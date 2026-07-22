import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVehicles, restockVehicle, deleteVehicle, getAllPurchases } from '../services/vehicalService';
import { Plus, Edit2, RotateCcw, Trash2, ShieldCheck, DollarSign, Database, Loader2, AlertCircle, CheckCircle2, ShoppingBag, FileText, TrendingUp, AlertTriangle, RefreshCw, Car, Image } from 'lucide-react';
import { jsPDF } from 'jspdf';
import InteractiveReceiptModal from '../components/InteractiveReceiptModal';

const Admin = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'sales'
  const [toast, setToast] = useState({ message: '', type: '' });
  const [selectedReceiptPurchase, setSelectedReceiptPurchase] = useState(null);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      showToast('Failed to fetch inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSalesHistory = async () => {
    setPurchasesLoading(true);
    try {
      const data = await getAllPurchases();
      setPurchases(data);
    } catch (err) {
      showToast('Failed to load customer sales report', 'error');
    } finally {
      setPurchasesLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
    loadSalesHistory();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: '' });
    }, 3000);
  };

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
      showToast(`Restocked ${qty} units successfully!`);
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicle.id ? { ...v, quantity: updated.quantity } : v))
      );
    } catch (err) {
      showToast(err.response?.data?.error || 'Restock failed', 'error');
    }
  };

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

  // Stats calculation
  const totalVehiclesCount = vehicles.length;
  const totalStockCount = vehicles.reduce((sum, v) => sum + (v.quantity || 0), 0);
  const totalInventoryValue = vehicles.reduce((sum, v) => sum + (v.price || 0) * (v.quantity || 0), 0);
  const totalRevenue = purchases.reduce((sum, p) => sum + (p.price || 0), 0);
  const outOfStockCount = vehicles.filter((v) => v.quantity <= 0).length;

  // PDF Receipt Generator
  const generateReceiptPDF = (purchase) => {
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
      doc.setFontSize(16);
      doc.text('VELOCITY SYSTEMS LUXURY DEALERSHIP', 15, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(156, 163, 175);
      doc.text('Premium Vehicles & Luxury Automobile Services', 15, 28);
      doc.text('Authorized Agent System', 15, 33);

      const receiptNo = purchase?.receiptNo || 'REC-' + Math.floor(100000 + Math.random() * 900000);
      const dateStr = purchase?.createdAt ? new Date(purchase.createdAt).toLocaleString() : new Date().toLocaleString();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      // doc.text(`RECEIPT: ${receiptNo}`, 147, 24);
      // doc.setFont('helvetica', 'normal');
      // doc.text(`Date: ${purchase?.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}`, 147, 28);
      // doc.text('Status: PAID', 147, 34);
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Receipt: ${receiptNo}`, pageWidth - 15, 18, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      const dateVal = purchase?.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
      doc.text(`Date: ${dateVal}`, pageWidth - 15, 26, { align: 'right' });
      doc.text('Status: PAID', pageWidth - 15, 34, { align: 'right' });


      
      // Indigo Accent Line
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 45, 210, 2, 'F');

      // 2. Seller and Buyer Information Columns
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('SELLER / DEALER:', 15, 60);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      doc.text(purchase?.sellerName || 'VeloCity Systems Dealership Group Ltd.', 15, 67);
      doc.text('100 Innovation Way, Tech District', 15, 73);
      doc.text('Silicon Valley, CA 94025', 15, 79);
      doc.text('Email: sales@velocitysystemsdealership.com', 15, 85);

      // Buyer Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('BUYER / CUSTOMER:', 110, 60);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Name: ${purchase?.buyerName || 'N/A'}`, 110, 67);
      doc.text(`Email: ${purchase?.buyerEmail || 'N/A'}`, 110, 73);
      doc.text(`Category: ${purchase?.buyerCategory || 'Customer'}`, 110, 79);
      doc.text(`Account ID: ${purchase?.buyerId || 'Guest'}`, 110, 85);

      // Horizontal Divider
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, 95, 195, 95);

      // 3. Purchase Details Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(99, 102, 241);
      doc.text('PURCHASED ITEM DESCRIPTION', 15, 105);

      // Table Header Box
      doc.setFillColor(241, 245, 249);
      doc.rect(15, 110, 180, 8, 'F');
      doc.rect(15, 110, 180, 8, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('ITEM SPECIFICATION', 20, 115.5);
      doc.text('VALUE / DESCRIPTION', 85, 115.5);

      // Table Content Grid Box
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(255, 255, 255);
      doc.rect(15, 118, 180, 48, 'S');

      // Table rows mapping
      const rows = [
        { label: 'Vehicle Manufacturer', val: purchase?.make || 'N/A' },
        { label: 'Model Name', val: purchase?.model || 'N/A' },
        { label: 'Body Category', val: purchase?.category || 'N/A' },
        { label: 'Unique Identifier (ID)', val: purchase?.vehicleId || 'N/A' },
        { label: 'Transaction Timestamp', val: dateStr },
        { label: 'Payment Method', val: 'Digital Payment' }
      ];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);

      rows.forEach((row, index) => {
        const yPos = 124 + index * 7;
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
      doc.rect(110, 172, 85, 18, 'F');
      doc.rect(110, 172, 85, 18, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text('TOTAL AMOUNT:', 115, 183);

      doc.setFontSize(14);
      doc.setTextColor(99, 102, 241);
      const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(purchase?.price);
      doc.text(formattedPrice, 150, 183);

      // Stamp / Signatures
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(1);
      doc.rect(20, 172, 45, 18, 'S');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(16, 185, 129);
      doc.text('AUTHORIZED', 26, 179);
      doc.text('PAID STAMP', 28, 185);

      // Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Terms: All vehicle sales include standard dealer warranties and manufacturer documentation.', 15, 215);
      doc.text('For assistance, please email support@velocitysystemsdealership.com.', 15, 221);

      // Save PDF
      doc.save(`receipt_${receiptNo}.pdf`);
    } catch (e) {
      showToast('PDF generation error', 'error');
    }
  };

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
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500/15 p-2.5 rounded-xl text-purple-400 border border-purple-500/20 shadow-glow">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Administrator Management Console</h1>
            <p className="text-gray-300 text-sm">Control inventory limits, add showroom assets, and view customer sales reports.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              loadInventory();
              loadSalesHistory();
            }}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-gray-200 font-semibold px-4 py-3 rounded-xl text-sm transition-all duration-200"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={() => navigate('/admin/add')}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-glow transition-all duration-200"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add New Vehicle</span>
          </button>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        {/* Metric 1: Inventory Assets Capital */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="bg-indigo-500/15 p-3.5 rounded-2xl border border-indigo-500/30 text-indigo-300">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Fleet Valuation</div>
            <div className="text-2xl font-black text-white">${totalInventoryValue.toLocaleString()}</div>
          </div>
        </div>

        {/* Metric 2: Total Sales Revenue */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="bg-emerald-500/15 p-3.5 rounded-2xl border border-emerald-500/30 text-emerald-300">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Gross Sales Revenue</div>
            <div className="text-2xl font-black text-emerald-400">${totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        {/* Metric 3: Total Stock Units */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="bg-purple-500/15 p-3.5 rounded-2xl border border-purple-500/30 text-purple-300">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">Total In-Stock Units</div>
            <div className="text-2xl font-black text-white">{totalStockCount} Units</div>
          </div>
        </div>

        {/* Metric 4: Stock Alerts */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className={`p-3.5 rounded-2xl border ${
            outOfStockCount > 0 ? 'bg-red-500/15 border-red-500/30 text-red-400' : 'bg-slate-800 border-white/10 text-gray-300'
          }`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">Stock Warnings</div>
            <div className={`text-2xl font-black ${outOfStockCount > 0 ? 'text-red-400' : 'text-white'}`}>
              {outOfStockCount} Out of Stock
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
            activeTab === 'inventory'
              ? 'bg-indigo-600 text-white shadow-glow border border-indigo-500'
              : 'bg-slate-800/80 hover:bg-slate-700 text-gray-300 border border-white/10'
          }`}
        >
          <Car className="h-4 w-4" />
          <span>Showroom Inventory Management ({vehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
            activeTab === 'sales'
              ? 'bg-indigo-600 text-white shadow-glow border border-indigo-500'
              : 'bg-slate-800/80 hover:bg-slate-700 text-gray-300 border border-white/10'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Customer Sales Reports ({purchases.length})</span>
        </button>
      </div>

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
              <span className="text-gray-300 font-medium">Fetching database contents...</span>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="glass-panel text-center py-16 px-4 rounded-2xl border border-white/10">
              <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Inventory Registered</h3>
              <p className="text-sm text-gray-300">Your database is empty. Click the button above to add a vehicle.</p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/90 border-b border-white/10 text-xs font-bold text-indigo-200 uppercase tracking-wider">
                      <th className="py-4 px-6">Vehicle ID</th>
                      <th className="py-4 px-6">Vehicle Specification</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Unit Price</th>
                      <th className="py-4 px-6">Stock Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-sm text-gray-200">
                    {vehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-white/[0.04] transition-colors duration-150">
                        {/* Vehicle ID with high-contrast pill */}
                        <td className="py-4 px-6 font-mono text-xs">
                          <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg font-bold">
                            {v.id}
                          </span>
                        </td>

                        {/* Vehicle Specification with photo thumbnail */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            {v.imageUrl ? (
                              <img
                                src={v.imageUrl}
                                alt={`${v.make} ${v.model}`}
                                className="w-12 h-10 object-cover rounded-lg border border-white/10 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-10 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0 text-indigo-400">
                                <Car className="h-5 w-5" />
                              </div>
                            )}
                            <div>
                              <div className="font-extrabold text-white text-base">{v.make}</div>
                              <div className="text-xs font-medium text-slate-300">{v.model}</div>
                            </div>
                          </div>
                        </td>

                        {/* Vehicle Category with vibrant badge */}
                        <td className="py-4 px-6">
                          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">
                            {v.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-6 font-black text-white text-base">${v.price?.toLocaleString()}</td>

                        {/* Stock Status */}
                        <td className="py-4 px-6">
                          {v.quantity <= 0 ? (
                            <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
                              Out of Stock
                            </span>
                          ) : (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg text-xs font-bold">
                              {v.quantity} units
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => navigate(`/admin/edit/${v.id}`, { state: { vehicle: v } })}
                              className="flex items-center space-x-1.5 bg-indigo-500/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleRestock(v)}
                              className="flex items-center space-x-1.5 bg-purple-500/20 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Restock</span>
                            </button>
                            <button
                              onClick={() => handleDelete(v.id)}
                              className="flex items-center space-x-1.5 bg-red-500/20 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/30 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* CUSTOMER SALES REPORT TAB */}
      {activeTab === 'sales' && (
        <>
          {purchasesLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
              <span className="text-gray-300 font-medium">Loading sales transaction reports...</span>
            </div>
          ) : purchases.length === 0 ? (
            <div className="glass-panel text-center py-16 px-4 rounded-2xl border border-white/10">
              <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Purchase Transactions Recorded</h3>
              <p className="text-sm text-gray-300">Sales records will appear here as customers buy vehicles.</p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Customer Sales Ledger</h3>
                  <p className="text-xs text-gray-300">Complete log of all vehicle purchases and generated receipts.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-300 font-medium">Total Revenue: </span>
                  <span className="text-lg font-black text-emerald-400">${totalRevenue.toLocaleString()}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/90 border-b border-white/10 text-xs font-bold text-indigo-200 uppercase tracking-wider">
                      <th className="py-4 px-6">Receipt No</th>
                      <th className="py-4 px-6">Buyer Customer</th>
                      <th className="py-4 px-6">Email / Category</th>
                      <th className="py-4 px-6">Vehicle Specification</th>
                      <th className="py-4 px-6">Sale Amount</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-sm text-gray-200">
                    {purchases.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.04] transition-colors duration-150">
                        <td className="py-4 px-6 font-mono text-indigo-300 font-bold text-xs">{p.receiptNo}</td>
                        <td className="py-4 px-6 font-extrabold text-white text-base">{p.buyerName}</td>
                        <td className="py-4 px-6 text-xs">
                          <div className="text-gray-200 font-medium">{p.buyerEmail}</div>
                          <div className="text-indigo-300 font-bold mt-0.5">{p.buyerCategory}</div>
                        </td>
                        <td className="py-4 px-6 font-extrabold text-white">
                          {p.make} {p.model} <span className="text-purple-300 font-bold text-xs">({p.category})</span>
                        </td>
                        <td className="py-4 px-6 font-black text-emerald-400 text-base">${p.price?.toLocaleString()}</td>
                        <td className="py-4 px-6 text-xs text-gray-300 font-medium">{new Date(p.createdAt).toLocaleString()}</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedReceiptPurchase(p)}
                            className="flex items-center space-x-1.5 bg-indigo-500/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ml-auto"
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
        </>
      )}

      {/* Interactive Receipt Modal */}
      <InteractiveReceiptModal
        isOpen={!!selectedReceiptPurchase}
        onClose={() => setSelectedReceiptPurchase(null)}
        purchase={selectedReceiptPurchase}
        onDownloadPDF={() => {
          if (selectedReceiptPurchase) {
            generateReceiptPDF(selectedReceiptPurchase);
          }
        }}
      />
    </div>
  );
};

export default Admin;
