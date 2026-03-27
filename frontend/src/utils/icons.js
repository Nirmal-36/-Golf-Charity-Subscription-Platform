import { 
  Heart, 
  Trees, 
  GraduationCap, 
  Ambulance, 
  Users, 
  PawPrint, 
  Baby, 
  Trophy,
  Globe,
  Handshake,
  TrendingUp
} from 'lucide-react';

/**
 * Maps a charity category string to a Lucide icon component.
 * Provides a fallback if the category is unknown.
 */
export const getCategoryIcon = (category) => {
  const cat = category?.toLowerCase() || '';
  
  if (cat.includes('golf') || cat.includes('sport')) return Trophy;
  if (cat.includes('health') || cat.includes('medical') || cat.includes('doctor')) return Ambulance;
  if (cat.includes('environment') || cat.includes('nature') || cat.includes('green')) return Trees;
  if (cat.includes('education') || cat.includes('school') || cat.includes('learning')) return GraduationCap;
  if (cat.includes('animal') || cat.includes('pet') || cat.includes('wildlife')) return PawPrint;
  if (cat.includes('child') || cat.includes('youth')) return Baby;
  if (cat.includes('community') || cat.includes('social')) return Users;
  if (cat.includes('international') || cat.includes('world')) return Globe;
  if (cat.includes('disaster') || cat.includes('aid') || cat.includes('humanitarian')) return Handshake;
  if (cat.includes('impact')) return TrendingUp;
  
  return Heart; // Default fallback
};
