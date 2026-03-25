import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { Search, Clock, ArrowLeft, Shield } from 'lucide-react';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <Link to="/admin" className="text-sm text-brand-green font-bold flex items-center gap-1 hover:underline">
          <ArrowLeft size={16} /> Back to Admin
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900">Audit Logs</h1>
        
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-100">
            {logs.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No audit logs found.</div>
            ) : logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-400">
                  <Shield size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900">{log.action}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Admin: <span className="font-medium text-gray-700">{log.admin_email}</span></p>
                  {log.notes && (
                    <p className="mt-2 text-xs bg-gray-50 p-2 rounded italic text-gray-600 border-l-2 border-brand-green">
                      "{log.notes}"
                    </p>
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
