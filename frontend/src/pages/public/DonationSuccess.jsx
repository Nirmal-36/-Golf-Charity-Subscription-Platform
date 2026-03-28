import React from 'react';
// import motion if needed
import { Heart, Share2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Transaction Gateway: DonationSuccess
 * The post-donation landing terminal for independent contributions.
 * Focuses on philanthropic validation, impact multiplication 
 * messaging, and social advocacy CTAs.
 */
const DonationSuccess = () => {
  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-white rounded-[48px] p-12 text-center shadow-2xl border border-gray-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green mx-auto mb-8 animate-bounce">
            <Heart size={48} className="fill-brand-green" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-brand-dark tracking-tight mb-4 leading-tight">
            Impact <span className="text-brand-green">Multiplied.</span>
          </h1>
          <p className="text-gray-500 text-lg font-medium mb-12 leading-relaxed">
            Your independent contribution has been processed successfully. You're helping drive real change through the power of the game.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-12">
            <div className="bg-brand-light/50 p-6 rounded-3xl border border-brand-green/10">
                <Trophy className="text-brand-gold mx-auto mb-2" size={24} />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction</p>
                <p className="text-brand-dark font-black">Verified</p>
            </div>
            <div className="bg-brand-light/50 p-6 rounded-3xl border border-brand-green/10">
                <Heart className="text-brand-green mx-auto mb-2" size={24} />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Impact</p>
                <p className="text-brand-dark font-black">Growing</p>
            </div>
          </div>

          <div className="space-y-4">
            <Link to="/explore" className="w-full py-5 bg-brand-green text-white rounded-[24px] font-black shadow-xl shadow-brand-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                Continue Exploring <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <div className="flex justify-center gap-6 pt-4">
                <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition">
                    <Share2 size={16} /> Share Impact
                </button>
                <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition">
                    <Globe size={16} /> Visit Charity
                </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DonationSuccess;
