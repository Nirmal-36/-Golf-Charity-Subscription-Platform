import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
import { Trophy, Target, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useDraw } from '../../hooks/useDraw';

/**
 * Gamification Hub: Draw
 * The primary interface for monthly prize draw participation.
 * Orchestrates number selection (1-45), entry state persistence, 
 * and real-time countdown to the next drawing event.
 */
const Draw = () => {
  const { currentDraw, loading, error, fetchCurrentDraw, enterDraw } = useDraw();
  
  // State: Selection metadata & Transaction lifecycle
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const timeLeft = 'TBA';

  // Lifecycle: Synchronize active draw parameters on mount
  useEffect(() => {
    fetchCurrentDraw();
  }, [fetchCurrentDraw]);

  /**
   * UI Interaction: toggleNumber
   * Manages the selection state for the 5-number draw entry.
   * Enforces business rule: Exactly 5 unique integers required.
   */
  const toggleNumber = (num) => {
    setSubmitError('');
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length >= 5) {
        setSubmitError("Selection Alert: Capacity reached (Max 5 numbers).");
        return;
      }
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  /**
   * Transaction Handler: handleSubmit
   * Dispatches the draw entry to the persistence layer.
   * Includes pre-flight validation to ensure schema compliance.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedNumbers.length !== 5) {
      setSubmitError("Selection Alert: Incomplete entry (5 numbers required).");
      return;
    }
    
    setSubmitting(true);
    setSubmitError('');
    
    const { success, error: apiError } = await enterDraw(currentDraw.id, selectedNumbers);
    if (!success) {
      setSubmitError(apiError);
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium tracking-wide">Fetching data...</p>
      </div>
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!currentDraw) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-brand-light p-4 md:p-8"
    >
      <div className="max-w-4xl mx-auto space-y-8 pt-8">
        
        {/* Header Widget */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-brand-dark rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-brand-gold mb-3 font-bold uppercase tracking-wider text-xs">
              <Trophy size={16} /> Monthly Jackpot
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
              ${parseFloat(currentDraw.jackpot_amount).toLocaleString()}
            </h1>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              Match 5 numbers to win the rolling jackpot. Total prize pool: ${parseFloat(currentDraw.total_pool).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-md md:text-right relative z-10">
            <div className="flex items-center md:justify-end gap-2 text-gray-300 mb-2 text-sm font-medium">
              <Clock size={16} /> Draw occurs in:
            </div>
            <div className="text-2xl font-bold font-mono text-brand-gold drop-shadow-sm">{timeLeft}</div>
            <Link to="/draw/history" className="text-sm text-green-400 hover:text-green-300 transition mt-4 inline-block font-medium underline underline-offset-4">
              View Past Entries →
            </Link>
          </div>
        </motion.div>

        {/* Entry Form */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Enter this Month's Draw</h2>
          
          <AnimatePresence mode="wait">
            {currentDraw.user_has_entered ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 mt-6"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-500 text-white rounded-xl shadow-lg shadow-green-200">
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">You're in the running!</h3>
                    <p className="text-green-700 leading-relaxed">Your numbers are locked in. Winners will be notified via email after the draw.</p>
                  </div>
                </div>
                
                {currentDraw.user_numbers && (
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-green-600">Your Selection</span>
                    <div className="flex gap-2">
                      {currentDraw.user_numbers.map((num, i) => (
                        <motion.span 
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 * i + 0.3 }}
                          className="w-12 h-12 rounded-full bg-brand-green text-white flex items-center justify-center font-bold shadow-md text-lg"
                        >
                          {num}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit} 
                className="mt-8"
              >
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-gray-600 font-medium">Select exactly 5 numbers (1-45):</p>
                  <div className={`font-bold transition-colors ${selectedNumbers.length === 5 ? 'text-brand-green' : 'text-gray-400'}`}>
                    {selectedNumbers.length}/5 Selected
                  </div>
                </div>

                <NumberPicker selectedNumbers={selectedNumbers} onToggle={toggleNumber} />

                {submitError && (
                  <motion.div 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl mb-8 border border-red-100"
                  >
                    <AlertCircle size={20} /> <span className="font-medium">{submitError}</span>
                  </motion.div>
                )}

                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={selectedNumbers.length !== 5 || submitting}
                    className="px-10 py-4 bg-brand-green text-white font-bold rounded-2xl hover:bg-brand-green/90 transition shadow-lg shadow-brand-green/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sealing Entry...
                      </div>
                    ) : 'Lock in Selection'}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Draw;
