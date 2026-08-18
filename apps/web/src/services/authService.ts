import API from './api';

export const login = async (username, password) => {
  const response = await API.post('/auth/login', { username, password });
  const result = response.data.data;
  if (result && result.token) {
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
  }
  return result;
};

export const register = async (username, password, role = 'user', name, email, category) => {
  const response = await API.post('/auth/register', { username, password, role, name, email, category });
  return response.data.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getProfile = async () => {
  const response = await API.get('/auth/me');
  return response.data.data.user;
};

export const updateProfile = async (profileData) => {
  const response = await API.put('/auth/profile', profileData);
  const result = response.data.data;
  localStorage.setItem('user', JSON.stringify(result));
  return result;
};

export const updatePassword = async (passwordData) => {
  const response = await API.put('/auth/password', passwordData);
  return response.data;
};
