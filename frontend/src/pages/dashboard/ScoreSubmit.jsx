import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import motion if needed
import { Target, Calendar, Award, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import { useScores } from '../../hooks/useScores';

/**
 * Member Transaction: ScoreSubmit
 * Orchestrates the submission and modification of golf scores.
 * Implements strict validation (1-45 Stableford range) and synchronizes 
 * with the global scorecard registry to update handicaps in real-time.
 */
const ScoreSubmit = () => {
  const { id } = useParams();
  const { addScore } = useScores();
  
  // State: Score metadata & Transaction lifecycle
  const [score, setScore] = useState('');
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const isEdit = !!id;

  // Lifecycle: Hydrate existing score for modification
  useEffect(() => {
    if (isEdit) {
      const fetchScore = async () => {
        try {
          const response = await api.get(`/api/scores/${id}/`);
          setScore(response.data.score);
          if (response.data.played_at) {
            setPlayedAt(response.data.played_at);
          }
        } catch {
          setError('Infrastructure Alert: Score data inaccessible.');
        } finally {
          setFetching(false);
        }
      };
      fetchScore();
    }
  }, [id, isEdit]);

  /**
   * Transaction Handler: handleSubmit
   * Executes the score persistence request (Create/Update).
   * Ensures business logic constraints are met before dispatching to API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation: Enforce Stableford scoring parameters
    if (score < 1 || score > 45) return;
    
    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        await api.patch(`/api/scores/${id}/`, { 
          score: parseInt(score, 10),
          played_at: playedAt
        });
        setSuccess(true);
      } else {
        const result = await addScore(parseInt(score, 10), playedAt);
        if (result) setSuccess(true);
      }
      
      // Post-Transaction: Smooth redirection to command center
      if (isEdit || !error) {
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Transaction Alert: Protocol rejection during persistence.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-green" size={40} />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block bg-green-100 rounded-[32px] p-8 mb-6"
        >
          <CheckCircle2 size={64} className="text-brand-green" />
        </motion.div>
        <h2 className="text-3xl font-black text-brand-dark mb-2 tracking-tight">
          Score {isEdit ? 'Updated' : 'Submitted'}!
        </h2>
        <p className="text-gray-500 font-medium">Your rolling window has been updated safely.</p>
        <p className="text-xs text-brand-green font-bold mt-8 uppercase tracking-widest animate-pulse">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8 mt-12">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-brand-dark transition mb-8 ml-4">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-brand-green/5 border border-gray-100 p-10 md:p-16">
        <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green mb-8">
          <Trophy size={32} />
        </div>
        <h1 className="text-3xl font-black text-brand-dark mb-4 tracking-tight">
          {isEdit ? 'Edit Your Round' : 'Post Your Round'}
        </h1>
        <p className="text-gray-500 mb-10 font-medium leading-relaxed">
          {isEdit 
            ? 'Adjust your score for this specific round. This will instantly refresh your rolling average.' 
            : "Enter your Stableford score and the date of your play. We'll automatically update your handicap."}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Stableford Score</label>
              <input
                type="number"
                className="w-full text-center text-4xl font-black border-2 border-gray-100 bg-brand-light/30 rounded-3xl p-6 focus:border-brand-green focus:bg-white focus:ring-0 outline-none transition"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                min="1"
                max="45"
                required
                placeholder="0"
              />
            </div>
            <div>
              <CustomDatePicker 
                label="Date Played" 
                value={playedAt} 
                onChange={(date) => setPlayedAt(date)} 
                required 
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !score}
            className="w-full py-5 bg-brand-green hover:bg-brand-green/90 text-white rounded-2xl font-black text-xl transition shadow-xl shadow-brand-green/20 disabled:opacity-50"
          >
            {loading ? (isEdit ? 'Updating...' : 'Submitting...') : (isEdit ? 'Update Score' : 'Save Score')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScoreSubmit;
