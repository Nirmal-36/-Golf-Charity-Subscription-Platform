import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { Users, DollarSign, Heart, Trophy, Target, Clock, CheckCircle, XCircle, Search, ArrowLeft } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingWinners, setPendingWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, winnersRes] = await Promise.all([
        api.get('/api/draws/admin/stats/'),
        api.get('/api/draws/admin/pending-winners/')
      ]);
      setStats(statsRes.data);
      setPendingWinners(winnersRes.data);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
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
      fetchData(); // Refresh
    } catch (err) {
      alert("Verification failed.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading admin panel...</div>;

  return (
    <div className="min-h-screen bg-brand-light p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-200">
          <div>
            <h1 className="text-4xl font-black text-brand-dark tracking-tight">Admin <span className="text-brand-green underline decoration-brand-green/30 decoration-8 underline-offset-8">Terminal</span></h1>
            <p className="text-gray-500 mt-4 font-medium max-w-lg">
              Manage subscribers, verify prize winners, and monitor platform health from a centralized command center.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-xs font-black text-gray-400 uppercase tracking-widest">System Live: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard icon={Users} label="Active Subscribers" value={stats.active_subscribers} color="text-blue-600" bg="bg-blue-50" />
          <StatCard icon={DollarSign} label="Monthly Revenue" value={`$${stats.monthly_revenue.toLocaleString()}`} color="text-green-600" bg="bg-green-50" />
          <StatCard icon={Trophy} label="Prize Pool Balance" value={`$${parseFloat(stats.prize_pool_balance).toLocaleString()}`} color="text-brand-gold" bg="bg-yellow-50" />
          <StatCard icon={Heart} label="Charity Contributions" value={`$${stats.total_donated.toLocaleString()}`} color="text-red-600" bg="bg-red-50" />
          <StatCard icon={Trophy} label="Total Winners" value={stats.total_winners} color="text-brand-dark" bg="bg-gray-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Winner Verification Queue */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="text-blue-500" /> Winner Verification Queue
              <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-sm">{pendingWinners.length} Pending</span>
            </h2>
            
            {pendingWinners.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-400">
                All winner proofs have been processed. Clean slate!
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 divide-y overflow-hidden shadow-sm">
                {pendingWinners.map((win) => (
                  <div key={win.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-gray-50/50 transition">
                    <div className="w-full md:w-48 h-32 bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition border" onClick={() => window.open(win.proof_screenshot_url, '_blank')}>
                      <img src={win.proof_screenshot_url} alt="Scorecard proof" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">{win.user_email}</h3>
                        <span className="font-mono text-xs text-gray-400">#WIN-{win.id}</span>
                      </div>
                      <p className="text-gray-600">Tier {win.tier} Winner • Prize: <span className="text-brand-green font-bold text-lg">${parseFloat(win.prize_amount).toLocaleString()}</span></p>
                      <div className="flex items-center gap-3 pt-4">
                        <button 
                          onClick={() => handleReview(win.id, 'approve')}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-md shadow-green-200"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button 
                          onClick={() => handleReview(win.id, 'reject')}
                          className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tasks / Links */}
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Management & Reports</h3>
                <div className="space-y-1">
                   <AdminLink icon={Users} label="Manage Users" count={stats.total_users} to="/admin/users" />
                   <AdminLink icon={Heart} label="Manage Charities" count={null} to="/admin/charities" />
                   <AdminLink icon={Target} label="Draw Management" count={null} to="/admin/draws" />
                   <AdminLink icon={Trophy} label="Prize Payouts" count={0} to="/admin/payouts" />
                   <AdminLink icon={Search} label="Audit Logs" count={null} to="/admin/logs" />
                </div>
             </div>
             
             <div className="bg-brand-dark rounded-2xl p-6 text-white shadow-lg">
                <h3 className="font-bold text-brand-gold mb-2">Platform Health</h3>
                <div className="space-y-4 mt-4">
                   <HealthMetric label="Stripe API" status="Operational" />
                   <HealthMetric label="Celery Service" status="Active" />
                   <HealthMetric label="Supabase DB" status="Operational" />
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
    <div className={`p-3 rounded-xl ${bg} ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
    </div>
  </div>
);

const AdminLink = ({ icon: Icon, label, count, to }) => (
  <Link 
    to={to}
    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer group"
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-gray-400 group-hover:text-brand-green" />
      <span className="font-medium text-gray-700 group-hover:text-brand-green">{label}</span>
    </div>
    {count !== null && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{count}</span>}
  </Link>
);

const HealthMetric = ({ label, status }) => (
  <div className="flex items-center justify-between text-sm">
     <span className="text-gray-400">{label}</span>
     <span className="text-green-400 flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> {status}
     </span>
  </div>
);

export default AdminDashboard;
