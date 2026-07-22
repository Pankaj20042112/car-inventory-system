import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { updateVehicle, getVehicles } from '../services/vehicalService';
import { Save, ArrowLeft, AlertCircle, Upload, Sparkles, X } from 'lucide-react';

const samplePhotos = [
  { name: 'Luxury SUV', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sports Coupe', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80' },
  { name: 'Executive Sedan', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pickup Truck', url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80' },
];

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
    description: '',
    powertrain: '',
    acceleration: '',
    range: '',
    topSpeed: '',
    horsepower: '',
    transmission: '',
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
        description: v.description || '',
        powertrain: v.powertrain || '',
        acceleration: v.acceleration || '',
        range: v.range || '',
        topSpeed: v.topSpeed || '',
        horsepower: v.horsepower || '',
        transmission: v.transmission || '',
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
              description: found.description || '',
              powertrain: found.powertrain || '',
              acceleration: found.acceleration || '',
              range: found.range || '',
              topSpeed: found.topSpeed || '',
              horsepower: found.horsepower || '',
              transmission: found.transmission || '',
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError('Image file size must be less than 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, imageUrl: reader.result }));
        setError('');
      };
      reader.readAsDataURL(file);
    }
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
        description: form.description.trim() || null,
        powertrain: form.powertrain.trim() || null,
        acceleration: form.acceleration.trim() || null,
        range: form.range.trim() || null,
        topSpeed: form.topSpeed.trim() || null,
        horsepower: form.horsepower.trim() || null,
        transmission: form.transmission.trim() || null,
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
          <p className="text-sm text-gray-400">Modify properties and photo of vehicle record (ID: {id}).</p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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

          {/* Performance Parameters (Manual Overrides) */}
          <div className="bg-slate-950/30 p-5 rounded-2xl border border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Performance Parameters (Overrides)</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Powertrain */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Engine / Motor</label>
                <input
                  type="text"
                  name="powertrain"
                  value={form.powertrain}
                  onChange={handleChange}
                  placeholder="e.g. 4.0L V8 Twin-Turbo"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Horsepower */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Horsepower</label>
                <input
                  type="text"
                  name="horsepower"
                  value={form.horsepower}
                  onChange={handleChange}
                  placeholder="e.g. 657 hp"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Acceleration */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Acceleration (0-60 mph)</label>
                <input
                  type="text"
                  name="acceleration"
                  value={form.acceleration}
                  onChange={handleChange}
                  placeholder="e.g. 3.1s"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Top Speed */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Top Speed</label>
                <input
                  type="text"
                  name="topSpeed"
                  value={form.topSpeed}
                  onChange={handleChange}
                  placeholder="e.g. 190 mph"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Transmission */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Transmission</label>
                <input
                  type="text"
                  name="transmission"
                  value={form.transmission}
                  onChange={handleChange}
                  placeholder="e.g. 8-Speed Automatic"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Fuel Economy / Range */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Range / Fuel Economy</label>
                <input
                  type="text"
                  name="range"
                  value={form.range}
                  onChange={handleChange}
                  placeholder="e.g. 300 miles / 20 mpg"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Custom Description / Specifications</label>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter unique performance specs, interior trims, premium features..."
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all duration-200 resize-none"
            />
          </div>

          {/* Vehicle Photo Upload & Presets */}
          <div className="flex flex-col space-y-3 pt-2 border-t border-white/5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Vehicle Photo</span>
              <span className="text-[10px] text-indigo-400">Stores in Database</span>
            </label>

            {/* Live Preview If Image Exists */}
            {form.imageUrl ? (
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-white/10 group">
                <img
                  src={form.imageUrl}
                  alt="Vehicle Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                  className="absolute top-3 right-3 bg-slate-950/80 text-white p-2 rounded-full border border-white/20 hover:bg-red-600 transition-colors"
                  title="Remove Photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            {/* Input Options: File Upload or Sample Presets or URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* File Upload Button */}
              <label className="flex items-center justify-center space-x-2 bg-slate-950 hover:bg-slate-900 border border-dashed border-white/20 hover:border-indigo-500 rounded-xl p-3.5 cursor-pointer text-gray-300 text-xs font-semibold transition-all">
                <Upload className="h-4 w-4 text-indigo-400" />
                <span>Upload from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* URL Input */}
              <input
                type="text"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="Or paste Image Web URL..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            {/* Presets Row */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-indigo-400" />
                <span>Or Select Sample Preset Photo:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {samplePhotos.map((photo) => (
                  <button
                    key={photo.name}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, imageUrl: photo.url }))}
                    className="text-[11px] bg-slate-900 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500 text-gray-300 hover:text-indigo-300 px-3 py-1.5 rounded-lg transition-all"
                  >
                    + {photo.name}
                  </button>
                ))}
              </div>
            </div>
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
