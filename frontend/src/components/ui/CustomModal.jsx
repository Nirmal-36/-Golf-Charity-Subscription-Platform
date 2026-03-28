import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, HelpCircle } from 'lucide-react';

const CustomModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  onConfirm, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "confirm", // 'confirm', 'alert', 'prompt'
  inputValue = "",
  onInputChange,
  inputPlaceholder = "",
  children
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden p-8"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-brand-dark transition"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                type === 'confirm' ? 'bg-brand-green/10 text-brand-green' : 
                type === 'prompt' ? 'bg-brand-gold/10 text-brand-gold' : 'bg-red-50 text-red-500'
              }`}>
                {type === 'confirm' ? <HelpCircle size={32} /> : <AlertCircle size={32} />}
              </div>

              <div>
                <h3 className="text-2xl font-black text-brand-dark mb-2 tracking-tight">{title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{message}</p>
              </div>

              {children}

              {type === 'prompt' && !children && (
                <div className="w-full">
                  <input 
                    type="text"
                    autoFocus
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green/20 focus:bg-white rounded-2xl p-4 outline-none transition font-bold"
                    placeholder={inputPlaceholder}
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-3 w-full pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-4 rounded-2xl font-black transition shadow-xl ${
                    type === 'confirm' ? 'bg-brand-green text-white shadow-brand-green/20' : 
                    type === 'prompt' ? 'bg-brand-dark text-white shadow-brand-dark/20' : 'bg-brand-green text-white shadow-brand-green/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CustomModal;
