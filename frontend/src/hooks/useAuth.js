import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Consumer Hook: useAuth
 * Provides a streamlined interface for components to access the 
 * global authentication state and identity actions.
 * @returns {Object} The AuthContext value suite.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Infrastructure Alert: useAuth must be consumed within an AuthProvider subtree.');
  }
  return context;
};
