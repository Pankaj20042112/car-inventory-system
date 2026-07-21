import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { updateVehicle, getVehicles } from '../services/vehicalService';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';

const EditVehicle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [form, setForm] = useState({
    make: '',
    model: '',
    category: '',
    price: '',
    quantity: '',
    imageUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Attempt to load from location state
    if (location.state?.vehicle) {
      const v = location.state.vehicle;
      setForm({
        make: v.make,
        model: v.model,
        category: v.category,
        price: v.price.toString(),
        quantity: v.quantity.toString(),
        imageUrl: v.imageUrl || '',
      });
    } else {
      // Fallback: Fetch all and find the matching one
      const fetchAndFind = async () => {
        try {
          const list = await getVehicles();
          const found = list.find((item) => item.id.toString() === id);
          if (found) {
            setForm({
              make: found.make,
              model: found.model,
              category: found.category,
              price: found.price.toString(),
              quantity: found.quantity.toString(),
              imageUrl: found.imageUrl || '',
            });
          } else {
            setError('Vehicle not found in database.');
          }
        } catch (err) {
          setError('Failed to load vehicle details.');
        }
      };
      fetchAndFind();
    }
  }, [id, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const priceNum = parseFloat(form.price);
    const qtyNum = parseInt(form.quantity);

    if (isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a positive number');
      setLoading(false);
      return;
    }

    if (isNaN(qtyNum) || qtyNum < 0) {
      setError('Quantity must be a positive integer');
      setLoading(false);
      return;
    }

    try {
      await updateVehicle(id, {
        make: form.make,
        model: form.model,
        category: form.category,
        price: priceNum,
        quantity: qtyNum,
        imageUrl: form.imageUrl.trim() || null,
      });
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update vehicle. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow py-12 px-4 max-w-2xl mx-auto w-full space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-semibold">Back to Admin Panel</span>
      </button>

      {/* Form Panel */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Edit Vehicle Details</h2>
          <p className="text-sm text-gray-400">Modify properties of vehicle record (ID: {id}).</p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Make */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Make</label>
              <input
                type="text"
                name="make"
                required
                value={form.make}
                onChange={handleChange}
                placeholder="e.g. Toyota"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            {/* Model */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Model</label>
              <input
                type="text"
                name="model"
                required
                value={form.model}
                onChange={handleChange}
                placeholder="e.g. Camry"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</label>
            <input
              type="text"
              name="category"
              required
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Sedan, SUV, Truck"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Price ($)</label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            {/* Quantity */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Units in Stock</label>
              <input
                type="number"
                name="quantity"
                required
                min="0"
                value={form.quantity}
                onChange={handleChange}
                placeholder="0"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vehicle Photo URL (Optional)</label>
            <input
              type="url"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="e.g. https://images.unsplash.com/photo-..."
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="bg-slate-900 border border-white/10 hover:bg-slate-950 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-glow disabled:opacity-50 transition-all duration-200"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVehicle;
