import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, User, Mail, CreditCard, Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, lapsed, inactive

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/draws/admin/users/');
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.post(`/api/auth/admin/users/${userId}/toggle-status/`);
      fetchUsers();
    } catch (err) {
      alert("Failed to toggle status.");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/api/auth/admin/users/${userId}/`);
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                          (filterStatus === 'active' && u.subscription_status === 'active' && u.is_active) ||
                          (filterStatus === 'lapsed' && u.subscription_status !== 'active') ||
                          (filterStatus === 'inactive' && !u.is_active);
                          
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="p-8 text-center text-gray-500">Loading user database...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <User className="text-brand-green" /> User Management
            </h1>
            <p className="text-gray-500 text-sm">Reviewing {users.length} registered platform members.</p>
          </div>
          <Link to="/admin/dashboard" className="text-sm text-brand-green font-bold flex items-center gap-1 hover:underline">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by email or name..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-brand-green transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-green border-none transition cursor-pointer"
          >
            <option value="all">All Users</option>
            <option value="active">Active Subscriptions</option>
            <option value="lapsed">Lapsed Subscriptions</option>
            <option value="inactive">Deactivated Accounts</option>
          </select>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Donated</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{user.username}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                           <Mail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 w-max ${
                        user.subscription_status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <CreditCard size={10} />
                        {user.subscription_status === 'active' ? 'Active Sub' : 'Lapsed Sub'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 w-max ${
                        user.is_active 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {user.is_active ? 'Account Active' : 'Account Disabled'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-gray-900">${user.total_donated}</div>
                    <div className="text-[10px] text-gray-400 flex items-center justify-end gap-1">
                      <Heart size={10} className="text-red-400" /> {user.donation_percentage}% rate
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleToggleStatus(user.id)}
                        className={`${user.is_active ? 'text-orange-600' : 'text-blue-600'} font-bold hover:underline`}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 font-bold hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-gray-400 italic">No users found matching your search.</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminUsers;
