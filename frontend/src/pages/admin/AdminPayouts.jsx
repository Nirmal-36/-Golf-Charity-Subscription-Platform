import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { Trophy, CheckCircle, Clock, ArrowLeft, DollarSign } from 'lucide-react';

const AdminPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayouts = async () => {
    try {
      const res = await api.get('/api/draws/admin/payouts/');
      setPayouts(res.data);
    } catch (err) {
      console.error("Failed to fetch payouts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleMarkPaid = async (winnerId) => {
    if (!window.confirm("Mark this winner as PAID?")) return;
    try {
      await api.post(`/api/draws/admin/winners/${winnerId}/review/`, { action: 'mark_paid', notes: 'Paid by admin' });
      fetchPayouts();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading payouts...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link to="/admin" className="text-sm text-brand-green font-bold flex items-center gap-1 hover:underline">
          <ArrowLeft size={16} /> Back to Admin
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900">Prize Payouts</h1>
        
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Winner</th>
                <th className="px-6 py-4">Prize</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Approved At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payouts.length === 0 ? (
                <tr>
                   <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No approved payouts yet.</td>
                </tr>
              ) : payouts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.user_email}</td>
                  <td className="px-6 py-4 text-brand-green font-bold">${parseFloat(p.prize_amount).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {p.admin_approved_at ? new Date(p.admin_approved_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.status === 'approved' && (
                      <button 
                        onClick={() => handleMarkPaid(p.id)}
                        className="bg-brand-green text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-brand-dark transition"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayouts;
