import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

/**
 * Security: ForgotPassword
 * Initiates the password recovery protocol by requesting a one-time 
 * verification code (OTP). Ensures the process is secure and user-friendly.
 */
const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    /**
     * Transaction Handler: handleSubmit
     * Executes the OTP request and provides immediate feedback on 
     * the dispatch status. Stores the target email in session storage 
     * to maintain context for the subsequent reset step.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await api.post('/api/auth/request-otp/', { 
                email,
                purpose: 'password reset'
            });
            setMessage('Verification code sent! Checking your inbox...');
            
            // Context Management: Persist email for the reset workflow
            sessionStorage.setItem('reset_email', email);
            setTimeout(() => navigate('/reset-password'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Recovery Alert: Protocol failed to dispatch verification code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-light p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-[32px] shadow-xl p-10 border border-gray-100"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={32} className="text-brand-green" />
                    </div>
                    <h1 className="text-3xl font-black text-brand-dark tracking-tight mb-2">Forgot Password?</h1>
                    <p className="text-gray-500 font-medium">No worries, we'll send you a recovery code.</p>
                </div>

                {message && (
                    <motion.div 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-green-50 text-green-700 p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 border border-green-100"
                    >
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        {message}
                    </motion.div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-brand-dark transition-all"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 bg-brand-green text-white rounded-2xl font-black shadow-lg shadow-brand-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}
                    >
                        {loading ? 'Sending Code...' : (
                            <>Send Recovery Code <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 font-bold hover:text-brand-green transition">
                        <ArrowLeft size={16} /> Back to Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
