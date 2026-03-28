import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import CustomSelect from '../../components/ui/CustomSelect';

/**
 * Philanthropic Ledger: OrganizationDonations
 * Provides a granular audit trail of all charitable contributions.
 * Facilitates fiscal transparency through filtered views, 
 * impact aggregation, and exportable CSV reports for reconciliation.
 */
const OrganizationDonations = () => {
  
  // State: Disbursement registry & UI orchestration
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // Schema: all, monthly, yearly

  // Lifecycle: Synchronize disbursement chronicle on mount
  useEffect(() => {
    fetchDonations();
  }, []);

  /**
   * Infrastructure Sync: fetchDonations
   * Retrieves the comprehensive donation log from the persistence layer.
   */
  const fetchDonations = async () => {
    try {
      const { data } = await api.get('/api/charities/donations/');
      setDonations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Infrastructure Alert: Donation ledger inaccessible.');
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Utility: handleExport
   * Formats current view into a standard CSV for organizational reporting.
   */
  const handleExport = () => {
    const headers = ['Supporter', 'Plan Type', 'Date', 'Amount', 'Invoice ID'];
    const rows = filteredDonations.map(d => [
      d.user_email || 'N/A',
      d.plan_type || 'N/A',
      d.timestamp ? new Date(d.timestamp).toLocaleDateString() : 'N/A',
      d.amount || '0.00',
      d.stripe_invoice_id || 'INTERNAL'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredDonations = donations.filter(d => {
    const email = d.user_email || '';
    const matchesSearch = email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || d.plan_type === filter;
    return matchesSearch && matchesFilter;
  });

  const totalRaised = filteredDonations.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/org/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-green font-bold mb-8 transition-colors">
        <ArrowLeft size={20} /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-brand-dark tracking-tight">Donation <span className="text-brand-green underline decoration-brand-green/30 decoration-8 underline-offset-8">History</span></h1>
          <p className="text-gray-500 mt-4 font-medium max-w-lg">
            Track and audit every contribution received from the Golf Charity community.
          </p>
        </div>
        
        <div className="bg-white px-8 py-6 rounded-[32px] border border-gray-100 shadow-xl shadow-brand-green/5 text-right min-w-[240px]">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Impact (This View)</p>
          <p className="text-4xl font-black text-brand-green">${totalRaised.toFixed(2)}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by supporter email..."
            className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <div className="w-56">
            <CustomSelect 
              value={filter}
              options={[
                { value: 'all', label: 'All Plans' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' }
              ]}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          <button 
            onClick={handleExport}
            className="px-6 py-4 bg-brand-dark text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-brand-dark/10 cursor-pointer"
          >
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-brand-green/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Supporter</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Plan Type</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Date Received</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Receipt ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-medium italic">
                      No matching donations found.
                    </td>
                  </tr>
                ) : filteredDonations.map((d, index) => (
                  <motion.tr 
                    key={d.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50/30 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-green/5 text-brand-green flex items-center justify-center font-black">
                          {d.user_email?.[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-brand-dark">{d.user_email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        d.plan_type === 'yearly' ? 'bg-brand-gold/10 text-brand-gold' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {d.plan_type}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-gray-500">
                      {new Date(d.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-lg font-black text-brand-green">${parseFloat(d.amount).toFixed(2)}</span>
                    </td>
                    <td className="px-8 py-6 text-right font-mono text-xs text-gray-400">
                      {d.stripe_invoice_id || 'INTERNAL_TRANS'}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrganizationDonations;
