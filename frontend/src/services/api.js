import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Brand API calls
export const brandAPI = {
  getAll: () => api.get('/brands'),
  getById: (id) => api.get(`/brands/${id}`),
  create: (name) => api.post('/brands', { name }),
  update: (id, name) => api.put(`/brands/${id}`, { name }),
  delete: (id) => api.delete(`/brands/${id}`),
};

// Domain API calls
export const domainAPI = {
  add: (brandId, domain) => api.post(`/brands/${brandId}/domains`, { domain }),
  delete: (domainId) => api.delete(`/domains/${domainId}`),
};

// Search API calls
export const searchAPI = {
  searchBrand: (brandId) => api.post(`/search/${brandId}`),
};

export default api;
