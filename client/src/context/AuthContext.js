import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/profile');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // ✅ CRITICAL FIX: Clear invalid token and user state
      localStorage.removeItem('token');
      setUser(null);
      
      // ✅ ADDED: Redirect to login if on a protected page
      const protectedRoutes = ['/home', '/browse', '/matches', '/feedback', '/admin'];
      const currentPath = window.location.pathname;
      
      if (protectedRoutes.includes(currentPath)) {
        window.location.href = '/';
      }
    } finally {
      // ✅ CRITICAL FIX: Always set loading to false
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser({
      ...userData,
      isAdmin: userData.isAdmin || false
    });
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};