import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Edit2, RotateCcw, Trash2, CheckCircle2, AlertTriangle, Database } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const VehicleCard = ({ vehicle, onEdit, onRestock, onDelete, isAdmin }) => {
  const navigate = useNavigate();
  const { addToCart, cart } = useContext(CartContext);
  const isOutOfStock = vehicle.quantity <= 0;

  const cartItem = cart.find((item) => item.id === vehicle.id);
  const qtyInCart = cartItem ? cartItem.cartQuantity : 0;
  const isCartLimitReached = qtyInCart >= vehicle.quantity;

  // Render a high-fidelity SVG based on category
  const renderCarSvg = (category) => {
    const lowerCategory = category.toLowerCase();
    
    if (lowerCategory.includes('suv')) {
      return (
        <svg viewBox="0 0 100 50" className="w-full h-full text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.6)]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 35 L22 35 A 7 7 0 0 1 36 35 L64 35 A 7 7 0 0 1 78 35 L95 35 C97 35 98 33 98 31 L96 19 C95 16 92 14 88 14 L72 14 L62 9 C59 7 54 6 50 6 L20 6 C16 6 12 8 10 11 L4 18 C2 20 2 23 2 25 L2 31 C2 33 3 35 5 35 Z" fill="url(#suvGrad)" />
          <circle cx="29" cy="35" r="7" fill="#0b0f19" stroke="currentColor" strokeWidth="3" />
          <circle cx="71" cy="35" r="7" fill="#0b0f19" stroke="currentColor" strokeWidth="3" />
          <circle cx="29" cy="35" r="2.5" fill="currentColor" />
          <circle cx="71" cy="35" r="2.5" fill="currentColor" />
          <path d="M97 25 L98 26" stroke="#f43f5e" strokeWidth="3.5" />
          <path d="M3 21 L5 22" stroke="#38bdf8" strokeWidth="3.5" />
          <defs>
            <linearGradient id="suvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.15)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0.3)" />
            </linearGradient>
          </defs>
        </svg>
      );
    } else if (lowerCategory.includes('truck')) {
      return (
        <svg viewBox="0 0 100 50" className="w-full h-full text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 35 L22 35 A 7 7 0 0 1 36 35 L64 35 A 7 7 0 0 1 78 35 L95 35 C97 35 98 33 98 31 L98 22 L68 22 L60 11 C58 8 54 7 50 7 L15 7 C12 7 9 9 7 11 L3 17 C2 19 2 21 2 23 L2 31 C2 33 3 35 5 35 Z" fill="url(#truckGrad)" />
          <circle cx="29" cy="35" r="7" fill="#0b0f19" stroke="currentColor" strokeWidth="3" />
          <circle cx="71" cy="35" r="7" fill="#0b0f19" stroke="currentColor" strokeWidth="3" />
          <circle cx="29" cy="35" r="2.5" fill="currentColor" />
          <circle cx="71" cy="35" r="2.5" fill="currentColor" />
          <path d="M97 26 L98 27" stroke="#f43f5e" strokeWidth="3.5" />
          <path d="M3 21 L5 22" stroke="#38bdf8" strokeWidth="3.5" />
          <defs>
            <linearGradient id="truckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0.15)" />
              <stop offset="100%" stopColor="rgba(236, 72, 153, 0.3)" />
            </linearGradient>
          </defs>
        </svg>
      );
    }
    
    // Default Sedan / Sports Coupe
    return (
      <svg viewBox="0 0 100 50" className="w-full h-full text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.6)]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 35 L25 35 A 6 6 0 0 1 37 35 L63 35 A 6 6 0 0 1 75 35 L90 35 C94 35 96 32 94 28 L88 20 C86 18 82 17 78 17 L58 17 L44 7 C40 4 34 4 30 7 L14 17 L8 19 C4 20 2 23 2 27 L2 32 C2 34 4 35 7 35 Z" fill="url(#carGrad)" />
        <circle cx="31" cy="35" r="6" fill="#0b0f19" stroke="currentColor" strokeWidth="3" />
        <circle cx="69" cy="35" r="6" fill="#0b0f19" stroke="currentColor" strokeWidth="3" />
        <circle cx="31" cy="35" r="2" fill="currentColor" />
        <circle cx="69" cy="35" r="2" fill="currentColor" />
        <path d="M93 27 L95 28" stroke="#f43f5e" strokeWidth="3.5" />
        <path d="M3 25 L5 26" stroke="#38bdf8" strokeWidth="3.5" />
        <defs>
          <linearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.15)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.3)" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  const [imgError, setImgError] = React.useState(false);
  const showImage = vehicle.imageUrl && !imgError;

  const getVehicleYear = (modelStr) => {
    const match = modelStr.match(/\b(19|20)\d{2}\b/);
    return match ? match[0] : '2024';
  };

  const cleanModelName = (modelStr) => {
    return modelStr.replace(/\b(19|20)\d{2}\b/, '').trim();
  };

  const vehicleYear = getVehicleYear(vehicle.model);
  const modelDisplayName = cleanModelName(vehicle.model);

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl overflow-hidden flex flex-col h-full border border-white/5 shadow-2xl hover:border-blue-500/20 transition-all duration-300">
      {/* Vehicle Render (Image or SVG Fallback) */}
      <div 
        onClick={() => !isAdmin && navigate(`/vehicle/${vehicle.id}`)}
        className="h-56 bg-slate-950 relative flex items-center justify-center overflow-hidden cursor-pointer group"
      >
        {showImage ? (
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-24 h-24 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
            {renderCarSvg(vehicle.category)}
          </div>
        )}

        {/* Bottom Dark Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
        
        {/* Category Badge & Year Badge overlay */}
        <div className="absolute top-3.5 left-3.5 flex items-center space-x-2 pointer-events-none">
          <span className="bg-slate-950/80 backdrop-blur-md text-[9px] uppercase font-black tracking-widest text-white px-2.5 py-1 rounded">
            {vehicle.category}
          </span>
          <span className="bg-slate-950/80 backdrop-blur-md text-[9px] uppercase font-black tracking-widest text-white px-2.5 py-1 rounded">
            {vehicleYear}
          </span>
        </div>

        {/* Stock Status Badge overlay */}
        <div className="absolute top-3.5 right-3.5 pointer-events-none">
          {isOutOfStock ? (
            <span className="bg-slate-950/80 backdrop-blur-md text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded text-red-500 border border-red-500/20">
              Out of Stock
            </span>
          ) : vehicle.quantity <= 2 ? (
            <span className="bg-[#eab308]/10 text-[#eab308] border border-[#eab308]/20 backdrop-blur-md text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded">
              Low Stock ({vehicle.quantity})
            </span>
          ) : (
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-md text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded">
              In Stock ({vehicle.quantity})
            </span>
          )}
        </div>

        {/* Overlaid Make & Model at bottom-left */}
        <div className="absolute bottom-4 left-4 flex flex-col pointer-events-none">
          <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest leading-none">
            {vehicle.make}
          </span>
          <h3 className="text-xl font-extrabold text-white tracking-tight mt-1 leading-none drop-shadow-md">
            {modelDisplayName}
          </h3>
        </div>
      </div>

      {/* Card Info Area */}
      <div className="p-4.5 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Stock Unit Counter and Price row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold text-xs">
              <Database className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span>Stock: <strong className="text-white">{vehicle.quantity} units</strong></span>
            </div>
            <span className="text-lg font-black text-cyan-400">
              ${vehicle.price.toLocaleString()}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-400 line-clamp-2 h-8 leading-relaxed">
            {vehicle.description || "A premium high-performance vehicle designed for exceptional driving dynamics, style, and luxury comfort."}
          </p>
        </div>

        {/* Action Button Panels */}
        <div className="space-y-2">
          {/* Main Purchase Button */}
          <button
            onClick={() => addToCart(vehicle)}
            disabled={isOutOfStock || isCartLimitReached}
            className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs transition-all duration-300 ${
              isOutOfStock
                ? 'bg-slate-900 text-slate-600 border border-slate-800/50 cursor-not-allowed'
                : isCartLimitReached
                ? 'bg-slate-900 text-indigo-500 border border-indigo-500/20 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black shadow-glow'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>
              {isOutOfStock
                ? 'Sold Out'
                : isCartLimitReached
                ? 'Max Limit Reached'
                : qtyInCart > 0
                ? `Purchase Vehicle (${qtyInCart} in Cart)`
                : 'Purchase Vehicle'}
            </span>
          </button>

          {/* Admin Tools Row */}
          {isAdmin && (
            <div className="flex gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => onRestock(vehicle)}
                className="flex-1 flex items-center justify-center space-x-1.5 bg-slate-950 border border-white/5 hover:bg-slate-900 text-gray-300 hover:text-white py-2 rounded-xl text-xs font-bold transition-all"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Restock</span>
              </button>

              <button
                onClick={() => onEdit(vehicle)}
                className="flex-1 flex items-center justify-center space-x-1.5 bg-slate-950 border border-white/5 hover:bg-slate-900 text-gray-300 hover:text-white py-2 rounded-xl text-xs font-bold transition-all"
              >
                <Edit2 className="h-3 w-3" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => onDelete(vehicle.id)}
                className="bg-slate-950 border border-white/5 hover:border-red-500/20 hover:text-red-400 text-gray-400 p-2 rounded-xl transition-all flex items-center justify-center"
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
