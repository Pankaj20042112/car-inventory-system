import React from 'react';
import { X, CheckCircle, Info, ShieldCheck, Zap, Gauge, Heart, ShoppingCart } from 'lucide-react';

const VehicleDetailsModal = ({ isOpen, onClose, vehicle, onAddToCart, qtyInCart, isCartLimitReached, isAdmin }) => {
  if (!isOpen || !vehicle) return null;

  // Generate dynamic premium specs based on vehicle category/make
  const getPerformanceSpecs = (category, make) => {
    const cat = category.toLowerCase();
    const manufacturer = make.toLowerCase();

    if (manufacturer.includes('tesla')) {
      return {
        powertrain: 'Tri-Motor AWD Electric',
        acceleration: '1.99s (0-60 mph)',
        range: '396 miles (Est.)',
        topSpeed: '200 mph',
        horsepower: '1,020 hp',
        transmission: 'Single-speed Automatic'
      };
    }
    
    if (cat.includes('suv')) {
      return {
        powertrain: '4.0L V8 Twin-Turbocharged',
        acceleration: '3.1s (0-60 mph)',
        range: '14 mpg City / 19 mpg Hwy',
        topSpeed: '190 mph',
        horsepower: '657 hp',
        transmission: '8-Speed Automatic'
      };
    }

    if (cat.includes('truck')) {
      return {
        powertrain: '3.5L V6 Twin-Turbo Hybrid',
        acceleration: '5.3s (0-60 mph)',
        range: '15 mpg City / 18 mpg Hwy',
        topSpeed: '120 mph',
        horsepower: '450 hp',
        transmission: '10-Speed Automatic'
      };
    }

    // Default High-end Sedan/Sports
    return {
      powertrain: '4.4L V8 TwinPower Turbo',
      acceleration: '3.0s (0-60 mph)',
      range: '15 mpg City / 22 mpg Hwy',
      topSpeed: '190 mph',
      horsepower: '617 hp',
      transmission: '8-Speed Sport Automatic'
    };
  };

  const specs = getPerformanceSpecs(vehicle.category, vehicle.make);
  const isOutOfStock = vehicle.quantity <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-white/15 overflow-hidden shadow-2xl relative flex flex-col max-h-[90svh] text-white">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/90 relative">
          <div className="flex items-center space-x-2.5">
            <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Vehicle Specifications</h3>
              <p className="text-xs text-slate-400 capitalize">{vehicle.make} Showroom Series</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow p-8 overflow-y-auto space-y-6">
          {/* Image & Title Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {vehicle.imageUrl ? (
              <img 
                src={vehicle.imageUrl} 
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-44 object-cover rounded-2xl border border-white/10 bg-slate-950"
              />
            ) : (
              <div className="w-full h-44 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-300">
                <Zap className="h-16 w-16 opacity-30 animate-pulse" />
              </div>
            )}
            <div className="space-y-3">
              <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">
                {vehicle.category}
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white">{vehicle.make} {vehicle.model}</h2>
              <div className="text-2xl font-black text-emerald-400">${vehicle.price?.toLocaleString()}</div>
              
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-emerald-500'}`} />
                <span>{isOutOfStock ? 'Sold Out' : `${vehicle.quantity} Available in Showroom`}</span>
              </div>
            </div>
          </div>

          {/* Custom Description/Specs */}
          {vehicle.description && (
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Info className="h-4 w-4" />
                <span>Overview & Features</span>
              </h4>
              <p className="text-sm text-slate-200 mt-1 leading-relaxed whitespace-pre-wrap">
                {vehicle.description}
              </p>
            </div>
          )}

          {/* Performance Grid */}
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Gauge className="h-4 w-4" />
              <span>Performance & Powertrain</span>
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-slate-500">Engine / Motor</div>
                <div className="font-semibold text-white mt-0.5">{specs.powertrain}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Horsepower</div>
                <div className="font-semibold text-white mt-0.5">{specs.horsepower}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Acceleration (0-60 mph)</div>
                <div className="font-semibold text-white mt-0.5">{specs.acceleration}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Top Speed</div>
                <div className="font-semibold text-white mt-0.5">{specs.topSpeed}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Transmission</div>
                <div className="font-semibold text-white mt-0.5">{specs.transmission}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Fuel Economy / Range</div>
                <div className="font-semibold text-white mt-0.5">{specs.range}</div>
              </div>
            </div>
          </div>

          {/* Guarantee / Warranty */}
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 flex items-start space-x-4">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400 border border-emerald-500/20 mt-0.5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Premium Dealership Guarantee</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                All vehicle deliveries include a standard 3-Year Factory Warranty, comprehensive luxury maintenance package, and standard dealer road-side assistance checks.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="p-6 bg-slate-900/90 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {!isAdmin && qtyInCart > 0 && <span>Currently in cart: <strong className="text-indigo-400">{qtyInCart} units</strong></span>}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            >
              Close Details
            </button>

            {!isAdmin && (
              <button
                onClick={() => {
                  onAddToCart(vehicle);
                }}
                disabled={isOutOfStock || isCartLimitReached}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-glow transition-all duration-150 ${
                  isOutOfStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : isCartLimitReached
                    ? 'bg-slate-800 text-indigo-400 border border-indigo-500/20 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>
                  {isOutOfStock
                    ? 'Unavailable'
                    : isCartLimitReached
                    ? 'Max Stock Added'
                    : qtyInCart > 0
                    ? `Add More (${qtyInCart})`
                    : 'Add to Cart'}
                </span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default VehicleDetailsModal;
