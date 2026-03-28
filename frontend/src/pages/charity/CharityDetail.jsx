import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Users, 
  ArrowLeft, 
  ExternalLink, 
  Zap,
  Globe,
  Share2,
  Trophy,
  ChevronRight
} from 'lucide-react';
import api from '../../api/axios';
import { resolveImageUrl } from '../../utils/image';
import { getCategoryIcon } from '../../utils/icons';
import { useAuth } from '../../hooks/useAuth';

const CharityDetail = () => {
    const { slug } = useParams();
    const { user } = useAuth();
    const [charity, setCharity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [donationAmount, setDonationAmount] = useState('25');
    const [isDonating, setIsDonating] = useState(false);

    useEffect(() => {
        const fetchCharity = async () => {
            try {
                const res = await api.get(`/api/charities/${slug}/`);
                setCharity(res.data);
            } catch (err) {
                console.error("Failed to load charity", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCharity();
    }, [slug]);

    const handleOneTimeDonation = async () => {
        setIsDonating(true);
        try {
            const res = await api.post(`/api/charities/${slug}/donate/`, {
                amount: donationAmount,
                success_url: window.location.origin + '/donation/success',
                cancel_url: window.location.href
            });
            window.location.href = res.data.checkout_url;
        } catch (err) {
            alert(err.response?.data?.error || "Donation failed to initialize.");
        } finally {
            setIsDonating(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-brand-light">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
        </div>
    );

    if (!charity) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-brand-light p-4 text-center">
            <h2 className="text-4xl font-black text-brand-dark mb-4 tracking-tight">Charity Not Found</h2>
            <Link to="/explore" className="text-brand-green font-bold hover:underline">Return to Explore</Link>
        </div>
    );

    const CategoryIcon = getCategoryIcon(charity.category);
    const bannerImage = charity.images?.find(img => img.is_banner)?.image || charity.logo_image || charity.logo_url;
    const isAdmin = user?.is_staff || user?.user_role === 'admin';
    const backPath = isAdmin ? '/admin/charities' : user ? '/charities' : '/explore';
    const backLabel = isAdmin ? 'Back to Charity Management' : 'Back to Explore';

    return (
        <div className="bg-brand-light min-h-screen pb-32">
            {/* Hero Banner Section */}
            <div className="relative h-[400px] md:h-[500px] overflow-hidden bg-brand-dark">
                <img 
                    src={resolveImageUrl(bannerImage)} 
                    alt={charity.name} 
                    className="w-full h-full object-cover opacity-60 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent"></div>
                
                <div className="absolute top-8 left-8">
                   <Link to={backPath} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white font-bold hover:bg-white/20 transition group">
                      <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> {backLabel}
                   </Link>
                </div>

                <div className="absolute bottom-12 left-0 w-full">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-end gap-8">
                            <motion.div 
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="w-40 h-40 bg-white rounded-3xl p-6 shadow-2xl flex items-center justify-center flex-shrink-0 border-4 border-white/20"
                            >
                                <img 
                                    src={resolveImageUrl(charity.logo_image || charity.logo_url)} 
                                    alt={charity.name} 
                                    className="max-h-full object-contain"
                                />
                            </motion.div>
                            <div className="flex-1 pb-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-green text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                    <CategoryIcon size={12} /> {charity.category}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2 leading-[0.9]">{charity.name}</h1>
                                <div className="flex flex-wrap gap-6 text-gray-300 font-medium text-sm">
                                    <span className="flex items-center gap-2"><Users size={16} className="text-brand-green" /> {charity.supporter_count} Supporters</span>
                                    <span className="flex items-center gap-2"><Trophy size={16} className="text-brand-gold" /> ${charity.total_received.toLocaleString()} Received</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left & Middle: Content and Gallery */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description Section */}
                        <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                            <h2 className="text-2xl font-black text-brand-dark mb-6">About the Impact</h2>
                            <p className="text-gray-500 text-lg leading-relaxed whitespace-pre-line">
                                {charity.description}
                            </p>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light rounded-bl-full -z-0"></div>
                        </div>

                        {/* Image Gallery */}
                        {charity.images?.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-black text-brand-dark mb-6 flex items-center gap-2">
                                    Gallery <span className="text-gray-300">({charity.images.length})</span>
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {charity.images.map((img, i) => (
                                        <motion.div 
                                            key={img.id}
                                            whileHover={{ scale: 1.02 }}
                                            className="aspect-square rounded-2xl overflow-hidden shadow-md bg-gray-100"
                                        >
                                            <img 
                                                src={resolveImageUrl(img.image)} 
                                                alt={img.caption || `Gallery ${i}`} 
                                                className="w-full h-full object-cover"
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upcoming Events Section (Phase 30) */}
                        <div>
                            <h2 className="text-2xl font-black text-brand-dark mb-6 flex items-center gap-2">
                                Upcoming Events <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold rounded text-xs font-black uppercase">Golf Days</span>
                            </h2>
                            {charity.events?.length > 0 ? (
                                <div className="space-y-6">
                                    {charity.events.map((event) => (
                                        <div key={event.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 hover:border-brand-green/20 transition group">
                                            {event.image && (
                                                <div className="w-full md:w-48 h-40 rounded-2xl overflow-hidden flex-shrink-0">
                                                    <img src={resolveImageUrl(event.image)} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h4 className="text-xl font-black text-brand-dark mb-2 group-hover:text-brand-green transition">{event.title}</h4>
                                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>
                                                <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                                                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-brand-gold" /> {new Date(event.event_date).toLocaleDateString()}</span>
                                                    {event.location && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-brand-gold" /> {event.location}</span>}
                                                </div>
                                            </div>
                                            {event.link_url && (
                                                <div className="flex items-center">
                                                    <a href={event.link_url} target="_blank" rel="noopener noreferrer" className="p-4 bg-brand-light text-brand-green rounded-full hover:bg-brand-green hover:text-white transition">
                                                        <ExternalLink size={20} />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white p-12 rounded-[40px] border-2 border-dashed border-gray-100 text-center text-gray-400 font-medium">
                                    No scheduled events at the moment.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Donation & Call to Action Sidebar */}
                    <div className="space-y-8">
                        {/* Independent Donation Box */}
                        <div className="bg-white rounded-[40px] p-8 border border-brand-green/10 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 -mr-16 -mt-16 rounded-full"></div>
                            <h3 className="text-2xl font-black text-brand-dark mb-2 flex items-center gap-2 relative z-10">
                               <Heart className="text-brand-green fill-brand-green" size={20} /> Donate Now
                            </h3>
                            <p className="text-gray-400 text-sm font-medium mb-6 relative z-10">Makes an independent impact today.</p>
                            
                            <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
                                {['10', '25', '50'].map(amt => (
                                    <button 
                                        key={amt}
                                        onClick={() => setDonationAmount(amt)}
                                        className={`py-3 rounded-2xl font-black text-sm transition-all border-2 ${
                                            donationAmount === amt ? 'bg-brand-green text-white border-brand-green' : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-100'
                                        }`}
                                    >
                                        ${amt}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="relative mb-6 z-10">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input 
                                    type="number" 
                                    value={donationAmount}
                                    onChange={(e) => setDonationAmount(e.target.value)}
                                    placeholder="Enter custom amount"
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 rounded-2xl py-4 pl-8 pr-4 outline-none font-black text-brand-dark transition-all"
                                />
                            </div>

                            <button 
                                onClick={handleOneTimeDonation}
                                disabled={isDonating || !donationAmount}
                                className="w-full py-5 bg-brand-green text-white rounded-[24px] font-black shadow-xl shadow-brand-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group relative z-10"
                            >
                                {isDonating ? 'Initializing...' : (
                                    <>Support Cause <Zap size={18} className="fill-white" /></>
                                )}
                            </button>
                        </div>

                        {/* Subscription Call to Action */}
                        {(!user || user.subscription_status !== 'active') && (
                            <div className="bg-brand-dark rounded-[40px] p-10 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/20 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000"></div>
                                <h3 className="text-2xl font-black mb-4 relative z-10">Become a Member</h3>
                                <p className="text-gray-400 font-medium mb-8 text-sm leading-relaxed relative z-10">
                                    Automated monthly giving. Track your scores, entry into prize draws, and consistent impact.
                                </p>
                                <Link to="/register" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition relative z-10 group/btn">
                                    <span className="font-bold">Join the Club</span>
                                    <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        )}

                        {/* Quick Contact / Social */}
                        <div className="flex justify-center gap-4">
                            <button className="w-12 h-12 bg-white rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-green hover:border-brand-green/20 transition shadow-sm">
                                <Globe size={20} />
                            </button>
                            <button className="w-12 h-12 bg-white rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-green hover:border-brand-green/20 transition shadow-sm">
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharityDetail;
