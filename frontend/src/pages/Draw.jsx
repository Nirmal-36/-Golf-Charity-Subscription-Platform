import React, { useState, useEffect } from 'react';
import { useDraw } from '../hooks/useDraw';
import { Target, AlertCircle, Clock, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const NumberPicker = ({ selectedNumbers, onToggle }) => {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-6">
      {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => {
        const isSelected = selectedNumbers.includes(num);
        return (
          <button
            key={num}
            type="button"
            onClick={() => onToggle(num)}
            className={`w-10 h-10 rounded-full font-bold transition-all ${
              isSelected
                ? 'bg-brand-gold text-white shadow-md scale-110'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
};

const Draw = () => {
  const { currentDraw, loading, error, fetchCurrentDraw, enterDraw } = useDraw();
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    fetchCurrentDraw();
  }, []);

  useEffect(() => {
    if (currentDraw?.draw_date) {
      const targetDate = new Date(currentDraw.draw_date).getTime();
      
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
          clearInterval(interval);
          setTimeLeft("Draw is executing...");
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentDraw]);

  const toggleNumber = (num) => {
    setSubmitError('');
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length >= 5) {
        setSubmitError("You can only select exactly 5 numbers.");
        return;
      }
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedNumbers.length !== 5) {
      setSubmitError("Please select exactly 5 numbers.");
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading draw details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!currentDraw) return null;

  return (
    <div className="min-h-screen bg-brand-light p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <Link to="/" className="text-brand-green font-semibold hover:underline flex items-center gap-2">
            ← Back to Dashboard
          </Link>
        </div>
        
        {/* Header Widget */}
        <div className="bg-brand-dark rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-brand-gold mb-2 font-bold uppercase tracking-wider text-sm">
              <Trophy size={18} /> Monthly Jackpot
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
              ${parseFloat(currentDraw.jackpot_amount).toLocaleString()}
            </h1>
            <p className="text-gray-400 max-w-sm">
              Match 5 numbers to win the rolling jackpot. Total prize pool: ${parseFloat(currentDraw.total_pool).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-sm md:text-right">
            <div className="flex items-center md:justify-end gap-2 text-gray-300 mb-1">
              <Clock size={16} /> Draw occurs in:
            </div>
            <div className="text-2xl font-bold font-mono text-brand-gold">{timeLeft}</div>
            <Link to="/draw/history" className="text-sm text-green-400 hover:text-green-300 transition mt-4 inline-block underline">
              View Past Entries →
            </Link>
          </div>
        </div>

        {/* Entry Form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Enter this Month's Draw</h2>
          
          {currentDraw.user_has_entered ? (
            <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 mt-6">
              <div className="flex items-start gap-4">
                <Target className="text-green-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">You're in!</h3>
                  <p className="text-green-700">You have successfully submitted your numbers for this month's draw. Good luck!</p>
                </div>
              </div>
              
              {currentDraw.user_numbers && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-green-600">Your Entry:</span>
                  <div className="flex gap-2">
                    {currentDraw.user_numbers.map((num, i) => (
                      <span key={i} className="w-10 h-10 rounded-full bg-brand-green text-white flex items-center justify-center font-bold shadow-sm">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600">Select exactly 5 numbers (1-50):</p>
                <div className="font-bold text-brand-green">
                  {selectedNumbers.length}/5 Selected
                </div>
              </div>

              <NumberPicker selectedNumbers={selectedNumbers} onToggle={toggleNumber} />

              {submitError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg mb-6">
                  <AlertCircle size={18} /> {submitError}
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={selectedNumbers.length !== 5 || submitting}
                  className="px-8 py-3 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Lock in Numbers'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Draw;
