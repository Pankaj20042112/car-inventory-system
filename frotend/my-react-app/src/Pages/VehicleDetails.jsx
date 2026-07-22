import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ShieldCheck, Gauge, Zap, Info, Loader2 } from 'lucide-react';
import { getVehicleById } from '../services/vehicalService';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/Authcontext';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart, cart } = useContext(CartContext);

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const data = await getVehicleById(id);
        setVehicle(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load vehicle details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60svh] space-y-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <span className="text-sm font-semibold text-gray-400">Fetching performance catalog...</span>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="text-red-400 text-lg font-bold">{error || 'Vehicle not found.'}</div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl border border-white/10 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const isOutOfStock = vehicle.quantity <= 0;
  const cartItem = Array.isArray(cart) ? cart.find((item) => item.id === vehicle.id) : null;
  const qtyInCart = cartItem ? cartItem.cartQuantity : 0;
  const isCartLimitReached = qtyInCart >= vehicle.quantity;

  // Generate dynamic premium specs based on vehicle category/make
  const getPerformanceSpecs = (category, make) => {
    const cat = category.toLowerCase();
    const manufacturer = make.toLowerCase();

    if (manufacturer.includes('tesla')) {
      return {
        powertrain: 'Tri-Motor AWD Electric',
        acceleration: '1.99s',
        range: '396 miles',
        topSpeed: '200 mph',
        horsepower: '1,020 hp',
        transmission: 'Single-speed Automatic'
      };
    }
    
    if (cat.includes('suv')) {
      return {
        powertrain: '4.0L V8 Twin-Turbocharged',
        acceleration: '3.1s',
        range: '14 mpg City / 19 mpg Hwy',
        topSpeed: '190 mph',
        horsepower: '657 hp',
        transmission: '8-Speed Automatic'
      };
    }

    if (cat.includes('truck')) {
      return {
        powertrain: '3.5L V6 Twin-Turbo Hybrid',
        acceleration: '5.3s',
        range: '15 mpg City / 18 mpg Hwy',
        topSpeed: '120 mph',
        horsepower: '450 hp',
        transmission: '10-Speed Automatic'
      };
    }

    return {
      powertrain: '4.4L V8 TwinPower Turbo',
      acceleration: '3.0s',
      range: '15 mpg City / 22 mpg Hwy',
      topSpeed: '190 mph',
      horsepower: '617 hp',
      transmission: '8-Speed Sport Automatic'
    };
  };

  const getSpecs = () => {
    const dynamic = getPerformanceSpecs(vehicle.category, vehicle.make);
    return {
      powertrain: vehicle.powertrain || dynamic.powertrain,
      acceleration: vehicle.acceleration || dynamic.acceleration,
      range: vehicle.range || dynamic.range,
      topSpeed: vehicle.topSpeed || dynamic.topSpeed,
      horsepower: vehicle.horsepower || dynamic.horsepower,
      transmission: vehicle.transmission || dynamic.transmission
    };
  };

  const specs = getSpecs();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 flex-grow w-full">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/5 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Showroom</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Image/Visual representation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-xl relative aspect-video flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40">
            {vehicle.imageUrl && !imgError ? (
              <img
                src={vehicle.imageUrl}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-indigo-300 space-y-4">
                <Zap className="h-24 w-24 opacity-30 animate-pulse filter drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                <span className="text-sm font-semibold tracking-wider uppercase text-slate-500">VeloCity Showroom Render</span>
              </div>
            )}

            {/* Badges */}
            <span className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-md text-xs uppercase font-bold tracking-wider text-indigo-300 border border-indigo-500/20 px-4 py-1.5 rounded-full">
              {vehicle.category}
            </span>
          </div>

          {/* Specifications Table */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-white/5 pb-4">
              <Gauge className="h-5 w-5 text-indigo-400" />
              <span>Performance Parameters</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="bg-slate-950/30 p-4.5 rounded-2xl border border-white/5">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Powertrain</div>
                <div className="font-bold text-white mt-1 text-base">{specs.powertrain}</div>
              </div>
              <div className="bg-slate-950/30 p-4.5 rounded-2xl border border-white/5">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Horsepower</div>
                <div className="font-bold text-white mt-1 text-base">{specs.horsepower}</div>
              </div>
              <div className="bg-slate-950/30 p-4.5 rounded-2xl border border-white/5">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Acceleration (0-60 mph)</div>
                <div className="font-bold text-white mt-1 text-base">{specs.acceleration}</div>
              </div>
              <div className="bg-slate-950/30 p-4.5 rounded-2xl border border-white/5">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Top Speed</div>
                <div className="font-bold text-white mt-1 text-base">{specs.topSpeed}</div>
              </div>
              <div className="bg-slate-950/30 p-4.5 rounded-2xl border border-white/5">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Transmission Type</div>
                <div className="font-bold text-white mt-1 text-base">{specs.transmission}</div>
              </div>
              <div className="bg-slate-950/30 p-4.5 rounded-2xl border border-white/5">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Fuel Economy / Range</div>
                <div className="font-bold text-white mt-1 text-base">{specs.range}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout panel & Description */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-xl space-y-6">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-indigo-400">{vehicle.make}</span>
              <h1 className="text-3xl font-black text-white mt-1">{vehicle.model}</h1>
            </div>

            <div className="text-3xl font-black text-emerald-400 bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              ${vehicle.price.toLocaleString()}
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-medium">Availability</span>
                <span className={`font-bold px-3 py-1 rounded-full text-xs uppercase border ${
                  isOutOfStock
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {isOutOfStock ? 'Sold Out' : `${vehicle.quantity} In Stock`}
                </span>
              </div>

              {!isAdmin && qtyInCart > 0 && (
                <div className="flex items-center justify-between text-sm border-t border-white/5 pt-4">
                  <span className="text-slate-400 font-medium">In your Cart</span>
                  <span className="text-indigo-400 font-bold">{qtyInCart} Units</span>
                </div>
              )}
            </div>

            {!isAdmin && (
              <button
                onClick={() => addToCart(vehicle)}
                disabled={isOutOfStock || isCartLimitReached}
                className={`w-full flex items-center justify-center space-x-2.5 py-4 rounded-2xl font-bold transition-all duration-200 shadow-glow ${
                  isOutOfStock
                    ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                    : isCartLimitReached
                    ? 'bg-slate-800 text-indigo-400 border border-indigo-500/20 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/30'
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>
                  {isOutOfStock
                    ? 'Unavailable'
                    : isCartLimitReached
                    ? 'Limit Reached'
                    : qtyInCart > 0
                    ? `Add More (${qtyInCart})`
                    : 'Add to Cart'}
                </span>
              </button>
            )}
          </div>

          {/* Specifications Description Card */}
          {vehicle.description && (
            <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-2">
                <Info className="h-4.5 w-4.5" />
                <span>Vehicle Overview</span>
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {vehicle.description}
              </p>
            </div>
          )}

          {/* Dealership Warranty Guarantee */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 flex items-start space-x-4">
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400 border border-emerald-500/20 mt-0.5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Dealership Guarantee</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Factory-certified performance checks, standard 3-Year comprehensive parts warranty, and 24/7 roadside assistance support.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default VehicleDetails;
