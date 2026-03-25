import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import ScoreSubmit from './pages/ScoreSubmit';
import CharityBrowse from './pages/CharityBrowse';
import Subscription from './pages/Subscription';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import Draw from './pages/Draw';
import DrawHistory from './pages/DrawHistory';
import MyWins from './pages/MyWins';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminPayouts from './pages/AdminPayouts';
import AdminAuditLogs from './pages/AdminAuditLogs';
import Login from './pages/Login';
import Register from './pages/Register';

/**
 * Protected Route for Admin only
 */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || !user.is_staff) return <Navigate to="/" />;
  return children;
};

// Protected Route Wrapper enforces Authentication AND Active Subscription
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  // If user is authenticated but not active (and not staff), redirect to subscription page
  if (user.subscription_status !== 'active' && !user.is_staff) {
    if (location.pathname !== '/subscribe') {
      return <Navigate to="/subscribe" />;
    }
  }
  
  return children;
};

function App() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-brand-light font-sans text-brand-dark">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Subscription Pages */}
        <Route path="/subscribe" element={
          user ? <Subscription /> : <Navigate to="/login" />
        } />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />

        {/* Protected Routes (Require Active Subscription) */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/scores/submit" element={<ProtectedRoute><ScoreSubmit /></ProtectedRoute>} />
        <Route path="/charities" element={<ProtectedRoute><CharityBrowse /></ProtectedRoute>} />
        <Route path="/draw" element={<ProtectedRoute><Draw /></ProtectedRoute>} />
        <Route path="/draw/history" element={<ProtectedRoute><DrawHistory /></ProtectedRoute>} />
        <Route path="/my-wins" element={<ProtectedRoute><MyWins /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/payouts" element={<AdminRoute><AdminPayouts /></AdminRoute>} />
        <Route path="/admin/logs" element={<AdminRoute><AdminAuditLogs /></AdminRoute>} />
      </Routes>
    </div>
  );
}

export default App;
