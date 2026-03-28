import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Identity & Access Management: AuthContext
 * Centralized state orchestrator for user authentication, persistent 
 * session hydration, and role-based security throughout the platform.
 */
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Session Hydration: checkUser
   * Validates existing JWT access tokens and synchronizes the local 
   * state with the latest backend profile data.
   */
  const checkUser = async () => {
    try {
      if (localStorage.getItem('access_token')) {
        const res = await api.get('/api/auth/me/');
        setUser(res.data);
      }
    } catch (error) {
      console.error("Auth Notification: Session restoration failed or expired.");
      setUser(null);
    } finally {
      // Transition out of initial boot state once identity is determined
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  /**
   * Authentication Flow: login
   * Verifies credentials against the central identity provider.
   * Persists JWT pairs in secure local storage for session continuity.
   */
  const login = async (email, password) => {
    const res = await api.post('/api/auth/login/', { email, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    setUser(res.data.user);
    return res.data;
  };

  /**
   * Onboarding: register
   * Facilitates account creation for standard Members.
   */
  const register = async (userData) => {
    const res = await api.post('/api/auth/register/', userData);
    return res.data;
  };

  /**
   * Onboarding: registerOrganization
   * Facilitates multi-layer registration for verified Charity Partners.
   */
  const registerOrganization = async (orgData) => {
    const res = await api.post('/api/auth/register/organization/', orgData);
    return res.data;
  };

  /**
   * Security Protocol: logout
   * Terminates the active session by purging sensitive tokens and 
   * resetting the global identity state.
   */
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, registerOrganization, logout, checkUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
