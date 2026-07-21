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
  const generateReceiptPDF = (vehicle) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header Banner Background
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(0, 0, 210, 40, 'F');

      // Header Banner Text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('ANTIGRAVITY LUXURY SHOWROOM', 15, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(194, 205, 230);
      doc.text('Premium Car Dealership & Inventory Receipt', 15, 28);

      // Invoice Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('TRANSACTION RECEIPT', 15, 55);

      // Metadata block
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);

      const receiptNo = 'REC-' + Math.floor(100000 + Math.random() * 900000);
      const dateStr = new Date().toLocaleString();

      doc.text(`Receipt Number: ${receiptNo}`, 15, 63);
      doc.text(`Date of Purchase: ${dateStr}`, 15, 69);
      doc.text(`Buyer Username: ${user?.username || 'Guest Customer'}`, 15, 75);

      // Separator line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, 82, 195, 82);

      // Specs Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(99, 102, 241); // Indigo
      doc.text('VEHICLE SPECIFICATIONS', 15, 90);

      // Specs Table Box
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 95, 180, 52, 'F');
      doc.rect(15, 95, 180, 52, 'S');

      // Spec Fields
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text('Manufacturer (Make):', 20, 103);
      doc.text('Vehicle Model:', 20, 111);
      doc.text('Vehicle Category:', 20, 119);
      doc.text('Stock Reference ID:', 20, 127);
      doc.text('Payment Status:', 20, 135);

      // Spec Values
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(vehicle.make || 'N/A', 75, 103);
      doc.text(vehicle.model || 'N/A', 75, 111);
      doc.text(vehicle.category || 'N/A', 75, 119);
      doc.text(vehicle.id || 'N/A', 75, 127);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // Emerald 500
      doc.text('PAID & SHIPPED', 75, 135);

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 155, 195, 155);

      // Totals
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('Total Amount Paid:', 105, 168);

      doc.setFontSize(16);
      doc.setTextColor(99, 102, 241); // Indigo
      const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(vehicle.price);
      doc.text(formattedPrice, 150, 168);

      // Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('Thank you for choosing Antigravity Showrooms! Have a safe and pleasant drive.', 15, 195);
      doc.text('For customer support, please contact us at support@antigravitydealership.com', 15, 201);

      // Download
      const pdfName = `receipt_${vehicle.make.toLowerCase()}_${vehicle.model.toLowerCase()}.pdf`;
      doc.save(pdfName);
    } catch (e) {
      console.error('Failed to generate PDF:', e);
      showToast('Purchase succeeded, but failed to generate receipt PDF', 'error');
    }
  };

  // Purchase handler
  const handlePurchase = async (id) => {
    try {
      const updated = await purchaseVehicle(id);
      showToast(`Vehicle purchased successfully!`);
      // Update local state
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, quantity: updated.quantity } : v))
      );
      // Trigger PDF Receipt Download
      generateReceiptPDF(updated);
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
