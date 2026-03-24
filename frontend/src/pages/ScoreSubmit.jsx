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
    <div className="max-w-md mx-auto p-4 md:p-8 mt-8">
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-brand-green mb-6 transition">
        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
      </Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-brand-green mb-2">Log a New Score</h1>
        <p className="text-gray-600 mb-6">Enter your Stableford score below. Remember, only your last 5 scores count towards your active handicap.</p>
        
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
