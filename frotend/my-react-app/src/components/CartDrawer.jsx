import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { X, ShoppingCart, Trash2, Plus, Minus, CreditCard, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, onCheckoutSuccess }) => {
  const { cart, addToCart, removeFromCart, removeFullyFromCart, cartCount, cartTotal, executeCheckout } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const purchases = await executeCheckout();
      if (purchases && purchases.length > 0) {
        onCheckoutSuccess(purchases);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel border-l border-white/10 shadow-2xl flex flex-col bg-slate-900/95 text-white animate-slide-in">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/30">
            <div className="flex items-center space-x-2.5">
              <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-400 border border-indigo-500/20">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Your Shopping Cart</h3>
                <p className="text-xs text-slate-400">{cartCount} {cartCount === 1 ? 'item' : 'items'} ready for checkout</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all duration-150"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-grow p-6 overflow-y-auto space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                <div className="bg-slate-950/40 p-6 rounded-full border border-white/5">
                  <ShoppingCart className="h-12 w-12 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Your cart is empty</h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">Browse our premium showroom catalog to select high-end vehicles.</p>
                </div>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-white/10 transition-colors duration-150"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={`${item.make} ${item.model}`}
                        className="w-14 h-10 object-cover rounded-lg bg-slate-900 border border-white/10"
                      />
                    ) : (
                      <div className="w-14 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{item.make} {item.model}</h4>
                      <p className="text-xs text-slate-400 capitalize">{item.category}</p>
                      <p className="text-xs font-bold text-emerald-400 mt-0.5">${item.price?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Quantity controls */}
                    <div className="flex items-center bg-slate-900 border border-white/5 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="px-2 py-1 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-slate-200">{item.cartQuantity}</span>
                      <button 
                        onClick={() => addToCart(item)}
                        disabled={item.cartQuantity >= item.quantity}
                        className="px-2 py-1 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Trash */}
                    <button 
                      onClick={() => removeFullyFromCart(item.id)}
                      className="text-slate-400 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all duration-150"
                      title="Remove Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer Summary */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-slate-950/30 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Items Count:</span>
                  <span className="font-semibold text-white">{cartCount} Units</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Luxury Delivery Fees:</span>
                  <span className="font-semibold text-emerald-400">Free / Included</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-white/5">
                  <span>Estimated Total:</span>
                  <span className="text-xl font-black text-emerald-400">${cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-glow disabled:opacity-50 transition-all duration-150"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing Transactions...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>Authorize Purchase & Checkout</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
