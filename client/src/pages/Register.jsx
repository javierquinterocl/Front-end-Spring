import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import axios from "axios"
import AuthLayout from "@/components/AuthLayout"
import AuthHeader from "@/components/AuthHeader"
import AuthCard from "@/components/AuthCard"

// Constante para la URL de la API
const API_URL = "http://localhost:4000/api"

export default function RegisterPage() {
  const [cedula, setCedula] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [surname, setSurname] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Formulario enviado - Iniciando proceso de registro directo")
    
    // Limpiar estado anterior
    setError("")
    setIsLoading(true)
    
    try {
      // Validaciones básicas
      if (!cedula || !firstName || !lastName || !surname || !email || !password || !confirmPassword) {
        throw new Error("Todos los campos son obligatorios excepto teléfono")
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error("El formato del correo electrónico no es válido")
      }
      
      // Validar longitud de contraseña
      if (password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres")
      }
      
      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        throw new Error("Las contraseñas no coinciden")
      }
      
      // Preparar datos exactamente como en el script de prueba exitoso
      const userData = {
        code: cedula,
        first_name: firstName,
        last_name: lastName,
        surname,
        phone: phone || "",
        email,
        password
      }
      
      console.log("Datos preparados para enviar al backend:", {
        ...userData,
        password: "******"
      })
      
      // Configurar la solicitud con headers explícitos
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
      
      // Conexión directa con el backend, como en el script de prueba
      console.log("Enviando solicitud POST directamente a:", `${API_URL}/register`)
      const response = await axios.post(`${API_URL}/register`, userData, config)
      
      console.log("Respuesta del servidor:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      })
      
      // Verificar respuesta exitosa
      if (response.status === 201) {
        console.log("¡Registro exitoso!")
        setRegistrationSuccess(true)
        
        // Limpiar el formulario
        setCedula("")
        setFirstName("")
        setLastName("")
        setSurname("")
        setPhone("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        
        // Almacenar el indicador de registro exitoso
        localStorage.setItem("registered", "true")
        
        // Redirigir después de mostrar el mensaje
        setTimeout(() => {
          console.log("Redirigiendo a login...")
          navigate("/login?registered=true")
        }, 2000)
      } else {
        console.warn("Respuesta inesperada del servidor:", response)
        throw new Error("Respuesta inesperada del servidor")
      }
      
    } catch (error) {
      console.error("Error en el proceso de registro:", error)
      
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          console.error("No hay respuesta del servidor - Verifica que el backend esté corriendo")
          setError("No se puede conectar con el servidor. Verifica que el backend esté corriendo.")
        } else {
          console.error("Detalles del error del servidor:", {
            status: error.response.status,
            data: error.response.data
          })
          
          // Mensajes de error específicos
          switch (error.response.status) {
            case 400:
              setError("Datos de registro inválidos. Por favor verifica la información.")
              break
            case 409:
              setError("El usuario ya existe. Por favor intenta con otro correo electrónico.")
              break
            case 500:
              setError("Error interno del servidor. Por favor intenta más tarde.")
              break
            default:
              setError(error.response.data.message || "Error en el registro")
          }
        }
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Ha ocurrido un error inesperado durante el registro")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader 
          title="Crear una cuenta" 
          subtitle="Completa los datos para registrarte en Granme"
        />

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        {registrationSuccess && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              ¡Registro exitoso! Redirigiendo a la página de inicio de sesión...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="cedula" className="text-sm font-semibold text-[#1a2e02] mb-2 block">
              Cédula
            </Label>
            <Input
              id="cedula"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="Ingrese su cédula"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c45] focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primer-nombre" className="text-sm font-semibold text-[#1a2e02] mb-2 block">
                Primer nombre
              </Label>
              <Input
                id="primer-nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Primer nombre"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c45] focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            <div>
              <Label htmlFor="segundo-nombre" className="text-sm font-semibold text-[#1a2e02] mb-2 block">
                Segundo nombre
              </Label>
              <Input
                id="segundo-nombre"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Segundo nombre"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c45] focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="apellido" className="text-sm font-semibold text-[#1a2e02] mb-2 block">
              Apellido
            </Label>
            <Input
              id="apellido"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Ingrese su apellido"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c45] focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <Label htmlFor="telefono" className="text-sm font-semibold text-[#1a2e02] mb-2 block">
              Teléfono <span className="text-gray-500 font-normal">(opcional)</span>
            </Label>
            <Input
              id="telefono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ingrese su teléfono"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c45] focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-semibold text-[#1a2e02] mb-2 block">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingrese su correo electrónico"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c45] focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-semibold text-[#1a2e02] mb-2 block">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c45] focus:border-transparent transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-[#1a2e02] mb-2 block">
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme su contraseña"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c45] focus:border-transparent transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || registrationSuccess} 
            className="w-full bg-[#6b7c45] hover:bg-[#5a6b35] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isLoading ? "REGISTRANDO..." : registrationSuccess ? "REGISTRO EXITOSO" : "REGISTRARSE"}
          </Button>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#4a5c2a]">¿Ya tienes cuenta? </span>
            <Link to="/login" className="font-semibold text-[#6b7c45] hover:text-[#5a6b35] hover:underline transition-colors">
              Ingresa acá
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}

