import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { User, Mail, UserCircle, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const payload = {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name
      };
      
      if (user.is_staff) {
        payload.email = formData.email;
      }

      const response = await api.patch('/api/auth/me/', payload);
      setUser(response.data);
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      const errorMsg = err.response?.data ? Object.values(err.response.data).flat()[0] : 'Failed to update profile.';
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-4 md:p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
          <UserCircle size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight">Account Settings</h1>
          <p className="text-gray-500 font-medium">Manage your personal information and preferences.</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl shadow-brand-green/5 border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12">
          
          {status.message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}
            >
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-bold">{status.message}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-brand-dark block ml-1 uppercase tracking-wider">First Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    className="w-full bg-brand-light/50 border-2 border-transparent focus:border-brand-green focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 outline-none transition font-medium"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-brand-dark block ml-1 uppercase tracking-wider">Last Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    className="w-full bg-brand-light/50 border-2 border-transparent focus:border-brand-green focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 outline-none transition font-medium"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-brand-dark block ml-1 uppercase tracking-wider">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <UserCircle size={18} />
                </span>
                <input
                  type="text"
                  className="w-full bg-brand-light/50 border-2 border-transparent focus:border-brand-green focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 outline-none transition font-medium"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-brand-dark block ml-1 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  className={`w-full border-2 border-transparent rounded-2xl py-3.5 pl-11 pr-4 outline-none transition font-medium ${
                    user?.is_staff 
                      ? "bg-brand-light/50 focus:border-brand-green focus:bg-white" 
                      : "bg-gray-100 text-gray-500 cursor-not-allowed"
                  }`}
                  value={formData.email}
                  onChange={(e) => user?.is_staff && setFormData({ ...formData, email: e.target.value })}
                  disabled={!user?.is_staff}
                  readOnly={!user?.is_staff}
                />
              </div>
              {!user?.is_staff && (
                <p className="text-[10px] text-gray-400 font-bold ml-1 uppercase tracking-widest">Email cannot be changed contact support</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-brand-dark hover:bg-black text-white py-4 rounded-2xl font-black text-lg transition flex items-center justify-center gap-3 shadow-xl shadow-brand-dark/10 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Saving...
                </>
              ) : (
                <>
                  <Save size={20} /> Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
