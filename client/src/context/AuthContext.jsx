import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, healthCheckAPI } from '../services/api';
import { registerSocketUser } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('mern_token'));
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  // Check backend server status
  const checkServerHealth = async () => {
    try {
      await healthCheckAPI();
      setServerStatus('online');
    } catch {
      setServerStatus('offline');
    }
  };

  // Check if user is logged in
  useEffect(() => {
    checkServerHealth();
    const interval = setInterval(checkServerHealth, 30000); // periodically ping

    const initAuth = async () => {
      const storedToken = localStorage.getItem('mern_token');
      const storedUser = localStorage.getItem('mern_user');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            registerSocketUser(parsed);
          } catch (e) {
            console.error('Erreur parsing user', e);
          }
        }
        try {
          const res = await authAPI.getProfile();
          setUser(res.data);
          registerSocketUser(res.data);
          localStorage.setItem('mern_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session non valide ou expirée', err.message);
          // Only logout if 401
          if (err.response && err.response.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
    return () => clearInterval(interval);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: jwtToken, ...userData } = res.data;
    setToken(jwtToken);
    setUser(userData);
    registerSocketUser(userData);
    localStorage.setItem('mern_token', jwtToken);
    localStorage.setItem('mern_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password, extraData = {}) => {
    const res = await authAPI.register({ name, email, password, ...extraData });
    const { token: jwtToken, ...userData } = res.data;

    // If account requires admin approval (pending status)
    if (userData.status === 'pending' || userData.isPendingApproval) {
      return userData;
    }

    if (jwtToken) {
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('mern_token', jwtToken);
      localStorage.setItem('mern_user', JSON.stringify(userData));
    }
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mern_token');
    localStorage.removeItem('mern_user');
  };

  const updateProfile = async (data) => {
    const res = await authAPI.updateProfile(data);
    const { token: jwtToken, ...userData } = res.data;
    if (jwtToken) {
      setToken(jwtToken);
      localStorage.setItem('mern_token', jwtToken);
    }
    setUser(userData);
    localStorage.setItem('mern_user', JSON.stringify(userData));
    return userData;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        serverStatus,
        checkServerHealth,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
