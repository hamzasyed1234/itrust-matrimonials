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
      console.log('🔍 Token found in localStorage, fetching profile...'); // DEBUG LOG
      fetchUserProfile();
    } else {
      console.log('⚠️ No token found in localStorage'); // DEBUG LOG
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log('📡 Fetching user profile from /profile...'); // DEBUG LOG
      const response = await api.get('/profile');
      console.log('✅ Profile fetched successfully:', response.data.user.email); // DEBUG LOG
      setUser(response.data.user);
    } catch (error) {
      console.error('❌ Error fetching user profile:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        fullError: error
      });
      
      // Only clear token if it's actually invalid (401/403)
      // Don't clear on network errors (500, timeout, etc.)
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('🚪 Token invalid (401/403), clearing localStorage and logging out');
        localStorage.removeItem('token');
        setUser(null);
      } else if (!error.response) {
        // Network error - keep token for retry
        console.log('⚠️ Network error, keeping token for potential retry');
        console.log('💡 This might be a temporary connection issue');
      } else {
        // Other server error (500, etc.) - keep token
        console.log('⚠️ Server error, keeping token');
      }
    } finally {
      setLoading(false);
      console.log('🏁 Auth loading complete'); // DEBUG LOG
    }
  };

  const login = (token, userData) => {
    console.log('🔐 Logging in user:', userData.email); // DEBUG LOG
    localStorage.setItem('token', token);
    setUser({
      ...userData,
      isAdmin: userData.isAdmin || false
    });
    setLoading(false);
  };

  const logout = () => {
    console.log('🚪 Logging out user'); // DEBUG LOG
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    console.log('🔄 Updating user data'); // DEBUG LOG
    setUser(updatedUserData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};