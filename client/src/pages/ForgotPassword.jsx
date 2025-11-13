import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "react-router-dom"
import axios from "axios"
import api from "@/services/api"
import AuthLayout from "@/components/AuthLayout"
import AuthHeader from "@/components/AuthHeader"
import AuthCard from "@/components/AuthCard"

// Constante para la URL de la API


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // Validaciones básicas
      if (!email) {
        throw new Error("El correo electrónico es obligatorio")
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error("El formato del correo electrónico no es válido")
      }

      console.log("Enviando solicitud de recuperación de contraseña...")

      // Configurar la solicitud
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }

      // Enviar solicitud de recuperación
    const response = await api.post(`/forgot-password`, { email }, config)

      console.log("Respuesta del servidor:", {
        status: response.status,
        data: response.data
      })

      if (response.status === 200) {
        setSuccess("Se ha enviado un enlace de recuperación a tu correo electrónico.")
        setEmail("")
      } else {
        throw new Error("Respuesta inesperada del servidor")
      }

    } catch (error) {
      console.error("Error en la recuperación de contraseña:", error)
      
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          setError("No se puede conectar con el servidor. Verifica que el backend esté corriendo.")
        } else {
          switch (error.response.status) {
            case 404:
              setError("No se encontró una cuenta con ese correo electrónico.")
              break
            case 400:
              setError("Datos inválidos.")
              break
            case 500:
              setError("Error interno del servidor. Intenta más tarde.")
              break
            default:
              setError(error.response.data.message || "Error en la recuperación de contraseña")
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

  return (
    <AuthLayout>
       <AuthCard>
          <AuthHeader 
            title="Recuperar contraseña"
            subtitle="Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña."
          />
     
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

          <Button 
            type="submit" 
            disabled={isLoading || success} 
            className="w-full bg-[#1a2e02] text-white hover:bg-[#2a4a04]"
          >
            {isLoading ? "ENVIANDO..." : success ? "ENVIADO" : "ENVIAR ENLACE"}
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
