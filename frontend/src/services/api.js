import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@finance:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Se erro 401 (Unauthorized), fazer logout
    if (error.response?.status === 401) {
      localStorage.removeItem('@finance:token');
      localStorage.removeItem('@finance:user');
      
      // Recarregar a página para mostrar tela de login
      window.location.reload();
    }
    
    return Promise.reject(error);
  }
);

export const expenseService = {
  async getAll(filters = {}) {
    const response = await api.get('/expenses', { params: filters });
    return response.data;
  },
  
  async getById(id) {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },
  
  async create(data) {
    const response = await api.post('/expenses', data);
    return response.data;
  },
  
  async update(id, data) {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },
  
  async delete(id) {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
  
  async getTotalByMonth(mes, ano) {
    const response = await api.get(`/expenses/totals/${mes}/${ano}`);
    return response.data;
  },
  
  async getByCategory(mes, ano, situacao = null) {
    const params = situacao ? { situacao } : {};
    const response = await api.get(`/expenses/categories/${mes}/${ano}`, { params });
    return response.data;
  },
  
  async getAllGrouped(filters = {}) {
    const response = await api.get('/expenses/grouped', { params: filters });
    return response.data;
  }
};

export const incomeService = {
  async getAll(filters = {}) {
    const response = await api.get('/incomes', { params: filters });
    return response.data;
  },
  
  async getById(id) {
    const response = await api.get(`/incomes/${id}`);
    return response.data;
  },
  
  async create(data) {
    const response = await api.post('/incomes', data);
    return response.data;
  },
  
  async update(id, data) {
    const response = await api.put(`/incomes/${id}`, data);
    return response.data;
  },
  
  async delete(id) {
    const response = await api.delete(`/incomes/${id}`);
    return response.data;
  },
  
  async getTotalByMonth(mes, ano) {
    const response = await api.get(`/incomes/totals/${mes}/${ano}`);
    return response.data;
  },
  
  async getByCategory(mes, ano, situacao = null) {
    const params = situacao ? { situacao } : {};
    const response = await api.get(`/incomes/categories/${mes}/${ano}`, { params });
    return response.data;
  }
};

export const categoryService = {
  async getAll(filters = {}) {
    const response = await api.get('/categories', { params: filters });
    return response.data;
  },
  
  async getById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  
  async create(data) {
    const response = await api.post('/categories', data);
    return response.data;
  },
  
  async update(id, data) {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  
  async delete(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
  
  async toggleActive(id) {
    const response = await api.patch(`/categories/${id}/toggle-active`);
    return response.data;
  }
};

export const creditCardService = {
  async getAll(filters = {}) {
    const response = await api.get('/credit-cards', { params: filters });
    return response.data;
  },
  
  async getById(id) {
    const response = await api.get(`/credit-cards/${id}`);
    return response.data;
  },
  
  async create(data) {
    const response = await api.post('/credit-cards', data);
    return response.data;
  },
  
  async update(id, data) {
    const response = await api.put(`/credit-cards/${id}`, data);
    return response.data;
  },
  
  async delete(id) {
    const response = await api.delete(`/credit-cards/${id}`);
    return response.data;
  },
  
  async toggleActive(id) {
    const response = await api.patch(`/credit-cards/${id}/toggle-active`);
    return response.data;
  }
};

export default api;