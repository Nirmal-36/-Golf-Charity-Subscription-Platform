import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, TrendingUp, DollarSign, Edit3, Camera, CheckCircle2, Globe, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { resolveImageUrl } from '../../utils/image';
import { getCategoryIcon } from '../../utils/icons';

const OrganizationDashboard = () => {
  const { user } = useAuth();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharityData();
  }, []);

  const fetchCharityData = async () => {
    try {
      const { data } = await api.get('/api/charities/my-profile/');
      setCharity(data);
    } catch (err) {
      console.error('Failed to fetch charity profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!charity) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-400 mb-6">
        <Heart size={40} />
      </div>
      <h2 className="text-2xl font-black text-brand-dark mb-2">Awaiting Assignment</h2>
      <p className="text-gray-500 max-w-sm">Your account is registered as an organization, but no charity profile has been linked yet. Please contact the administrator.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {!charity.is_approved && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-brand-gold/10 border border-brand-gold/20 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-gold shadow-sm">
              <Award size={24} />
            </div>
            <div>
              <p className="font-black text-brand-dark">Verification Pending</p>
              <p className="text-sm text-gray-500 font-medium">Our administrators are reviewing your charity credentials. Some features may be limited.</p>
            </div>
          </div>
          <div className="px-6 py-2 bg-white rounded-full text-xs font-black text-brand-gold uppercase tracking-widest border border-brand-gold/10">
            Phase 1 of 2
          </div>
        </motion.div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl border border-gray-100 flex items-center justify-center overflow-hidden">
              {charity.logo_image || charity.logo_url ? (
                <img src={resolveImageUrl(charity.logo_image || charity.logo_url)} alt={charity.name} className="w-full h-full object-cover" />
              ) : (
                (() => {
                  const Icon = getCategoryIcon(charity.category);
                  return <Icon size={40} className="text-brand-green/40" strokeWidth={1.5} />;
                })()
              )}
            </div>
            <Link to="/org/profile" className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-dark text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={14} />
            </Link>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-brand-dark tracking-tight">{charity.name}</h1>
              {charity.is_approved && (
                <div className="bg-brand-green/10 text-brand-green p-1 rounded-full" title="Verified Partner">
                  <CheckCircle2 size={20} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm font-bold text-gray-400 uppercase tracking-widest">
              <span>{charity.category}</span>
              <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
              <span className="flex items-center gap-1.5">
                <Globe size={14} /> Charity Partner
              </span>
            </div>
          </div>
        </div>
        
        <Link 
          to="/org/profile"
          className="px-6 py-3 bg-white border border-gray-200 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all text-brand-dark shadow-sm cursor-pointer"
        >
          <Edit3 size={18} />
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Total Received" value={`$${charity.total_received}`} icon={DollarSign} color="brand-green" />
            <StatCard label="Active Supporters" value={charity.supporter_count || 0} icon={Users} color="blue-500" />
            <StatCard 
              label="Avg. Donation" 
              value={charity.supporter_count > 0 ? `$${(charity.total_received / charity.supporter_count).toFixed(2)}` : '$0.00'} 
              icon={TrendingUp} 
              color="orange-500" 
            />
          </div>

          <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black text-brand-dark mb-4">Our Mission</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-lg">
                {charity.description}
              </p>
            </div>
            <Heart size={150} className="absolute -bottom-10 -right-10 text-brand-green/5 rotate-12" />
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-8">
          <div className="bg-brand-dark text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
            <Award size={100} className="absolute -bottom-6 -right-6 text-white/10" />
            <p className="text-xs font-black uppercase tracking-widest mb-4 text-gray-400">Impact Milestone</p>
            <h4 className="text-2xl font-black mb-2">Platform Hero</h4>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              You are in the top 10% of charities by disbursement speed. Keep up the great work!
            </p>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-brand-green rounded-full"></div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl">
            <h4 className="font-black text-brand-dark mb-6">Quick Links</h4>
            <div className="space-y-4">
              <QuickLink label="View Public Profile" href={`/charities/${charity.slug}`} />
              <QuickLink label="Disbursement History" href="/org/donations" />
              <QuickLink label="Partner Support" href="/contact" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-lg shadow-gray-200/50">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-gray-50 text-${color}`}>
      <Icon size={24} />
    </div>
    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-brand-dark">{value}</p>
  </div>
);

const QuickLink = ({ label, href }) => (
  <a href={href} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-brand-green/5 hover:text-brand-green rounded-2xl font-bold transition-all text-gray-500 group">
    {label}
    <TrendingUp size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
  </a>
);

export default OrganizationDashboard;
