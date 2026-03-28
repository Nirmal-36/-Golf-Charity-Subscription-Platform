import React, { useState } from 'react';
// import motion if needed
import { 
  Check, Shield, Zap, ArrowRight, Loader2, 
  Trophy, Heart, Target 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';

/**
 * Conversion Point: Subscription
 * The primary value proposition and checkout gateway for new members.
 * Orchestrates tiered plan selection (Monthly/Yearly) and initiates 
 * secure Stripe Checkout sessions.
 */
const Subscription = () => {
  const { user } = useAuth();
  
  // State: Checkout lifecycle & Plan configuration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [planType, setPlanType] = useState('monthly');

  // Security: Redirection for administrative identities
  if (user?.is_staff) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Logic: Prevent redundant subscriptions for active members
  if (user?.subscription_status === 'active') {
    return <Navigate to="/" />;
  }

  /**
   * Transaction Handler: handleSubscribe
   * Executes the transition to the secure Stripe Checkout environment.
   * Maps local plan configurations to Stripe Price IDs.
   */
  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/subscriptions/create-checkout-session/', {
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/cancel`,
        plan_type: planType,
      });
      // Gateway Transaction: Hand-off to encrypted Stripe terminal
      window.location.href = data.checkout_url;
    } catch {
      setError('Transaction Alert: Failed to initialize secure checkout protocol.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
      >
        
        {/* Left Side: Features */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-brand-green text-white p-8 md:p-12 flex flex-col justify-center relative overflow-hidden"
        >
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">Join the Club</h2>
            <p className="text-green-100 mb-8 max-w-sm leading-relaxed">
              Unlock your active handicap, enter monthly prize draws, and seamlessly donate to causes you care about.
            </p>
            
            <ul className="space-y-8">
              {[
                { icon: Trophy, color: 'text-brand-gold', title: 'Rolling 5-Score Tracking', desc: 'Automatically calculate your most recent active handicap.' },
                { icon: Heart, color: 'text-red-400', title: 'Charitable Giving Built-in', desc: '10% of your membership fee instantly goes to your selected charity.' },
                { icon: Target, color: 'text-blue-300', title: 'Monthly Prize Draws', desc: 'Automatic entry into our monthly hardware and holiday giveaways.' }
              ].map((item, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                {(() => {
                  const Icon = item.icon;
                  return <Icon className={`${item.color} shrink-0 mt-1`} size={24} />;
                })()}
                  <div>
                    <h4 className="font-bold text-lg">{item.title}</h4>
                    <p className="text-sm text-green-200/80">{item.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Right Side: Pricing / Checkout */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-8 md:p-12 flex flex-col justify-center items-center text-center bg-white"
        >
          <div className="mb-6 flex bg-gray-100 p-1.5 rounded-2xl w-full max-w-[280px]">
            <button 
              onClick={() => setPlanType('monthly')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${planType === 'monthly' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setPlanType('yearly')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${planType === 'yearly' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Yearly <span className="text-[10px] bg-brand-green/10 text-brand-green px-1.5 py-0.5 rounded-full ml-1">-15%</span>
            </button>
          </div>

          <div className="mb-3 text-xs font-black text-brand-gold uppercase tracking-[0.2em]">Membership</div>
          <h2 className="text-6xl font-black text-brand-dark mb-3">
            ${planType === 'monthly' ? '9.99' : '99'}
            <span className="text-xl text-gray-400 font-medium">/{planType === 'monthly' ? 'mo' : 'yr'}</span>
          </h2>
          <p className="text-gray-500 mb-6 max-w-xs leading-relaxed">
            {planType === 'monthly' ? 'Billed monthly. Cancel anytime easily through your dashboard.' : 'Billed annually. Best value for dedicated players.'}
          </p>

          <div className="w-full max-w-xs mb-8 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Selected Charity</span>
              <Link to="/charities" className="text-xs font-bold text-brand-green hover:underline">Change</Link>
            </div>
            {user?.selected_charity_name ? (
              <div className="flex items-center gap-2 text-brand-dark font-bold">
                <Heart size={16} className="text-brand-green" />
                {user.selected_charity_name}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                <Heart size={16} />
                Please select a charity
              </div>
            )}
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-red-600 text-sm mb-6 bg-red-50 p-4 rounded-xl w-full border border-red-100 font-medium"
            >
              {error}
            </motion.div>
          )}
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubscribe} 
            disabled={loading || !user?.selected_charity}
            className="w-full max-w-xs py-5 bg-brand-dark text-white rounded-2xl font-bold text-xl hover:bg-black transition shadow-xl shadow-gray-200 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              !user?.selected_charity ? 'Select Charity First' : 'Subscribe Now'
            )}
          </motion.button>
          
          <div className="mt-10 flex items-center gap-3 text-sm text-gray-400 font-medium">
            <CheckCircle2 size={18} className="text-brand-green" /> Secure checkout powered by Stripe
          </div>
        </motion.div>

      </motion.div>
    </div>
  );

};

export default Subscription;
