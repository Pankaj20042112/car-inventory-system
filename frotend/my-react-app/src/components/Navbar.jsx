import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/Authcontext';
import { Car, LogOut, Shield, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 shadow-md">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl text-white shadow-glow">
          <Car className="h-6 w-6" />
        </div>
        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
          VeloCity Systems
        </span>
      </div>

      <div className="flex items-center space-x-6">
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all duration-200"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center space-x-2 text-indigo-300 hover:text-white hover:bg-indigo-500/10 px-3 py-2 rounded-lg border border-indigo-500/20 transition-all duration-200"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            )}

            <div className="h-4 w-[1px] bg-white/10" />

            <div className="flex items-center space-x-3">
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-white">{user.username}</span>
                <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white p-2 rounded-lg transition-all duration-200 border border-red-500/20"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
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
  );
};

export default Navbar;
