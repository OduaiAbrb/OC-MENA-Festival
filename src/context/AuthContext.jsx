/**
 * Auth Context for managing user authentication state
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = api.getUser();
    if (storedUser && api.isAuthenticated()) {
      setUser(storedUser);
      // Refresh user data
      api.getProfile().then(data => {
        if (data?.success) {
          setUser(data.data);
          api.setUser(data.data);
        }
      }).catch(() => {
        // Token expired
        api.clearTokens();
        setUser(null);
      });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    if (data?.success) {
      setUser(data.data.user);
    }
    return data;
  };

  const register = async (email, password, confirmPassword, fullName, phone) => {
    const data = await api.register(email, password, confirmPassword, fullName, phone);
    if (data?.success) {
      setUser(data.data.user);
    }
    return data;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    api.setUser(userData);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
