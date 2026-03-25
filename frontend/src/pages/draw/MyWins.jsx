import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Trophy, Upload, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyWins = () => {
  const [wins, setWins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null); // stores winner_id being uploaded

  const fetchWins = async () => {
    try {
      const { data } = await api.get('/api/draws/my-wins/');
      setWins(data);
    } catch (err) {
      console.error("Failed to fetch wins", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWins();
  }, []);

  const handleFileUpload = async (winnerId, file) => {
    const formData = new FormData();
    formData.append('proof', file);
    
    setUploading(winnerId);
    try {
      await api.post(`/api/draws/wins/${winnerId}/upload-proof/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchWins(); // Refresh to show "Submitted" status
    } catch (err) {
      alert("Failed to upload proof. Please try again.");
    } finally {
      setUploading(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your wins...</div>;

  return (
    <div className="min-h-screen bg-brand-light p-4 md:p-8 text-brand-dark">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-12 border-b border-gray-200 pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight">My <span className="text-brand-gold">Wins</span></h1>
            <p className="text-gray-500 mt-2 font-medium">Tracking your prize history and verification status.</p>
          </div>
          <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold">
             <Trophy size={32} />
          </div>
        </div>

        {wins.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
            <Trophy size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 text-lg">No wins recorded yet. Keep playing!</p>
            <Link to="/draw" className="mt-4 inline-block bg-brand-gold text-brand-dark px-6 py-2 rounded-xl font-bold">
              Enter Next Draw
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {wins.map((win) => (
              <div key={win.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${win.status === 'paid' ? 'bg-green-100' : 'bg-brand-gold/10'}`}>
                    <Trophy className={win.status === 'paid' ? 'text-green-600' : 'text-brand-gold'} size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-brand-dark">Tier {win.tier} Winner</h3>
                    <p className="text-gray-500">Draw #{win.draw} • ${parseFloat(win.prize_amount).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <StatusBadge status={win.status} />
                  
                  {win.status === 'pending_proof' && (
                    <label className="cursor-pointer bg-brand-green text-white px-5 py-2 rounded-xl font-bold hover:bg-brand-green/90 transition text-sm flex items-center gap-2">
                      <Upload size={16} />
                      {uploading === win.id ? 'Uploading...' : 'Upload Scorecard Proof'}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(win.id, e.target.files[0])}
                        disabled={uploading === win.id}
                      />
                    </label>
                  )}
                  
                  {win.status === 'proof_submitted' && (
                    <p className="text-xs text-gray-400 italic">Waiting for admin review...</p>
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

const StatusBadge = ({ status }) => {
  const configs = {
    pending_proof: { label: 'Proof Required', icon: AlertTriangle, color: 'text-brand-gold bg-yellow-50 border-yellow-100' },
    proof_submitted: { label: 'Awaiting Review', icon: Clock, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    approved: { label: 'Approved', icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-100' },
    paid: { label: 'Prize Paid', icon: CheckCircle, color: 'text-white bg-green-500 border-green-600' },
    rejected: { label: 'Rejected', icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-100' },
  };

  const config = configs[status] || configs.pending_proof;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
      <Icon size={14} />
      {config.label}
    </div>
  );
};

export default MyWins;
