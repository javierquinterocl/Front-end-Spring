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
      // Asegurarse que los campos coincidan exactamente con el modelo del backend
      const validatedData = {
        idCard: userData.idCard,
        code: userData.code,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email.toLowerCase(),
        phone: userData.phone || "", // Nota: phone no puede ser null según el modelo
        password: userData.password
      };
      
      // Endpoint para registro de usuarios
      const response = await api.post('/users', validatedData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 500 && error.response?.data?.message?.includes('llave duplicad')) {
        // Verificar qué campo está duplicado
        if (error.response.data.message.includes('email')) {
          throw new Error('El correo electrónico ya está registrado');
        } else if (error.response.data.message.includes('id_card')) {
          throw new Error('El número de documento ya está registrado');
        } else if (error.response.data.message.includes('code')) {
          throw new Error('El código de usuario ya está registrado');
        } else {
          throw new Error('Ya existe un usuario con algunos de los datos proporcionados');
        }
      }
      throw error;
    }
  },

  // Obtener todos los usuarios
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Obtener usuario por cedula
  getUserByIdCard: async (idCard) => {
    const response = await api.get(`/users/idcard/${idCard}`);
    return response.data;
  },

  // Obtener usuario por codigo
  getUserByCode: async (code) => {
    const response = await api.get(`/users/code/${code}`);
    return response.data;
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    // Asegurarnos de que phone sea string y no null según el modelo
    const updateData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email.toLowerCase(),
      phone: userData.phone || "", // phone no puede ser null
      // No incluir password en actualizaciones a menos que sea explícito
    };
    
    const response = await api.put(`/users/${id}`, updateData);
    return response.data;
  },

  // Actualizar contraseña
  updatePassword: async (id, passwordData) => {
    const response = await api.put(`/users/${id}/password`, {
      password: passwordData.password
    });
    return response.data;
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  
  // Login de usuario
  login: async (loginData) => {
    try {
      // Llamar al endpoint real del backend
      const response = await api.post('/users/login', {
        email: loginData.email.toLowerCase(),
        password: loginData.password
      });

      // El backend devuelve un UserResponse con los datos del usuario
      const userData = response.data;

      // Generar un token básico (mientras no hay JWT en el backend)
      const mockToken = "basic_token_" + Date.now();

      // Guardar el token y los datos del usuario
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('user', JSON.stringify(userData));

      return {
        token: mockToken,
        user: userData
      };
    } catch (error) {
      // Manejar errores de autenticación
      if (error.response?.status === 401 || error.response?.status === 404) {
        throw new Error('Credenciales inválidas');
      } else if (error.response?.status === 500) {
        throw new Error('Error en el servidor. Intente nuevamente');
      }
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }
};

export default api;
