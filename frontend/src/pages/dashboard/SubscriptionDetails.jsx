import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { CreditCard, Heart, Calendar, ArrowRight, ShieldCheck, Award, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SubscriptionBadge from '../../components/SubscriptionBadge';
import api from '../../api/axios';

const SubscriptionDetails = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invoices, setInvoices] = useState([]);

  React.useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await api.get('/api/subscriptions/history/');
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error('Failed to fetch billing history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/subscriptions/create-portal-session/', {
        return_url: window.location.href
      });
      window.location.href = data.portal_url;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to open billing portal.');
      setLoading(false);
    }
  };


  const isActive = user?.subscription_status === 'active';

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatStripeDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-brand-light pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-brand-dark tracking-tight mb-4">
              Membership <span className="text-brand-green">Center</span>
            </h1>
            <p className="text-lg text-gray-500 font-medium">Manage your subscription and track your impact.</p>
          </div>
          <SubscriptionBadge status={user?.subscription_status} />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Plan Card or Subscribe Placeholder */}
          <motion.div 
            variants={cardVariants}
            className="lg:col-span-2 space-y-8"
          >
            {isActive ? (
              <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-16 h-16 bg-brand-dark rounded-2xl flex items-center justify-center text-brand-gold shadow-lg">
                      <Award size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-brand-dark">
                        {user?.subscription_plan === 'yearly' ? 'Eagle Yearly' : 'Eagle Monthly'} Membership
                      </h3>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                        ${user?.subscription_plan === 'yearly' ? '99.00 / Year' : '9.99 / Month'}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-10 mb-10">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={14} /> Next Billing Date
                      </p>
                      <p className="text-xl font-bold text-brand-dark">
                        {formatDate(user?.subscription_end_date)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <CreditCard size={14} /> Payment Method
                      </p>
                      <p className="text-xl font-bold text-brand-dark">Stripe Secure Billing</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={handleManageBilling}
                      disabled={loading}
                      className="px-8 py-4 bg-brand-dark text-white font-bold rounded-2xl hover:bg-black transition-all flex items-center gap-2 group shadow-xl shadow-brand-dark/10 disabled:opacity-70"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                      Manage Billing <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="px-6 py-4 bg-gray-50 text-gray-400 text-sm font-bold rounded-2xl flex items-center gap-2">
                      <ShieldCheck size={18} /> Cancel Anytime
                    </div>
                  </div>

                  {error && (
                    <p className="mt-4 text-sm font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                      {error}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-brand-green text-white rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-700"></div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-black mb-4">Resume Your Impact</h3>
                  <p className="text-green-50 mb-8 max-w-md text-lg leading-relaxed">
                    Your subscription is currently inactive. Re-join the club to unlock active handicap tracking, monthly prize draws, and charitable giving.
                  </p>
                  <Link 
                    to="/subscribe" 
                    className="inline-flex px-10 py-5 bg-white text-brand-green font-black text-xl rounded-2xl hover:bg-green-50 transition-all shadow-xl items-center gap-3 group"
                  >
                    View Membership Options 
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )}

            {/* Billing History Section */}
            <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-xl border border-gray-100">
              <h3 className="text-xl font-black mb-8 text-brand-dark">Billing History</h3>
              {historyLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-brand-green" size={32} />
                </div>
              ) : invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-50">
                        <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest">Invoice</th>
                        <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                        <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
                        <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="pb-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="group">
                          <td className="py-4 font-bold text-brand-dark text-sm">{inv.number}</td>
                          <td className="py-4 text-gray-500 text-sm font-medium">{formatStripeDate(inv.date)}</td>
                          <td className="py-4 font-bold text-brand-dark text-sm">{inv.amount.toFixed(2)} {inv.currency}</td>
                          <td className="py-4">
                            <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-full tracking-wider">
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <a 
                              href={inv.pdf} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/5 rounded-lg transition-all"
                            >
                              <ArrowRight size={18} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-gray-400 font-medium italics">No previous invoices found.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Impact Sidebar */}
          <div className="space-y-8">
            <motion.div 
              variants={cardVariants}
              className="bg-brand-green text-white rounded-[40px] p-8 shadow-2xl shadow-brand-green/20 relative overflow-hidden"
            >
              <Heart size={120} className="absolute -bottom-8 -right-8 text-white/10 rotate-12" />
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-green-100">Your Impact</p>
                <h4 className="text-4xl font-black mb-2">${user?.total_donated || '0.00'}</h4>
                <p className="text-sm text-green-100/80 leading-relaxed mb-8">
                  Total donations generated through your monthly membership.
                </p>
                <div className="h-1 w-12 bg-white/30 rounded-full"></div>
              </div>
            </motion.div>

            <motion.div 
              variants={cardVariants}
              className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100"
            >
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Supported Cause</p>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center">
                  <Heart size={24} className="fill-brand-green/20" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-brand-dark line-clamp-1">{user?.selected_charity_name || 'No Charity Selected'}</p>
                  <p className="text-xs text-gray-400 font-medium">Monthly Recipient</p>
                </div>
              </div>

              <div className="mb-8 p-4 bg-gray-50 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">Donation Split</p>
                  <p className="text-sm font-black text-brand-green">{user?.donation_percentage}%</p>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  step="5"
                  value={user?.donation_percentage || 10}
                  onChange={async (e) => {
                    try {
                      await api.patch('/api/auth/me/', { donation_percentage: e.target.value });
                      window.location.reload(); // Quick refresh to update user context
                    } catch (err) {
                      alert("Failed to update percentage");
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-green"
                />
                <p className="text-[10px] text-gray-400 mt-2 italic text-center">Slide to increase your impact (Min 10%)</p>
              </div>

              <Link 
                to="/charities" 
                className="block text-center py-4 bg-brand-dark text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg"
              >
                Change Charity
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Support Section */}
        <div className="mt-12 p-8 bg-gray-50 rounded-[40px] border border-dashed border-gray-200 text-center">
          <p className="text-gray-500 font-medium">
            Need help with your subscription? <Link to="/contact" className="text-brand-green font-bold hover:underline ml-1">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails;
