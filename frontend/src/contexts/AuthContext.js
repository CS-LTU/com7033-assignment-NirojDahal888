import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://127.0.0.1:8000/api';

  const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true, // Send cookies
  });

  // Helper: Get current logged-in user
  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/current_user');
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (username, password) => {
    try {
      await api.post('/auth/register', { username, password });
      await checkAuth();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Register failed' };
    }
  };

  // Login
  const login = async (username, password) => {
    try {
      await api.post('/auth/login', { username, password });
      await checkAuth();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  useEffect(() => { checkAuth(); }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
