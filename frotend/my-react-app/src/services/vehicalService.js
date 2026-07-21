import API from './api';

export const getVehicles = async () => {
  const response = await API.get('/vehicles');
  return response.data;
};

export const searchVehicles = async (filters) => {
  const params = new URLSearchParams();
  if (filters.make) params.append('make', filters.make);
  if (filters.model) params.append('model', filters.model);
  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

  const response = await API.get(`/vehicles/search?${params.toString()}`);
  return response.data;
};

export const addVehicle = async (vehicleData) => {
  const response = await API.post('/vehicles', vehicleData);
  return response.data;
};

export const updateVehicle = async (id, vehicleData) => {
  const response = await API.put(`/vehicles/${id}`, vehicleData);
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await API.delete(`/vehicles/${id}`);
  return response.data;
};

export const purchaseVehicle = async (id) => {
  const response = await API.post(`/vehicles/${id}/purchase`);
  return response.data;
};

export const restockVehicle = async (id, quantity) => {
  const response = await API.post(`/vehicles/${id}/restock`, { quantity });
  return response.data;
};
