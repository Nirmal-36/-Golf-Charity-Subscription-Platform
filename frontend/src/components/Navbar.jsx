import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Menu, X, Trophy, LogOut, User, LayoutDashboard, Compass, CreditCard } from 'lucide-react';
import SubscriptionBadge from './SubscriptionBadge';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const navigation = user 
    ? (user.is_staff 
        ? [
            { name: 'Admin Hub', href: '/admin/dashboard', icon: LayoutDashboard },
            { name: 'Users', href: '/admin/users', icon: User },
            { name: 'Payouts', href: '/admin/payouts', icon: CreditCard },
            { name: 'Audit Logs', href: '/admin/logs', icon: Menu },
          ]
        : [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Subscription', href: '/subscription/details', icon: CreditCard },
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
              <div className="flex items-center gap-6">
                {!user.is_staff && <SubscriptionBadge status={user.subscription_status} />}
                <div className="flex items-center gap-3 border-l pl-6 border-gray-100">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-bold text-brand-dark leading-none">{user.username}</p>
                    <p className="text-xs text-gray-400 mt-1 capitalize">{user.is_staff ? 'Administrator' : 'Subscriber'}</p>
                  </div>
                  <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut size={22} />
                  </button>
                </div>
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
                {!user.is_staff && (
                  <div className="px-3">
                    <SubscriptionBadge status={user.subscription_status} />
                  </div>
                )}
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

export default Navbar;
