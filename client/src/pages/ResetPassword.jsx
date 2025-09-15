import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useParams, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import axios from "axios"
import AuthLayout from "@/components/AuthLayout"
import AuthHeader from "@/components/AuthHeader"
import AuthCard from "@/components/AuthCard"

// Constante para la URL de la API
const API_URL = "http://localhost:4000/api"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)

  const { token } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar si el token es válido
    if (token) {
      setTokenValid(true)
    } else {
      setError("Token de recuperación inválido o faltante.")
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // Validaciones básicas
      if (!password || !confirmPassword) {
        throw new Error("Todos los campos son obligatorios")
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres")
      }

      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        throw new Error("Las contraseñas no coinciden")
      }

      console.log("Restableciendo contraseña...")

      // Configurar la solicitud
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }

      // Enviar solicitud de restablecimiento
      const response = await axios.post(`${API_URL}/reset-password`, {
        token,
        password
      }, config)

      console.log("Respuesta del servidor:", {
        status: response.status,
        data: response.data
      })

      if (response.status === 200) {
        setSuccess("Contraseña restablecida exitosamente. Redirigiendo al login...")
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      } else {
        throw new Error("Respuesta inesperada del servidor")
      }

    } catch (error) {
      console.error("Error en el restablecimiento de contraseña:", error)
      
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          setError("No se puede conectar con el servidor. Verifica que el backend esté corriendo.")
        } else {
          switch (error.response.status) {
            case 400:
              setError("Token inválido o expirado.")
              break
            case 404:
              setError("Token no encontrado o ya utilizado.")
              break
            case 500:
              setError("Error interno del servidor. Intenta más tarde.")
              break
            default:
              setError(error.response.data.message || "Error en el restablecimiento de contraseña")
          }
        }
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Ha ocurrido un error inesperado")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!tokenValid) {
    return (
      <AuthLayout>
        <AuthHeader 
          title="Token inválido"
          subtitle="El enlace de recuperación no es válido o ha expirado."
        />
        
        <AuthCard>
          <div className="text-center">
            <Link to="/forgot-password" className="font-medium text-[#6b7c45] hover:underline">
              Solicitar nuevo enlace
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthHeader 
        title="Restablecer contraseña"
        subtitle="Ingresa tu nueva contraseña."
      />
      
      <AuthCard>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-500">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-[#1a2e02]">
              Nueva contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su nueva contraseña"
                className="mt-1 bg-[#1a2e02] text-white placeholder:text-gray-400 focus-visible:ring-[#6b7c45]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#1a2e02]">
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme su nueva contraseña"
                className="mt-1 bg-[#1a2e02] text-white placeholder:text-gray-400 focus-visible:ring-[#6b7c45]"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || success} 
            className="w-full bg-[#1a2e02] text-white hover:bg-[#2a4a04]"
          >
            {isLoading ? "RESTABLECIENDO..." : success ? "RESTABLECIDA" : "RESTABLECER CONTRASEÑA"}
          </Button>

          <div className="mt-4 text-center text-sm">
            <Link to="/login" className="font-medium text-[#6b7c45] hover:underline">
              ← Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
