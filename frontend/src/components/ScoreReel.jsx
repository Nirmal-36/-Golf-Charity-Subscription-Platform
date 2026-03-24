import React, { useEffect } from 'react';
import ScoreCard from './ScoreCard';
import { useScores } from '../hooks/useScores';

const ScoreReel = () => {
  const { scores, loading, error, fetchActiveScores } = useScores();

  useEffect(() => {
    fetchActiveScores();
  }, [fetchActiveScores]);

  if (loading) return <div className="text-gray-500 animate-pulse py-8">Loading scores...</div>;
  if (error) return <div className="text-red-500 py-8">Failed to load scores.</div>;

  // The backend returns them ordered by -submitted_at (newest first). 
  // We want to render them newest to oldest (left to right)
  
  if (scores.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center border border-gray-100">
        <p className="text-gray-500">No active scores yet.</p>
        <p className="text-sm mt-2 text-gray-400">Submit your first score to start the rolling window.</p>
      </div>
    );
  }

  // Identify the oldest score manually (since array is newest-first, oldest is the last element)
  const oldestIndex = scores.length - 1;

  return (
    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex gap-4">
        {scores.map((s, index) => (
          <ScoreCard 
            key={s.id} 
            score={s.score} 
            submittedAt={s.submitted_at} 
            isOldest={scores.length === 5 && index === oldestIndex} 
          />
        ))}
      </div>
    </div>
  );
};

export default ScoreReel;
