import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  DollarSign,
  Heart,
  Trophy,
  Zap,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  Calendar,
  AlertCircle,
  Check,
  Clock,
  Eye,
  Menu,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, winnersRes] = await Promise.all([
        api.get('/api/draws/admin/stats/'),
        api.get('/api/draws/admin/payouts/')
      ]);
      setStats(statsRes.data);
      setWinners(winnersRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Chart Data Preparation
  const charityData = stats?.charity_stats?.map(c => ({
    name: c.selected_charity__name,
    subscribers: c.count,
    donated: Math.round(c.count * 9.99 * 0.12)
  })) || [];

  const revenueData = stats?.draw_stats?.map(d => ({
    month: new Date(d.draw_date).toLocaleDateString('en-US', { month: 'short' }),
    revenue: Math.round(d.total_entries * 9.99),
    prizes: Math.round(d.total_entries * 9.99 * 0.4),
    charity: Math.round(d.total_entries * 9.99 * 0.12)
  })) || [];

  const charityDistribution = charityData.slice(0, 5).map(c => ({
    name: c.name,
    value: c.subscribers
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} open={sidebarOpen} />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Top Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div className="px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-500">Platform management & analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-emerald-700">System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">
          {activeTab === 'overview' && <OverviewTab stats={stats} winners={winners} charityData={charityData} revenueData={revenueData} charityDistribution={charityDistribution} />}
          {activeTab === 'users' && <UsersTab stats={stats} />}
          {activeTab === 'subscriptions' && <SubscriptionsTab stats={stats} />}
          {activeTab === 'draws' && <DrawsTab stats={stats} />}
          {activeTab === 'charities' && <CharitiesTab charityData={charityData} />}
          {activeTab === 'winners' && <WinnersTab winners={winners} />}
          {activeTab === 'analytics' && <AnalyticsTab revenueData={revenueData} charityDistribution={charityDistribution} />}
        </div>
      </div>
    </div>
  );
};

// ==================== SIDEBAR ====================
const Sidebar = ({ activeTab, setActiveTab, open }) => {
  const menuItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview', color: 'text-emerald-600' },
    { id: 'users', icon: Users, label: 'Manage Users', color: 'text-blue-600' },
    { id: 'subscriptions', icon: DollarSign, label: 'Subscriptions', color: 'text-amber-600' },
    { id: 'draws', icon: Zap, label: 'Draw Management', color: 'text-purple-600' },
    { id: 'charities', icon: Heart, label: 'Manage Charities', color: 'text-rose-600' },
    { id: 'winners', icon: Trophy, label: 'Verify Winners', color: 'text-yellow-600' },
    { id: 'analytics', icon: TrendingUp, label: 'Reports & Analytics', color: 'text-teal-600' }
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 transition-all duration-300 z-50 ${
        open ? 'w-72' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
            ⛳
          </div>
          {open && (
            <div>
              <p className="text-white font-bold text-sm">GolfGive</p>
              <p className="text-slate-400 text-[10px]">Admin</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="pt-6 px-3 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
            title={!open ? item.label : ''}
          >
            <item.icon size={20} className="flex-shrink-0" />
            {open && <span className="text-sm font-medium">{item.label}</span>}
            {open && activeTab === item.id && <ChevronRight size={16} className="ml-auto" />}
          </button>
        ))}
      </nav>

      {/* Footer */}
      {open && (
        <div className="absolute bottom-6 left-3 right-3 space-y-2 pt-6 border-t border-slate-700/50">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-all duration-200">
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200">
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ==================== TAB COMPONENTS ====================

// Overview Tab
const OverviewTab = ({ stats, winners, charityData, revenueData, charityDistribution }) => (
  <div className="space-y-8">
    {/* Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard
        icon={Users}
        label="Active Subscribers"
        value={stats?.active_subscribers || 0}
        color="emerald"
      />
      <MetricCard
        icon={DollarSign}
        label="Monthly Revenue"
        value={`$${(stats?.monthly_revenue || 0).toLocaleString()}`}
        color="amber"
      />
      <MetricCard
        icon={Trophy}
        label="Prize Pool"
        value={`$${Math.round(parseFloat(stats?.prize_pool_balance || 0)).toLocaleString()}`}
        color="yellow"
      />
      <MetricCard
        icon={Heart}
        label="Charity Impact"
        value={`$${(stats?.total_donated || 0).toLocaleString()}`}
        color="rose"
      />
      <MetricCard
        icon={Zap}
        label="Total Winners"
        value={stats?.total_winners || 0}
        color="purple"
      />
    </div>

    {/* Charts Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Trend */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">Revenue & Distribution</h3>
          <p className="text-sm text-slate-500">Monthly subscription breakdown</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
            />
            <Legend wrapperStyle={{ color: '#64748b' }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Total Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charity Distribution */}
      <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">Top Charities</h3>
          <p className="text-sm text-slate-500">By subscriber count</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={charityDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name.substring(0, 10)}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {charityDistribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Recent Winners Table */}
    <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Winners</h3>
            <p className="text-sm text-slate-500">Latest prize payouts</p>
          </div>
          <Link
            to="/admin/winners"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            View All <ChevronRight size={16} />
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">Winner</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">Prize Amount</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">Draw Date</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50">
            {winners.slice(0, 5).map(win => (
              <tr key={win.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                      {win.user_email[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-900">{win.user_email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-emerald-600">
                  ${parseFloat(win.prize_amount).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {new Date(win.admin_approved_at || win.proof_submitted_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={win.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Users Tab
const UsersTab = ({ stats }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl border border-slate-200/50 p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
        <p className="text-slate-500">Manage platform users and subscriptions</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <InfoCard label="Total Users" value={stats?.total_users || 0} icon={Users} />
        <InfoCard label="Active Subscribers" value={stats?.active_subscribers || 0} icon={Check} />
        <InfoCard label="Inactive Users" value={(stats?.total_users || 0) - (stats?.active_subscribers || 0)} icon={Clock} />
      </div>
      <div className="space-y-3">
        <AdminAction label="View All Users" description="Manage user profiles and accounts" icon={Eye} href="/admin/users" />
        <AdminAction label="User Analytics" description="Engagement and activity metrics" icon={BarChart3} href="/admin/users/analytics" />
        <AdminAction label="Bulk Actions" description="Export, import, or update users in bulk" icon={Users} href="/admin/users/bulk" />
      </div>
    </div>
  </div>
);

// Subscriptions Tab
const SubscriptionsTab = ({ stats }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl border border-slate-200/50 p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Subscription Management</h2>
        <p className="text-slate-500">Monitor and manage all subscriptions</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <InfoCard label="Monthly Revenue" value={`$${(stats?.monthly_revenue || 0).toLocaleString()}`} icon={DollarSign} />
        <InfoCard label="Active Subscriptions" value={stats?.active_subscribers || 0} icon={Check} />
        <InfoCard label="Churn Rate" value="2.3%" icon={TrendingUp} />
      </div>
      <div className="space-y-3">
        <AdminAction label="View Subscriptions" description="All active and inactive subscriptions" icon={Eye} href="/admin/subscriptions" />
        <AdminAction label="Failed Payments" description="Review and resolve payment issues" icon={AlertCircle} href="/admin/subscriptions/failed" />
        <AdminAction label="Renewal Schedule" description="Upcoming subscription renewals" icon={Calendar} href="/admin/subscriptions/renewals" />
        <AdminAction label="Billing Reports" description="Revenue and payment analytics" icon={BarChart3} href="/admin/subscriptions/reports" />
      </div>
    </div>
  </div>
);

// Draws Tab
const DrawsTab = ({ stats }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl border border-slate-200/50 p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Draw Management</h2>
        <p className="text-slate-500">Configure and execute monthly draws</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <InfoCard label="Prize Pool" value={`$${Math.round(parseFloat(stats?.prize_pool_balance || 0)).toLocaleString()}`} icon={Trophy} />
        <InfoCard label="Monthly Draws" value={stats?.total_draws || 0} icon={Zap} />
        <InfoCard label="Winners This Month" value={stats?.monthly_winners || 0} icon={Trophy} />
      </div>
      <div className="space-y-3">
        <AdminAction label="Configure Draw" description="Set draw parameters and rules" icon={Settings} href="/admin/draws/configure" />
        <AdminAction label="Run Draw" description="Execute and publish draw results" icon={Zap} href="/admin/draws/run" />
        <AdminAction label="Draw History" description="View all past draws and results" icon={Eye} href="/admin/draws/history" />
        <AdminAction label="Prize Analysis" description="Track prize pool and distributions" icon={BarChart3} href="/admin/draws/analysis" />
      </div>
    </div>
  </div>
);

// Charities Tab
const CharitiesTab = ({ charityData }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl border border-slate-200/50 p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Charity Management</h2>
        <p className="text-slate-500">Manage listed charities and donations</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <InfoCard label="Total Charities" value={charityData.length} icon={Heart} />
        <InfoCard label="Total Donated" value={`$${charityData.reduce((sum, c) => sum + (c.donated || 0), 0).toLocaleString()}`} icon={DollarSign} />
        <InfoCard label="Featured Charity" value="1" icon={Trophy} />
      </div>
      <div className="space-y-3">
        <AdminAction label="All Charities" description="View and edit charity listings" icon={Eye} href="/admin/charities" />
        <AdminAction label="Add Charity" description="Register a new charity" icon={Heart} href="/admin/charities/add" />
        <AdminAction label="Donations Tracking" description="Monitor donation amounts" icon={DollarSign} href="/admin/charities/donations" />
        <AdminAction label="Charity Reports" description="Impact and engagement metrics" icon={BarChart3} href="/admin/charities/reports" />
      </div>
    </div>
  </div>
);

// Winners Tab
const WinnersTab = ({ winners }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200/50">
        <h2 className="text-2xl font-bold text-slate-900">Winner Verification & Payouts</h2>
        <p className="text-slate-500">Review and approve prize winners</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/50">
        <InfoCard label="Pending Review" value={winners.filter(w => w.status === 'pending').length} icon={Clock} />
        <InfoCard label="Verified" value={winners.filter(w => w.status === 'approved').length} icon={Check} />
        <InfoCard label="Paid Out" value={winners.filter(w => w.status === 'paid').length} icon={Trophy} />
        <InfoCard label="Rejected" value={winners.filter(w => w.status === 'rejected').length} icon={AlertCircle} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">Winner Email</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">Prize Amount</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">Submitted</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50">
            {winners.map(win => (
              <tr key={win.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                      {win.user_email[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-900">{win.user_email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-emerald-600">${parseFloat(win.prize_amount).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={win.status} />
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {new Date(win.proof_submitted_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {win.status === 'pending' ? (
                    <button className="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">
                      Review
                    </button>
                  ) : (
                    <button className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg" disabled>
                      View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Analytics Tab
const AnalyticsTab = ({ revenueData, charityDistribution }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Reports & Analytics</h2>
        <p className="text-slate-500">Comprehensive platform insights</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200/50">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Charity Breakdown */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200/50">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Charity Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={charityDistribution.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* Export Options */}
    <div className="bg-white rounded-2xl border border-slate-200/50 p-8 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Export Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExportButton label="Financial Report" description="Revenue, expenses, and profit data" />
        <ExportButton label="User Report" description="User engagement and retention metrics" />
        <ExportButton label="Charity Report" description="Donation tracking and charity performance" />
        <ExportButton label="Draw Statistics" description="Draw results and winner information" />
      </div>
    </div>
  </div>
);

// ==================== SHARED COMPONENTS ====================

const MetricCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    emerald: 'from-emerald-50 to-teal-50 text-emerald-600 border-emerald-200/50',
    amber: 'from-amber-50 to-orange-50 text-amber-600 border-amber-200/50',
    yellow: 'from-yellow-50 to-amber-50 text-yellow-600 border-yellow-200/50',
    rose: 'from-rose-50 to-pink-50 text-rose-600 border-rose-200/50',
    purple: 'from-purple-50 to-violet-50 text-purple-600 border-purple-200/50'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl border p-6 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <Icon size={24} className="opacity-50" />
      </div>
    </div>
  );
};

const InfoCard = ({ label, value, icon: Icon }) => (
  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200/50 p-4">
    <div className="flex items-center gap-3 mb-2">
      <Icon size={18} className="text-slate-600" />
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

const AdminAction = ({ label, description, icon: Icon, href }) => (
  <Link
    to={href}
    className="flex items-center justify-between p-4 rounded-lg border border-slate-200/50 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 group"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-100 group-hover:bg-emerald-100 rounded-lg transition-colors">
        <Icon size={18} className="text-slate-600 group-hover:text-emerald-600 transition-colors" />
      </div>
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
  </Link>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Pending Review' },
    approved: { bg: 'bg-green-50', text: 'text-green-700', label: 'Approved' },
    paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Paid' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

const ExportButton = ({ label, description }) => (
  <button className="flex items-center gap-4 p-4 border border-slate-200/50 rounded-lg hover:bg-slate-50 transition-colors group">
    <div className="p-3 bg-slate-100 group-hover:bg-emerald-100 rounded-lg transition-colors">
      <BarChart3 size={18} className="text-slate-600 group-hover:text-emerald-600" />
    </div>
    <div className="text-left">
      <p className="font-medium text-slate-900">{label}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  </button>
);

export default AdminDashboard;