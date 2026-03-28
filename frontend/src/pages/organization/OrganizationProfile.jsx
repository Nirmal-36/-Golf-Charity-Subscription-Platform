import React, { useState, useEffect } from 'react';
import { 
  Building2, Mail, Globe, MapPin, 
  Camera, Save, CheckCircle2, Loader2, Trash2 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { resolveImageUrl } from '../../utils/image';
import { getCategoryIcon } from '../../utils/icons';
import { CHARITY_CATEGORIES } from '../../utils/constants';

/**
 * Branding Terminal: OrganizationProfile
 * Manages the public-facing identity of the charitable partner.
 * Orchestrates mission statement persistence, category classification, 
 * and visual asset management (logo upload/removal).
 */
const OrganizationProfile = () => {
  const { user } = useAuth();
  
  // State: Organizational metadata & visual asset lifecycle
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    logo_url: ''
  });

  const fileInputRef = React.useRef(null);

  // Lifecycle: Hydrate organizational profile from persistence layer
  useEffect(() => {
    fetchCharityData();
  }, []);

  /**
   * Infrastructure Sync: fetchCharityData
   * Retrieves the comprehensive partner profile including 
   * existing branding assets and classification.
   */
  const fetchCharityData = async () => {
    try {
      const { data } = await api.get('/api/charities/my-profile/');
      setCharity(data);
      setFormData({
        name: data.name,
        description: data.description,
        category: data.category,
        logo_url: data.logo_url
      });
      // Visual Sync: Resolve branding preview
      if (data.logo_image) {
        setPreviewUrl(resolveImageUrl(data.logo_image));
      } else if (data.logo_url) {
        setPreviewUrl(resolveImageUrl(data.logo_url));
      }
    } catch {
      console.error('Infrastructure Alert: Organizational data inaccessible.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * UI Interaction: handleFileSelect
   * Generates a local preview of the proposed branding asset 
   * for organizational review.
   */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result); // UX Alert: Base64 for zero-latency preview
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Transaction Handler: handleUpdate
   * Synchronizes the organizational identity with the backend.
   * Utilizes multipart/form-data for concurrent text and binary transmission.
   */
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaved(false);
    
    try {
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('description', formData.description);
      dataToSend.append('category', formData.category);
      dataToSend.append('logo_url', formData.logo_url);
      
      // Branding Sync: Handle logo binary or removal signal
      if (logoFile) {
        dataToSend.append('logo_image', logoFile);
      } else if (!previewUrl) {
        dataToSend.append('logo_image', ''); 
      }

      const { data } = await api.patch(`/api/charities/my-profile/`, dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // UI Sync: Refresh local state and signal success
      setCharity(data);
      if (data.logo_image) {
        setPreviewUrl(resolveImageUrl(data.logo_image));
      } else if (data.logo_url) {
        setPreviewUrl(resolveImageUrl(data.logo_url));
      } else {
        setPreviewUrl(null);
      }
      setSaved(true);
      setLogoFile(null);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      console.error('Transaction Alert: Protocol rejection during profile update.');
    } finally {
      setSaveLoading(false);
    }
  };

  /**
   * Infrastructure Sync: handleRemoveLogo
   * Signal the orchestrator to purge the organizational visual identity.
   */
  const handleRemoveLogo = async () => {
    try {
      setSaveLoading(true);
      await api.delete('/api/charities/my-profile/remove-logo/');
      setCharity(prev => ({ ...prev, logo_image: null, logo_url: null }));
      setPreviewUrl(null);
      setLogoFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      console.error('Infrastructure Alert: Logo removal rejected.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const CategoryIcon = getCategoryIcon(formData.category || charity?.category);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/org/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-green font-bold mb-8 transition-colors">
        <ArrowLeft size={20} /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-black text-brand-dark tracking-tight">Organization <span className="text-brand-green underline decoration-brand-green/30 decoration-8 underline-offset-8">Profile</span></h1>
        {charity.is_approved && (
          <div className="bg-brand-green/10 text-brand-green px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <CheckCircle2 size={16} /> Verified Partner
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left: Branding */}
        <div className="md:col-span-1 space-y-8">
          <div className="relative group w-full aspect-square bg-white rounded-[40px] shadow-xl border border-gray-100 flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img src={previewUrl} alt={charity.name} className="w-full h-full object-cover" />
            ) : (
              <CategoryIcon size={120} className="text-brand-green/20" strokeWidth={1} />
            )}
            
            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />

            <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <div className="flex flex-col gap-6">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center hover:text-brand-green transition-colors cursor-pointer"
                >
                  <Camera size={32} />
                  <span className="text-xs font-black uppercase tracking-widest mt-2">{previewUrl ? 'Change' : 'Upload'} Logo</span>
                </button>
                
                {previewUrl && (
                  <button 
                    type="button"
                    onClick={handleRemoveLogo}
                    className="flex flex-col items-center hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 size={24} />
                    <span className="text-xs font-black uppercase tracking-widest mt-2">Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Registration Details</p>
             <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-500">Linked Account</p>
                  <p className="font-bold text-brand-dark truncate">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">Partner Since</p>
                  <p className="font-bold text-brand-dark">March 2026</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleUpdate} className="space-y-8 bg-white rounded-[40px] p-8 md:p-12 shadow-xl border border-gray-100">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Organization Name</label>
                <input 
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green rounded-2xl p-4 font-bold outline-none transition"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. UNICEF Golf Initiative"
                />
              </div>

              <CustomSelect 
                label="Category"
                name="category"
                value={formData.category}
                options={CHARITY_CATEGORIES}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Logo URL</label>
                <input 
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green rounded-2xl p-4 font-bold outline-none transition"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Mission Statement</label>
                <textarea 
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green rounded-2xl p-4 font-bold outline-none transition min-h-[150px]"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your organization's mission and how golf donations will make an impact..."
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <button 
                type="submit" 
                disabled={saveLoading}
                className="flex-1 px-8 py-5 bg-brand-green text-white font-black rounded-2xl shadow-xl shadow-brand-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {saveLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Update Profile
              </button>
              
              {saved && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-brand-green font-black uppercase text-xs tracking-widest"
                >
                  <CheckCircle2 size={16} /> Changes Saved
                </motion.div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrganizationProfile;
