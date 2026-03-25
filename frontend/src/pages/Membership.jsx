import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Trophy, Heart, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

const Membership = () => {
  const plans = [
    {
      name: 'Eagle Member',
      price: '20',
      period: 'mo',
      features: [
        'Rolling 5-score handicap tracking',
        'Stripe-secured payments',
        'Direct 10% charity contribution',
        'Automatic entry to monthly draw',
        'Personal impact dashboard',
        'Email notification for wins'
      ],
      popular: true,
      cta: 'Join Now'
    },
    {
      name: 'Legacy Club',
      price: '200',
      period: 'yr',
      features: [
        'All Eagle Member features',
        'Two months free (Annual bonus)',
        'Priority verification support',
        'Legacy badge on profile',
        'Annual impact report',
        'Exclusive partner discounts'
      ],
      popular: false,
      cta: 'Go Annual'
    }
  ];

  return (
    <div className="bg-brand-light min-h-screen">
      
      {/* Header */}
      <section className="bg-white border-b border-gray-100 py-24 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold/10 text-brand-gold rounded-full text-xs font-black uppercase tracking-widest mb-6">
             <Trophy size={14} /> Elite Membership
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-brand-dark tracking-tight mb-6">One Membership. <br />Infinite <span className="text-brand-green">Impact.</span></h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Choose the plan that fits your game. Every membership secures your place in our monthly prize draws and guarantees a direct donation to your chosen charity.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className={`bg-white rounded-[40px] p-10 border-2 transition-all relative overflow-hidden ${
                plan.popular ? 'border-brand-green shadow-2xl shadow-brand-green/10' : 'border-gray-100'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-8 -right-12 rotate-45 bg-brand-green text-white px-12 py-2 text-xs font-black uppercase tracking-widest">
                  Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-black text-brand-dark mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-brand-dark">${plan.price}</span>
                  <span className="text-gray-400 font-bold">/{plan.period}</span>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-bold text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              <Link 
                to="/register" 
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 ${
                  plan.popular 
                    ? 'bg-brand-green text-white shadow-xl shadow-brand-green/20 hover:bg-brand-green/90' 
                    : 'bg-brand-light text-brand-dark hover:bg-gray-100'
                }`}
              >
                {plan.cta} <ArrowRight size={20} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Benefits Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 text-center border-t border-gray-100 pt-32">
           {[
             { icon: Heart, title: 'Charity First', desc: '10% of every payment is automatically routed to your chosen partner.' },
             { icon: ShieldCheck, title: 'Stripe Secure', desc: 'Enterprise-grade encryption for all membership and payout transactions.' },
             { icon: Zap, title: 'Instant Entry', desc: 'Secure your spot in the monthly draw immediately upon joining.' }
           ].map((item, i) => (
             <div key={i}>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-green mx-auto mb-6 shadow-sm border border-gray-50">
                {(() => {
                  const Icon = item.icon;
                  return <Icon size={28} />;
                })()}
                </div>
                <h4 className="text-xl font-bold text-brand-dark mb-3">{item.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Membership;
