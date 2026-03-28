import { motion } from 'framer-motion';
import { Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ScoreCard = ({ id, score, submittedAt, isOldest }) => {
  const dateObj = new Date(submittedAt);
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-xl shadow p-4 text-center shrink-0 w-32 border-2 relative group ${isOldest ? 'border-brand-gold bg-brand-light opacity-80' : 'border-transparent bg-white'}`}
    >
      <Link 
        to={`/scores/edit/${id}`}
        className="absolute top-2 right-2 p-1 bg-white border border-gray-100 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:text-brand-green transition-all shadow-sm"
      >
        <Edit2 size={12} />
      </Link>
      <div className="text-sm text-gray-500 mb-1">{formattedDate}</div>
      <div className="text-3xl font-bold text-brand-green">{score}</div>
      {isOldest && <div className="text-xs text-brand-gold mt-1 font-semibold">Oldest</div>}
    </motion.div>
  );
};

export default ScoreCard;
