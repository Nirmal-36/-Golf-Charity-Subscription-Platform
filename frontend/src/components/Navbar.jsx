import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Menu, X, Trophy, UserCircle, LogOut, User, LayoutDashboard, Compass, CreditCard, Heart, Target } from 'lucide-react';
import SubscriptionBadge from './SubscriptionBadge';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigation = user 
    ? (user.is_staff 
        ? [
            { name: 'Admin Hub', href: '/admin/dashboard', icon: LayoutDashboard },
            { name: 'Users', href: '/admin/users', icon: User },
            { name: 'Charities', href: '/admin/charities', icon: Heart },
            { name: 'Draws', href: '/admin/draws', icon: Target },
            { name: 'Payouts', href: '/admin/payouts', icon: CreditCard },
            { name: 'Audit Logs', href: '/admin/logs', icon: Menu },
          ]
        : [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Prize Draw', href: '/draw', icon: Trophy },
            { name: 'Charities', href: '/charities', icon: Compass },
          ])
    : [
        { name: 'Explore', href: '/explore', icon: Compass },
        { name: 'Membership', href: '/membership', icon: CreditCard },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
                <Trophy size={24} />
              </div>
              <span className="text-xl font-black text-brand-dark tracking-tighter">GOLF<span className="text-brand-green">CHARITY</span></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  isActive(item.href) ? 'text-brand-green' : 'text-gray-500 hover:text-brand-green'
                }`}
              >
                {(() => {
                  const Icon = item.icon;
                  return <Icon size={18} />;
                })()}
                {item.name}
              </Link>
            ))}

            <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

            {user ? (
              <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
                >
                  <div className="w-10 h-10 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-bold text-brand-dark leading-none">{user.username}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-black uppercase tracking-widest">{user.is_staff ? 'Administrator' : (user.subscription_status === 'active' ? 'Active Pro' : 'Subscriber')}</p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                <React.Fragment>
                  {isProfileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden ring-1 ring-black/5"
                    >
                      <div className="p-6 bg-brand-light/30 border-b border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-brand-green text-white rounded-2xl flex items-center justify-center text-xl font-black">
                            {user.username[0].toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-black text-brand-dark truncate">{user.username}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <SubscriptionBadge status={user.subscription_status} />
                      </div>

                      <div className="p-2">
                        <DropdownLink to="/profile" icon={UserCircle} label="Account Settings" onClick={() => setIsProfileOpen(false)} />
                        {!user.is_staff && (
                          <DropdownLink to="/subscription/details" icon={CreditCard} label="Membership & Billing" onClick={() => setIsProfileOpen(false)} />
                        )}
                        {user.is_staff && (
                          <DropdownLink to="/admin/dashboard" icon={LayoutDashboard} label="Admin Terminal" onClick={() => setIsProfileOpen(false)} />
                        )}
                      </div>

                      <div className="p-2 border-t border-gray-50 bg-gray-50/50">
                        <button 
                          onClick={() => { logout(); setIsProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut size={18} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </React.Fragment>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-brand-green transition-colors">
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2.5 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green/90 transition shadow-lg shadow-brand-green/20"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        className="md:hidden overflow-hidden bg-white border-t border-gray-50"
      >
        <div className="px-4 pt-2 pb-6 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-4 text-base font-bold rounded-xl transition-colors ${
                isActive(item.href) ? 'bg-brand-green/5 text-brand-green' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {(() => {
                const Icon = item.icon;
                return <Icon size={20} />;
              })()}
              {item.name}
            </Link>
          ))}
          
          <div className="pt-4 mt-4 border-t border-gray-100">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-10 h-10 bg-brand-green text-white rounded-xl flex items-center justify-center font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-brand-dark">{user.username}</p>
                    <SubscriptionBadge status={user.subscription_status} />
                  </div>
                </div>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-4 text-base font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                   <UserCircle size={20} /> Settings
                </Link>
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="flex w-full items-center gap-3 px-3 py-4 text-base font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 px-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center py-3 font-bold text-brand-green border border-brand-green/20 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center py-3 font-bold text-white bg-brand-green rounded-xl"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </nav>
  );
};

const DropdownLink = ({ to, icon: Icon, label, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:text-brand-green hover:bg-brand-green/5 rounded-xl transition-all group"
  >
    <Icon size={18} className="text-gray-400 group-hover:text-brand-green transition-colors" />
    {label}
  </Link>
);

export default Navbar;
