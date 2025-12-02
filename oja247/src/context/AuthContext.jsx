import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set axios default header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Load user data
  const loadUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me');
      setUser(response.data.user);
      setBusiness(response.data.business);
    } catch (error) {
      console.error('Load user error:', error);
      logout(); // Clear invalid token
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (email, password, businessData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        email,
        password,
        businessData
      });

      const { token, user, business } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      setBusiness(business);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, business };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, user, business } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      setBusiness(business);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, business };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setBusiness(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('http://localhost:5000/api/auth/password', {
        currentPassword,
        newPassword
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password update failed'
      };
    }
  };

  const value = {
    user,
    business,
    token,
    loading,
    register,
    login,
    logout,
    updatePassword,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};