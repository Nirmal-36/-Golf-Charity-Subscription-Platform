import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import ScoreSubmit from './pages/ScoreSubmit';
import CharityBrowse from './pages/CharityBrowse';
import Subscription from './pages/Subscription';
import Success from './pages/Success';
import Cancel from './pages/Cancel';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-brand-green text-center">Login</h1>
        {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              className="w-full border rounded p-2" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="w-full border rounded p-2" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="w-full py-2 bg-brand-green text-white rounded font-bold">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
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
      </Routes>
    </div>
  );
}

export default App;
