import React, { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    const clearedFilters = {
      make: '',
      model: '',
      category: '',
      minPrice: '',
      maxPrice: '',
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel p-6 rounded-2xl border border-white/5 shadow-xl space-y-4 mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Make */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Make</label>
          <input
            type="text"
            name="make"
            value={filters.make}
            onChange={handleChange}
            placeholder="e.g. Tesla, Toyota"
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all duration-200"
          />
        </div>

        {/* Model */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Model</label>
          <input
            type="text"
            name="model"
            value={filters.model}
            onChange={handleChange}
            placeholder="e.g. Model Y, Camry"
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all duration-200"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</label>
          <input
            type="text"
            name="category"
            value={filters.category}
            onChange={handleChange}
            placeholder="e.g. Sedan, SUV, Truck"
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all duration-200"
          />
        </div>

        {/* Min Price */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Min Price ($)</label>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleChange}
            placeholder="Min"
            min="0"
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all duration-200"
          />
        </div>

        {/* Max Price */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Max Price ($)</label>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder="Max"
            min="0"
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-2">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center space-x-2 text-gray-400 hover:text-white px-4 py-2 text-sm font-medium border border-white/10 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-200"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset Filters</span>
        </button>
        <button
          type="submit"
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-semibold shadow-glow transition-all duration-200"
        >
          <Search className="h-4 w-4" />
          <span>Search Inventory</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
