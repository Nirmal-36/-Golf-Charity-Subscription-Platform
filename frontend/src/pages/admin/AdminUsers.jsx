import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, User, Mail, CreditCard, Heart, ArrowLeft, Edit2, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CustomSelect from '../../components/ui/CustomSelect';
import CustomModal from '../../components/ui/CustomModal';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, lapsed, inactive
  
  // Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Score Editor States
  const [scoresModalUser, setScoresModalUser] = useState(null);
  const [userScores, setUserScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const [editingScore, setEditingScore] = useState(null); // { id, score }

  // Edit User Profile States
  const [editUserModal, setEditUserModal] = useState(null); // user object
  const [editForm, setEditForm] = useState({});
  const [savingUser, setSavingUser] = useState(false);

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
    } catch {
      alert("Failed to toggle status.");
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/api/auth/admin/users/${userToDelete}/`);
      fetchUsers();
    } catch {
      alert("Failed to delete user.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openScoresModal = async (user) => {
    setScoresModalUser(user);
    setLoadingScores(true);
    try {
      const { data } = await api.get(`/api/scores/admin/user/${user.id}/`);
      setUserScores(data);
    } catch {
      setUserScores([]);
    } finally {
      setLoadingScores(false);
    }
  };

  const handleSaveScore = async (scoreId, newValue) => {
    try {
      await api.patch(`/api/scores/admin/${scoreId}/`, { score: parseInt(newValue, 10) });
      openScoresModal(scoresModalUser); // refresh
      setEditingScore(null);
    } catch {
      alert('Failed to update score.');
    }
  };

  const handleDeleteScore = async (scoreId) => {
    if (!window.confirm('Delete this score?')) return;
    try {
      await api.delete(`/api/scores/admin/${scoreId}/`);
      openScoresModal(scoresModalUser);
    } catch {
      alert('Failed to delete score.');
    }
  };

  const openEditUserModal = (user) => {
    setEditUserModal(user);
    setEditForm({
      username: user.username || '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      donation_percentage: user.donation_percentage || 10,
      is_staff: user.is_staff || false,
    });
  };

  const handleSaveUser = async () => {
    if (!editUserModal) return;
    setSavingUser(true);
    try {
      await api.patch(`/api/auth/admin/users/${editUserModal.id}/`, editForm);
      fetchUsers();
      setEditUserModal(null);
    } catch (err) {
      alert('Failed to update user: ' + (err.response?.data ? JSON.stringify(err.response.data) : 'Unknown error'));
    } finally {
      setSavingUser(false);
    }
  };

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
          <div className="w-56">
            <CustomSelect 
              value={filterStatus}
              options={[
                { value: 'all', label: 'All Users' },
                { value: 'active', label: 'Active Subscriptions' },
                { value: 'lapsed', label: 'Lapsed Subscriptions' },
                { value: 'inactive', label: 'Deactivated Accounts' }
              ]}
              onChange={(e) => setFilterStatus(e.target.value)}
            />
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Account</th>
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
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        user.is_staff ? 'bg-orange-100 text-orange-600' : 'bg-brand-green/10 text-brand-green'
                      }`}>
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
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest ${
                       user.is_staff ? 'bg-orange-100 text-orange-600' : 
                       user.user_role === 'organization' ? 'bg-blue-100 text-blue-600' : 
                       'bg-gray-100 text-gray-600'
                     }`}>
                       {user.is_staff ? 'Administrator' : 
                        user.user_role === 'organization' ? 'Organization' : 
                        'Supporter'}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col gap-1">
                      {!user.is_staff && (
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 w-max ${
                          user.subscription_status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          <CreditCard size={10} />
                          {user.subscription_status === 'active' ? 'Active Sub' : 'Lapsed Sub'}
                        </span>
                      )}
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
                        onClick={() => openEditUserModal(user)}
                        className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => openScoresModal(user)}
                        className="text-brand-green font-bold hover:underline flex items-center gap-1"
                      >
                        <Edit2 size={13} /> Scores
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user.id)}
                        className={`${user.is_active ? 'text-orange-600' : 'text-blue-600'} font-bold hover:underline`}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                       <button 
                        onClick={() => {
                          setUserToDelete(user.id);
                          setIsDeleteModalOpen(true);
                        }}
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

      <CustomModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete User"
        message="Are you sure you want to PERMANENTLY delete this user? This action is irreversible and will remove all their data."
        type="confirm"
        confirmText="Delete User"
        onConfirm={handleDelete}
      />

      {/* Score Editor Modal */}
      {scoresModalUser && (
        <div className="fixed inset-0 z-50 bg-brand-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-brand-dark text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">Golf Scores</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{scoresModalUser.email}</p>
              </div>
              <button onClick={() => { setScoresModalUser(null); setEditingScore(null); }} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
              {loadingScores ? (
                <div className="text-center text-gray-400 py-8">Loading...</div>
              ) : userScores.length === 0 ? (
                <div className="text-center text-gray-400 py-8 text-sm">No scores recorded.</div>
              ) : userScores.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase">{s.played_at || s.submitted_at}</div>
                    {editingScore?.id === s.id ? (
                      <input
                        type="number" min={1} max={45}
                        className="text-xl font-black text-brand-green w-20 border-b-2 border-brand-green focus:outline-none bg-transparent"
                        value={editingScore.score}
                        onChange={e => setEditingScore({ ...editingScore, score: e.target.value })}
                      />
                    ) : (
                      <div className="text-2xl font-black text-brand-green">{s.score}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingScore?.id === s.id ? (
                      <>
                        <button onClick={() => handleSaveScore(s.id, editingScore.score)} className="text-xs bg-brand-green text-white px-3 py-1.5 rounded-lg font-black hover:bg-brand-green/90">Save</button>
                        <button onClick={() => setEditingScore(null)} className="text-xs text-gray-400 font-bold hover:text-gray-600">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingScore({ id: s.id, score: s.score })} className="text-brand-green font-bold text-xs hover:underline"><Edit2 size={14} /></button>
                        <button onClick={() => handleDeleteScore(s.id)} className="text-red-400 font-bold text-xs hover:underline">×</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 bg-brand-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-brand-dark text-white p-8 flex items-center justify-between">
              <div>
                <h3 className="font-black text-xl">Edit <span className="text-brand-green">User Profile</span></h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">User ID: {editUserModal.id}</p>
              </div>
              <button onClick={() => setEditUserModal(null)} className="text-gray-400 hover:text-white transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Username & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">Username</label>
                  <input 
                    type="text" 
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 outline-none transition font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">Email Address</label>
                  <input 
                    type="email" 
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 outline-none transition font-medium text-sm"
                  />
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">First Name</label>
                  <input 
                    type="text" 
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 outline-none transition font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">Last Name</label>
                  <input 
                    type="text" 
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 outline-none transition font-medium text-sm"
                  />
                </div>
              </div>

              {/* Donation Percentage */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">Donation Percentage (%)</label>
                <input 
                  type="number" 
                  min="10"
                  max="100"
                  value={editForm.donation_percentage}
                  onChange={(e) => setEditForm({...editForm, donation_percentage: parseInt(e.target.value)})}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 outline-none transition font-black text-brand-green text-lg"
                />
              </div>

              {/* Staff Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-brand-green/10 transition">
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Administrator Status</div>
                  <div className="text-xs font-bold text-gray-600 mt-1">Grant this user full system access</div>
                </div>
                <button 
                  onClick={() => setEditForm({...editForm, is_staff: !editForm.is_staff})}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 outline-none ${editForm.is_staff ? 'bg-brand-green' : 'bg-gray-200'}`}
                >
                  <motion.div 
                    animate={{ x: editForm.is_staff ? 28 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="pt-6 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveUser}
                  disabled={savingUser}
                  className="flex-1 bg-brand-green text-white px-6 py-4 rounded-2xl font-bold hover:bg-brand-dark transition shadow-lg shadow-brand-green/20 disabled:opacity-50"
                >
                  {savingUser ? 'Saving...' : 'Update Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
