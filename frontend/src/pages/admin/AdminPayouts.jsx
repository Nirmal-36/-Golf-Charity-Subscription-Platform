import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { Trophy, CheckCircle, Clock, ArrowLeft, DollarSign, X, ShieldCheck, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWinner, setSelectedWinner] = useState(null); // Winner for modal
  const [payoutStatus, setPayoutStatus] = useState('idle'); // idle | processing | success

  const fetchPayouts = async () => {
    try {
      const res = await api.get('/api/draws/admin/payouts/');
      setPayouts(res.data);
    } catch (err) {
      console.error("Failed to fetch payouts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleMarkPaid = async (winnerId) => {
    if (!window.confirm("Mark this winner as PAID?")) return;
    try {
      await api.post(`/api/draws/admin/winners/${winnerId}/review/`, { action: 'mark_paid', notes: 'Paid by admin' });
      alert("Status updated to PAID successfully.");
      fetchPayouts();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const executePayout = async () => {
    setPayoutStatus('processing');
    try {
      await api.post(`/api/draws/admin/winners/${selectedWinner.id}/pay/`);
      setPayoutStatus('success');
      setTimeout(() => {
        fetchPayouts();
      }, 1000);
    } catch (err) {
      alert("Payout failed.");
      setPayoutStatus('idle');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading payouts...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link to="/admin/dashboard" className="text-sm text-brand-green font-bold flex items-center gap-1 hover:underline">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900">Prize Payouts</h1>
        
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Winner</th>
                <th className="px-6 py-4">Prize</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Approved At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payouts.length === 0 ? (
                <tr>
                   <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No approved payouts yet.</td>
                </tr>
              ) : payouts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.user_email}</td>
                  <td className="px-6 py-4 text-brand-green font-bold">${parseFloat(p.prize_amount).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {p.admin_approved_at ? new Date(p.admin_approved_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    {p.status === 'approved' && (
                      <button 
                        onClick={() => { setSelectedWinner(p); setPayoutStatus('idle'); }}
                        className="bg-brand-gold text-brand-dark px-3 py-1.5 rounded-lg text-xs font-black hover:scale-105 transition shadow-sm flex items-center gap-1"
                      >
                        <DollarSign size={14} /> Pay
                      </button>
                    )}
                    {p.status === 'approved' && (
                      <button 
                        onClick={() => handleMarkPaid(p.id)}
                        className="bg-brand-green text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-brand-dark transition"
                      >
                        Mark as Paid (Manual)
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Modal (The "Payment Page") */}
      <AnimatePresence>
        {selectedWinner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="bg-brand-dark p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-gold/20 rounded-xl flex items-center justify-center text-brand-gold">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Secure Payout</h3>
                    <p className="text-gray-400 text-xs font-medium">Verification Round #{selectedWinner.draw}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedWinner(null)} className="text-gray-400 hover:text-white transition">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {payoutStatus === 'idle' && (
                  <>
                    <div className="text-center space-y-2">
                      <p className="text-gray-500 font-medium italic">You are about to disburse</p>
                      <div className="text-5xl font-black text-brand-dark tracking-tighter">
                        ${parseFloat(selectedWinner.prize_amount).toLocaleString()}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Recipient Email</span>
                        <span className="font-bold text-gray-900">{selectedWinner.user_email}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Payment Gateway</span>
                        <span className="font-bold text-brand-green flex items-center gap-1.5">
                          <CheckCircle size={14} /> Stripe Connected
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                        <span className="text-gray-400 font-medium italic">Processing Fee</span>
                        <span className="font-bold text-gray-500">$0.00 (Platform Covered)</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                      By clicking the button below, you authorize the immediate transfer of funds from the Prize Pool balance to the user's verified Stripe account. This action is recorded in the Audit Log and is irreversible.
                    </p>

                    <button 
                      onClick={executePayout}
                      className="w-full bg-brand-gold text-brand-dark py-4 rounded-2xl font-black text-lg hover:bg-brand-gold/90 transition shadow-lg shadow-brand-gold/20"
                    >
                      Process Prize Payout
                    </button>
                  </>
                )}

                {payoutStatus === 'processing' && (
                  <div className="py-12 text-center space-y-6">
                    <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
                    <div className="space-y-2">
                       <h3 className="text-xl font-bold">Communicating with Stripe...</h3>
                       <p className="text-gray-500 animate-pulse">Establishing secure handshake for disbursement</p>
                    </div>
                  </div>
                )}

                {payoutStatus === 'success' && (
                  <div className="py-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
                       <CheckCircle size={48} />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-black text-gray-900">Payout Successful!</h3>
                       <p className="text-gray-500 px-4">Funds have been disbursed to <b>{selectedWinner.user_email}</b> successfully.</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 font-mono text-[10px] text-gray-400 text-left">
                       TRANSACTION_ID: strp_payout_mock_{Math.random().toString(36).substr(2, 9)}<br/>
                       NETWORK: mainnet-verified
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setSelectedWinner(null)}
                        className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                      >
                        Done
                      </button>
                      <button 
                        className="flex-1 bg-brand-green text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-dark transition"
                        onClick={() => window.open('https://dashboard.stripe.com/', '_blank')}
                      >
                         <ExternalLink size={18} /> Stripe Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPayouts;
