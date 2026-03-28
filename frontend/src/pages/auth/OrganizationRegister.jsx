import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Mail, Lock, User, 
  ArrowRight, CheckCircle, Loader2 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { CHARITY_CATEGORIES } from '../../utils/constants';

/**
 * Partner Onboarding: OrganizationRegister
 * A sophisticated multi-step pipeline for onboarding verified Charity Partners.
 * Orchestrates a seamless transition from personal identity verification 
 * to organizational profile provisioning.
 */
const OrganizationRegister = () => {
  const { registerOrganization } = useAuth();
  
  // Logic: Sequential State Management (1: Account -> 2: Profile -> 3: Success)
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    org_name: '',
    org_category: '',
    org_description: '',
    org_logo_url: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Transaction Handler: handleSubmit
   * Executes the final organizational creation request.
   * Upon success, transitions the UX to the verification confirmation stage.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerOrganization(formData);
      // UX Lifecycle: Transition to the 'Received' confirmation state
      setStep(3); 
    } catch (err) {
      setError(err.response?.data?.detail || 'Onboarding Alert: Synchronization failed. Please verify your data.');
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4 py-20">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-5 bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Component: Managed Sidebar Navigation */}
        <div className="lg:col-span-2 bg-brand-dark p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-12 group">
              <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center text-white">
                <Heart size={18} />
              </div>
              <span className="font-black tracking-tighter text-lg uppercase">Partner <span className="text-brand-green">Portal</span></span>
            </Link>
            
            <h1 className="text-3xl font-black mb-6 leading-tight">Empower your cause through Golf.</h1>
            
            <div className="space-y-8">
              <StepIndicator active={step === 1} done={step > 1} num={1} title="Account Details" desc="Your personal login credentials." />
              <StepIndicator active={step === 2} done={step > 2} num={2} title="Organization" desc="Your charity's mission & identity." />
              <StepIndicator active={step === 3} done={false} num={3} title="Verification" desc="Awaiting portal activation." />
            </div>
          </div>
          
          <div className="relative z-10 mt-12 pt-12 border-t border-white/10">
            <p className="text-sm text-gray-400 font-medium italic">
              "Joining this platform increased our monthly recurring donations by 40% in just 3 months."
            </p>
            <p className="mt-4 font-bold text-brand-green">— Hope Fairway Foundation</p>
          </div>
          
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl"></div>
        </div>

        {/* Component: Interactive Transaction Area */}
        <div className="lg:col-span-3 p-12 relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col justify-center"
              >
                <div className="mb-10">
                  <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center mb-4">
                    <User size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-brand-dark">Account Details</h2>
                  <p className="text-gray-500 font-medium">Let's set up your personal access to the Partner Hub.</p>
                </div>

                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required />
                    <InputField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required />
                  </div>
                  <InputField label="Preferred Username" name="username" value={formData.username} onChange={handleChange} required />
                  <InputField label="Corporate Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
                  <InputField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
                  
                  <button 
                    type="submit"
                    className="w-full py-4 bg-brand-green text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-green/20 mt-8"
                  >
                    Continue to Profile <ArrowRight size={20} />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col justify-center"
              >
                <div className="mb-10">
                  <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center mb-4">
                    <Globe size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-brand-dark">Organization Profile</h2>
                  <p className="text-gray-500 font-medium">Tell us about the charity you'll be managing.</p>
                </div>

                {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 text-sm font-bold border border-red-100">{error}</div>}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <InputField label="Organization Name" name="org_name" value={formData.org_name} onChange={handleChange} required />
                  <div className="grid grid-cols-2 gap-4">
                    <CustomSelect 
                      label="Category"
                      name="org_category"
                      value={formData.org_category}
                      options={CHARITY_CATEGORIES}
                      onChange={handleChange}
                      required
                    />
                    <InputField label="Logo URL (Optional)" name="org_logo_url" value={formData.org_logo_url} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mission Description</label>
                    <textarea 
                      name="org_description"
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green rounded-2xl p-4 font-bold outline-none transition min-h-[120px]"
                      value={formData.org_description}
                      onChange={handleChange}
                      placeholder="What impact do you aim to achieve?"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-4 mt-8">
                    <button 
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black flex items-center gap-2 hover:bg-gray-200 transition-all"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-4 bg-brand-green text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-green/20 disabled:opacity-50"
                    >
                      {loading ? 'Initiating Portal...' : 'Get Started'} <CheckCircle2 size={20} />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center"
              >
                <div className="w-24 h-24 bg-brand-green/10 text-brand-green rounded-[32px] flex items-center justify-center mb-8">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black text-brand-dark mb-4">Application Received!</h2>
                <p className="text-gray-500 font-medium mb-10 max-w-sm">
                  Your organization portal is being provisioned. You can now log in to manage your profile while we verify your charity credentials.
                </p>
                <Link 
                  to="/login"
                  className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-dark/20"
                >
                  Sign In to Partner Hub
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/**
 * UI Component: StepIndicator
 * Displays the current progress through the multi-step registration 
 * process with visual status feedback.
 */
const StepIndicator = ({ active, done, num, title, desc }) => (
  <div className={`flex gap-4 transition-all ${active ? 'opacity-100' : 'opacity-40'}`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black border-2 ${done ? 'bg-brand-green border-brand-green text-white' : (active ? 'border-brand-green text-brand-green' : 'border-white/20 text-white')}`}>
      {done ? <CheckCircle2 size={16} /> : num}
    </div>
    <div>
      <p className="font-black text-sm uppercase tracking-wider">{title}</p>
      <p className="text-xs text-gray-400 font-medium">{desc}</p>
    </div>
  </div>
);

/**
 * UI Component: InputField
 * Standardized input for the registration form with professional styling.
 */
const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{label}</label>
    <input 
      className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green rounded-2xl p-4 font-bold outline-none transition"
      {...props}
    />
  </div>
);

export default OrganizationRegister;
