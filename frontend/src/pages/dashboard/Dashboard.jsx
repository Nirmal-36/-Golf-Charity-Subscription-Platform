import React from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { Trophy, ArrowRight, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ScoreReel from '../../components/ScoreReel';
import SubscriptionBadge from '../../components/SubscriptionBadge';
import { resolveImageUrl } from '../../utils/image';
import { getCategoryIcon } from '../../utils/icons';

/**
 * Member Core: Dashboard
 * The primary command center for standard platform members.
 * Orchestrates real-time score tracking, subscription status monitoring, 
 * and philanthropic impact visualization.
 */
const Dashboard = () => {
  const { user, logout } = useAuth();

  // Security: Role-based redirection for administrative staff
  if (user?.is_staff) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-4 md:p-8"
    >
      {/* Page Header: Identity & CTA Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-brand-dark tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Welcome back, <span className="text-brand-green">{user?.username}</span>. Here's your current impact.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/draw"
            className="px-6 py-3 bg-brand-gold text-brand-dark font-black rounded-2xl hover:bg-yellow-500 transition shadow-lg shadow-brand-gold/20 flex items-center gap-2"
          >
            <Trophy size={20} /> Prize Draw
          </Link>
          <Link
            to="/scores/submit"
            className="px-6 py-3 bg-brand-green text-white font-black rounded-2xl hover:bg-brand-green/90 transition shadow-lg shadow-brand-green/20"
          >
            + Submit Score
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column: Activity & Performance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >

          {/* Component: ScoreReel - Handled via dedicated hook/component */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="text-brand-gold" />
                <h2 className="text-xl font-bold">Your Active Scores</h2>
              </div>
            </div>
            <ScoreReel />
          </section>

          {/* Strategic Reveal: Next Draw Announcement */}
          <section className="bg-gradient-to-br from-brand-green to-[#0f281e] text-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-2">Monthly Charity Draw</h2>
            <p className="text-gray-300 mb-6">The next draw happens on the 1st of the month. Match 5 numbers to win the rolling jackpot!</p>
            <Link to="/draw" className="inline-flex items-center gap-2 bg-brand-gold text-brand-dark px-5 py-2.5 rounded-lg font-bold hover:bg-yellow-500 transition">
              Enter The Draw <ArrowRight size={18} />
            </Link>
          </section>

        </motion.div>

        {/* Column: Status & Philanthropy Widgets */}
        <motion.div
           // ... variants ...
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Membership Status Widget */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Membership</h2>
              <SubscriptionBadge status={user?.subscription_status} />
            </div>

            {user?.subscription_status === 'active' ? (
              <>
                <div className="bg-brand-light/50 rounded-xl p-5 mb-4 border border-brand-green/10">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Current Plan</p>
                  <p className="font-black text-brand-dark text-lg uppercase tracking-tight">
                    Eagle {user?.subscription_plan === 'yearly' ? 'Yearly' : 'Monthly'}
                  </p>
                  <p className="text-brand-green font-bold text-sm mt-1">
                    ${user?.subscription_plan === 'yearly' ? '99 / year' : '9.99 / month'}
                  </p>
                </div>
                <Link
                  to="/subscription/details"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-brand-dark text-white rounded-xl font-bold hover:bg-black transition shadow-xl shadow-brand-dark/10 group"
                >
                  Manage Membership <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            ) : (
              <>
                <div className="bg-red-50 rounded-xl p-5 mb-4 border border-red-100">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-2">Notice</p>
                  <p className="font-bold text-red-700">Membership Inactive</p>
                  <p className="text-xs text-red-600/70 mt-1 leading-relaxed">Your benefits are currently suspended. Rejoin to resume your impact.</p>
                </div>
                <Link
                  to="/subscription/details"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-brand-green text-white rounded-xl font-bold hover:bg-brand-green/90 transition shadow-xl shadow-brand-green/20 group"
                >
                  View Options <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </section>

          {/* Charity Impact Widget */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="text-red-500" />
              <h2 className="text-xl font-bold">Your Impact</h2>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold text-brand-green">${user?.total_donated}</div>
              <div className="text-sm text-gray-500">Total Donated to Date</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 mb-4 border border-gray-100">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Supported Charity</div>
              {user?.selected_charity_name ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.selected_charity_logo ? (
                      <img src={resolveImageUrl(user.selected_charity_logo)} alt={user.selected_charity_name} className="w-full h-full object-contain p-1" />
                    ) : (
                      (() => {
                        const Icon = getCategoryIcon(user.selected_charity_category);
                        return <Icon size={24} className="text-brand-green/40" />;
                      })()
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-brand-dark leading-tight">{user.selected_charity_name}</div>
                    <div className="text-[10px] font-black text-brand-green uppercase tracking-widest mt-1">{user.selected_charity_category}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">No charity selected yet.</div>
              )}
            </div>

            <Link
              to="/charities"
              className="block w-full text-center text-sm font-semibold border border-gray-200 rounded-lg py-2 text-brand-green hover:bg-gray-50 transition"
            >
              Change Charity
            </Link>
          </section>

        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
