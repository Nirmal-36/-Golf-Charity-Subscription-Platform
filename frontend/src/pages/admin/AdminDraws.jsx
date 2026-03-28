import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const MotionDiv = motion.div;
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { Target, Calendar, Trophy, Zap, ArrowLeft, AlertCircle, Timer, Clock } from 'lucide-react';
import CustomModal from '../../components/ui/CustomModal';

const AdminDraws = () => {
  const [currentDraw, setCurrentDraw] = useState(null);
  const [drawResults, setDrawResults] = useState(null);
  const [pastDraws, setPastDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  // Modal States
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmTriggerOpen, setIsConfirmTriggerOpen] = useState(false);
  const [editDrawData, setEditDrawData] = useState({
    draw_date: '',
    jackpot_amount: '',
    total_pool: ''
  });

  // Enhancement States
  const [logicType, setLogicType] = useState('random');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [countdown, setCountdown] = useState('00d 00h 00m 00s');

  const fetchDrawData = useCallback(async () => {
    try {
      const [currentRes, historyRes] = await Promise.all([
        api.get('/api/draws/current/'),
        api.get('/api/draws/admin/draws/history/')
      ]);
      setCurrentDraw(currentRes.data);
      setPastDraws(historyRes.data);
    } catch (err) {
      console.error("Failed to fetch draw data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrawData();
  }, [fetchDrawData]);

  useEffect(() => {
    if (!currentDraw || currentDraw.status !== 'scheduled') return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(currentDraw.draw_date).getTime();
      const distance = target - now;

      if (distance < 0) {
        setCountdown('00d 00h 00m 00s (Pending Execution)');
        // Trigger a refresh/sync if it's overdue
        handleSyncDraws();
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(
        `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [currentDraw, handleSyncDraws]);

  const handleUpdateDraw = async () => {
    try {
      // Ensure we send a proper ISO string with timezone context (UTC)
      const dateObj = new Date(editDrawData.draw_date);
      if (isNaN(dateObj.getTime())) {
        alert("Invalid date selected.");
        return;
      }
      const utcDate = dateObj.toISOString();

      await api.patch(`/api/draws/admin/draws/${currentDraw.id}/`, { 
        draw_date: utcDate,
        jackpot_amount: parseFloat(editDrawData.jackpot_amount),
        total_pool: parseFloat(editDrawData.total_pool)
      });
      setIsUpdateModalOpen(false);
      fetchDrawData();
    } catch {
      alert("Failed to update draw parameters.");
    }
  };

  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    // Extract local parts to fill the datetime-local input correctly
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const handleTriggerDraw = async (isDryRun = false) => {
    if (isDryRun) setIsSimulating(true);
    else setExecuting(true);
    
    setDrawResults(null);
    setSimulationResults(null);
    
    try {
      const res = await api.post(`/api/draws/admin/draws/${currentDraw.id}/trigger/`, {
        is_dry_run: isDryRun,
        logic_type: logicType
      });
      
      if (isDryRun) {
        setSimulationResults(res.data.results);
      } else {
        setDrawResults(res.data.results);
        fetchDrawData();
      }
    } catch (error) {
      alert("Draw operation failed: " + (error.response?.data?.error || error.message));
    } finally {
      setIsSimulating(false);
      setExecuting(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await api.post(`/api/draws/admin/draws/${currentDraw.id}/publish/`);
      alert("Results published successfully!");
      fetchDrawData();
    } catch {
      alert("Failed to publish results.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSyncDraws = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await api.post('/api/draws/admin/draws/sync/');
      fetchDrawData();
    } catch {
      console.error("Sync failed:");
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, fetchDrawData]);

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
              <div className="flex items-center gap-3 text-brand-gold font-bold text-xl mt-2">
                <Timer size={24} className="animate-pulse" />
                <span className="font-mono tracking-tighter">{countdown}</span>
              </div>
              <div className="flex flex-col md:flex-row gap-4 mt-6">
                 <p className="text-gray-400 font-medium flex items-center gap-2">
                   <Clock size={14} /> Official Date: {new Date(currentDraw.draw_date).toLocaleDateString()} at {new Date(currentDraw.draw_date).toLocaleTimeString()}
                 </p>
                 {countdown.includes('Pending') && (
                    <button 
                      onClick={handleSyncDraws}
                      disabled={isSyncing}
                      className="text-brand-gold text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-2"
                    >
                      <Zap size={14} className={isSyncing ? "animate-spin" : ""} /> {isSyncing ? "Executing..." : "Force Sync Execution"}
                    </button>
                 )}
              </div>
            </div>
            
            <div className="w-full bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 md:w-2/4">
               <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Jackpot</div>
               <div className="text-4xl font-black text-brand-gold mb-4">${parseFloat(currentDraw.jackpot_amount).toLocaleString()}</div>
                <button 
                  onClick={() => {
                    setEditDrawData({
                      draw_date: formatDateTimeForInput(currentDraw.draw_date),
                      jackpot_amount: currentDraw.jackpot_amount,
                      total_pool: currentDraw.total_pool
                    });
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
           <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group space-y-6">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                 <Zap size={80} className="text-brand-green" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-brand-dark mb-2 flex items-center gap-2">
                   <Zap className="text-brand-green" size={20} /> Execution Strategy
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Choose your logic and run a simulation or execute the final draw.
                </p>
              </div>

              {/* Logic Selector */}
              <div className="flex bg-gray-50 p-1 rounded-2xl">
                 <button 
                  onClick={() => setLogicType('random')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition ${logicType === 'random' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-400 hover:text-brand-dark'}`}
                 >
                   Standard (Random)
                 </button>
                 <button 
                  onClick={() => setLogicType('weighted')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition ${logicType === 'weighted' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-400 hover:text-brand-dark'}`}
                 >
                   Algorithmic (Weighted)
                 </button>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleTriggerDraw(true)}
                  disabled={isSimulating || executing || currentDraw.status !== 'scheduled'}
                  className="flex-1 py-4 bg-white border-2 border-brand-dark text-brand-dark font-bold rounded-2xl hover:bg-gray-50 transition disabled:opacity-50"
                >
                  {isSimulating ? 'Simulating...' : 'Simulate'}
                </button>
                <button 
                  onClick={() => setIsConfirmTriggerOpen(true)}
                  disabled={executing || isSimulating || currentDraw.status !== 'scheduled'}
                  className="flex-[2] py-4 bg-brand-dark text-white font-black rounded-2xl hover:bg-black transition shadow-xl disabled:opacity-50"
                >
                  {executing ? 'Executing...' : 'Trigger Final Draw'}
                </button>
              </div>
           </div>

            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
               <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-2">
                  <Trophy className="text-brand-gold" size={20} /> Quick Stats
               </h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                     <span className="text-gray-400 font-medium">Total Pool (Revenue Share)</span>
                     <div className="flex items-center gap-2">
                        <span className="text-brand-dark font-black">${parseFloat(currentDraw.total_pool).toLocaleString()}</span>
                        <button 
                          onClick={handleSyncDraws}
                          disabled={isSyncing}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-brand-green transition"
                          title="Sync Pool from Live Revenue"
                        >
                          <Zap size={14} className={isSyncing ? "animate-spin" : ""} />
                        </button>
                     </div>
                  </div>
                  <StatItem label="Active Entries" value={currentDraw.entry_count || 0} />
                  <StatItem label="Time Remaining" value={countdown} />
               </div>
            </div>
        </div>

        {drawResults && (
          <MotionDiv 
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
          </MotionDiv>
        )}

        {currentDraw.status === 'completed' && !drawResults && (
          <div className="bg-white border border-gray-100 p-8 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
             <div className="flex items-start gap-4">
               <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center shrink-0">
                  <AlertCircle size={24} />
               </div>
               <div>
                  <p className="font-bold text-brand-dark">Execution Completed</p>
                  <p className="text-sm text-gray-500">Winning numbers: {currentDraw.winning_numbers?.join(', ') || 'N/A'}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${currentDraw.is_published ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                       {currentDraw.is_published ? 'Results Published' : 'Results Hidden'}
                    </span>
                  </div>
               </div>
             </div>
             
             {!currentDraw.is_published && (
               <button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full md:w-auto px-8 py-4 bg-brand-green text-white font-black rounded-2xl hover:bg-brand-dark transition shadow-lg shadow-brand-green/20"
               >
                 {isPublishing ? 'Publishing...' : 'Publish Official Results'}
               </button>
             )}
          </div>
        )}

        {/* Simulation Results Preview */}
        {simulationResults && (
           <MotionDiv 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-dark rounded-[32px] p-8 text-white border-4 border-dashed border-white/10"
           >
             <div className="flex items-center justify-between mb-8">
               <div>
                 <p className="text-xs font-black uppercase tracking-widest text-brand-gold mb-1">Pre-Analysis Mode</p>
                 <h2 className="text-2xl font-black">Simulation Results</h2>
                 <p className="text-sm text-gray-400 mt-1 italic">Note: These results are NOT persisted to the database.</p>
               </div>
               <button 
                onClick={() => setSimulationResults(null)}
                className="text-gray-400 hover:text-white transition"
               >
                 Clear Preview
               </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                 <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Simulated Winning Numbers</p>
                 <div className="flex gap-3">
                    {simulationResults.winning_numbers.map((num, i) => (
                      <div key={i} className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center font-black border border-white/20">
                        {num}
                      </div>
                    ))}
                 </div>
               </div>
               
                <div className="bg-white/5 p-6 rounded-2xl">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Partitioned Pool Shares</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Match 5 (40% + JP):</span>
                      <span className="font-mono text-brand-gold font-black underline decoration-brand-gold/30 underline-offset-4">
                        ${parseFloat(simulationResults.pool_details.tier_5_available).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Match 4 (35%):</span>
                      <span className="font-mono font-bold">
                        ${parseFloat(simulationResults.pool_details.tier_4_available).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Match 3 (25%):</span>
                      <span className="font-mono font-bold">
                        ${parseFloat(simulationResults.pool_details.tier_3_available).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Potential Winners:</span>
                      <span className="font-bold">{simulationResults.winners.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Jackpot Release:</span>
                      <span className={`font-bold ${simulationResults.jackpot_won ? 'text-brand-green' : 'text-red-400'}`}>
                         {simulationResults.jackpot_won ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>
                </div>
             </div>
           </MotionDiv>
        )}

        {/* MODALS */}
        <CustomModal 
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title="Adjust Draw Parameters"
          message="Modify the scheduling and financial aspects of this round."
          onConfirm={handleUpdateDraw}
          confirmText="Save Parameters"
        >
          <div className="w-full space-y-4 text-left">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Draw Schedule (Date & Time)</label>
                <input 
                  type="datetime-local"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 outline-none transition font-bold"
                  value={editDrawData.draw_date}
                  onChange={(e) => setEditDrawData({ ...editDrawData, draw_date: e.target.value })}
                />
             </div>
             <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Jackpot Amount ($)</label>
                  <input 
                    type="number"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 outline-none transition font-bold"
                    value={editDrawData.jackpot_amount}
                    onChange={(e) => setEditDrawData({ ...editDrawData, jackpot_amount: e.target.value })}
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Total Prize Pool ($)</label>
                  <input 
                    type="number"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 outline-none transition font-bold"
                    value={editDrawData.total_pool}
                    onChange={(e) => setEditDrawData({ ...editDrawData, total_pool: e.target.value })}
                  />
               </div>
             </div>
          </div>
        </CustomModal>

        <CustomModal 
          isOpen={isConfirmTriggerOpen}
          onClose={() => setIsConfirmTriggerOpen(false)}
          title="Manual Draw Execution"
          message="WARNING: This will manually execute the draw, pick winners, and lock the round. This action is permanent and cannot be undone."
          type="confirm"
          confirmText="Proceed with Execution"
          onConfirm={handleTriggerDraw}
        />

        {/* Draw History Section */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden mt-8">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-brand-dark tracking-tight">Draw History</h2>
              <p className="text-gray-400 text-sm font-medium">Review past winning numbers and logic strategies.</p>
            </div>
            <Trophy className="text-brand-gold" size={32} />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Round</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Logic</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Winning Numbers</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Jackpot</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pastDraws.length > 0 ? pastDraws.map((draw) => (
                  <tr key={draw.id} className="hover:bg-gray-50/30 transition group">
                    <td className="px-8 py-6">
                      <span className="text-brand-dark font-black">#{draw.id}</span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-sm font-bold text-gray-600">{new Date(draw.draw_date).toLocaleDateString()}</div>
                      <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                        {new Date(draw.draw_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-1.5">
                        {draw.logic_type === 'weighted' ? (
                          <Zap size={14} className="text-brand-gold" />
                        ) : (
                          <Trophy size={14} className="text-brand-green" />
                        )}
                        <span className="text-xs font-black uppercase tracking-widest">
                          {draw.logic_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex gap-1.5">
                        {draw.winning_numbers?.map((num, i) => (
                          <span key={i} className="w-8 h-8 rounded-lg bg-brand-green/10 text-brand-green font-black flex items-center justify-center text-xs">
                            {num}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-sm font-black text-brand-dark">${parseFloat(draw.jackpot_amount).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {draw.is_published ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-green bg-brand-green/5 px-2.5 py-1 rounded-full border border-brand-green/10">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/5 px-2.5 py-1 rounded-full border border-brand-gold/10">
                          Finalizing
                        </span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center space-y-3 opacity-20">
                         <Trophy size={48} />
                         <p className="font-bold text-sm">No draw history available yet.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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
