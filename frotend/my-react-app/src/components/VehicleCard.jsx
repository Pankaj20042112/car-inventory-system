import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Edit2, RotateCcw, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
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

  return (
    <div className="glass-panel glass-panel-hover rounded-3xl overflow-hidden flex flex-col h-full border border-white/10 hover:border-indigo-500/20 shadow-2xl transition-all duration-300">
      {/* Vehicle Render (Image or SVG Fallback) */}
      <div 
        onClick={() => !isAdmin && navigate(`/vehicle/${vehicle.id}`)}
        className={`h-48 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 relative flex items-center justify-center border-b border-white/5 overflow-hidden ${
          !isAdmin ? 'cursor-pointer group' : ''
        }`}
      >
        {showImage ? (
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-28 h-28 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
            {renderCarSvg(vehicle.category)}
          </div>
        )}
        
        {/* Category Badge */}
        <span className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-[9px] uppercase font-black tracking-widest text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-xl">
          {vehicle.category}
        </span>

        {/* Stock Badge */}
        <span className={`absolute top-4 right-4 text-[9px] uppercase font-black tracking-widest px-3 py-1.5 rounded-xl backdrop-blur-md border ${
          isOutOfStock
            ? 'bg-red-500/10 text-red-400 border-red-500/20'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }`}>
          {isOutOfStock ? 'Sold Out' : `${vehicle.quantity} Available`}
        </span>
      </div>

      {/* Vehicle Specs */}
      <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
        <div>
          <div 
            onClick={() => !isAdmin && navigate(`/vehicle/${vehicle.id}`)}
            className={!isAdmin ? 'cursor-pointer group/title' : ''}
          >
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">{vehicle.make}</span>
            <h3 className="text-2xl font-black text-white tracking-tight mt-1 mb-2 group-hover/title:text-indigo-400 transition-colors duration-200">{vehicle.model}</h3>
          </div>
          
          <div className="flex items-baseline space-x-1.5">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">MSRP Starting At</span>
            <span className="text-2xl font-black text-white bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              ${vehicle.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Purchase / Add to Cart Button */}
          {!isAdmin && (
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                className="flex-1 bg-slate-950 hover:bg-slate-900 text-gray-300 hover:text-white font-semibold py-3 rounded-2xl text-xs transition-all duration-300 border border-white/10 hover:border-indigo-500/30"
              >
                Specs Details
              </button>

              <button
                onClick={() => addToCart(vehicle)}
                disabled={isOutOfStock || isCartLimitReached}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-2xl font-black text-xs transition-all duration-300 ${
                  isOutOfStock
                    ? 'bg-slate-900 text-slate-600 border border-slate-800/50 cursor-not-allowed'
                    : isCartLimitReached
                    ? 'bg-slate-900 text-indigo-500 border border-indigo-500/20 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:scale-[1.02] hover:shadow-glow text-white border border-indigo-500/30'
                }`}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>
                  {isOutOfStock
                    ? 'Sold Out'
                    : isCartLimitReached
                    ? 'Max Limit'
                    : qtyInCart > 0
                    ? `Add (${qtyInCart})`
                    : 'Add'}
                </span>
              </button>
            </div>
          )}

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
