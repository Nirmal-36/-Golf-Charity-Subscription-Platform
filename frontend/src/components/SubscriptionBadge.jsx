import React from 'react';
import { motion } from 'framer-motion';

const SubscriptionBadge = ({ status }) => {
  const config = {
    active: { 
      label: 'Active Member', 
      classes: 'bg-green-100 text-green-700 border-green-200',
      dot: 'bg-green-500'
    },
    cancelled: { 
      label: 'Membership Ending', 
      classes: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      dot: 'bg-yellow-500'
    },
    lapsed: { 
      label: 'Lapsed Account', 
      classes: 'bg-red-100 text-red-700 border-red-200',
      dot: 'bg-red-500'
    }
  };

  const current = config[status] || config.lapsed;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${current.classes}`}
    >
      <span className={`w-2 h-2 rounded-full ${current.dot} animate-pulse`}></span>
      {current.label}
    </motion.div>
  );
};

export default SubscriptionBadge;
