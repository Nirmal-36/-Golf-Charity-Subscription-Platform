import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { Search, Clock, ArrowLeft, Shield } from 'lucide-react';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/api/draws/admin/audit-logs/');
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading audit logs...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-brand-dark tracking-tight">Audit Logs</h1>
            <p className="text-gray-500 text-sm font-medium">Reviewing platform events and administrative actions.</p>
          </div>
          <Link to="/admin/dashboard" className="text-sm text-brand-green font-bold flex items-center gap-1 hover:underline">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by action, admin, or notes..." 
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-xl outline-none transition font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select 
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-xl outline-none transition font-bold text-sm appearance-none"
            >
              <option value="all">All Action Types</option>
              <option value="Draw">Draw Rounds</option>
              <option value="Winner">Winner Payouts</option>
              <option value="Charity">Charity Mgmt</option>
            </select>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-100">
            {logs.filter(log => {
              const matchesSearch = 
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                log.admin_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()));
              
              const matchesFilter = filterAction === 'all' || log.action.includes(filterAction);
              
              return matchesSearch && matchesFilter;
            }).length === 0 ? (
              <div className="p-20 text-center text-gray-400">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold">No matching audit logs found.</p>
              </div>
            ) : logs.filter(log => {
               const matchesSearch = 
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                log.admin_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()));
              const matchesFilter = filterAction === 'all' || log.action.includes(filterAction);
              return matchesSearch && matchesFilter;
            }).map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50/50 transition flex items-start gap-4 group">
                <div className={`p-3 rounded-2xl shadow-sm border transition bg-white group-hover:scale-110 ${
                  log.action.includes('Winner') ? 'text-brand-gold border-yellow-100' : 
                  log.action.includes('Draw') ? 'text-brand-green border-green-100' :
                  'text-gray-400 border-gray-100'
                }`}>
                  <Shield size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-brand-dark tracking-tight">{log.action}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full">
                      <Clock size={12} /> {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 font-medium">Administrator: <span className="font-black text-brand-green">{log.admin_email}</span></p>
                  {log.notes && (
                    <div className="mt-4 text-xs bg-brand-light/20 p-4 rounded-2xl italic text-gray-600 border border-brand-green/10 leading-relaxed relative">
                      <span className="text-brand-green font-black absolute -top-2 left-4 bg-white px-2 not-italic text-[8px] uppercase tracking-widest">Detail Note</span>
                      "{log.notes}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
