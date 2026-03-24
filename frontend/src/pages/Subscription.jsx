import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Target, Heart, Trophy, CheckCircle2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Subscription = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If user is already active (and it's not a staff overriding it), redirect to dashboard
  if (user?.subscription_status === 'active' && !user?.is_staff) {
    return <Navigate to="/" />;
  }

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/subscriptions/create-checkout-session/', {
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/cancel`,
      });
      // Redirect to Stripe Checkout URL
      window.location.href = data.checkout_url;
    } catch (err) {
      setError('Failed to initiate checkout. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Left Side: Features */}
        <div className="bg-brand-green text-white p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Club</h2>
          <p className="text-green-100 mb-8 max-w-sm">
            Unlock your active handicap, enter monthly prize draws, and seamlessly donate to causes you care about.
          </p>
          
          <ul className="space-y-6">
            <li className="flex items-start gap-3">
              <Trophy className="text-brand-gold shrink-0 mt-1" />
              <div>
                <h4 className="font-bold">Rolling 5-Score Tracking</h4>
                <p className="text-sm text-green-200">Automatically calculate your most recent active handicap.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="text-red-400 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold">Charitable Giving Built-in</h4>
                <p className="text-sm text-green-200">10% of your membership fee instantly goes to your selected charity.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Target className="text-blue-300 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold">Monthly Prize Draws</h4>
                <p className="text-sm text-green-200">Automatic entry into our monthly hardware and holiday giveaways.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Right Side: Pricing / Checkout */}
        <div className="p-8 md:p-12 flex flex-col justify-center items-center text-center">
          <div className="mb-2 text-sm font-bold text-brand-gold uppercase tracking-widest">Membership</div>
          <h2 className="text-4xl font-bold text-brand-dark mb-2">$20<span className="text-lg text-gray-500 font-normal">/month</span></h2>
          <p className="text-gray-600 mb-8 max-w-xs">Billed monthly. Cancel anytime easily through your dashboard.</p>
          
          {error && <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg w-full">{error}</div>}
          
          <button 
            onClick={handleSubscribe} 
            disabled={loading}
            className="w-full max-w-xs py-4 bg-brand-dark text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? 'Redirecting to Stripe...' : 'Subscribe Now'}
          </button>
          
          <div className="mt-8 flex items-center gap-2 text-sm text-gray-400">
            <CheckCircle2 size={16} className="text-green-500" /> Secure checkout powered by Stripe
          </div>
        </div>

      </div>
    </div>
  );
};

export default Subscription;
