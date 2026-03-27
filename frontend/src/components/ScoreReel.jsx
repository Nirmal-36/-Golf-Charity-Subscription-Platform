import React, { useEffect } from 'react';
import ScoreCard from './ScoreCard';
import { useScores } from '../hooks/useScores';
import { motion, AnimatePresence } from 'framer-motion';

const ScoreReel = () => {
  const { scores, loading, error, fetchActiveScores } = useScores();

  useEffect(() => {
    fetchActiveScores();
  }, [fetchActiveScores]);

  if (loading) return (
    <div className="flex gap-4 py-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="w-32 h-24 bg-gray-100 rounded-xl animate-pulse"></div>
      ))}
    </div>
  );
  
  if (error) return <div className="text-red-500 py-8 font-medium">Failed to load scores.</div>;

  if (scores.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 p-12 rounded-2xl text-center border-2 border-dashed border-gray-200"
      >
        <p className="text-gray-500 font-medium">No live scores yet.</p>
        <p className="text-sm mt-2 text-gray-400">Submit your first round to enter the rolling window.</p>
      </motion.div>
    );
  }

  const oldestIndex = scores.length - 1;

  return (
    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
      <motion.div 
        layout
        className="flex gap-4"
      >
        <AnimatePresence mode="popLayout">
          {scores.map((s, index) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <ScoreCard 
                id={s.id}
                score={s.score} 
                submittedAt={s.submitted_at} 
                isOldest={scores.length === 5 && index === oldestIndex} 
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ScoreReel;
