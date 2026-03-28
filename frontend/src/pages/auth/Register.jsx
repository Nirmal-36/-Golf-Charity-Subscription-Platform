import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';

/**
 * Onboarding Pipeline: Register
 * Manages the multi-step registration for standard platform Members.
 * Includes dynamic charity partner synchronization to ensure new 
 * users can immediately commit to a philanthropic cause.
 */
const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    user_role: 'member'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // State: Dynamic philanthropy registry
  const [charities, setCharities] = useState([]);
  const [loadingCharities, setLoadingCharities] = useState(true);

  React.useEffect(() => {
    /**
     * Infrastructure Sync: fetchCharities
     * Retrieves the latest verified partner list for user selection.
     */
    const fetchCharities = async () => {
      try {
        const res = await api.get('/api/charities/');
        setCharities(res.data);
      } catch {
        console.error("UX Notification: Partner synchronization failed.");
      } finally {
        setLoadingCharities(false);
      }
    };
    fetchCharities();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Transaction Handler: handleSubmit
   * Submits the membership application and associates the user 
   * with their selected philanthropic partner.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await register({
        ...formData,
        selected_charity_id: formData.selected_charity
      });
      // Lifecycle: Direct to login after successful creation
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Enrollment Alert: Security protocols rejected this registration.');
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
             <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Support Cause (Select Charity)</label>
             <select 
               name="selected_charity"
               className="w-full border-2 border-gray-50 rounded-xl p-3 focus:border-brand-green outline-none transition bg-gray-50/50 font-bold"
               value={formData.selected_charity}
               onChange={handleChange}
               required
             >
               <option value="">-- Choose a cause --</option>
               {charities.map(c => (
                 <option key={c.id} value={c.id}>{c.name} ({c.category})</option>
               ))}
             </select>
             {loadingCharities && <p className="text-[10px] text-brand-green animate-pulse mt-1 ml-1 font-bold">Syncing partner list...</p>}
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
