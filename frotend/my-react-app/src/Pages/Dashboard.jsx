import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/Authcontext';
import SearchBar from '../components/SearchBar';
import VehicleCard from '../components/VehicleCard';
import InteractiveReceiptModal from '../components/InteractiveReceiptModal';
import { getVehicles, searchVehicles, purchaseVehicle, getMyPurchases } from '../services/vehicalService';
import { Loader2, Sparkles, CheckCircle2, AlertCircle, ShoppingBag, Car, Tag, RefreshCw, Filter, FileText, Download, UserCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('showroom'); // 'showroom' | 'my-purchases'
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [selectedReceiptPurchase, setSelectedReceiptPurchase] = useState(null);

  // Load showroom vehicles
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

  // Load user purchase history
  const loadMyPurchases = async () => {
    setPurchasesLoading(true);
    try {
      const data = await getMyPurchases();
      setPurchases(data);
    } catch (err) {
      showToast('Failed to load purchase history', 'error');
    } finally {
      setPurchasesLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
    loadMyPurchases();
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
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 45, 'F');

      // Header Banner Text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('VELOCITY SYSTEMS LUXURY DEALERSHIP', 15, 20);

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
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 45, 210, 2, 'F');

      // 2. Seller and Buyer Information Columns
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('SELLER / DEALER:', 15, 60);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text('VeloCity Systems Dealership Group Ltd.', 15, 67);
      doc.text('100 Innovation Way, Tech District', 15, 73);
      doc.text('Silicon Valley, CA 94025', 15, 79);
      doc.text('Email: sales@velocitysystemsdealership.com', 15, 85);
      doc.text('Registry Lic: LIC-99381-AGY', 15, 91);

      // Buyer Info
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
      doc.setTextColor(99, 102, 241);
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
      doc.setTextColor(99, 102, 241);
      const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(vehicle.price);
      doc.text(formattedPrice, 150, 189);

      // Stamp / Signatures
      doc.setDrawColor(16, 185, 129);
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
      doc.text('For assistance, please email support@velocitysystemsdealership.com.', 15, 236);

      // Save PDF
      const pdfName = `receipt_${vehicle.make.toLowerCase()}_${vehicle.model.toLowerCase()}.pdf`;
      doc.save(pdfName);
    } catch (e) {
      console.error('Failed to generate PDF:', e);
      showToast('Failed to generate PDF receipt', 'error');
    }
  };

  // Purchase handler
  const handlePurchase = async (id) => {
    try {
      const responseData = await purchaseVehicle(id);
      showToast(`Vehicle purchased successfully!`);
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, quantity: responseData.vehicle.quantity } : v))
      );
      setSelectedReceiptPurchase(responseData.purchase);
      loadMyPurchases(); // refresh purchase history
    } catch (err) {
      showToast(err.response?.data?.error || 'Purchase failed', 'error');
    }
  };

  // Filter vehicles by category pill
  const filteredVehicles = vehicles.filter((v) => {
    if (activeCategoryFilter === 'All') return true;
    if (activeCategoryFilter === 'In Stock') return v.quantity > 0;
    if (activeCategoryFilter === 'Out of Stock') return v.quantity <= 0;
    return v.category.toLowerCase() === activeCategoryFilter.toLowerCase();
  });

  const categoriesList = ['All', 'SUV', 'Sedan', 'Truck', 'In Stock'];

  return (
    <div className="flex-grow py-8 px-4 max-w-7xl mx-auto w-full space-y-8">
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

      {/* Customer Welcome Hero Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-950">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <UserCheck className="h-3.5 w-3.5" />
                <span>Customer Portal</span>
              </span>
              {user?.category && (
                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  <span>{user.category}</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{user?.name || user?.username || 'Valued Customer'}</span> 👋
            </h1>
            <p className="text-sm text-gray-400 max-w-xl">
              Browse showroom vehicles, search luxury models, purchase cars, and view your purchase receipts anytime.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                loadVehicles();
                loadMyPurchases();
              }}
              className="flex items-center space-x-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-gray-300 font-semibold px-4 py-3 rounded-xl text-sm transition-all duration-200"
              title="Reload catalog"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Catalog</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs: Showroom Catalog vs My Purchases */}
      <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('showroom')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
            activeTab === 'showroom'
              ? 'bg-indigo-600 text-white shadow-glow border border-indigo-500'
              : 'bg-slate-900/80 hover:bg-slate-800 text-gray-400 border border-white/5'
          }`}
        >
          <Car className="h-4 w-4" />
          <span>Showroom Catalog ({vehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('my-purchases')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
            activeTab === 'my-purchases'
              ? 'bg-indigo-600 text-white shadow-glow border border-indigo-500'
              : 'bg-slate-900/80 hover:bg-slate-800 text-gray-400 border border-white/5'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>My Orders & Receipts ({purchases.length})</span>
        </button>
      </div>

      {/* SHOWROOM TAB CONTENT */}
      {activeTab === 'showroom' && (
        <div className="space-y-8">
          {/* Search Bar Component */}
          <SearchBar onSearch={handleSearch} />

          {/* Category Filter Quick-Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Category Filter:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {categoriesList.map((cat) => {
                const isActive = activeCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-glow'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-gray-400 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid View */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
              <span className="text-gray-400 font-medium">Synchronizing showroom vehicles...</span>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="glass-panel text-center py-20 px-4 rounded-3xl border border-white/5 shadow-md">
              <Sparkles className="h-12 w-12 text-indigo-400/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Vehicles Found</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
                We couldn't find any vehicles matching your filter criteria. Try choosing a different category or resetting filters.
              </p>
              <button
                onClick={() => {
                  setActiveCategoryFilter('All');
                  loadVehicles();
                }}
                className="bg-slate-900 border border-white/10 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-950 transition-all duration-200"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onPurchase={handlePurchase}
                  isAdmin={false} // Normal user view
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MY PURCHASES TAB CONTENT */}
      {activeTab === 'my-purchases' && (
        <div className="space-y-6">
          {purchasesLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
              <span className="text-gray-400 font-medium">Loading your purchase history...</span>
            </div>
          ) : purchases.length === 0 ? (
            <div className="glass-panel text-center py-20 px-4 rounded-3xl border border-white/5 shadow-md space-y-4">
              <FileText className="h-12 w-12 text-indigo-400/40 mx-auto" />
              <h3 className="text-xl font-bold text-white">No Purchase History Found</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                You haven't purchased any vehicles yet. Explore our Showroom Catalog to make your first purchase!
              </p>
              <button
                onClick={() => setActiveTab('showroom')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-glow"
              >
                Browse Showroom
              </button>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">My Order Transactions</h3>
                  <p className="text-xs text-gray-400">View details and download official PDF receipts for past purchases.</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">
                  {purchases.length} Total Purchased
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Receipt No</th>
                      <th className="py-4 px-6">Vehicle</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Amount Paid</th>
                      <th className="py-4 px-6">Purchase Date</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                    {purchases.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                        <td className="py-4 px-6 font-mono text-indigo-400 font-bold text-xs">{p.receiptNo}</td>
                        <td className="py-4 px-6 font-bold text-white">
                          {p.make} {p.model}
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-slate-950 text-indigo-300 border border-white/10 px-2.5 py-1 rounded-md text-xs font-semibold">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-emerald-400">
                          ${p.price?.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-400">
                          {new Date(p.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedReceiptPurchase(p)}
                            className="flex items-center space-x-1.5 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/20 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ml-auto"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>View Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Receipt Modal */}
      <InteractiveReceiptModal
        isOpen={!!selectedReceiptPurchase}
        onClose={() => setSelectedReceiptPurchase(null)}
        purchase={selectedReceiptPurchase}
        onDownloadPDF={() => {
          if (selectedReceiptPurchase) {
            generateReceiptPDF({
              make: selectedReceiptPurchase.make,
              model: selectedReceiptPurchase.model,
              category: selectedReceiptPurchase.category,
              price: selectedReceiptPurchase.price,
              id: selectedReceiptPurchase.vehicleId
            }, selectedReceiptPurchase);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
