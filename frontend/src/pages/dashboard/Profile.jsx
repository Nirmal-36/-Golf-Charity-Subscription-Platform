import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { User, Mail, UserCircle, Save, Loader2, CheckCircle2, AlertCircle, Heart, ShieldCheck, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    donation_percentage: 10
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  // Password Reset State
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [passwordData, setPasswordData] = useState({
    otp: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleRequestOTP = async () => {
    setPasswordLoading(true);
    setStatus({ type: null, message: '' });
    try {
      await api.post('/api/auth/request-otp/', { 
        email: user.email,
        purpose: 'security update'
      });
      setOtpSent(true);
      setStatus({ type: 'success', message: 'Verification code sent to your email.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.detail || 'Failed to send code.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      return setStatus({ type: 'error', message: 'Passwords do not match.' });
    }
    
    setPasswordLoading(true);
    try {
      await api.post('/api/auth/change-password-otp/', {
        otp: passwordData.otp,
        new_password: passwordData.new_password
      });
      setStatus({ type: 'success', message: 'Password changed successfully!' });
      setShowPasswordReset(false);
      setOtpSent(false);
      setPasswordData({ otp: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.detail || 'Failed to change password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        donation_percentage: user.donation_percentage || 10
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

      // Update Profile Details
      const response = await api.patch('/api/auth/me/', payload);
      
      // Update Donation Percentage if changed (and not for staff)
      if (!user.is_staff && formData.donation_percentage !== user.donation_percentage) {
        await api.post('/api/charities/donation-pct/', { 
            percentage: formData.donation_percentage 
        });
      }

      // Refresh User Context
      const updatedUserRes = await api.get('/api/auth/me/');
      setUser(updatedUserRes.data);
      
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

            {!user?.is_staff && (
                <div className="pt-8 border-t border-gray-100 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Heart className="text-brand-green fill-brand-green" size={20} />
                        <h3 className="text-xl font-extrabold text-brand-dark tracking-tight">Charity Impact</h3>
                    </div>

                    <div className="bg-brand-light/30 rounded-3xl p-6 border border-brand-green/5">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Your Selected Cause</p>
                                <p className="text-lg font-black text-brand-dark">{user?.selected_charity_name || 'No Charity Selected'}</p>
                            </div>
                            <Link to="/charities" className="text-xs font-black text-brand-green hover:underline uppercase tracking-widest">Change</Link>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Impact Percentage</label>
                                <span className="text-brand-green font-black text-xl">{formData.donation_percentage || 10}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="10" 
                                max="100" 
                                step="5"
                                value={formData.donation_percentage || 10}
                                onChange={(e) => setFormData({ ...formData, donation_percentage: e.target.value })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-green"
                            />
                            <p className="text-[10px] text-gray-400 font-medium italic">
                                * Minimum 10% of your subscription goes to your selected charity. You can voluntarily increase this up to 100%.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Password & Security Section (Phase 31) */}
            <div className="pt-8 border-t border-gray-100 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="text-brand-green" size={20} />
                    <h3 className="text-xl font-extrabold text-brand-dark tracking-tight">Password & Security</h3>
                </div>

                {!showPasswordReset ? (
                    <button 
                        type="button"
                        onClick={() => setShowPasswordReset(true)}
                        className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold border-2 border-dashed border-gray-200 hover:border-brand-green/20 hover:text-brand-green transition-all flex items-center justify-center gap-2"
                    >
                        <KeyRound size={18} /> Change Account Password
                    </button>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-brand-light/30 rounded-3xl p-6 border border-brand-green/5 space-y-6"
                    >
                        {!otpSent ? (
                            <div className="text-center py-4">
                                <p className="text-sm font-medium text-gray-500 mb-6"> To change your password, we'll send a 6-digit verification code to <span className="text-brand-dark font-bold">{user?.email}</span>.</p>
                                <button 
                                    type="button"
                                    onClick={handleRequestOTP}
                                    disabled={passwordLoading}
                                    className="px-8 py-3 bg-brand-green text-white rounded-xl font-black text-sm shadow-lg shadow-brand-green/20 hover:scale-105 transition-all disabled:opacity-50"
                                >
                                    {passwordLoading ? 'Sending...' : 'Send Verification Code'}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowPasswordReset(false)}
                                    className="block w-full mt-4 text-xs font-bold text-gray-400 hover:text-red-500 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Verification Code</label>
                                    <input 
                                        type="text"
                                        maxLength={6}
                                        value={passwordData.otp}
                                        onChange={(e) => setPasswordData({...passwordData, otp: e.target.value})}
                                        className="w-full bg-white border-2 border-gray-100 focus:border-brand-green rounded-2xl py-3 px-4 outline-none font-black text-center tracking-[0.5em] text-lg"
                                        placeholder="000000"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">New Password</label>
                                        <input 
                                            type="password"
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                            className="w-full bg-white border-2 border-gray-100 focus:border-brand-green rounded-2xl py-3 px-4 outline-none font-bold"
                                            placeholder="Min. 8 chars"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Confirm New Password</label>
                                        <input 
                                            type="password"
                                            value={passwordData.confirm_password}
                                            onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                            className="w-full bg-white border-2 border-gray-100 focus:border-brand-green rounded-2xl py-3 px-4 outline-none font-bold"
                                            placeholder="Repeat password"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button 
                                        type="button"
                                        onClick={handleChangePassword}
                                        disabled={passwordLoading}
                                        className="flex-1 py-4 bg-brand-green text-white rounded-xl font-black shadow-lg shadow-brand-green/20 hover:bg-brand-green/90 transition-all disabled:opacity-50"
                                    >
                                        {passwordLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setOtpSent(false)}
                                        className="px-6 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
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
