import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Authentication Gateway: Login
 * Facilitates secure user access through JWT credential verification.
 * Implements role-based redirection to ensure administrators, partners, 
 * and members lands on their respective command centers.
 */
const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Transaction Handler: handleSubmit
   * Orchestrates the authentication request and executes the 
   * redirection logic based on user authorization levels.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await login(email, password);
      
      // Routing Logic: Identity-aware redirection
      if (res.user.is_staff || res.user.user_role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.user.user_role === 'organization') {
        navigate('/org/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Identity Verification Failed: Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-light p-4">
      <div className="p-8 bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-extrabold mb-2 text-brand-green text-center">Welcome Back</h1>
        <p className="text-center text-gray-500 mb-8">Access your dashboard and entries.</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Email</label>
            <input 
              type="email" 
              className="w-full border-2 border-gray-50 rounded-xl p-3 focus:border-brand-green outline-none transition bg-gray-50/50" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Password</label>
            <input 
              type="password" 
              className="w-full border-2 border-gray-50 rounded-xl p-3 focus:border-brand-green outline-none transition bg-gray-50/50" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <div className="flex justify-end pt-1 pb-4">
             <Link to="/forgot-password" size={14} className="text-xs font-bold text-gray-400 hover:text-brand-green transition">Forgot Password?</Link>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 bg-brand-green text-white rounded-xl font-bold shadow-lg shadow-brand-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          New to the platform? <Link to="/register" className="text-brand-green font-bold hover:underline">Create an Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
