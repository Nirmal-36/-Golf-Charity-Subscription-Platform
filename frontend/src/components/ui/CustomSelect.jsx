import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select an option", 
  label,
  name,
  required = false,
  error = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
          {label} {required && <span className="text-brand-green">*</span>}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-gray-50 border-2 transition-all rounded-2xl p-4 font-bold text-left flex items-center justify-between outline-none ${
          isOpen ? 'border-brand-green bg-white shadow-lg' : 'border-transparent hover:bg-gray-100'
        } ${error ? 'border-red-400' : ''}`}
      >
        <span className={selectedOption ? 'text-brand-dark' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={20} className="text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-[100] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto">
              {options.length > 0 ? (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full text-left p-4 font-bold transition-colors hover:bg-brand-light flex items-center justify-between group ${
                      value === option.value ? 'bg-brand-green/5 text-brand-green' : 'text-gray-600'
                    }`}
                  >
                    {option.label}
                    {value === option.value && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-brand-green"
                      />
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-gray-400 text-center font-medium">No options available</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {error && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{error}</p>}
    </div>
  );
};

export default CustomSelect;
