import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay un usuario autenticado al cargar la aplicación
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error('Error parseando datos de usuario:', parseError);
            // Limpiar datos corruptos
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error verificando estado de autenticación:', error);
        // Limpiar datos corruptos
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Funcion para registrar un usuario
  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      
      const registrationData = {
        idCard: userData.idCard?.trim(),
        code: userData.code?.trim(),
        firstName: userData.firstName?.trim(),
        lastName: userData.lastName?.trim(),
        email: userData.email?.toLowerCase().trim(),
        phone: userData.phone?.trim() || "", 
        password: userData.password
      };
      
      const response = await userService.register(registrationData);
      
      console.log('Usuario registrado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Funcion para hacer login
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      // Usar el servicio real de API para login
      const response = await userService.login({
        email: credentials.email.toLowerCase(),
        password: credentials.password
      });
      
      // Guardar token y datos de usuario
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
        
        console.log('Login exitoso', response.user);
        
        
        
      } else {
        throw new Error('No se recibió un token de autenticación válido');
      }
      
      return response;
    } catch (error) {
      console.error('Error en login:', error);
      
      // Manejar errores específicos
      if (error.response?.status === 401) {
        throw new Error('Credenciales incorrectas');
      } else if (error.response?.status === 403) {
        throw new Error('No tiene permisos para acceder al sistema');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para hacer logout
  const logout = async () => {
    try {
      // Invalidar token en el servidor
      await userService.logout();
    } catch (error) {
      console.error('Error durante el logout:', error);
    } finally {
      // Limpiar estado local siempre
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Funcion para actualizar datos del usuario
  const updateUser = async (userId, userData) => {
    try {
      setIsLoading(true);
      
      // Validar y limpiar datos de actualización
      const updateData = {
        firstName: userData.firstName?.trim(),
        lastName: userData.lastName?.trim(),
        email: userData.email?.toLowerCase().trim(),
        phone: userData.phone?.trim() || "" 
      };
      
      const response = await userService.updateUser(userId, updateData);
      
      // Actualizar el usuario en el estado local
      if (user && user.id === userId) {
        const updatedUser = { ...user, ...response };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  
  const getAllUsers = useCallback(async () => {
    try {
      
      const response = await userService.getAllUsers();
      return response;
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }, []);

  // Funciones adicionales para validaciones
  const checkEmailAvailability = async (email) => {
    try {
      return await userService.checkEmailAvailability(email);
    } catch (error) {
      console.error('Error verificando disponibilidad de email:', error);
      throw error;
    }
  };

  const checkCodeAvailability = async (code) => {
    try {
      return await userService.checkCodeAvailability(code);
    } catch (error) {
      console.error('Error verificando disponibilidad de código:', error);
      throw error;
    }
  };

  const checkIdCardAvailability = async (idCard) => {
    try {
      return await userService.checkIdCardAvailability(idCard);
    } catch (error) {
      console.error('Error verificando disponibilidad de cédula:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    register,
    login,
    logout,
    updateUser,
    getAllUsers,
    checkEmailAvailability,
    checkCodeAvailability,
    checkIdCardAvailability,
    setUser,
    setIsAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

