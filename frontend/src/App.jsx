import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Temporary Mock Pages
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

const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-brand-green mb-4">Dashboard</h1>
      <p>Welcome, {user?.email || 'User'}</p>
      <button onClick={logout} className="mt-4 px-4 py-2 bg-brand-gold text-white rounded">Logout</button>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-brand-light font-sans text-brand-dark">
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
