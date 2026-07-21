import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, login, logout, register } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const loginUser = async (username, password) => {
    const data = await login(username, password);
    setUser(data.user);
    return data.user;
  };

  const registerUser = async (username, password, role) => {
    return await register(username, password, role);
  };

  const logoutUser = () => {
    logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
