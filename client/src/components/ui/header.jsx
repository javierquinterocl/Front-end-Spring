import { Bell, HelpCircle, Menu, Moon, Search, Settings, Sun, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useTheme } from "@/components/ui/theme-provider"
import { useAuth } from "@/context/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Link, useNavigate } from "react-router-dom"

export function Header({ toggleSidebar }) {
  const { setTheme, theme } = useTheme()
  const { logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)

    // Obtener los datos del usuario desde localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error al parsear los datos del usuario:", error)
      }
    }
  }, [])

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await logout() // Usar la función logout del AuthContext
      navigate("/login", { replace: true })
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // Forzar limpieza y redirección aunque haya error
      localStorage.removeItem("user")
      localStorage.removeItem("authToken")
      navigate("/login", { replace: true })
    }
  }

  // Obtener iniciales para el avatar
  const getInitials = () => {
    if (!user) return "U"
    
    // Intentar con firstName y lastName
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    
    // Intentar con fisrtName (typo del backend)
    if (user.fisrtName && user.lastName) {
      return `${user.fisrtName[0]}${user.lastName[0]}`.toUpperCase()
    }
    
    // Intentar con name
    if (user.name) {
      const nameParts = user.name.split(" ")
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      }
      return user.name.substring(0, 2).toUpperCase()
    }
    
    // Usar email como fallback
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    
    return "U"
  }

  // Obtener nombre completo del usuario
  const getFullName = () => {
    if (!user) return "Usuario"
    
    // Intentar con firstName y lastName
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    
    // Intentar con fisrtName (typo del backend)
    if (user.fisrtName && user.lastName) {
      return `${user.fisrtName} ${user.lastName}`
    }
    
    // Intentar con name
    if (user.name) {
      return user.name
    }
    
    // Usar email como fallback
    if (user.email) {
      return user.email.split('@')[0]
    }
    
    return "Usuario"
  }

  return (
    <header className="bg-[#6b7c45] text-white px-4 py-3 sticky top-0 z-50 shadow-md">
      <div className="w-full max-w-[1400px] mx-auto flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-[#5a6a3a] hover:text-white"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Menú</span>
          </Button>
          <div className="md:hidden">
            <h1 className="text-xl font-bold">Granme</h1>
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold">Sistema de Gestión Granme</h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/70" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-8 w-[200px] bg-[#5a6a3a] border-[#5a6a3a] text-white placeholder:text-white/70 focus-visible:ring-white"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-white hover:bg-[#5a6a3a] hover:text-white">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                  3
                </Badge>
                <span className="sr-only">Notificaciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px] bg-white">
              <DropdownMenuLabel className="text-gray-900">Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start focus:bg-gray-100">
                <div className="font-medium text-gray-900">Stock bajo de alimento</div>
                <div className="text-sm text-gray-600">El alimento balanceado está por debajo del mínimo</div>
                <div className="text-xs text-gray-500 mt-1">Hace 2 horas</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start focus:bg-gray-100">
                <div className="font-medium text-gray-900">Nueva venta registrada</div>
                <div className="text-sm text-gray-600">Se ha registrado una venta de leche</div>
                <div className="text-xs text-gray-500 mt-1">Hace 5 horas</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start focus:bg-gray-100">
                <div className="font-medium text-gray-900">Vacunación programada</div>
                <div className="text-sm text-gray-600">Recordatorio de vacunación para mañana</div>
                <div className="text-xs text-gray-500 mt-1">Hace 1 día</div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center cursor-pointer text-gray-900 justify-center focus:bg-gray-100">
                Ver todas las notificaciones
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="text-white hover:bg-[#5a6a3a] hover:text-white">
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Ayuda</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-[#5a6a3a] hover:text-white"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Cambiar tema</span>
          </Button>

          <Button variant="ghost" size="icon" className="text-white hover:bg-[#5a6a3a] hover:text-white">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Configuración</span>
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative flex items-center gap-2 text-white hover:bg-[#5a6a3a] hover:text-white"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt={getFullName()} />
                <AvatarFallback className="bg-[#5a6a3a] text-white">{getInitials()}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{getFullName()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuLabel className="text-gray-900">Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="focus:bg-gray-100">
              <Link to="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Mi Cuenta</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-gray-100">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="focus:bg-gray-100 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

