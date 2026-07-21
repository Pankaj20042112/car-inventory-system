import React from 'react';
import { ShoppingCart, Edit2, RotateCcw, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

const VehicleCard = ({ vehicle, onPurchase, onEdit, onRestock, onDelete, isAdmin }) => {
  const isOutOfStock = vehicle.quantity <= 0;

  // Render a clean SVG based on category
  const renderCarSvg = (category) => {
    const lowerCategory = category.toLowerCase();
    let path = "M4 14h24l-3-5H7l-3 5zm1 0a2 2 0 100 4 2 2 0 000-4zm18 0a2 2 0 100 4 2 2 0 000-4z"; // fallback car path
    
    if (lowerCategory.includes('suv')) {
      return (
        <svg viewBox="0 0 32 32" className="w-full h-full text-indigo-400 opacity-80" fill="currentColor">
          <path d="M2 16h28l-2-6H16l-3-3H6l-4 9zm4 1a2 2 0 100 4 2 2 0 000-4zm18 0a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      );
    } else if (lowerCategory.includes('truck')) {
      return (
        <svg viewBox="0 0 32 32" className="w-full h-full text-purple-400 opacity-80" fill="currentColor">
          <path d="M2 18h16v-9h-6L8 13H2v5zm18-7v7h10v-3h-4v-4h-6zm-14 8a2 2 0 100 4 2 2 0 000-4zm18 0a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      );
    }
    // Default Sedan
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full text-indigo-300 opacity-80" fill="currentColor">
        <path d="M1 16h30l-4-6H19l-4-3H8l-7 9zm5 2a2 2 0 100 4 2 2 0 000-4zm18 0a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    );
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-3xl overflow-hidden flex flex-col h-full border border-white/5 shadow-lg transition-all duration-300">
      {/* Vehicle Vector Render */}
      <div className="h-44 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 relative flex items-center justify-center p-6 border-b border-white/5">
        <div className="w-24 h-24 flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          {renderCarSvg(vehicle.category)}
        </div>
        
        {/* Category Badge */}
        <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full">
          {vehicle.category}
        </span>

        {/* Stock Badge */}
        <span className={`absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full backdrop-blur-md border ${
          isOutOfStock
            ? 'bg-red-500/10 text-red-400 border-red-500/20'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }`}>
          {isOutOfStock ? 'Sold Out' : `${vehicle.quantity} Available`}
        </span>
      </div>

      {/* Vehicle Specs */}
      <div className="p-6 flex-grow flex flex-col justify-between">
        <div>
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{vehicle.make}</span>
          <h3 className="text-xl font-bold text-white mb-2">{vehicle.model}</h3>
          
          <div className="text-2xl font-black text-white bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent mb-4">
            ${vehicle.price.toLocaleString()}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Purchase Button */}
          <button
            onClick={() => onPurchase(vehicle.id)}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow border border-indigo-500/30'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{isOutOfStock ? 'Unavailable' : 'Purchase Vehicle'}</span>
          </button>

          {/* Admin Tools Panel */}
          {isAdmin && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => onEdit(vehicle)}
                className="flex items-center justify-center bg-slate-900 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-gray-400 hover:text-indigo-400 p-2.5 rounded-lg transition-all duration-200"
                title="Edit Details"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onRestock(vehicle)}
                className="flex items-center justify-center bg-slate-900 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-gray-400 hover:text-purple-400 p-2.5 rounded-lg transition-all duration-200"
                title="Restock Inventory"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(vehicle.id)}
                className="flex items-center justify-center bg-slate-900 border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 p-2.5 rounded-lg transition-all duration-200"
                title="Delete Vehicle"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
