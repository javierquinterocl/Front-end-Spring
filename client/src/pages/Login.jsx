import { useState, useEffect } from "react"
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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [registeredMessage, setRegisteredMessage] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    // Verificar si el usuario viene del registro exitoso
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('registered') === 'true') {
      setRegisteredMessage("¡Registro exitoso! Ahora puedes iniciar sesión.")
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Validaciones básicas
      if (!email || !password) {
        throw new Error("Todos los campos son obligatorios")
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error("El formato del correo electrónico no es válido")
      }

      // Preparar datos para el login
      const loginData = {
        email,
        password
      }

      console.log("Iniciando sesión...")

      // Configurar la solicitud
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }

      // Enviar solicitud de login
      const response = await axios.post(`${API_URL}/login`, loginData, config)

      console.log("Respuesta del servidor:", {
        status: response.status,
        data: response.data
      })

      if (response.status === 200) {
        console.log("¡Login exitoso!")
        
        // Guardar token en localStorage
        if (response.data.token) {
          localStorage.setItem('token', response.data.token)
        }

        // Limpiar el formulario
        setEmail("")
        setPassword("")
        
        // Redirigir al dashboard o página principal
        navigate("/dashboard")
      } else {
        throw new Error("Respuesta inesperada del servidor")
      }

    } catch (error) {
      console.error("Error en el login:", error)
      
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          setError("No se puede conectar con el servidor. Verifica que el backend esté corriendo.")
        } else {
          switch (error.response.status) {
            case 401:
              setError("Credenciales inválidas. Verifica tu email y contraseña.")
              break
            case 400:
              setError("Datos de login inválidos.")
              break
            case 500:
              setError("Error interno del servidor. Intenta más tarde.")
              break
            default:
              setError(error.response.data.message || "Error en el login")
          }
        }
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Ha ocurrido un error inesperado durante el login")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader 
          title="Iniciar sesión" 
          subtitle="Ingresa tus credenciales para acceder a Granme"
        />

        {registeredMessage && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {registeredMessage}
            </div>
          </div>
        )}

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

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-[#6b7c45] hover:bg-[#5a6b35] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isLoading ? "INICIANDO SESIÓN..." : "INICIAR SESIÓN"}
          </Button>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#4a5c2a]">¿No tienes cuenta? </span>
            <Link to="/register" className="font-semibold text-[#6b7c45] hover:text-[#5a6b35] hover:underline transition-colors">
              Regístrate acá
            </Link>
          </div>

          <div className="mt-3 text-center text-sm">
            <Link to="/forgot-password" className="font-semibold text-[#6b7c45] hover:text-[#5a6b35] hover:underline transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
