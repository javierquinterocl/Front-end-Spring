import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import AuthLayout from "@/components/AuthLayout"
import AuthHeader from "@/components/AuthHeader"
import AuthCard from "@/components/AuthCard"
import { useAuth } from "@/context/AuthContext"


export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [idCardValue, setIdCardValue] = useState("")
  const [code, setCode] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("")
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
      // Validaciones básicas - todos los campos son obligatorios según el modelo
      if (!idCardValue || !code || !firstName || !lastName || !phone || !email || !password || !confirmPassword || !role) {
        throw new Error("Todos los campos son obligatorios")
      }
      
      // Validar formato de cédula 
      if (idCardValue.length < 6 || idCardValue.length > 20) {
        throw new Error("La cédula debe tener entre 6 y 20 caracteres")
      }
      
      // Validar código
      if (code.length < 3 || code.length > 10) {
        throw new Error("El código debe tener entre 3 y 10 caracteres")
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
      
      // Validar teléfono (obligatorio según el modelo)
      if (!phone || !/^[+]?[0-9]{10,15}$/.test(phone)) {
        throw new Error("El formato del teléfono no es válido (debe tener entre 10 y 15 dígitos)")
      }
      
      // Preparar datos según la estructura exacta del modelo backend
      const userData = {
        idCard: idCardValue,
        code: code,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone || "", 
        email: email.toLowerCase().trim(),
        password: password,
        role: role
      }
      
      console.log("Datos preparados para enviar al backend:", {
        ...userData,
        password: "******"
      })
      
      
      console.log("Enviando solicitud de registro...")
      const response = await registerUser(userData)
      
      console.log("Respuesta del servidor:", response)
      
     
      console.log("¡Registro exitoso!")
      setRegistrationSuccess(true)
      
      // Limpiar el formulario
      setIdCardValue("")
      setCode("")
      setFirstName("")
      setLastName("")
      setPhone("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setRole("")
      
      // Almacenar el indicador de registro exitoso
      localStorage.setItem("registered", "true")
      
      // Redirigir después de mostrar el mensaje
      setTimeout(() => {
        console.log("Redirigiendo a login...")
        // Limpiar cualquier estado de autenticación antes de redirigir
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate("/login?registered=true", { replace: true })
      }, 2000)
      
    } catch (error) {
      console.error("Error en el proceso de registro:", error)
      
      // Usar el mensaje de error mejorado del servicio
      if (error.message) {
        setError(error.message);
      } else if (error?.response) {
        console.error("Detalles del error del servidor:", {
          status: error.response.status,
          data: error.response.data
        });
        setError("Error al registrar usuario. Intenta nuevamente.");
      } else {
        setError("No se pudo conectar con el servidor. Verifica tu conexión.");
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
            <Label htmlFor="idCard" className="text-sm font-semibold text-[#1a2e02] mb-2 block">
              Cédula / Documento de Identidad
            </Label>
            <Input
              id="idCard"
              value={idCardValue}
              onChange={(e) => setIdCardValue(e.target.value)}
              placeholder="Ingrese su número de cédula"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c45] focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <Label htmlFor="code" className="text-sm font-semibold text-[#1a2e02] mb-2 block">
              Código de Usuario
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ingrese un código único (3-10 caracteres)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c45] focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-semibold text-[#1a2e02] mb-2 block">
                Nombres
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ingrese sus nombres"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c45] focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-semibold text-[#1a2e02] mb-2 block">
                Apellidos
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ingrese sus apellidos"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c45] focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="telefono" className="text-sm font-semibold text-[#1a2e02] mb-2 block">
              Teléfono
            </Label>
            <Input
              id="telefono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ingrese su teléfono (obligatorio)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c45] focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <Label htmlFor="role" className="text-sm font-semibold text-[#1a2e02] mb-2 block">
              Tipo de Usuario
            </Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7c45] focus:border-transparent transition-all duration-200">
                <SelectValue placeholder="Seleccione el tipo de usuario" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ADMIN" className="cursor-pointer hover:bg-gray-100">
                  Administrador
                </SelectItem>
                <SelectItem value="PRACTICANTE" className="cursor-pointer hover:bg-gray-100">
                  Practicante
                </SelectItem>
              </SelectContent>
            </Select>
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

