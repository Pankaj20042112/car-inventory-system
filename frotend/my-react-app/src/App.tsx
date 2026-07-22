import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/Authcontext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import Admin from './Pages/Admin';
import AddVehicle from './Pages/AddVehicle';
import EditVehicle from './Pages/EditVehicle';
import { Loader2 } from 'lucide-react';
import './App.css';

// Route guards
interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const PrivateRoute = ({ children, requireAdmin = false }: PrivateRouteProps) => {
  const { user, loading } = useContext(AuthContext) as any;


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60svh] space-y-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <span className="text-sm font-semibold text-gray-500">Authorizing credentials...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const DashboardRoute = () => {
  const { user } = useContext(AuthContext) as any;
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Dashboard />;
};

const HomeRoute = () => {
  const { user } = useContext(AuthContext) as any;
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative flex flex-col min-h-screen bg-[#131b2e] text-gray-100 selection:bg-indigo-500/30 selection:text-white overflow-hidden">
          {/* Animated Colorful Background Layer */}
          <div className="colorful-bg-wrapper">
            <div className="colorful-orb-1" />
            <div className="colorful-orb-2" />
            <div className="colorful-orb-3" />
            <div className="colorful-grid-overlay" />
          </div>

          <Navbar />
          
          <main className="relative z-10 flex-grow flex flex-col pt-24">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomeRoute />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Regular Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardRoute />
                  </PrivateRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute requireAdmin>
                    <Admin />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/add"
                element={
                  <PrivateRoute>
                    <AddVehicle />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/edit/:id"
                element={
                  <PrivateRoute requireAdmin>
                    <EditVehicle />
                  </PrivateRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
