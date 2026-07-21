import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/Authcontext';
import SearchBar from '../components/SearchBar';
import VehicleCard from '../components/VehicleCard';
import { getVehicles, searchVehicles, purchaseVehicle, restockVehicle, deleteVehicle } from '../services/vehicalService';
import { Loader2, Plus, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });

  // Load vehicles
  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      showToast('Failed to fetch vehicles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: '' });
    }, 3000);
  };

  // Search handler
  const handleSearch = async (filters) => {
    setLoading(true);
    try {
      const data = await searchVehicles(filters);
      setVehicles(data);
    } catch (err) {
      showToast('Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // PDF Receipt Generator
  const generateReceiptPDF = (vehicle, purchase) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 1. Header Banner Background
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(0, 0, 210, 45, 'F');

      // Header Banner Text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('ANTIGRAVITY LUXURY DEALERSHIP', 15, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text('Premium Vehicles & Luxury Automobile Services', 15, 28);
      doc.text('Authorized Agent System', 15, 34);

      const receiptNo = purchase?.receiptNo || 'REC-' + Math.floor(100000 + Math.random() * 900000);
      const dateStr = purchase?.createdAt ? new Date(purchase.createdAt).toLocaleString() : new Date().toLocaleString();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`RECEIPT: ${receiptNo}`, 145, 20);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${purchase?.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}`, 145, 26);
      doc.text('Status: PAID', 145, 32);

      // Indigo Accent Line
      doc.setFillColor(99, 102, 241); // Indigo 500
      doc.rect(0, 45, 210, 2, 'F');

      // 2. Seller and Buyer Information Columns (Side-by-Side)
      
      // Seller Info (Left Column)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('SELLER / DEALER:', 15, 60);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text('Antigravity Dealership Group Ltd.', 15, 67);
      doc.text('100 Innovation Way, Tech District', 15, 73);
      doc.text('Silicon Valley, CA 94025', 15, 79);
      doc.text('Email: sales@antigravitydealership.com', 15, 85);
      doc.text('Registry Lic: LIC-99381-AGY', 15, 91);

      // Buyer Info (Right Column)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('BUYER / CUSTOMER:', 110, 60);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text(`Name: ${purchase?.buyerName || user?.name || 'N/A'}`, 110, 67);
      doc.text(`Username: ${user?.username || 'N/A'}`, 110, 73);
      doc.text(`Email: ${purchase?.buyerEmail || user?.email || 'N/A'}`, 110, 79);
      doc.text(`Category: ${purchase?.buyerCategory || user?.category || 'Customer'}`, 110, 85);
      doc.text(`Account ID: ${purchase?.buyerId || user?.id || 'Guest'}`, 110, 91);

      // Horizontal Divider
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, 100, 195, 100);

      // 3. Purchase Details Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(99, 102, 241); // Indigo
      doc.text('PURCHASED ITEM DESCRIPTION', 15, 110);

      // Table Header Box
      doc.setFillColor(241, 245, 249);
      doc.rect(15, 115, 180, 8, 'F');
      doc.rect(15, 115, 180, 8, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('ITEM SPECIFICATION', 20, 120.5);
      doc.text('VALUE / DESCRIPTION', 85, 120.5);

      // Table Content Grid Box
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(255, 255, 255);
      doc.rect(15, 123, 180, 48, 'S');

      // Table rows mapping
      const rows = [
        { label: 'Vehicle Manufacturer', val: vehicle.make || 'N/A' },
        { label: 'Model Name', val: vehicle.model || 'N/A' },
        { label: 'Body Category', val: vehicle.category || 'N/A' },
        { label: 'Unique Identifier (ID)', val: vehicle.id || 'N/A' },
        { label: 'Transaction Timestamp', val: dateStr },
        { label: 'Payment Method', val: 'Digital Authorization / Token' }
      ];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);

      rows.forEach((row, index) => {
        const yPos = 129 + index * 7;
        doc.setFont('helvetica', 'bold');
        doc.text(row.label, 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(row.val, 85, yPos);
        if (index < rows.length - 1) {
          doc.line(15, yPos + 2.5, 195, yPos + 2.5);
        }
      });

      // 4. Totals Block
      doc.setFillColor(248, 250, 252);
      doc.rect(110, 178, 85, 18, 'F');
      doc.rect(110, 178, 85, 18, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text('TOTAL AMOUNT:', 115, 189);

      doc.setFontSize(14);
      doc.setTextColor(99, 102, 241); // Indigo
      const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(vehicle.price);
      doc.text(formattedPrice, 150, 189);

      // Stamp / Signatures
      doc.setDrawColor(16, 185, 129); // Emerald 500
      doc.setLineWidth(1);
      doc.rect(20, 178, 45, 18, 'S');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(16, 185, 129);
      doc.text('AUTHORIZED', 26, 185);
      doc.text('PAID STAMP', 28, 191);

      // Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Terms: All vehicle sales include standard dealer warranties and manufacturer documentation.', 15, 230);
      doc.text('For assistance, please email support@antigravitydealership.com.', 15, 236);

      // Save PDF
      const pdfName = `receipt_${vehicle.make.toLowerCase()}_${vehicle.model.toLowerCase()}.pdf`;
      doc.save(pdfName);
    } catch (e) {
      console.error('Failed to generate PDF:', e);
      showToast('Purchase succeeded, but failed to generate detailed PDF receipt', 'error');
    }
  };

  // Purchase handler
  const handlePurchase = async (id) => {
    try {
      const responseData = await purchaseVehicle(id);
      showToast(`Vehicle purchased successfully!`);
      // Update local state
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, quantity: responseData.vehicle.quantity } : v))
      );
      // Trigger PDF Receipt Download
      generateReceiptPDF(responseData.vehicle, responseData.purchase);
    } catch (err) {
      showToast(err.response?.data?.error || 'Purchase failed', 'error');
    }
  };

  // Restock handler
  const handleRestock = async (vehicle) => {
    const qtyStr = prompt(`Enter restock quantity for ${vehicle.make} ${vehicle.model}:`, '10');
    if (qtyStr === null) return;
    const qty = parseInt(qtyStr);

    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid positive integer.');
      return;
    }

    try {
      const updated = await restockVehicle(vehicle.id, qty);
      showToast(`Successfully restocked ${qty} units!`);
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicle.id ? { ...v, quantity: updated.quantity } : v))
      );
    } catch (err) {
      showToast(err.response?.data?.error || 'Restock failed', 'error');
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle from inventory?')) return;

    try {
      await deleteVehicle(id);
      showToast('Vehicle deleted successfully');
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      showToast('Deletion failed', 'error');
    }
  };

  // Edit handler (redirects to edit page)
  const handleEdit = (vehicle) => {
    navigate(`/admin/edit/${vehicle.id}`, { state: { vehicle } });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex-grow py-12 px-4 max-w-7xl mx-auto w-full space-y-8">
      {/* Toast Alert */}
      {toast.message && (
        <div className={`fixed bottom-6 right-6 flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl border z-50 animate-bounce ${
          toast.type === 'error'
            ? 'bg-red-500/10 border-red-500/20 text-red-400'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Showroom Inventory</h1>
          <p className="text-gray-400 text-sm">Explore, search, and manage high-quality vehicles instantly.</p>
        </div>

        {user && (
          <button
            onClick={() => navigate('/admin/add')}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow-glow transition-all duration-200"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add New Vehicle</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Main Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
          <span className="text-gray-400 font-medium">Synchronizing live stock...</span>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="glass-panel text-center py-20 px-4 rounded-3xl border border-white/5 shadow-md">
          <Sparkles className="h-12 w-12 text-indigo-400/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Vehicles Found</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
            We couldn't find any vehicles matching your search criteria. Try modifying your filters.
          </p>
          <button
            onClick={loadVehicles}
            className="bg-slate-900 border border-white/10 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-950 transition-all duration-200"
          >
            Refresh Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPurchase={handlePurchase}
              onEdit={handleEdit}
              onRestock={handleRestock}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
