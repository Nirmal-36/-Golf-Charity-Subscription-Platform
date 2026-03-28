import React, { useState } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { Heart, Send, CheckCircle, ArrowRight, Shield, Globe, Award, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { CHARITY_CATEGORIES } from '../../utils/constants';
import CustomSelect from '../../components/ui/CustomSelect';
import { resolveImageUrl } from '../../utils/image';

const CharityRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    category: '',
    description: '',
    logo_url: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/charities/register/', formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.slug?.[0] || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto text-brand-green">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-4xl font-black text-brand-dark">Application <span className="text-brand-green">Sent!</span></h1>
          <p className="text-gray-500 font-medium text-lg text-balance">
            Thank you for applying. Our team will review your organization's details and contact you shortly to finalize the partnership.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-brand-dark text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-green transition shadow-xl"
          >
            Back to Home <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light">
      <div className="max-w-6xl mx-auto px-6 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Brand & Value Prop */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-bold text-brand-green">
            <Award size={16} /> Partner with us
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-brand-dark leading-[1.1] tracking-tight">
            Empower your <span className="text-brand-green">impact.</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-lg text-pretty">
            Join our platform to receive sustainable, monthly donations from our global community of golfers. We handle the technology; you handle the change.
          </p>
          
          <div className="space-y-6">
            <div className="flex gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-3xl border border-white">
              <div className="p-3 bg-brand-green/10 rounded-2xl text-brand-green h-fit">
                <Shield size={24} />
              </div>
              <div>
                <h4 className="font-bold text-brand-dark">Verified Partnerships</h4>
                <p className="text-sm text-gray-500">We prioritize transparency and accountability for all listed organizations.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-3xl border border-white">
              <div className="p-3 bg-brand-green/10 rounded-2xl text-brand-green h-fit">
                <Globe size={24} />
              </div>
              <div>
                <h4 className="font-bold text-brand-dark">Global Reach</h4>
                <p className="text-sm text-gray-500">Connect with recurring donors from the worldwide golf community.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Registration Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[48px] p-8 lg:p-12 shadow-2xl shadow-brand-dark/5 border border-gray-100"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-black text-brand-dark mb-2">Partner Registration</h2>
            <p className="text-gray-500 font-medium text-sm italic">Tell us about your organization to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">Organization Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 lg:p-5 outline-none transition font-medium text-lg placeholder:text-gray-300 shadow-inner"
                    placeholder="e.g. Hope Foundation"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">Contact Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 lg:p-5 outline-none transition font-medium text-lg placeholder:text-gray-300 shadow-inner"
                    placeholder="contact@foundation.org"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomSelect 
                  label="Category"
                  name="category"
                  value={formData.category}
                  options={CHARITY_CATEGORIES}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                />
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">Logo URL</label>
                  <input 
                    type="url" 
                    value={formData.logo_url}
                    onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 lg:p-5 outline-none transition font-medium text-lg placeholder:text-gray-300 shadow-inner"
                    placeholder="https://logo.com/image.png"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">About your Mission</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 lg:p-5 outline-none transition font-medium text-lg placeholder:text-gray-300 resize-none shadow-inner"
                  placeholder="Describe your organization's primary goals and impact..."
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-2 animate-shake">
                <Heart size={16} className="rotate-180" /> {error}
              </p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-dark text-white p-5 lg:p-6 rounded-[2rem] font-black text-xl hover:bg-brand-green transition-all shadow-xl shadow-brand-dark/10 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Apply Now <Send size={24} /></>
              )}
            </button>
          </form>
          
          <p className="mt-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
            Already a partner? <Link to="/admin" className="text-brand-green hover:underline">Support Portal</Link>
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default CharityRegister;
