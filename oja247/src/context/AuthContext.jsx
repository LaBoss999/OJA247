import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../services/api';

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

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/me');
      setUser(response.data.user);
      setBusiness(response.data.business);
    } catch (error) {
      console.error('Load user error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, businessData, referralCodeUsed = null) => {
    try {
      const response = await axiosInstance.post('/api/auth/register', {
        email,
        password,
        businessData,
        referralCodeUsed
      });

      const { token, user, business } = response.data;

      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      setBusiness(business);

      return { success: true, business };
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      const backendDetails = error.response?.data?.details;

      return {
        success: false,
        message: backendMessage || backendDetails || error.message || 'Registration failed'
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', {
        email,
        password
      });

      // Admin accounts route through TOTP before a real session starts —
      // no token yet, just a short-lived preAuthToken the caller uses to
      // finish setup or submit a code (see LoginPage.jsx).
      if (response.data.requiresTotpSetup || response.data.requiresTotpCode) {
        return {
          success: true,
          requiresTotpSetup: response.data.requiresTotpSetup || false,
          requiresTotpCode: response.data.requiresTotpCode || false,
          preAuthToken: response.data.preAuthToken
        };
      }

      const { token, user, business } = response.data;

      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      setBusiness(business);

      return { success: true, user, business };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // Fetches the QR code for an admin setting up TOTP for the first time.
  // Uses preAuthToken explicitly, not the (nonexistent yet) session token.
  const getTotpSetupQr = async (preAuthToken) => {
    try {
      const response = await axiosInstance.post(
        '/api/auth/totp/setup-init',
        {},
        { headers: { Authorization: `Bearer ${preAuthToken}` } }
      );
      return { success: true, ...response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Could not load 2FA setup' };
    }
  };

  // Confirms TOTP setup with a code from the authenticator app — on
  // success this is what actually completes login and issues a real token.
  const completeTotpSetup = async (preAuthToken, code) => {
    try {
      const response = await axiosInstance.post(
        '/api/auth/totp/setup-verify',
        { code },
        { headers: { Authorization: `Bearer ${preAuthToken}` } }
      );
      const { token, user, business } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      setBusiness(business);
      return { success: true, user, business };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Invalid code' };
    }
  };

  // Normal-login TOTP step for an admin who already has 2FA enabled.
  const verifyTotpLogin = async (preAuthToken, code) => {
    try {
      const response = await axiosInstance.post(
        '/api/auth/totp/verify',
        { code },
        { headers: { Authorization: `Bearer ${preAuthToken}` } }
      );
      const { token, user, business } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      setBusiness(business);
      return { success: true, user, business };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Invalid code' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setBusiness(null);
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await axiosInstance.put('/api/auth/password', {
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
    getTotpSetupQr,
    completeTotpSetup,
    verifyTotpLogin,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};