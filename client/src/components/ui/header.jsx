import { Bell, HelpCircle, Menu, Moon, Search, Settings, Sun, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useTheme } from "@/components/ui/theme-provider"
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
  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    navigate("/login")
  }

  // Obtener iniciales para el avatar
  const getInitials = () => {
    if (!user || !user.name) return "U"
    
    const nameParts = user.name.split(" ")
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`
    }
    return user.name.substring(0, 2).toUpperCase()
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
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start">
                <div className="font-medium">Stock bajo de alimento</div>
                <div className="text-sm text-muted-foreground">El alimento balanceado está por debajo del mínimo</div>
                <div className="text-xs text-muted-foreground mt-1">Hace 2 horas</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start">
                <div className="font-medium">Nueva venta registrada</div>
                <div className="text-sm text-muted-foreground">Se ha registrado una venta de leche</div>
                <div className="text-xs text-muted-foreground mt-1">Hace 5 horas</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start">
                <div className="font-medium">Vacunación programada</div>
                <div className="text-sm text-muted-foreground">Recordatorio de vacunación para mañana</div>
                <div className="text-xs text-muted-foreground mt-1">Hace 1 día</div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center cursor-pointer">Ver todas las notificaciones</DropdownMenuItem>
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
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user?.name || "Usuario"} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{user?.name || "Usuario"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Mi Cuenta</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

