import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try a different username or email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-light p-4">
      <div className="p-8 bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-extrabold mb-2 text-brand-green text-center">Join the Club</h1>
        <p className="text-center text-gray-500 mb-8">Start your journey of golf and giving.</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">First Name</label>
              <input 
                name="first_name"
                className="w-full border-2 border-gray-50 rounded-xl p-3 focus:border-brand-green outline-none transition bg-gray-50/50" 
                value={formData.first_name}
                onChange={handleChange}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Last Name</label>
              <input 
                name="last_name"
                className="w-full border-2 border-gray-50 rounded-xl p-3 focus:border-brand-green outline-none transition bg-gray-50/50" 
                value={formData.last_name}
                onChange={handleChange}
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Username</label>
            <input 
              name="username"
              className="w-full border-2 border-gray-50 rounded-xl p-3 focus:border-brand-green outline-none transition bg-gray-50/50" 
              value={formData.username}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Email</label>
            <input 
              type="email" 
              name="email"
              className="w-full border-2 border-gray-50 rounded-xl p-3 focus:border-brand-green outline-none transition bg-gray-50/50" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Password</label>
            <input 
              type="password" 
              name="password"
              className="w-full border-2 border-gray-50 rounded-xl p-3 focus:border-brand-green outline-none transition bg-gray-50/50" 
              value={formData.password}
              onChange={handleChange}
              required 
              minLength={8}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 bg-brand-green text-white rounded-xl font-bold shadow-lg shadow-brand-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-brand-green font-bold hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
