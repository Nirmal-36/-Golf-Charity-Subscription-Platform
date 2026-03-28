import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { Trophy, CheckCircle, Clock, ArrowLeft, DollarSign, X, ShieldCheck, ExternalLink } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const AdminPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [pendingWinners, setPendingWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWinner, setSelectedWinner] = useState(null); // Winner for modal
  const [payoutStatus, setPayoutStatus] = useState('idle'); // idle | processing | success

  const fetchData = async () => {
    try {
      const [payoutsRes, pendingRes] = await Promise.all([
        api.get('/api/draws/admin/payouts/'),
        api.get('/api/draws/admin/pending-winners/')
      ]);
      setPayouts(payoutsRes.data);
      setPendingWinners(pendingRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReview = async (winnerId, action) => {
    const notes = window.prompt(`Enter notes for ${action}:`);
    if (notes === null) return; // Cancelled
    try {
      await api.post(`/api/draws/admin/winners/${winnerId}/review/`, { action, notes });
      alert(`Winner ${action}d successfully.`);
      fetchData(); // Refresh both
    } catch {
      alert("Verification failed.");
    }
  };

  const handleMarkPaid = async (winnerId) => {
    if (!window.confirm("Mark this winner as PAID?")) return;
    try {
      await api.post(`/api/draws/admin/winners/${winnerId}/review/`, { action: 'mark_paid', notes: 'Paid by admin' });
      alert("Status updated to PAID successfully.");
      fetchData();
    } catch {
      alert("Failed to update status.");
    }
  };

  const executePayout = async () => {
    setPayoutStatus('processing');
    try {
      await api.post(`/api/draws/admin/winners/${selectedWinner.id}/pay/`);
      setPayoutStatus('success');
      setTimeout(() => {
        fetchData();
      }, 1000);
    } catch {
      alert("Payout failed.");
      setPayoutStatus('idle');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-light p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200">
           <div>
              <Link to="/admin/dashboard" className="text-xs font-black text-brand-green flex items-center gap-1 hover:translate-x-[-4px] transition-transform uppercase tracking-widest mb-2">
                <ArrowLeft size={14} /> Back to Terminal
              </Link>
              <h1 className="text-4xl font-black text-brand-dark tracking-tight">Verification & <span className="text-brand-green">Payouts</span></h1>
              <p className="text-gray-500 mt-2 font-medium">Review winner proof, approve disbursements, and manage Stripe payouts.</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                 <ShieldCheck className="text-brand-green" size={20} />
                 <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Queue Status</div>
                    <div className="text-sm font-bold text-gray-900 leading-none">{pendingWinners.length} Pending Verification</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Verification Queue (CRITICAL RESTORE) */}
        <section className="space-y-6">
          <h2 className="text-xl font-black flex items-center gap-2 text-brand-dark uppercase tracking-tight">
            <Clock className="text-blue-500" /> Winner Verification Queue
          </h2>
          
          {pendingWinners.length === 0 ? (
            <div className="bg-white p-16 rounded-[32px] border border-dashed border-gray-300 text-center space-y-3">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <CheckCircle size={32} />
               </div>
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No pending verification items</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingWinners.map((win) => (
                <div key={win.id} className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-xl shadow-brand-green/5 hover:shadow-brand-green/10 transition-all group overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                   
                   <div className="flex items-start gap-6">
                      <div 
                        className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-2xl overflow-hidden cursor-zoom-in border border-gray-100 relative group/img"
                        onClick={() => window.open(win.proof_screenshot_url, '_blank')}
                      >
                         <img src={win.proof_screenshot_url} alt="Proof" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
                         <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-[10px] font-black uppercase transition-opacity">
                            View Proof
                         </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-4">
                         <div className="space-y-1">
                            <h3 className="font-black text-gray-900 truncate">{win.user_email}</h3>
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                               <Trophy size={10} className="text-brand-gold" /> Tier {win.tier} Winner
                            </div>
                         </div>
                         
                         <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-brand-green">${parseFloat(win.prize_amount).toLocaleString()}</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prize</span>
                         </div>
                         
                         <div className="flex items-center gap-2 pt-2">
                            <button 
                              onClick={() => handleReview(win.id, 'approve')}
                              className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-xs font-black shadow-lg shadow-brand-green/20 hover:scale-105 active:scale-95 transition-all"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReview(win.id, 'reject')}
                              className="px-4 border-2 border-red-50 text-red-100 text-red-500 py-2 rounded-xl text-xs font-black hover:bg-red-50 transition-colors"
                            >
                              Reject
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Payouts Section */}
        <section className="space-y-6 pt-10 border-t border-gray-200">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-2 text-brand-dark uppercase tracking-tight">
                <DollarSign className="text-brand-green" /> Disbursement History
              </h2>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Showing {payouts.length} Approved/Paid Winners
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl shadow-brand-green/5 overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Recipient</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Prize Amount</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Approval Date</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Payment Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {payouts.length === 0 ? (
                      <tr>
                         <td colSpan="4" className="px-8 py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No disbursements pending</td>
                      </tr>
                    ) : payouts.map((p) => (
                      <tr key={p.id} className="hover:bg-brand-green/5 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-brand-dark border border-gray-100 group-hover:bg-white transition-colors">
                                {p.user_email[0].toUpperCase()}
                             </div>
                             <span className="font-bold text-gray-900 italic">{p.user_email}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-xl font-black text-brand-green">${parseFloat(p.prize_amount).toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="text-xs font-bold text-gray-400">
                             {p.admin_approved_at ? new Date(p.admin_approved_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           {p.status === 'approved' ? (
                             <div className="flex items-center justify-end gap-2">
                               <button 
                                 onClick={() => { setSelectedWinner(p); setPayoutStatus('idle'); }}
                                 className="bg-brand-gold text-brand-dark px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-brand-gold/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                               >
                                 <DollarSign size={14} /> Process Payout
                               </button>
                               <button 
                                 onClick={() => handleMarkPaid(p.id)}
                                 className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-brand-green transition-colors"
                               >
                                 Mark Paid (Offline)
                               </button>
                             </div>
                           ) : (
                             <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700 inline-flex items-center gap-1.5">
                               <CheckCircle size={10} /> Paid via Stripe
                             </span>
                           )}
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
           </div>
        </section>
      </div>

      {/* Payout Modal (Stays the same as it's already premium) */}
      <AnimatePresence>
        {selectedWinner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="bg-brand-dark p-8 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl tracking-tight">Secure Payout</h3>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Transaction Authorization</p>
                  </div>
                </div>
                <button onClick={() => setSelectedWinner(null)} className="text-gray-400 hover:text-white transition p-2 hover:bg-white/5 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {payoutStatus === 'idle' && (
                  <>
                    <div className="text-center space-y-2">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Disbursement Amount</p>
                       <div className="text-5xl font-black text-brand-dark tracking-tighter">
                         ${parseFloat(selectedWinner.prize_amount).toLocaleString()}
                       </div>
                    </div>

                    <div className="bg-gray-50 rounded-[24px] p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipient</span>
                        <span className="font-bold text-gray-900 text-sm truncate max-w-[180px]">{selectedWinner.user_email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gateway</span>
                        <span className="font-black text-brand-green text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                          <CheckCircle size={12} /> Stripe Verified
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Fee</span>
                        <span className="font-black text-brand-gold text-[10px] uppercase tracking-widest">Waived</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-400 text-center leading-relaxed font-bold uppercase tracking-tight">
                       By clicking the button below, you authorize the immediate and irreversible transfer of funds to the user's Stripe Account.
                    </p>

                    <button 
                      onClick={executePayout}
                      className="w-full bg-brand-gold text-brand-dark py-5 rounded-2xl font-black text-lg hover:bg-brand-gold/90 transition shadow-xl shadow-brand-gold/20 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Confirm Disbursement
                    </button>
                  </>
                )}

                {payoutStatus === 'processing' && (
                  <div className="py-12 text-center space-y-8">
                    <div className="w-20 h-20 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
                    <div className="space-y-3">
                       <h3 className="text-2xl font-black text-brand-dark">Sending Funds...</h3>
                       <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Contacting Stripe Disbursement API</p>
                    </div>
                  </div>
                )}

                {payoutStatus === 'success' && (
                  <div className="py-8 text-center space-y-8">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto shadow-inner">
                       <CheckCircle size={56} />
                    </div>
                    <div className="space-y-3">
                       <h3 className="text-3xl font-black text-gray-900 italic">Disbursed!</h3>
                       <p className="text-sm font-medium text-gray-500 px-6">Success! Funds have been safely transferred to the winner's account.</p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                         onClick={() => setSelectedWinner(null)}
                         className="flex-1 bg-gray-50 text-gray-400 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition"
                      >
                         Close Window
                      </button>
                      <button 
                         className="flex-1 bg-brand-green text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg shadow-brand-green/20 transition-all hover:scale-105"
                         onClick={() => window.open('https://dashboard.stripe.com/', '_blank')}
                      >
                         <ExternalLink size={16} /> Stripe Panel
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
