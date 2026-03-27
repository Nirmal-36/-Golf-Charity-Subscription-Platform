import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { Target, Calendar, Trophy, Zap, ArrowLeft, AlertCircle } from 'lucide-react';
import CustomModal from '../../components/ui/CustomModal';

const AdminDraws = () => {
  const [currentDraw, setCurrentDraw] = useState(null);
  const [drawResults, setDrawResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  // Modal States
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newJackpot, setNewJackpot] = useState('');
  const [isConfirmTriggerOpen, setIsConfirmTriggerOpen] = useState(false);

  const fetchDrawData = async () => {
    try {
      const res = await api.get('/api/draws/current/');
      setCurrentDraw(res.data);
    } catch (err) {
      console.error("Failed to fetch draw data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrawData();
  }, []);

  const handleUpdateDraw = async () => {
    if (!newJackpot) return;
    try {
      await api.patch(`/api/draws/admin/draws/${currentDraw.id}/`, { 
        jackpot_amount: parseFloat(newJackpot) 
      });
      fetchDrawData();
    } catch (err) {
      alert("Failed to update draw.");
    }
  };

  const handleTriggerDraw = async () => {
    setExecuting(true);
    setDrawResults(null);
    try {
      const res = await api.post(`/api/draws/admin/draws/${currentDraw.id}/trigger/`);
      setDrawResults(res.data.results);
    } catch (err) {
      alert("Draw execution failed: " + (err.response?.data?.error || err.message));
    } finally {
      setExecuting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading draw management...</div>;

  return (
    <div className="min-h-screen bg-brand-light p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <Link to="/admin/dashboard" className="text-sm text-brand-green font-bold flex items-center gap-1 hover:underline">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
            currentDraw.status === 'scheduled' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
          }`}>
             <div className={`w-2 h-2 rounded-full ${currentDraw.status === 'scheduled' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
             Current Status: {currentDraw.status}
          </div>
        </div>

        <div className="bg-brand-dark rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 items-start">
            <div>
              <div className="text-brand-gold font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                <Target size={16} /> Active Round Management
              </div>
              <h1 className="text-5xl font-black mb-2 tracking-tight">Draw #{currentDraw.id}</h1>
              <p className="text-gray-400 font-medium max-w-md">
                Scheduled for {new Date(currentDraw.draw_date).toLocaleDateString()} at {new Date(currentDraw.draw_date).toLocaleTimeString()}.
              </p>
            </div>
            
            <div className="w-full bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 md:w-2/4">
               <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Jackpot</div>
               <div className="text-4xl font-black text-brand-gold mb-4">${parseFloat(currentDraw.jackpot_amount).toLocaleString()}</div>
                <button 
                  onClick={() => {
                    setNewJackpot(currentDraw.jackpot_amount);
                    setIsUpdateModalOpen(true);
                  }}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-2"
                >
                  <Calendar size={16} /> Reschedule / Adjust
                </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                 <Zap size={80} className="text-brand-green" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-2">
                 <Zap className="text-brand-green" size={20} /> Manual Override
              </h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Forcefully execute the draw logic right now. This will ignore the schedule, pick winners based on current entries, and move the round to 'Completed'.
              </p>
              <button 
                onClick={() => setIsConfirmTriggerOpen(true)}
                disabled={executing || currentDraw.status !== 'scheduled'}
                className="w-full py-4 bg-brand-dark text-white font-black rounded-2xl hover:bg-black transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {executing ? 'Executing Strategy...' : 'Trigger Draw Execution'}
              </button>
           </div>

           <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-2">
                 <Trophy className="text-brand-gold" size={20} /> Quick Stats
              </h3>
              <div className="space-y-4">
                 <StatItem label="Total Pool" value={`$${parseFloat(currentDraw.total_pool).toLocaleString()}`} />
                 <StatItem label="Active Entries" value={currentDraw.entry_count || 0} />
                 <StatItem label="Time Remaining" value={`${Math.max(0, Math.floor((new Date(currentDraw.draw_date) - new Date()) / (1000 * 60 * 60 * 24)))} Days`} />
              </div>
           </div>
        </div>

        {drawResults && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-600 rounded-[32px] p-8 text-white shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Trophy className="text-brand-gold" /> Draw Execution Results
              </h2>
              <button 
                onClick={() => { setDrawResults(null); fetchDrawData(); }}
                className="text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition"
              >
                Close & Next Round
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-green-100 font-medium">Winning Numbers:</p>
                <div className="flex gap-3">
                  {drawResults.winning_numbers.map((num, i) => (
                    <div key={i} className="w-12 h-12 bg-white text-brand-green rounded-full flex items-center justify-center font-black text-xl shadow-lg">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
                <p className="text-xs font-black uppercase tracking-widest text-green-200 mb-4">Winner Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Jackpot Won:</span>
                    <span className="font-bold underline decoration-brand-gold decoration-2 underline-offset-4">{drawResults.jackpot_won ? 'YES!' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Individual Winners:</span>
                    <span className="font-bold">{drawResults.winners.length}</span>
                  </div>
                  {!drawResults.jackpot_won && (
                    <p className="text-[10px] text-green-200 mt-4 italic">
                      * Jackpot amount has rolled over to next month's round.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentDraw.status === 'completed' && !drawResults && (
          <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-2xl flex items-start gap-4 text-yellow-800">
             <AlertCircle className="shrink-0 mt-0.5" />
             <div>
                <p className="font-bold">This draw is completed.</p>
                <p className="text-sm opacity-80">Winning numbers: {currentDraw.winning_numbers?.join(', ') || 'N/A'}</p>
             </div>
          </div>
        )}

        {/* MODALS */}
        <CustomModal 
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title="Update Jackpot"
          message="Enter the new jackpot amount for this active round."
          type="prompt"
          inputValue={newJackpot}
          onInputChange={setNewJackpot}
          inputPlaceholder="e.g. 5000"
          onConfirm={handleUpdateDraw}
        />

        <CustomModal 
          isOpen={isConfirmTriggerOpen}
          onClose={() => setIsConfirmTriggerOpen(false)}
          title="Manual Draw Execution"
          message="WARNING: This will manually execute the draw, pick winners, and lock the round. This action is permanent and cannot be undone."
          type="confirm"
          confirmText="Proceed with Execution"
          onConfirm={handleTriggerDraw}
        />

      </div>
    </div>
  );
};

const StatItem = ({ label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
     <span className="text-gray-400 font-medium">{label}</span>
     <span className="text-brand-dark font-black">{value}</span>
  </div>
);

export default AdminDraws;
