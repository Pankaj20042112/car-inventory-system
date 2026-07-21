import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/Authcontext';
import { ArrowRight, ShieldCheck, Flame, Trophy } from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 max-w-6xl mx-auto flex-grow">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mb-12 space-y-6">
        <span className="bg-indigo-500/10 text-indigo-400 text-xs uppercase font-extrabold tracking-wider border border-indigo-500/20 px-4 py-1.5 rounded-full inline-block">
          Next-Gen Inventory Control
        </span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.1]">
          Rev Up Your{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
            Dealership Workflow
          </span>
        </h1>
        <p className="text-lg text-gray-400 font-medium">
          A high-performance single-page application built for modern automotive enterprise. Track, search, and manage premium inventory with ease and security.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
        <Link
          to={user ? "/dashboard" : "/login"}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-glow text-base"
        >
          <span>Enter Showroom</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        {!user && (
          <Link
            to="/register"
            className="bg-slate-900/60 hover:bg-slate-900 border border-white/10 hover:border-white/20 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 text-base"
          >
            Create Free Account
          </Link>
        )}
      </div>

      {/* Core Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {/* Card 1 */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-md flex flex-col space-y-4">
          <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-2xl border border-indigo-500/20 w-fit">
            <Flame className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Instant Operations</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Perform real-time purchases and restocks. Track dynamic inventory counts and prevent double-purchasing instantly.
          </p>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-md flex flex-col space-y-4">
          <div className="bg-purple-500/10 text-purple-400 p-3 rounded-2xl border border-purple-500/20 w-fit">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Secure Architecture</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Secured using cryptographically signed JSON Web Tokens (JWT) and role-based permissions preventing unauthorized actions.
          </p>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-md flex flex-col space-y-4">
          <div className="bg-amber-500/10 text-amber-400 p-3 rounded-2xl border border-amber-500/20 w-fit">
            <Trophy className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Premium UI Console</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Beautiful glassmorphism aesthetics, responsive layouts, micro-animations, and dynamic visual filters for user comfort.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
