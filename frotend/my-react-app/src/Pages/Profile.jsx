import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/Authcontext';
import { updateProfile, updatePassword } from '../services/authService';
import { getMyPurchases, getAllPurchases, getVehicles } from '../services/vehicalService';
import { User, Mail, Shield, UserCheck, KeyRound, AlertCircle, CheckCircle2, TrendingUp, DollarSign, Database, Loader2, Award, Calendar, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, setUser, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    category: user?.category || 'Customer',
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Page States
  const [stats, setStats] = useState({
    totalCount: 0,
    totalSpent: 0,
    activeInventoryCount: 0,
    outOfStockCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: '' });
    }, 4000);
  };

  useEffect(() => {
    const fetchUserStats = async () => {
      setStatsLoading(true);
      try {
        if (user?.role === 'admin') {
          // Admin Stats
          const [allInventory, allSales] = await Promise.all([
            getVehicles(),
            getAllPurchases()
          ]);
          const outOfStock = allInventory.filter(v => v.quantity <= 0).length;
          const grossRevenue = allSales.reduce((sum, p) => sum + (p.price || 0), 0);
          setStats({
            totalCount: allSales.length, // total customer orders processed
            totalSpent: grossRevenue, // gross sales
            activeInventoryCount: allInventory.length,
            outOfStockCount: outOfStock
          });
        } else {
          // Customer Stats
          const myPurchases = await getMyPurchases();
          const totalSpentAmt = myPurchases.reduce((sum, p) => sum + (p.price || 0), 0);
          setStats({
            totalCount: myPurchases.length,
            totalSpent: totalSpentAmt,
            activeInventoryCount: 0,
            outOfStockCount: 0
          });
        }
      } catch (err) {
        console.error('Failed to load user profile statistics', err);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      if (profileForm.name.trim() === '') {
        showToast('Name cannot be empty', 'error');
        setProfileLoading(false);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileForm.email)) {
        showToast('Please enter a valid email address', 'error');
        setProfileLoading(false);
        return;
      }

      const updatedUser = await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        category: profileForm.category,
      });

      setUser(updatedUser);
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update profile details', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);

    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      setPasswordLoading(false);
      return;
    }

    try {
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      showToast('Password changed successfully!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Password update failed', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Avatar Initials
  const getInitials = (nameStr) => {
    if (!nameStr) return 'VS';
    return nameStr
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex-grow py-12 px-4 max-w-6xl mx-auto w-full space-y-8">
      {/* Toast Alert */}
      {toast.message && (
        <div className={`fixed bottom-6 right-6 flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl border z-50 animate-bounce ${
          toast.type === 'error'
            ? 'bg-red-500/10 border-red-500/20 text-red-400'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header Profile Profile Header Card */}
      <div className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-glow select-none">
          {getInitials(user?.name)}
        </div>

        <div className="flex-grow text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white">{user?.name || 'VeloCity User'}</h1>
            <span className="inline-block bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-center">
              {user?.role === 'admin' ? 'Administrator' : 'Customer'}
            </span>
          </div>
          <p className="text-slate-300 font-medium text-sm">@{user?.username}</p>
          <div className="flex items-center justify-center md:justify-start space-x-6 pt-2 text-xs text-slate-400">
            <div className="flex items-center space-x-1">
              <Mail className="h-4 w-4 text-indigo-400" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Award className="h-4 w-4 text-purple-400" />
              <span>Category: {user?.category || 'Customer'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Edit Details & Password */}
        <div className="lg:col-span-2 space-y-8">
          {/* Edit Profile Form */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 pb-2 border-b border-white/10">
              <div className="bg-indigo-500/15 p-2 rounded-xl text-indigo-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Update Personal Profile</h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Customer Category</label>
                <select
                  value={profileForm.category}
                  onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="Customer">Standard Customer</option>
                  <option value="Silver Member">Silver Member</option>
                  <option value="Gold Member">Gold Member</option>
                  <option value="Premium VIP">Premium VIP</option>
                  <option value="Corporate Dealership">Corporate Dealership</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-center justify-end pt-3">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-glow disabled:opacity-50"
                >
                  {profileLoading ? 'Saving Profile...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 pb-2 border-b border-white/10">
              <div className="bg-purple-500/15 p-2 rounded-xl text-purple-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Change Credentials Password</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end pt-3">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-glow disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating credentials...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 1 Column: Stats Panel */}
        <div className="space-y-8">
          <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 pb-2 border-b border-white/10">
              <div className="bg-indigo-500/15 p-2 rounded-xl text-indigo-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white">System Activity & Metrics</h2>
            </div>

            {statsLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                <span className="text-xs text-slate-400 font-semibold">Summarizing account activity...</span>
              </div>
            ) : user?.role === 'admin' ? (
              // Admin Stats Details
              <div className="space-y-5">
                <div className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl flex items-center space-x-4">
                  <div className="bg-indigo-500/15 p-3 rounded-xl text-indigo-300 border border-indigo-500/20">
                    <Database className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Managed Fleet Assets</div>
                    <div className="text-xl font-black text-white">{stats.activeInventoryCount} Models</div>
                  </div>
                </div>

                <div className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl flex items-center space-x-4">
                  <div className="bg-emerald-500/15 p-3 rounded-xl text-emerald-300 border border-emerald-500/20">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Gross Sales Logged</div>
                    <div className="text-xl font-black text-emerald-400">${stats.totalSpent.toLocaleString()}</div>
                  </div>
                </div>

                <div className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl flex items-center space-x-4">
                  <div className="bg-purple-500/15 p-3 rounded-xl text-purple-300 border border-purple-500/20">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Total Purchase Orders</div>
                    <div className="text-xl font-black text-white">{stats.totalCount} Orders</div>
                  </div>
                </div>
              </div>
            ) : (
              // Customer Stats Details
              <div className="space-y-5">
                <div className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl flex items-center space-x-4">
                  <div className="bg-indigo-500/15 p-3 rounded-xl text-indigo-300 border border-indigo-500/20">
                    <Database className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Vehicles Purchased</div>
                    <div className="text-xl font-black text-white">{stats.totalCount} Units</div>
                  </div>
                </div>

                <div className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl flex items-center space-x-4">
                  <div className="bg-emerald-500/15 p-3 rounded-xl text-emerald-300 border border-emerald-500/20">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Total Amount Invested</div>
                    <div className="text-xl font-black text-emerald-400">${stats.totalSpent.toLocaleString()}</div>
                  </div>
                </div>

                <div className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl flex items-center space-x-4">
                  <div className="bg-purple-500/15 p-3 rounded-xl text-purple-300 border border-purple-500/20">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Member Status</div>
                    <div className="text-xl font-black text-white">Active Account</div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-white/10 mt-6">
              <button
                onClick={() => {
                  logoutUser();
                  navigate('/');
                }}
                className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 py-3.5 rounded-xl font-bold transition-all duration-200 shadow-glow"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
