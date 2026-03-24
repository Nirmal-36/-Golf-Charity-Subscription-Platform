import React from 'react';
import { motion } from 'framer-motion';

const ScoreCard = ({ score, submittedAt, isOldest }) => {
  const dateObj = new Date(submittedAt);
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-xl shadow p-4 text-center shrink-0 w-32 border-2 ${isOldest ? 'border-brand-gold bg-brand-light opacity-80' : 'border-transparent bg-white'}`}
    >
      <div className="text-sm text-gray-500 mb-1">{formattedDate}</div>
      <div className="text-3xl font-bold text-brand-green">{score}</div>
      {isOldest && <div className="text-xs text-brand-gold mt-1 font-semibold">Oldest</div>}
    </motion.div>
  );
};

export default ScoreCard;
