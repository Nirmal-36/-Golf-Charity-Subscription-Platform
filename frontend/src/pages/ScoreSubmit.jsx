import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useScores } from '../hooks/useScores';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ScoreSubmit = () => {
  const { addScore, loading, error } = useScores();
  const [score, setScore] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (score < 1 || score > 45) return;
    
    const isSuccess = await addScore(parseInt(score, 10));
    if (isSuccess) {
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000); // Redirect to dashboard after 2s
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="inline-block bg-green-100 rounded-full p-6 mb-4"
        >
          <CheckCircle2 size={64} className="text-brand-green" />
        </motion.div>
        <h2 className="text-2xl font-bold text-brand-dark mb-2">Score Submitted!</h2>
        <p className="text-gray-600">Your rolling window has been updated.</p>
        <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8 mt-12">
      <div className="bg-white rounded-[40px] shadow-2xl shadow-brand-green/5 border border-gray-100 p-10 md:p-16">
        <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green mb-8">
           <Trophy size={32} />
        </div>
        <h1 className="text-3xl font-black text-brand-dark mb-4 tracking-tight">Post Your Round</h1>
        <p className="text-gray-500 mb-10 font-medium leading-relaxed">
          Enter your Stableford score for today's play. We'll automatically update your handicap based on your rolling 5-score history.
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {typeof error === 'object' ? JSON.stringify(error) : error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-2">Stableford Score (1 - 45)</label>
            <input 
              type="number" 
              className="w-full text-center text-4xl font-bold border-2 border-gray-200 rounded-xl p-4 focus:border-brand-green focus:ring-0 outline-none transition" 
              value={score}
              onChange={(e) => setScore(e.target.value)}
              min="1"
              max="45"
              required 
              placeholder="0"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !score}
            className="w-full py-4 bg-brand-green hover:bg-brand-green/90 text-white rounded-xl font-bold text-lg transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Save Score'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScoreSubmit;
