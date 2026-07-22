import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/Authcontext';
import { CartContext } from '../context/CartContext';
import { Car, LogOut, Shield, LayoutDashboard, LogIn, UserPlus, User, ShoppingCart, Sun, Moon } from 'lucide-react';
import CartDrawer from './CartDrawer';
import InteractiveReceiptModal from './InteractiveReceiptModal';
import { generateReceiptPDF } from '../utils/pdfHelper';

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutPurchases, setCheckoutPurchases] = useState(null);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <>
      <nav className="glass-panel fixed top-0 left-0 right-0 w-full z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-2.5 rounded-xl text-white shadow-glow flex items-center justify-center">
            {/* Custom Modern Speed Vector Logo */}
            <svg className="h-5.5 w-5.5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.95" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <Link to="/" className="text-xl font-black tracking-wider text-white flex items-center gap-2">
            <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">VeloCity</span>
            <span className="text-[9px] uppercase font-black tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">SYSTEMS</span>
          </Link>
        </div>

        <div className="flex items-center space-x-6">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 text-indigo-300 hover:text-white hover:bg-indigo-500/10 px-3 py-2 rounded-lg border border-indigo-500/20 transition-all duration-200"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Console</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all duration-200"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>My Dashboard</span>
                  </Link>

                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all duration-200 font-semibold text-sm"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden sm:inline">Cart</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-slate-900 shadow-glow">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </>
              )}

              <div className="h-4 w-[1px] bg-white/10" />

              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-indigo-300 hover:text-white hover:bg-indigo-500/10 px-3 py-2 rounded-lg border border-indigo-500/20 transition-all duration-200"
                  title="View Profile"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm font-semibold">{user.username}</span>
                </Link>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white px-3 py-2 rounded-lg transition-all duration-200 border border-red-500/20 font-bold text-xs"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="flex items-center space-x-2 text-gray-300 hover:text-white px-4 py-2 transition-all duration-200"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-xl transition-all duration-200 shadow-glow"
              >
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Cart Drawer Panel */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckoutSuccess={(purchases) => {
          setCheckoutPurchases(purchases);
          window.dispatchEvent(new Event('cart-checkout-success'));
        }}
      />

      {/* Interactive Checkout Receipt Modal */}
      <InteractiveReceiptModal
        isOpen={!!checkoutPurchases}
        onClose={() => setCheckoutPurchases(null)}
        purchase={checkoutPurchases}
        onDownloadPDF={() => {
          if (checkoutPurchases) {
            generateReceiptPDF(checkoutPurchases);
          }
        }}
      />
    </>
  );
};

export default Navbar;
