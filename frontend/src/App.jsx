import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import MainLayout from './components/MainLayout';
import ScrollToTop from './components/ScrollToTop';

// Core Pages
import LandingPage from './pages/public/LandingPage';
import ExploreCharities from './pages/charity/ExploreCharities';
import Membership from './pages/public/Membership';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StaticPage from './pages/public/StaticPage';
import CharityRegister from './pages/auth/CharityRegister';

// Subscriber Pages
import Dashboard from './pages/dashboard/Dashboard';
import ScoreSubmit from './pages/dashboard/ScoreSubmit';
import CharityBrowse from './pages/charity/CharityBrowse';
import Subscription from './pages/dashboard/Subscription';
import Success from './pages/public/Success';
import Cancel from './pages/public/Cancel';
import Draw from './pages/draw/Draw';
import DrawHistory from './pages/draw/DrawHistory';
import MyWins from './pages/draw/MyWins';
import SubscriptionDetails from './pages/dashboard/SubscriptionDetails';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminCharities from './pages/admin/AdminCharities';
import AdminDraws from './pages/admin/AdminDraws';

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
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-light"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div></div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  
  // If user is authenticated but not active (and not staff), redirect to subscription page
  // ALLOW access to subscription details so they can see history and sub options
  if (user.subscription_status !== 'active' && !user.is_staff) {
    const allowedPaths = ['/subscribe', '/subscription/details', '/charities'];
    if (!allowedPaths.includes(location.pathname)) {
      return <Navigate to="/subscribe" />;
    }
  }
  
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-brand-light font-sans text-brand-dark">
      <ScrollToTop />
      <MainLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExploreCharities />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/charity-registration" element={<CharityRegister />} />
          
          {/* Static Content Routes */}
          <Route path="/about" element={<StaticPage title="Our Mission" description="Driving change through every swing." />} />
          <Route path="/faq" element={<StaticPage title="Frequently Asked Questions" description="Everything you need to know about the platform." />} />
          <Route path="/transparency" element={<StaticPage title="Transparency Report" description="Our commitment to accountable giving." />} />
          <Route path="/contact" element={<StaticPage title="Contact Support" description="We're here to help you and your game." />} />
          <Route path="/press" element={<StaticPage title="Press Inquiries" description="The latest news from the world of Golf Charity." />} />
          <Route path="/terms" element={<StaticPage title="Terms of Service" description="The rules of the game." />} />
          <Route path="/privacy" element={<StaticPage title="Privacy Policy" description="How we protect your data." />} />
          <Route path="/cookies" element={<StaticPage title="Cookie Settings" description="Managing your preferences." />} />
          
          <Route path="/subscribe" element={
            user ? <Subscription /> : <Navigate to="/login" />
          } />
          <Route path="/subscription/details" element={
            <ProtectedRoute>
              <SubscriptionDetails />
            </ProtectedRoute>
          } />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />

          {/* Protected Subscriber Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/scores/submit" element={<ProtectedRoute><ScoreSubmit /></ProtectedRoute>} />
          <Route path="/charities" element={<ProtectedRoute><CharityBrowse /></ProtectedRoute>} />
          <Route path="/draw" element={<ProtectedRoute><Draw /></ProtectedRoute>} />
          <Route path="/draw/history" element={<ProtectedRoute><DrawHistory /></ProtectedRoute>} />
          <Route path="/my-wins" element={<ProtectedRoute><MyWins /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/payouts" element={<AdminRoute><AdminPayouts /></AdminRoute>} />
          <Route path="/admin/logs" element={<AdminRoute><AdminAuditLogs /></AdminRoute>} />
          <Route path="/admin/charities" element={<AdminRoute><AdminCharities /></AdminRoute>} />
          <Route path="/admin/draws" element={<AdminRoute><AdminDraws /></AdminRoute>} />

          {/* Redirect old root to dashboard if logged in */}
          <Route path="/home" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </div>
  );
}

export default App;
