import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { Heart, Plus, Edit, Trash2, ArrowLeft, Globe, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminCharities = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    logo_url: ''
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'pending'

  const fetchCharities = async () => {
    try {
      const { data } = await api.get('/api/charities/admin/');
      setCharities(data);
    } catch (err) {
      console.error("Failed to fetch charities", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  const handleApprove = async (charity) => {
    try {
      await api.patch(`/api/charities/admin/${charity.id}/`, {
        is_approved: true,
        is_active: true
      });
      fetchCharities();
    } catch (err) {
      alert("Failed to approve charity.");
    }
  };

  const handleToggleStatus = async (charity) => {
    try {
      await api.patch(`/api/charities/admin/${charity.id}/`, { is_active: !charity.is_active });
      fetchCharities();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (charityId) => {
    if (!window.confirm("Are you sure? This will remove the charity from the directory.")) return;
    try {
      await api.delete(`/api/charities/admin/${charityId}/`);
      fetchCharities();
    } catch (err) {
      alert("Failed to delete charity.");
    }
  };

  const openAddModal = () => {
    setEditingCharity(null);
    setFormData({ name: '', category: '', description: '', logo_url: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (charity) => {
    setEditingCharity(charity);
    setFormData({
      name: charity.name || '',
      category: charity.category || '',
      description: charity.description || '',
      logo_url: charity.logo_url || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCharity) {
        await api.patch(`/api/charities/admin/${editingCharity.id}/`, formData);
      } else {
        await api.post('/api/charities/admin/', formData);
      }
      setIsModalOpen(false);
      fetchCharities();
    } catch (err) {
      alert("Failed to save charity. " + (err.response?.data?.slug?.[0] || ''));
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading charities...</div>;

  return (
    <div className="min-h-screen bg-brand-light p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-8">
          <div>
            <h1 className="text-3xl font-black text-brand-dark tracking-tight">Charity <span className="text-brand-green">Management</span></h1>
            <p className="text-gray-500 font-medium">Manage partner organizations and donation routing.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-gray-400 hover:text-brand-dark transition text-sm font-bold flex items-center gap-1">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <button 
              onClick={openAddModal}
              className="bg-brand-green text-white px-6 py-3 rounded-2xl font-bold hover:bg-brand-dark transition shadow-lg shadow-brand-green/20 flex items-center gap-2"
            >
              <Plus size={20} /> Add Charity
            </button>
          </div>
        </div>

        {/* Filters/Tabs Section */}
        <div className="flex gap-4 border-b border-gray-100 pb-1">
          <button 
            onClick={() => setActiveTab('all')}
            className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'all' ? 'text-brand-green' : 'text-gray-400 hover:text-brand-dark'}`}
          >
            All Charities ({charities.filter(c => c.is_approved).length})
            {activeTab === 'all' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-green rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'pending' ? 'text-brand-green' : 'text-gray-400 hover:text-brand-dark'}`}
          >
            Organization Requests ({charities.filter(c => !c.is_approved).length})
            {activeTab === 'pending' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-green rounded-full" />}
          </button>
        </div>

        {/* Charity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities
            .filter(charity => activeTab === 'all' ? charity.is_approved : !charity.is_approved)
            .map((charity) => (
            <div key={charity.id} className={`bg-white rounded-3xl p-6 shadow-sm border-2 transition-all ${charity.is_active ? 'border-transparent' : 'border-gray-100 grayscale opacity-60'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-brand-light rounded-xl flex items-center justify-center text-brand-green">
                   {charity.logo_url ? (
                     <img src={charity.logo_url} alt={charity.name} className="w-8 h-8 object-contain" />
                   ) : (
                     <Heart size={24} />
                   )}
                </div>
                <div className="flex gap-2">
                   <button onClick={() => openEditModal(charity)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-brand-gold transition" title="Edit Charity">
                      <Edit size={18} />
                   </button>
                   <button onClick={() => handleDelete(charity.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition" title="Delete Charity">
                      <Trash2 size={18} />
                   </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-brand-dark mb-1">{charity.name}</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-brand-green uppercase tracking-widest mb-4">
                 <Tag size={12} /> {charity.category}
              </div>
              
              <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                {charity.description}
              </p>
              
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                 <div className="text-sm">
                    <div className="text-gray-400 font-medium">Total Received</div>
                    <div className="font-bold text-brand-dark">${parseFloat(charity.total_received).toLocaleString()}</div>
                 </div>
                 <div className="flex items-center gap-4">
                   {charity.is_approved ? (
                     <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase tracking-tight ${charity.is_active ? 'text-brand-green' : 'text-gray-400'}`}>
                          {charity.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button 
                          onClick={() => handleToggleStatus(charity)}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-200 outline-none ${charity.is_active ? 'bg-brand-green' : 'bg-gray-200'}`}
                        >
                          <motion.div 
                            animate={{ x: charity.is_active ? 28 : 4 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </button>
                     </div>
                   ) : (
                     <button 
                       onClick={() => handleApprove(charity)}
                       className="px-6 py-2 bg-brand-green text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-dark transition shadow-lg shadow-brand-green/20"
                     >
                       Approve Request
                     </button>
                   )}
                 </div>
              </div>
            </div>
          ))}
          
          {charities.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-[40px]">
               No charities found. Start by adding your first partner.
            </div>
          )}
        </div>

        {/* Charity Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-2xl font-black text-brand-dark">
                  {editingCharity ? 'Edit' : 'Add New'} <span className="text-brand-green">Charity</span>
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-brand-dark transition">
                   <Plus size={24} className="rotate-45" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">Charity Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 outline-none transition font-medium"
                    placeholder="e.g. Cancer Research UK"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">Category</label>
                    <select 
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 outline-none transition font-medium appearance-none"
                    >
                      <option value="">Select Category</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Environment">Environment</option>
                      <option value="Disaster Relief">Disaster Relief</option>
                      <option value="Youth Support">Youth Support</option>
                      <option value="Animal Welfare">Animal Welfare</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">Logo URL</label>
                    <input 
                      type="url" 
                      value={formData.logo_url}
                      onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 outline-none transition font-medium"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">Description</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 outline-none transition font-medium resize-none"
                    placeholder="Briefly describe the mission and impact..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-brand-green text-white px-6 py-4 rounded-2xl font-bold hover:bg-brand-dark transition shadow-lg shadow-brand-green/20"
                  >
                    {editingCharity ? 'Update Charity' : 'Add Charity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminCharities;
