import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVehicles, restockVehicle, deleteVehicle } from '../services/vehicalService';
import { Plus, Edit2, RotateCcw, Trash2, ShieldCheck, DollarSign, Database, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });

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

  useEffect(() => {
    loadInventory();
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
  const totalStockCount = vehicles.reduce((sum, v) => sum + v.quantity, 0);
  const totalInventoryValue = vehicles.reduce((sum, v) => sum + v.price * v.quantity, 0);

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
          <div className="bg-purple-500/15 p-2 rounded-xl text-purple-400 border border-purple-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Admin Management Console</h1>
            <p className="text-gray-400 text-sm">Control inventory limits, add showroom assets, and monitor performance.</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/admin/add')}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-glow transition-all duration-200"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Metric 1 */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center space-x-4">
          <div className="bg-indigo-500/10 p-4 rounded-xl text-indigo-400">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Showroom Models</div>
            <div className="text-2xl font-black text-white">{totalVehiclesCount} Types</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center space-x-4">
          <div className="bg-purple-500/10 p-4 rounded-xl text-purple-400">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Stock Units</div>
            <div className="text-2xl font-black text-white">{totalStockCount} units</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center space-x-4">
          <div className="bg-emerald-500/10 p-4 rounded-xl text-emerald-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventory Assets Capital</div>
            <div className="text-2xl font-black text-white">${totalInventoryValue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Database Inventory Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <span className="text-gray-400 font-medium">Fetching database contents...</span>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="glass-panel text-center py-16 px-4 rounded-2xl border border-white/5">
          <AlertCircle className="h-10 w-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Inventory Registered</h3>
          <p className="text-sm text-gray-500">Your database is empty. Click the button above to add a vehicle.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Vehicle Specification</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Unit Price</th>
                  <th className="py-4 px-6">Stock Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                    <td className="py-4 px-6 font-mono text-gray-500 text-xs">{v.id}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-white">{v.make}</div>
                      <div className="text-xs text-gray-400">{v.model}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-950 text-indigo-300 border border-white/10 px-2.5 py-1 rounded-md text-xs font-semibold">
                        {v.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-white">${v.price.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      {v.quantity <= 0 ? (
                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-xs font-bold">
                          {v.quantity} units
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/admin/edit/${v.id}`, { state: { vehicle: v } })}
                          className="flex items-center space-x-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleRestock(v)}
                          className="flex items-center space-x-1.5 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white border border-purple-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Restock</span>
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="flex items-center space-x-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                        >
                          <Trash2 className="h-3 w-3" />
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
    </div>
  );
};

export default Admin;
