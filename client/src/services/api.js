import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://primer-parcial-spring-production.up.railway.app';

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
    // Rutas públicas que no requieren autenticación (ruta + método HTTP)
    const publicEndpoints = [
      { url: '/users/login', method: 'POST' },   // Login
      { url: '/users', method: 'POST' }          // Registro
    ];
    
    // Verificar si es una ruta pública (comparar URL y método)
    const isPublicRoute = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint.url) && config.method?.toUpperCase() === endpoint.method
    );
    
    // Solo agregar token si NO es una ruta pública
    if (!isPublicRoute) {
      const token = localStorage.getItem('authToken');
      console.log(`Request to ${config.url}: Token present:`, !!token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`Added Authorization header for ${config.url}`);
      } else {
        console.warn(`No token found for ${config.url}`);
      }
    } else {
      console.log(`Public route ${config.url}, no token needed`);
    }
    
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
        password: userData.password,
        role: userData.role || "PRACTICANTE" // Valor por defecto si no se especifica
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

      // El backend devuelve AuthenticationResponse { token: string, user: UserResponse }
      const { token, user } = response.data;

      // Guardar el token JWT y los datos del usuario
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        token: token,
        user: user
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
  },

  // Logout de usuario (invalidar token en el servidor)
  logout: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Llamar al backend para invalidar el token
        await api.post('/users/logout');
      }
    } catch (error) {
      // Si hay error al invalidar en el servidor, continuar con logout local
      console.error('Error al invalidar token en el servidor:', error);
    } finally {
      // Siempre limpiar el localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }
};

// Servicios de la API para Productos
export const productService = {
  // Crear producto
  createProduct: async (productData) => {
    try {
      
      const validatedData = {
        productId: productData.productId,
        name: productData.name,
        description: productData.description || "",
        unitPrice: productData.unitPrice,
        stock: productData.stock,
        productType: productData.productType,
        supplierId: productData.supplierId
      };
      
      // Endpoint para crear producto
      const response = await api.post('/products', validatedData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 500 && error.response?.data?.message?.includes('llave duplicad')) {
       
        if (error.response.data.message.includes('product_id')) {
          throw new Error('El ID del producto ya está registrado');
        } else if (error.response.data.message.includes('name')) {
          throw new Error('El nombre del producto ya está registrado');
        } else {
          throw new Error('Ya existe un producto con algunos de los datos proporcionados');
        }
      }
      throw error;
    }
  },

  // Obtener todos los productos
  getAllProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  // Obtener producto por ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Actualizar producto
  updateProduct: async (id, productData) => {
    const updateData = {
      productId: productData.productId,
      name: productData.name,
      description: productData.description || "",
      unitPrice: productData.unitPrice,
      stock: productData.stock,
      productType: productData.productType,
      supplierId: productData.supplierId
    };
    
    const response = await api.put(`/products/${id}`, updateData);
    return response.data;
  },

  // Eliminar producto
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};
// ############### Servicios de la API para Proveedores ##############################
export const supplierService = {
  // Crear proveedor
  createSupplier: async (supplierData) => {
    try {
      const validatedData = {
        supplierId: supplierData.supplierId,
        name: supplierData.name,
        phone: supplierData.phone,
        email: supplierData.email,
        cityId: supplierData.cityId,
        stateId: supplierData.stateId,
        countryId: supplierData.countryId,
        nit: supplierData.nit,
        address: supplierData.address || ""
      };

      // Endpoint para crear proveedor
      const response = await api.post('/suppliers', validatedData);
      return response.data;
    } catch (error) {
      if (
        error.response?.status === 500 &&
        error.response?.data?.message?.includes('llave duplicada')
      ) {
        if (error.response.data.message.includes('supplier_id')) {
          throw new Error('El ID del proveedor ya está registrado');
        } else if (error.response.data.message.includes('email')) {
          throw new Error('El correo electrónico ya está registrado');
        } else if (error.response.data.message.includes('nit')) {
          throw new Error('El NIT ya está registrado');
        } else {
          throw new Error('Ya existe un proveedor con algunos de los datos proporcionados');
        }
      }
      throw error;
    }
  },

  // Obtener todos los proveedores
  getAllSuppliers: async () => {
    const response = await api.get('/suppliers');
    return response.data;
  },

  // Obtener proveedor por ID
  getSupplierById: async (id) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  // Actualizar proveedor
  updateSupplier: async (id, supplierData) => {
    const updateData = {
      supplierId: supplierData.supplierId,
      name: supplierData.name,
      phone: supplierData.phone,
      email: supplierData.email,
      cityId: supplierData.cityId,
      stateId: supplierData.stateId,
      countryId: supplierData.countryId,
      nit: supplierData.nit,
      address: supplierData.address || ""
    };

    const response = await api.put(`/suppliers/${id}`, updateData);
    return response.data;
  },

  // Eliminar proveedor
  deleteSupplier: async (id) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  }
};

// ############### Servicios de la API para Cabras (Goats) ##############################
export const goatService = {
  // Crear cabra
  createGoat: async (goatData) => {
    try {
      const validatedData = {
        goatId: goatData.goatId,
        name: goatData.name,
        breed: goatData.breed,
        birthDate: goatData.birthDate,
        gender: goatData.gender,
        goatType: goatData.goatType || "LEVANTE",
        weight: goatData.weight || 0,
        milkProduction: goatData.milkProduction || 0,
        foodConsumption: goatData.foodConsumption || 0,
        vaccinationsCount: goatData.vaccinationsCount || 0,
        heatPeriods: goatData.heatPeriods || 0,
        offspringCount: goatData.offspringCount || 0,
        parentId: goatData.parentId || null,
        status: goatData.status || "ACTIVE",
        notes: goatData.notes || ""
      };

      // Endpoint para crear cabra
      const response = await api.post('/goats', validatedData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 500 && error.response?.data?.message?.includes('llave duplicada')) {
        if (error.response.data.message.includes('goat_id')) {
          throw new Error('El ID de la cabra ya está registrado');
        } else {
          throw new Error('Ya existe una cabra con algunos de los datos proporcionados');
        }
      }
      throw error;
    }
  },

  // Obtener todas las cabras
  getAllGoats: async () => {
    const response = await api.get('/goats');
    return response.data;
  },

  // Obtener cabra por ID
  getGoatById: async (id) => {
    const response = await api.get(`/goats/${id}`);
    return response.data;
  },

  // Actualizar cabra
  updateGoat: async (id, goatData) => {
    const updateData = {
      goatId: goatData.goatId,
      name: goatData.name,
      breed: goatData.breed,
      birthDate: goatData.birthDate,
      gender: goatData.gender,
      goatType: goatData.goatType || "LEVANTE",
      weight: goatData.weight || 0,
      milkProduction: goatData.milkProduction || 0,
      foodConsumption: goatData.foodConsumption || 0,
      vaccinationsCount: goatData.vaccinationsCount || 0,
      heatPeriods: goatData.heatPeriods || 0,
      offspringCount: goatData.offspringCount || 0,
      parentId: goatData.parentId || null,
      status: goatData.status || "ACTIVE",
      notes: goatData.notes || ""
    };

    const response = await api.put(`/goats/${id}`, updateData);
    return response.data;
  },

  // Eliminar cabra
  deleteGoat: async (id) => {
    const response = await api.delete(`/goats/${id}`);
    return response.data;
  }
};

// ############### Servicios de la API para Salidas de Productos ##############################
export const productOutputService = {
  // Crear salida de producto
  createProductOutput: async (outputData) => {
    try {
      const validatedData = {
        userId: outputData.userId,
        productId: outputData.productId,
        quantity: outputData.quantity,
        notes: outputData.notes || ""
      };

      // Endpoint para crear salida de producto
      const response = await api.post('/product-outputs', validatedData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Datos inválidos');
      } else if (error.response?.status === 404) {
        throw new Error('Producto o usuario no encontrado');
      }
      throw error;
    }
  },

  // Obtener todas las salidas de productos
  getAllProductOutputs: async () => {
    const response = await api.get('/product-outputs');
    return response.data;
  },

  // Obtener salida de producto por ID
  getProductOutputById: async (id) => {
    const response = await api.get(`/product-outputs/${id}`);
    return response.data;
  },

  // Obtener salidas por producto
  getOutputsByProduct: async (productId) => {
    const response = await api.get(`/product-outputs/product/${productId}`);
    return response.data;
  },

  // Obtener salidas por usuario
  getOutputsByUser: async (userId) => {
    const response = await api.get(`/product-outputs/user/${userId}`);
    return response.data;
  },

  // Actualizar salida de producto
  updateProductOutput: async (id, outputData) => {
    const updateData = {
      userId: outputData.userId,
      productId: outputData.productId,
      quantity: outputData.quantity,
      notes: outputData.notes || ""
    };

    const response = await api.put(`/product-outputs/${id}`, updateData);
    return response.data;
  },

  // Eliminar salida de producto
  deleteProductOutput: async (id) => {
    const response = await api.delete(`/product-outputs/${id}`);
    return response.data;
  }
};

export default api;
