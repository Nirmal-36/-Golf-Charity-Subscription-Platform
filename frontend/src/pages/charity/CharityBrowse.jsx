import React, { useEffect } from 'react';
import { useCharities } from '../../hooks/useCharities';
import { useAuth } from '../../hooks/useAuth';
import CharityCard from '../../components/CharityCard';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const CharityBrowse = () => {
  const { charities, loading, error, fetchCharities, selectCharity } = useCharities();
  const { user, checkUser } = useAuth();

  useEffect(() => {
    fetchCharities();
  }, [fetchCharities]);

  const handleSelectCharity = async (charityId) => {
    const success = await selectCharity(charityId);
    if (success) {
      await checkUser(); // Refresh user profile to get the newly selected charity name
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Scanning network...</p>
      </div>
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-5xl mx-auto p-4 md:p-8"
    >
      <motion.div variants={itemVariants} className="mb-12">
        <h1 className="text-4xl font-black text-brand-dark tracking-tight">Charity <span className="text-brand-green">Directory</span></h1>
        <p className="text-gray-500 mt-4 font-medium max-w-2xl leading-relaxed">
          Select your partner for the month. 10% of your contribution is automatically routed to support their mission.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {charities.map((charity) => {
          const isSelected = user?.selected_charity === charity.id || user?.selected_charity === charity.name;
          
          return (
            <motion.div key={charity.id} variants={itemVariants}>
              <CharityCard 
                charity={charity}
                isSelected={isSelected}
                onSelect={handleSelectCharity}
              />
            </motion.div>
          );
        })}
      </motion.div>
      
      {charities.length === 0 && (
        <motion.div 
          variants={itemVariants}
          className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100 mt-6"
        >
          No charities available at the moment.
        </motion.div>
      )}
    </motion.div>
  );
};

export default CharityBrowse;
