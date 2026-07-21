import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/Authcontext';
import SearchBar from '../components/SearchBar';
import VehicleCard from '../components/VehicleCard';
import { getVehicles, searchVehicles, purchaseVehicle, restockVehicle, deleteVehicle } from '../services/vehicalService';
import { Loader2, Plus, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

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

  // Purchase handler
  const handlePurchase = async (id) => {
    try {
      const updated = await purchaseVehicle(id);
      showToast(`Vehicle purchased successfully!`);
      // Update local state
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, quantity: updated.quantity } : v))
      );
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

        {isAdmin && (
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
