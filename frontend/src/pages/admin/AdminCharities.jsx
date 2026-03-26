import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { Heart, Plus, Edit, Trash2, ArrowLeft, Globe, Tag } from 'lucide-react';

const AdminCharities = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleAddCharity = async () => {
     // Simple prompt-based add for now, but a modal would be better
     const name = window.prompt("Charity Name:");
     if (!name) return;
     const category = window.prompt("Category (Healthcare, Education, etc):");
     const description = window.prompt("Short Description:");
     const logo_url = window.prompt("Logo URL (optional):");
     
     try {
       await api.post('/api/charities/admin/', { 
         name, 
         category, 
         description, 
         logo_url: logo_url || '',
         slug: name.toLowerCase().replace(/ /g, '-')
       });
       fetchCharities();
     } catch (err) {
       alert("Failed to add charity.");
     }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading charities...</div>;

  return (
    <div className="min-h-screen bg-brand-light p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
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
              onClick={handleAddCharity}
              className="bg-brand-green text-white px-6 py-3 rounded-2xl font-bold hover:bg-brand-dark transition shadow-lg shadow-brand-green/20 flex items-center gap-2"
            >
              <Plus size={20} /> Add Charity
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities.map((charity) => (
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
                   <button onClick={() => handleToggleStatus(charity)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-brand-gold transition">
                      <Edit size={18} />
                   </button>
                   <button onClick={() => handleDelete(charity.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition">
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
                 <button 
                   onClick={() => handleToggleStatus(charity)}
                   className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                     charity.is_active ? 'border-green-200 text-green-600 bg-green-50' : 'border-gray-200 text-gray-400 bg-gray-50'
                   }`}
                 >
                   {charity.is_active ? 'Active' : 'Disabled'}
                 </button>
              </div>
            </div>
          ))}
          
          {charities.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-[40px]">
               No charities found. Start by adding your first partner.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminCharities;
