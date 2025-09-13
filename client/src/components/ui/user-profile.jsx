import from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Mail, Phone, MapPin, Calendar, FileText, ShoppingBag, BarChart, Bell, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useToast } from "../../hooks/use-toast"
import { updateEmail, updateUserProfile, uploadProfileImage, getUserProfile } from "@/services/api"
import axios from "axios"

// Interface extendida para el estado userInfo

// Datos de ejemplo para el usuario
const userData = {
  id: "USR001",
  firstName: "Pedro",
  lastName: "Agropecuario",
  email: "pedro@caprisystem.com",
  phone: "555-123-4567",
  address: "Calle Principal 123, Ciudad",
  role: "Administrador",
  joinDate: "2020-05-15",
  lastLogin: "2023-04-15 08:30",
  avatar: "/placeholder.svg?height=128&width=128",
}

// Datos de ejemplo para actividad reciente
const recentActivity = [
  { id: 1, action: "Registro de nacimiento", entity: "CAP009", date: "2023-04-14 14:30" },
  { id: 2, action: "Actualización de inventario", entity: "INV005", date: "2023-04-13 10:15" },
  { id: 3, action: "Registro de venta", entity: "VEN012", date: "2023-04-12 16:45" },
  { id: 4, action: "Actualización de empleado", entity: "EMP003", date: "2023-04-10 09:20" },
  { id: 5, action: "Registro de vacunación", entity: "CAP005", date: "2023-04-08 11:30" },
]

// Datos de ejemplo para compras recientes
const recentPurchases = [
  { id: "PUR001", date: "2023-04-10", supplier: "Alimentos Naturales S.A.", items: 3, total: 450 },
  { id: "PUR002", date: "2023-03-28", supplier: "Medicamentos Veterinarios", items: 5, total: 320 },
  { id: "PUR003", date: "2023-03-15", supplier: "Forrajes del Valle", items: 2, total: 180 },
  { id: "PUR004", date: "2023-03-05", supplier: "Suplementos Minerales", items: 4, total: 275 },
  { id: "PUR005", date: "2023-02-20", supplier: "Equipos Agrícolas", items: 1, total: 1200 },
]

// Datos de ejemplo para estadísticas
const userStats = {
  registrosCreados: 128,
  ventasRealizadas: 45,
  comprasRealizadas: 32,
  reportesGenerados: 18,
  diasActivo: 245,
}

export function UserProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone,
  })
  
  // Estados para el cambio de correo electrónico
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [emailData, setEmailData] = useState({
    currentEmail: userData.email,
    newEmail: "",
    password: ""
  })

  // Estados para gestionar la imagen de perfil
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfoState>({
    ...userData,
    avatar: userData.avatar || ""
  })

  const { toast } = useToast()
  
  // Referencia para controlar si ya cargamos el perfil
  const profileLoadedRef = useRef(false);

  // Memoizar los datos de usuario para evitar renderizados innecesarios
  const userDisplayData = useMemo(() => {
    return {
      name: `${userInfo.firstName} ${userInfo.lastName}`,
      email: userInfo.email,
      phone: userInfo.phone || "No especificado",
      code: userInfo.code || userData.id,
      avatar: userInfo.avatar,
      joinDate: userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : userData.joinDate
    };
  }, [userInfo.firstName, userInfo.lastName, userInfo.email, userInfo.phone, userInfo.code, userInfo.avatar, userInfo.createdAt]);
  
  // Crear manejadores de eventos memorizados para evitar recreaciones en cada renderizado
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleAvatarClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Cargar datos del usuario desde localStorage y luego obtener perfil completo
  useEffect(() => {
    // Si ya cargamos el perfil, no hacerlo de nuevo
    if (profileLoadedRef.current) return;
    
    // Bandera para evitar cargas duplicadas
    let isMounted = true;
    
    const loadUserProfile = async () => {
      // Evitar múltiples cargas simultáneas
      if (isLoadingProfile) return;
      setIsLoadingProfile(true);
      
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          if (isMounted) {
            toast({
              title: "Error",
              description: "No se encontró información del usuario. Por favor inicia sesión nuevamente.",
              variant: "destructive",
            });
          }
          return;
        }
        
        const userData = JSON.parse(storedUser);
        if (!userData || !userData.id) {
          if (isMounted) {
            toast({
              title: "Error",
              description: "Datos de usuario incompletos. Por favor inicia sesión nuevamente.",
              variant: "destructive",
            });
          }
          return;
        }
        
        // Actualizar datos básicos desde localStorage primero
        if (userData.email && isMounted) {
          setEmailData(prev => ({ ...prev, currentEmail: userData.email }));
          setUserInfo(prev => ({ ...prev, email: userData.email }));
        }
        
        if (userData.name && isMounted) {
          // Dividir el nombre completo en nombre y apellido
          const nameParts = userData.name.split(' ');
          if (nameParts.length >= 2) {
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');
            
            if (isMounted) {
              setFormData(prev => ({
                ...prev,
                firstName,
                lastName
              }));
              
              setUserInfo(prev => ({
                ...prev,
                firstName,
                lastName
              }));
            }
          }
        }
        
        if (userData.avatar && isMounted) {
          setUserInfo(prev => ({ ...prev, avatar: userData.avatar }));
        }
        
        if (userData.phone && isMounted) {
          setFormData(prev => ({ ...prev, phone: userData.phone }));
          setUserInfo(prev => ({ ...prev, phone: userData.phone }));
        }
        
        // Obtener perfil completo desde la API
        try {
          if (isMounted) {
            setIsLoading(true);
          }
          
          const userId = userData.id;
          console.log("Obteniendo perfil completo del usuario:", userId);
          
          const profileData = await getUserProfile(userId);
          console.log("Perfil completo obtenido:", profileData);
          
          // Actualizar todos los datos con la información completa del perfil
          if (isMounted) {
            setFormData({
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              phone: profileData.phone || "",
            });
            
            setUserInfo(prev => ({
              ...prev,
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              phone: profileData.phone || "",
              email: profileData.email,
              avatar: profileData.avatar || prev.avatar,
              code: profileData.code,
              surname: profileData.surname,
              id: profileData.id.toString(),
              createdAt: profileData.createdAt
            }));
            
            setEmailData(prev => ({ 
              ...prev, 
              currentEmail: profileData.email 
            }));
            
            toast({
              title: "Perfil cargado",
              description: "Se ha cargado tu información de perfil correctamente.",
            });
            
            // Marcar que el perfil ya se cargó
            profileLoadedRef.current = true;
          }
        } catch (error) {
          console.error("Error al obtener perfil completo:", error);
          if (isMounted) {
            toast({
              title: "Advertencia",
              description: "No se pudo cargar el perfil completo. Se mostrarán datos básicos.",
              variant: "destructive",
            });
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos de usuario:', error);
        if (isMounted) {
          toast({
            title: "Error",
            description: "Ocurrió un error al cargar los datos del usuario.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };
    
    loadUserProfile();
    
    // Limpieza para evitar actualizaciones en componentes desmontados
    return () => {
      isMounted = false;
    };
  }, []); // Eliminar 'toast' de las dependencias

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validar que es una imagen
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive",
      });
      return;
    }
    
    // Validar tamaño (max 1MB - reducido de 2MB)
    if (file.size > 1 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no debe superar 1MB para evitar errores de servidor",
        variant: "destructive",
      });
      return;
    }

    // Mostrar vista previa
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    setIsUploadingImage(true);
    
    try {
      console.log(`Procesando imagen: ${file.name}, tipo: ${file.type}, tamaño: ${(file.size / 1024).toFixed(2)}KB`);
      
      // Comprimir imagen antes de convertirla a Base64
      const compressedImage = await compressImage(file);
      console.log(`Imagen comprimida tamaño: ${(compressedImage.size / 1024).toFixed(2)}KB`);
      
      // Convertir a Base64
      const base64Image = await uploadProfileImage(compressedImage);
      console.log(`Imagen convertida a Base64, longitud: ${base64Image.length} caracteres`);
      
      // Obtener ID del usuario desde localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('No se encontró información del usuario');
      }
      
      const userData = JSON.parse(storedUser);
      const userId = userData.id;
      console.log(`Actualizando perfil para usuario ID: ${userId}`);
      
      // Verificar si el userId es un número válido
      if (isNaN(Number(userId))) {
        console.error('ID de usuario inválido:', userId);
        throw new Error('ID de usuario inválido');
      }
      
      try {
        // Actualizar el perfil con la nueva imagen
        await updateUserProfile(userId, {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          phone: userInfo.phone,
          avatar: base64Image
        });
        
        // Actualizar estado local
        setUserInfo(prev => ({
          ...prev,
          avatar: base64Image
        }));
        
        toast({
          title: "Foto actualizada",
          description: "Tu foto de perfil ha sido actualizada correctamente y ya es visible en tu cuenta.",
        });
      } catch (updateError) {
        console.error('Error específico al llamar updateUserProfile:', updateError);
        
        if (axios.isAxiosError(updateError) && updateError.response) {
          console.error('Detalles del error del servidor:', {
            status: updateError.response.status,
            statusText: updateError.response.statusText,
            data: updateError.response.data
          });
          
          if (updateError.response.status === 500) {
            toast({
              title: "Error del servidor",
              description: "El servidor no pudo procesar la imagen. Intenta con una imagen más pequeña o de otro formato.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: updateError.response.data?.message || "Error al actualizar la imagen de perfil",
              variant: "destructive",
            });
          }
          return; // Evitar que se lance de nuevo
        }
        
        throw updateError; // Re-lanzar para el catch externo si no es un AxiosError
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      setPreviewImage(null); // Eliminar la vista previa si hay error
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al subir la imagen",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  }, [toast, userInfo.firstName, userInfo.lastName, userInfo.phone]);

  // Función para comprimir imagen (reducir calidad y tamaño)
  const compressImage = useCallback((file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // Calcular nuevas dimensiones (máximo 500px - reducido de 800px)
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 500;
          
          if (width > height && width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convertir a Blob con calidad reducida (0.6 = 60% de calidad - reducido de 0.7)
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Error al comprimir la imagen'));
                return;
              }
              
              // Crear un nuevo archivo con el blob comprimido
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              console.log(`Imagen comprimida: Original ${(file.size / 1024).toFixed(2)}KB -> Comprimida ${(compressedFile.size / 1024).toFixed(2)}KB`);
              
              resolve(compressedFile);
            },
            'image/jpeg',
            0.6 // Calidad de compresión (0-1)
          );
        };
        
        img.onerror = () => {
          reject(new Error('Error al cargar la imagen para compresión'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo para compresión'));
      };
    });
  }, []);

  // Memoizar handleSaveProfile para evitar recreaciones innecesarias
  const handleSaveProfile = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Validar datos
      if (!formData.firstName || !formData.lastName) {
        toast({
          title: "Error",
          description: "El nombre y apellido son obligatorios",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Obtener ID del usuario desde localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('No se encontró información del usuario');
      }
      
      const userData = JSON.parse(storedUser);
      const userId = userData.id;
      
      console.log("Actualizando perfil con datos:", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });
      
      // Llamar a la API para actualizar el perfil
      await updateUserProfile(userId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });
      
      // Actualizar estado local
      setUserInfo(prev => ({
        ...prev,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      }));
      
      setIsEditing(false);
      
      toast({
        title: "Perfil actualizado",
        description: "Tu información personal ha sido actualizada correctamente.",
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar perfil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData.firstName, formData.lastName, formData.phone, toast]);

  // En el evento de cambiar email, usar userDisplayData.email
  const handleUpdateEmail = useCallback(async () => {
    if (!emailData.newEmail) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nuevo correo electrónico.",
        variant: "destructive",
      });
      return;
    }

    if (!emailData.password) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu contraseña para confirmar el cambio.",
        variant: "destructive",
      });
      return;
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.newEmail)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un correo electrónico válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Obtener ID del usuario desde localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('No se encontró información del usuario');
      }
      
      const userData = JSON.parse(storedUser);
      const userId = userData.id;

      // Llamar a la API para actualizar el correo
      await updateEmail(
        userId,
        userDisplayData.email,  // Usar userDisplayData.email en lugar de emailData.currentEmail
        emailData.newEmail,
        emailData.password
      );

      // Actualizar el estado local
      setUserInfo(prev => ({ ...prev, email: emailData.newEmail }));
      setEmailData(prev => ({ 
        ...prev, 
        currentEmail: emailData.newEmail,
        newEmail: "",
        password: ""
      }));
      
      setIsChangingEmail(false);
      
      toast({
        title: "Correo actualizado",
        description: "Tu correo electrónico ha sido actualizado correctamente.",
      });
    } catch (error) {
      console.error('Error al actualizar correo:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar correo electrónico",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [emailData.newEmail, emailData.password, toast, userDisplayData.email]);
  
  // Función memoizada para caneclar la edición del correo
  const handleCancelEmailChange = useCallback(() => {
    setIsChangingEmail(false);
    setEmailData({
      currentEmail: userDisplayData.email,
      newEmail: "",
      password: ""
    });
  }, [userDisplayData.email]);

  // Función para eliminar foto de perfil
  const handleRemoveAvatar = useCallback(async () => {
    if (!userDisplayData.avatar && !previewImage) return;

    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar tu foto de perfil?");
    if (!confirmDelete) return;

    setIsUploadingImage(true);
    
    try {
      // Obtener ID del usuario desde localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('No se encontró información del usuario');
      }
      
      const userData = JSON.parse(storedUser);
      const userId = userData.id;
      
      // Actualizar el perfil eliminando la imagen
      await updateUserProfile(userId, {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        phone: userInfo.phone,
        avatar // Cambiar null a undefined para cumplir con el tipo esperado
      });
      
      // Actualizar estado local
      setUserInfo(prev => ({
        ...prev,
        avatar
      }));
      
      // Limpiar vista previa
      setPreviewImage(null);
      
      toast({
        title: "Foto eliminada",
        description: "Tu foto de perfil ha sido eliminada correctamente.",
      });
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar la imagen",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  }, [toast, userDisplayData.avatar, previewImage, userInfo.firstName, userInfo.lastName, userInfo.phone]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Mi Cuenta</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel lateral con información básica */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <Avatar className="h-40 w-40 border-2 border-secondary shadow-md">
                    {previewImage ? (
                      <AvatarImage src={previewImage} alt={userDisplayData.name} />
                    ) : userDisplayData.avatar ? (
                      <AvatarImage src={userDisplayData.avatar} alt={userDisplayData.name} />
                    ) : (
                      <AvatarFallback className="text-4xl bg-gradient-to-r from-green-100 to-green-200 text-green-800">
                        {userInfo.firstName?.[0]}
                        {userInfo.lastName?.[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  {/* Overlay de carga */}
                  {isUploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                      <Loader2 className="h-10 w-10 animate-spin text-white" />
                    </div>
                  )}
                  
                  {/* Input oculto para la selección de archivos */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                </div>
                <CardTitle className="text-xl">
                  {userDisplayData.name}
                </CardTitle>
                <CardDescription>{userDisplayData.email}</CardDescription>
                <Badge className="mt-2">{userData.role}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground text-center mb-2">
                  Utiliza el botón de abajo para cambiar tu foto de perfil.
                  <br />Tamaño máximo: 2MB.
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{userDisplayData.phone}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{userData.address}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Miembro desde: {userDisplayData.joinDate}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Último acceso: {userData.lastLogin}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleAvatarClick}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  "Cambiar Foto"
                )}
              </Button>
              
              {(userDisplayData.avatar || previewImage) && (
                <Button 
                  variant="outline" 
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleRemoveAvatar}
                  disabled={isUploadingImage}
                >
                  Eliminar Foto
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    Registros Creados
                  </span>
                  <Badge variant="secondary">{userStats.registrosCreados}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2 text-muted-foreground" />
                    Ventas Realizadas
                  </span>
                  <Badge variant="secondary">{userStats.ventasRealizadas}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2 text-muted-foreground" />
                    Compras Realizadas
                  </span>
                  <Badge variant="secondary">{userStats.comprasRealizadas}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-muted-foreground" />
                    Reportes Generados
                  </span>
                  <Badge variant="secondary">{userStats.reportesGenerados}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    Días Activo
                  </span>
                  <Badge variant="secondary">{userStats.diasActivo}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal con pestañas */}
        <div className="md:col-span-2">
          <Tabs defaultValue="activity" className="space-y-4">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="activity">Actividad</TabsTrigger>
              <TabsTrigger value="purchases">Compras</TabsTrigger>
              <TabsTrigger value="security">Seguridad</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
            </TabsList>

            {/* Pestaña de Actividad Reciente */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Historial de tus acciones recientes en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Acción</TableHead>
                        <TableHead>Entidad</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentActivity.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">{activity.action}</TableCell>
                          <TableCell>{activity.entity}</TableCell>
                          <TableCell>{activity.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Ver Más Antiguas</Button>
                  <Button variant="outline">Exportar Historial</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Actividad</CardTitle>
                  <CardDescription>Resumen de tu actividad en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <FileText className="h-8 w-8 mb-2 text-[#6b7c45]" />
                      <span className="text-2xl font-bold">{userStats.registrosCreados}</span>
                      <span className="text-sm text-muted-foreground">Registros</span>
                    </div>
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <ShoppingBag className="h-8 w-8 mb-2 text-[#6b7c45]" />
                      <span className="text-2xl font-bold">
                        {userStats.ventasRealizadas + userStats.comprasRealizadas}
                      </span>
                      <span className="text-sm text-muted-foreground">Transacciones</span>
                    </div>
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <BarChart className="h-8 w-8 mb-2 text-[#6b7c45]" />
                      <span className="text-2xl font-bold">{userStats.reportesGenerados}</span>
                      <span className="text-sm text-muted-foreground">Reportes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pestaña de Compras */}
            <TabsContent value="purchases" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Compras Recientes</CardTitle>
                  <CardDescription>Historial de tus compras recientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Artículos</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentPurchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell className="font-medium">{purchase.id}</TableCell>
                          <TableCell>{purchase.date}</TableCell>
                          <TableCell>{purchase.supplier}</TableCell>
                          <TableCell>{purchase.items}</TableCell>
                          <TableCell>${purchase.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Ver Historial Completo</Button>
                  <Button variant="outline">Exportar a PDF</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Compras</CardTitle>
                  <CardDescription>Resumen de tus compras por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Alimentos</span>
                        <span>$1,250</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full">
                        <div className="bg-[#6b7c45] h-2 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Medicamentos</span>
                        <span>$850</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full">
                        <div className="bg-[#6b7c45] h-2 rounded-full" style={{ width: "30%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Equipos</span>
                        <span>$1,500</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full">
                        <div className="bg-[#6b7c45] h-2 rounded-full" style={{ width: "55%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Suplementos</span>
                        <span>$450</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full">
                        <div className="bg-[#6b7c45] h-2 rounded-full" style={{ width: "15%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Otros</span>
                        <span>$350</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full">
                        <div className="bg-[#6b7c45] h-2 rounded-full" style={{ width: "10%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full flex justify-between">
                    <span className="font-medium">Total Gastado:</span>
                    <span className="font-bold">$4,400</span>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Pestaña de Seguridad */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cambiar Correo Electrónico</CardTitle>
                  <CardDescription>
                    Actualiza tu dirección de correo electrónico
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isChangingEmail ? (
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="currentEmail">Correo Electrónico Actual</Label>
                        <Input 
                          id="currentEmail" 
                          name="currentEmail" 
                          type="email" 
                          value={emailData.currentEmail} 
                          disabled 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="newEmail">Nuevo Correo Electrónico</Label>
                        <Input
                          id="newEmail"
                          name="newEmail"
                          type="email"
                          value={emailData.newEmail}
                          onChange={handleEmailChange}
                          placeholder="nuevo@correo.com"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="emailPassword">Contraseña para confirmar</Label>
                        <Input
                          id="emailPassword"
                          name="password"
                          type="password"
                          value={emailData.password}
                          onChange={handleEmailChange}
                          placeholder="Ingresa tu contraseña actual"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Correo Electrónico</p>
                          <p className="text-sm text-muted-foreground">{userDisplayData.email}</p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => setIsChangingEmail(true)}>
                        Cambiar
                      </Button>
                    </div>
                  )}
                </CardContent>
                {isChangingEmail && (
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={handleCancelEmailChange}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleUpdateEmail}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Actualizando...
                        </>
                      ) : (
                        "Actualizar Correo"
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            {/* Pestaña de Configuración */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>Actualiza tu información personal</CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="firstName">Nombre</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="lastName">Apellido</Label>
                          <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Nombre</Label>
                          <p>{userInfo.firstName}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Apellido</Label>
                          <p>{userInfo.lastName}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Correo Electrónico</Label>
                        <p>{userDisplayData.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Para cambiar el correo, ve a la pestaña de Seguridad
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Teléfono</Label>
                        <p>{userInfo.phone || "No especificado"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">ID de Usuario</Label>
                        <p>{userDisplayData.code}</p>
                        <p className="text-xs text-muted-foreground mt-1">Este código no se puede modificar</p>
                      </div>
                      <Button variant="outline" className="mt-2" onClick={() => setIsEditing(true)}>
                        Editar Datos Personales
                      </Button>
                    </div>
                  )}
                </CardContent>
                {isEditing && (
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setFormData({
                          firstName: userInfo.firstName,
                          lastName: userInfo.lastName,
                          phone: userInfo.phone || "",
                        })
                      }}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Guardando...
                        </>
                      ) : (
                        "Guardar Cambios"
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preferencias de Notificaciones</CardTitle>
                  <CardDescription>Configura cómo quieres recibir notificaciones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Notificaciones por correo</p>
                        <p className="text-sm text-muted-foreground">Recibe notificaciones por correo electrónico</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Alertas del sistema</p>
                        <p className="text-sm text-muted-foreground">Recibe alertas importantes del sistema</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Reportes semanales</p>
                        <p className="text-sm text-muted-foreground">Recibe resúmenes semanales de actividad</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

