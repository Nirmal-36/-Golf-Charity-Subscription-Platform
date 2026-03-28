import React from 'react';
// import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { resolveImageUrl } from '../utils/image';
import { getCategoryIcon } from '../utils/icons';
import { Link } from 'react-router-dom';

const CharityCard = ({ charity, onSelect, isSelected }) => {
  const isSelectionMode = !!onSelect;

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`relative bg-white rounded-xl shadow overflow-hidden transition-all border-2 flex flex-col h-full ${
        isSelected ? 'border-brand-green' : 'border-transparent hover:border-gray-200'
      } ${isSelectionMode ? 'cursor-pointer' : ''}`}
      onClick={() => isSelectionMode && onSelect(charity.id)}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 text-brand-green z-10">
          <CheckCircle2 size={24} className="fill-white" />
        </div>
      )}
      
      <div className="h-32 bg-gray-50 flex items-center justify-center p-4">
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
      
      <div className="p-4 flex flex-col flex-1">
        <div className="text-[10px] font-black text-brand-gold uppercase tracking-widest mb-1">
          {charity.category}
        </div>
        <h3 className="font-bold text-brand-dark mb-2 line-clamp-1" title={charity.name}>
          {charity.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-1">
          {charity.description}
        </p>
        
        <div className="pt-4 border-t border-gray-100 mt-auto space-y-2">
          <Link 
            to={`/charity/${charity.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full py-3 bg-brand-light text-brand-green rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-green hover:text-white transition group"
          >
            View Profile <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          {isSelectionMode && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(charity.id); }}
              className={`w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition ${
                isSelected
                  ? 'bg-brand-green text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-brand-green/10 hover:text-brand-green'
              }`}
            >
              {isSelected ? <><CheckCircle2 size={12} /> Selected</> : 'Select This Charity'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CharityCard;
