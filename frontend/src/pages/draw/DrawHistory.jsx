import React, { useEffect } from 'react';
import { useDraw } from '../../hooks/useDraw';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, CheckCircle2 } from 'lucide-react';

const DrawHistory = () => {
  const { history, loading, error, fetchHistory } = useDraw();

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading history...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-brand-light p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-brand-dark">My Draw History</h1>
          <Link to="/draw" className="text-brand-green hover:underline">← Back to Current Draw</Link>
        </div>

        {history.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-gray-500">
            You haven't entered any draws yet. 
            <br />
            <Link to="/draw" className="text-brand-green font-bold hover:underline mt-4 inline-block">Enter the next draw</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar size={16} /> Draw #{entry.draw}
                  </div>
                  <div className="flex gap-2">
                    {entry.numbers.map((num, i) => (
                      <span key={i} className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-sm">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  {entry.tier_won ? (
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-brand-gold font-bold flex items-center gap-2 justify-end">
                        <Trophy size={18} /> Tier {entry.tier_won} Winner!
                        <div className="text-2xl ml-2">${parseFloat(entry.prize_amount).toLocaleString()}</div>
                      </div>
                      <Link 
                        to="/my-wins" 
                        className="text-xs bg-brand-gold text-brand-dark px-4 py-1.5 rounded-xl font-black hover:scale-105 transition shadow-sm"
                      >
                        Verify & Claim Prize
                      </Link>
                    </div>
                  ) : (
                    <div className="text-gray-400 flex items-center gap-1 justify-end">
                      <CheckCircle2 size={16} /> {entry.matches} Matches
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawHistory;
