import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { motion } from 'framer-motion';
import { KeyRound, ShieldCheck, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        otp: '',
        new_password: '',
        confirm_password: ''
    });
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('reset_email');
        if (!storedEmail) {
            navigate('/forgot-password');
        } else {
            setEmail(storedEmail);
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.new_password !== formData.confirm_password) {
            return setError('Passwords do not match.');
        }
        
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await api.post('/api/auth/reset-password-otp/', {
                email,
                otp: formData.otp,
                new_password: formData.new_password
            });
            setMessage('Password reset successfully! Redirecting to login...');
            sessionStorage.removeItem('reset_email');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Reset failed. Please verify the code and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-light p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 border border-gray-100 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 -mr-16 -mt-16 rounded-full"></div>
                
                <div className="text-center mb-10 relative z-10">
                    <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <KeyRound size={32} className="text-brand-green" />
                    </div>
                    <h1 className="text-3xl font-black text-brand-dark tracking-tight mb-2">Create New Password</h1>
                    <p className="text-gray-500 font-medium">Resetting password for <span className="text-brand-green font-bold">{email}</span></p>
                </div>

                {message && (
                    <motion.div 
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-green-50 text-green-700 p-4 rounded-2xl mb-8 text-sm font-bold border border-green-100 flex items-center gap-3"
                    >
                        <ShieldCheck size={20} className="text-green-500" /> {message}
                    </motion.div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-sm font-bold border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">6-Digit Verification Code</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input 
                                name="otp"
                                required
                                maxLength={6}
                                value={formData.otp}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 rounded-2xl py-4 pl-12 pr-4 outline-none font-black text-brand-dark transition-all tracking-[0.5em] text-lg text-center"
                                placeholder="000000"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input 
                                name="new_password"
                                type="password"
                                required
                                minLength={8}
                                value={formData.new_password}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-brand-dark transition-all"
                                placeholder="Min. 8 characters"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input 
                                name="confirm_password"
                                type="password"
                                required
                                value={formData.confirm_password}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-brand-dark transition-all"
                                placeholder="Repeat new password"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full py-5 bg-brand-green text-white rounded-2xl font-black shadow-xl shadow-brand-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}
                    >
                        {loading ? 'Reseting...' : (
                            <>Update Password <ArrowRight size={18} /></>
                        )}
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="w-full py-4 text-gray-400 font-bold hover:text-brand-green transition text-sm flex items-center justify-center gap-2"
                    >
                         <ArrowLeft size={16} /> Resend Verification Code
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
