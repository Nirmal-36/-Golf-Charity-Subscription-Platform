import React, { useState, useEffect } from 'react';
import { Search, Heart, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

/**
 * Philanthropy Discovery: ExploreCharities
 * The public-facing partner directory. 
 * Allows visitors to search and browse verified charitable partners 
 * before committing to a membership.
 */
const ExploreCharities = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Lifecycle: Synchronize public partner registry
  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const res = await api.get('/api/charities/');
        setCharities(res.data);
      } catch {
        console.error("Infrastructure Alert: Discovery registry inaccessible.");
      } finally {
        setLoading(false);
      }
    };
    fetchCharities();
  }, []);

  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-brand-light min-h-screen pb-24">
      <div className="bg-white border-b border-gray-100 py-20 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green/10 text-brand-green rounded-full text-xs font-black uppercase tracking-widest mb-6">
             <Compass size={14} /> Discovery Mode
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-brand-dark tracking-tight mb-6">Our Partner Charities</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Explore the organizations we support. As a member, you select one charity to receive a portion of your monthly contribution.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or cause..."
              className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-brand-green/30 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            {filteredCharities.length} Partners Found
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCharities.map((charity) => (
              <CharityCard key={charity.id} charity={charity} />
            ))}
          </motion.div>
        )}

        <div className="mt-24 bg-brand-dark rounded-[40px] p-12 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
             <div>
               <h3 className="text-3xl font-black mb-2 tracking-tight">Ready to start supporting?</h3>
               <p className="text-gray-400 font-medium">Join today and automate your charitable impact.</p>
             </div>
             <Link to="/register" className="px-10 py-4 bg-brand-green text-white font-black rounded-2xl hover:bg-brand-green/90 transition shadow-xl shadow-black/20 flex items-center gap-2">
               Get Started <ChevronRight size={20} />
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreCharities;
