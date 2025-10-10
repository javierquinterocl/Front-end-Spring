import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = 'http://localhost:8080'; // Puerto por defecto de Spring Boot

// Crear instancia de axios con configuracion base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Aquí puedes agregar tokens de autenticacion si los tienes
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Enviando request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log('Respuesta recibida:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Error en response:', error.response?.status, error.response?.data);
    
    // Manejo de errores específicos
    if (error.response?.status === 401) {
      // Token expirado o no valido
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirigir al login si es necesario
    }
    
    return Promise.reject(error);
  }
);

// Servicios de la API
export const userService = {
  // Registrar usuario
  register: async (userData) => {
    
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todos los usuarios
   getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;
