import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { resolveImageUrl } from '../utils/image';
import { getCategoryIcon } from '../utils/icons';

const CharityCard = ({ charity, onSelect, isSelected }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`relative bg-white rounded-xl shadow overflow-hidden cursor-pointer border-2 transition-colors ${
        isSelected ? 'border-brand-green' : 'border-transparent hover:border-gray-200'
      }`}
      onClick={() => onSelect(charity.id)}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 text-brand-green">
          <CheckCircle2 size={24} className="fill-white" />
        </div>
      )}
      
      <div className="h-32 bg-gray-100 flex items-center justify-center p-4">
        {charity.logo_image || charity.logo_url ? (
          <img 
            src={resolveImageUrl(charity.logo_image || charity.logo_url)} 
            alt={charity.name} 
            className="max-h-full object-contain mix-blend-multiply" 
          />
        ) : (
          (() => {
            const Icon = getCategoryIcon(charity.category);
            return (
              <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                <Icon size={32} strokeWidth={1.5} />
              </div>
            );
          })()
        )}
      </div>
      
      <div className="p-4">
        <div className="text-xs font-semibold text-brand-gold uppercase tracking-wider mb-1">
          {charity.category}
        </div>
        <h3 className="font-bold text-brand-dark mb-2 line-clamp-1" title={charity.name}>
          {charity.name}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
          {charity.description}
        </p>
        
        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
          <span className="text-gray-500">Total Donated</span>
          <span className="font-semibold text-brand-green">${charity.total_received}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CharityCard;
