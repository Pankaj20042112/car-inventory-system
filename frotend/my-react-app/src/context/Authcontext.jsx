import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, login, logout, register, getProfile } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Call database to verify user existence and token validity
          const verifiedUser = await getProfile();
          setUser(verifiedUser);
          localStorage.setItem('user', JSON.stringify(verifiedUser));
        } catch (error) {
          // If user is not found in database or token is invalid
          logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const loginUser = async (username, password) => {
    const data = await login(username, password);
    setUser(data.user);
    return data.user;
  };

  const registerUser = async (username, password, role, name, email, category) => {
    return await register(username, password, role, name, email, category);
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
