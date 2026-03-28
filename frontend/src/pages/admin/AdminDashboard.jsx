import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { Users, DollarSign, Heart, Trophy, Target, Clock, CheckCircle, XCircle, Search, ArrowLeft } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [previousWinners, setPreviousWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, winnersRes] = await Promise.all([
        api.get('/api/draws/admin/stats/'),
        api.get('/api/draws/admin/payouts/')
      ]);
      setStats(statsRes.data);
      setPreviousWinners(winnersRes.data);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-light p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-200">
          <div>
            <h1 className="text-4xl font-black text-brand-dark tracking-tight">Admin <span className="text-brand-green underline decoration-brand-green/30 decoration-8 underline-offset-8">Terminal</span></h1>
            <p className="text-gray-500 mt-4 font-medium max-w-lg">
              Manage subscribers, track platform growth, and review champion payout history from your command center.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Live Updates Enabled</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard icon={Users} label="Active Subscribers" value={stats.active_subscribers} color="text-blue-600" bg="bg-blue-50" />
          <StatCard icon={DollarSign} label="Monthly Revenue" value={`$${stats.monthly_revenue.toLocaleString()}`} color="text-green-600" bg="bg-green-50" />
          <StatCard icon={Trophy} label="Prize Pool" value={`$${parseFloat(stats.prize_pool_balance).toLocaleString()}`} color="text-brand-gold" bg="bg-yellow-50" />
          <StatCard icon={Heart} label="Charity Impact" value={`$${stats.total_donated.toLocaleString()}`} color="text-red-600" bg="bg-red-50" />
          <StatCard icon={Target} label="Total Winners" value={stats.total_winners} color="text-brand-dark" bg="bg-gray-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Previous Winners History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-2 text-brand-dark uppercase tracking-tight">
                <Trophy className="text-brand-gold" /> Recent Champion History
              </h2>
              <Link to="/admin/payouts" className="text-sm font-bold text-brand-green hover:underline">View All Payouts</Link>
            </div>
            
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-brand-green/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Winner</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Prize</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {previousWinners.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">No previous winners recorded yet.</td>
                      </tr>
                    ) : previousWinners.slice(0, 5).map((win) => (
                      <tr key={win.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-xs">
                              {win.user_email[0].toUpperCase()}
                            </div>
                            <span className="font-bold text-gray-900 truncate max-w-[120px]">{win.user_email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-black text-brand-green text-lg">
                          ${parseFloat(win.prize_amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-gray-400">
                          {new Date(win.admin_approved_at || win.proof_submitted_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            win.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {win.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar: Analytics & Quick Tasks */}
          <div className="space-y-8">
            {/* Website Analytics Section */}
            <div className="bg-brand-dark rounded-[32px] p-8 text-white shadow-2xl shadow-brand-dark/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 rounded-full -mr-16 -mt-16 blur-2xl" />
               <h3 className="font-black text-xl mb-6 flex items-center gap-2">
                 <Target className="text-brand-green" /> Website Analytics
               </h3>
               
               <div className="space-y-6">
                 <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Top Charity Engagement</p>
                   <div className="space-y-3">
                     {stats.charity_stats.map((charity, i) => (
                       <div key={i} className="space-y-1">
                         <div className="flex justify-between text-xs font-bold">
                           <span className="truncate">{charity.selected_charity__name}</span>
                           <span className="text-brand-green">{charity.count}</span>
                         </div>
                         <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-brand-green rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                             style={{ width: `${(charity.count / stats.total_users) * 100}%` }}
                           />
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 <div className="pt-6 border-t border-white/5">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Recent Draw Participation</p>
                   <div className="space-y-4">
                     {stats.draw_stats.map((draw, i) => (
                       <div key={i} className="flex items-center justify-between group">
                         <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-green group-hover:scale-150 transition-transform" />
                            <span className="text-xs font-medium text-gray-300">{new Date(draw.draw_date).toLocaleDateString()}</span>
                         </div>
                         <span className="text-xs font-black text-white">{draw.total_entries} Entries</span>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
            </div>

            {/* Management Section (Kept as requested) */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-brand-green/5">
                <h3 className="font-black text-brand-dark text-lg mb-6 uppercase tracking-tight">Management & Reports</h3>
                <div className="space-y-1">
                   <AdminLink icon={Users} label="Manage Users" count={stats.total_users} to="/admin/users" />
                   <AdminLink icon={Heart} label="Manage Charities" count={null} to="/admin/charities" />
                   <AdminLink icon={Target} label="Draw Management" count={null} to="/admin/draws" />
                   <AdminLink icon={Trophy} label="Prize Payouts" count={null} to="/admin/payouts" />
                   <AdminLink icon={Clock} label="Audit Logs" count={null} to="/admin/logs" />
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, bg }) => {
  const Icon = icon;
  return (
    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-xl shadow-brand-green/5 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300">
      <div className={`p-3 rounded-2xl ${bg} ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{label}</div>
        <div className={`text-2xl font-black ${color}`}>{value}</div>
      </div>
    </div>
  );
};

const AdminLink = ({ icon, label, count, to }) => {
  const Icon = icon;
  return (
    <Link 
      to={to}
      className="flex items-center justify-between p-4 rounded-2xl hover:bg-brand-green/5 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-gray-400 group-hover:text-brand-green transition-colors" />
        <span className="font-bold text-gray-600 group-hover:text-brand-green transition-colors">{label}</span>
      </div>
      {count !== null && <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-2 py-0.5 rounded-lg group-hover:bg-brand-green group-hover:text-white transition-all">{count}</span>}
    </Link>
  );
};

export default AdminDashboard;