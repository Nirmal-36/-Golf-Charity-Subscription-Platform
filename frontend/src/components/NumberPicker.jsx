import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NumberPicker = ({ selectedNumbers, onToggle }) => {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-6">
      {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => {
        const isSelected = selectedNumbers.includes(num);
        return (
          <motion.button
            key={num}
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggle(num)}
            className={`w-10 h-10 rounded-full font-bold transition-colors flex items-center justify-center ${
              isSelected
                ? 'bg-brand-gold text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {num}
          </motion.button>
        );
      })}
    </div>
  );
};

export default NumberPicker;
