import React from 'react';
import { useAuth } from '../context/AuthContext';
import ScoreReel from '../components/ScoreReel';
import { Link } from 'react-router-dom';
import { Trophy, Heart, ArrowRight, UserCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-green">Welcome back!</h1>
          <p className="text-gray-600 mt-1">Ready to hit the links and make a difference.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            user?.subscription_status === 'active' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {user?.subscription_status === 'active' ? 'Active Member' : 'Subscription Lapsed'}
          </span>
          <button onClick={logout} className="text-gray-500 hover:text-gray-800 transition">
            <UserCircle size={28} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Scores Section */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="text-brand-gold" />
                <h2 className="text-xl font-bold">Your Active Scores</h2>
              </div>
              <Link 
                to="/scores/submit" 
                className="text-sm font-medium bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-brand-green/90 transition"
              >
                Submit Score
              </Link>
            </div>
            <ScoreReel />
          </section>
          
          {/* Next Draw Teaser */}
          <section className="bg-gradient-to-br from-brand-green to-[#0f281e] text-white rounded-2xl p-6 shadow-sm">
             <h2 className="text-xl font-bold mb-2">Monthly Charity Draw</h2>
             <p className="text-gray-300 mb-6">The next draw happens on the 1st of the month. Match 5 numbers to win the rolling jackpot!</p>
             <Link to="/draw" className="inline-flex items-center gap-2 bg-brand-gold text-brand-dark px-5 py-2.5 rounded-lg font-bold hover:bg-yellow-500 transition">
               Enter The Draw <ArrowRight size={18} />
             </Link>
          </section>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
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

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Supported Charity</div>
              {user?.selected_charity ? (
                <>
                  <div className="font-bold text-brand-dark">{user.selected_charity}</div>
                  <div className="text-sm text-gray-600 mt-1">Receiving {user.donation_percentage}% of your monthly fee.</div>
                </>
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

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
