import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Heart, Target, ChevronRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const LandingPage = () => {
  const { user } = useAuth();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
// ... rest of variants ...
  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const charities = [
    { name: 'Red Cross Golf Fund', category: 'Humanitarian', impact: '$12,400' },
    { name: 'Pure Water Initiative', category: 'Environment', impact: '$8,200' },
    { name: 'Junior Golf Scholars', category: 'Education', impact: '$15,900' }
  ];

  return (
    <div className="bg-white overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 bg-brand-light">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-green/5 rounded-bl-[200px] hidden lg:block -z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green/10 text-brand-green rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <Zap size={14} className="fill-brand-green" /> The New Era of Charitable Golf
            </div>
            <h1 className="text-6xl lg:text-8xl font-black text-brand-dark tracking-tighter leading-[0.95] mb-8">
              Swing for <span className="text-brand-green">Change.</span> <br />
              Win for <span className="text-brand-gold italic">Life.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-xl leading-relaxed">
              Tracking your handicap shouldn't just be about the score. Join the platform where every round you play contributes to a global impact and enters you into elite prize draws.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link 
                  to={user.is_staff ? "/admin/dashboard" : "/dashboard"} 
                  className="px-10 py-5 bg-brand-green text-white font-bold rounded-2xl text-lg hover:bg-brand-green/90 transition shadow-2xl shadow-brand-green/20 flex items-center justify-center gap-2 group"
                >
                  Go to {user.is_staff ? "Admin Panel" : "Dashboard"} <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link 
                  to="/register" 
                  className="px-10 py-5 bg-brand-green text-white font-bold rounded-2xl text-lg hover:bg-brand-green/90 transition shadow-2xl shadow-brand-green/20 flex items-center justify-center gap-2 group"
                >
                  Start Your Journey <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <Link 
                to="/explore" 
                className="px-10 py-5 bg-white text-brand-dark font-bold rounded-2xl text-lg border-2 border-gray-100 hover:border-brand-green/20 transition shadow-sm flex items-center justify-center gap-2"
              >
                View Charities
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Stat Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute right-0 top-1/2 hidden lg:block"
        >
          <div className="bg-brand-dark text-white p-10 rounded-l-[40px] shadow-3xl border border-white/10">
            <div className="text-4xl font-black text-brand-gold mb-1">$412,000+</div>
            <div className="text-xs uppercase tracking-widest text-gray-400 font-bold">Total Donated by Members</div>
          </div>
        </motion.div>
      </section>

      {/* Mechanics / How it Works */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-brand-dark tracking-tight mb-4">How It Works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Three simple steps to automate your handicap and your charitable footprint.</p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {[
              { icon: Heart, title: 'Join & Support', desc: 'Sign up and select a charity. 10% of your monthly fee goes directly to them.' },
              { icon: Target, title: 'Play & Submit', desc: 'Enter your 18-hole scores. We maintain your rolling 5-score active handicap.' },
              { icon: Trophy, title: 'Win Big', desc: 'Automatically entered into monthly hardware and holiday giveaways.' }
            ].map((step, i) => (
              <motion.div key={i} variants={itemVariants} className="relative group">
                <div className="w-20 h-20 bg-brand-light rounded-3xl flex items-center justify-center text-brand-green mb-8 group-hover:bg-brand-green group-hover:text-white transition-all shadow-sm">
                {(() => {
                  const Icon = step.icon;
                  return <Icon size={32} />;
                })()}
                </div>
                <h4 className="text-2xl font-bold text-brand-dark mb-4">{step.title}</h4>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                {i < 2 && (
                   <div className="hidden lg:block absolute top-10 -right-6 w-12 h-[2px] bg-gray-100"></div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Charity Impact Showcase */}
      <section className="py-32 bg-brand-dark text-white relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Real People. <br /><span className="text-brand-gold">Real Impact.</span></h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl">
                We've partnered with over 50 vetted charities. When you improve your game, you improve the world. Transparency is our core value—every cent is tracked and audited.
                {!user?.is_staff && (
                  <>
                    <br /><br />
                    <Link to="/charity-registration" className="text-brand-gold hover:underline font-bold flex items-center gap-2">
                      Partner with us <ChevronRight size={16} />
                    </Link>
                  </>
                )}
              </p>
              
              <div className="space-y-6">
                {['Direct donation routing', 'Verified impact reports', 'Zero platform fees on donations'].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green">
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="font-bold text-gray-200">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {charities.map((charity, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ x: 10 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 bg-brand-green/20 text-brand-green text-xs font-black uppercase tracking-widest rounded-full">{charity.category}</span>
                    <span className="text-brand-gold font-black">{charity.impact} Raised</span>
                  </div>
                  <h4 className="text-xl font-bold">{charity.name}</h4>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-brand-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-brand-green rounded-[60px] p-16 md:p-24 text-white relative overflow-hidden shadow-3xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10">
              {user ? (
                <>
                  <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">Your impact continues.</h2>
                  <p className="text-green-100/80 text-xl mb-12 max-w-2xl mx-auto">
                    You're already part of the community making a difference on and off the course.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Link to={user.is_staff ? "/admin/dashboard" : "/dashboard"} className="px-12 py-5 bg-white text-brand-green font-black rounded-2xl text-xl hover:bg-green-50 transition shadow-xl shadow-black/10">
                      View {user.is_staff ? "Admin Panel" : "Dashboard"}
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">Ready to elevate your game?</h2>
                  <p className="text-green-100/80 text-xl mb-12 max-w-2xl mx-auto">
                    Join thousands of golfers worldwide who are playing for more than just a lower handicap.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Link to="/register" className="px-12 py-5 bg-white text-brand-green font-black rounded-2xl text-xl hover:bg-green-50 transition shadow-xl shadow-black/10">
                      Join The Club
                    </Link>
                    <div className="flex items-center gap-2 text-green-100/60 font-medium">
                       <ShieldCheck size={20} /> Cancel Anytime
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
