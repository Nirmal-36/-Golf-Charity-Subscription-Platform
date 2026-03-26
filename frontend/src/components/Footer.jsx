import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Camera, Send, Globe, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Footer = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Instagram', icon: Camera, url: '#' },
    { name: 'Twitter', icon: Send, url: '#' },
    { name: 'Facebook', icon: Globe, url: '#' }
  ];

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center text-white shadow-md">
                <Trophy size={18} />
              </div>
              <span className="text-lg font-black text-brand-dark tracking-tighter">GOLF<span className="text-brand-green">CHARITY</span></span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Empowering golfers to make a difference. Rolling handicap tracking, monthly prize draws, and direct charitable impact with every swing.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a 
                    key={social.name} 
                    href={social.url} 
                    className="p-2 bg-gray-50 text-gray-400 hover:text-brand-green rounded-xl transition-colors"
                    aria-label={social.name}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-brand-dark mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/explore" className="hover:text-brand-green transition-colors">Partner Charities</Link></li>
              <li><Link to="/membership" className="hover:text-brand-green transition-colors">Membership Plans</Link></li>
              <li><Link to="/draw" className="hover:text-brand-green transition-colors">Monthly Draws</Link></li>
              <li><Link to="/faq" className="hover:text-brand-green transition-colors">Common Questions</Link></li>
              {!user?.is_staff && (
                <li><Link to="/charity-registration" className="hover:text-brand-green transition-colors font-bold text-brand-green/80">Partner with Us</Link></li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-brand-dark mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/about" className="hover:text-brand-green transition-colors">Our Mission</Link></li>
              <li><Link to="/transparency" className="hover:text-brand-green transition-colors">Transparency Report</Link></li>
              <li><Link to="/contact" className="hover:text-brand-green transition-colors">Contact Support</Link></li>
              <li><Link to="/press" className="hover:text-brand-green transition-colors">Press Inquiries</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-brand-dark mb-6">Subscribe to Updates</h4>
            <p className="text-sm text-gray-500 mb-4">Get the latest draw results and impact reports delivered to your inbox.</p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="golf@example.com"
                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-green/30 transition-colors"
              />
              <button className="p-2 bg-brand-green text-white rounded-xl shadow-md hover:bg-brand-green/90 transition-colors">
                <Mail size={18} />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-medium uppercase tracking-widest">
          <p>© 2026 Golf Charity Platform. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/terms" className="hover:text-brand-dark transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-brand-dark transition-colors">Privacy Policy</Link>
            <Link to="/cookies" className="hover:text-brand-dark transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
