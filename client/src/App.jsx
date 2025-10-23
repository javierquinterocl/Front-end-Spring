import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import ForgotPasswordPage from './pages/ForgotPassword'
import ResetPasswordPage from './pages/ResetPassword'
import { ThemeProvider } from './components/ui/theme-provider'
import UsersListPage from './pages/UsersList'
import ProductsListPage from './pages/ProductsList'
import SuppliersListPage from './pages/SupplierList'
import Dashboard from './pages/Dashboard'
import { Toaster } from './components/ui/toaster'
import { ProtectedRoute } from './components/ui/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          
          {/* Rutas protegidas dentro del layout principal */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UsersListPage />} />
            <Route path="/products" element={<ProductsListPage />} />
            <Route path="/suppliers" element={<SuppliersListPage/>} />
            <Route path="/profile" element={<div>Perfil del Usuario</div>} />
            <Route path="/suppliers" element={<div>Gestión de Proveedores</div>} />
            <Route path="/employees" element={<div>Gestión de Empleados</div>} />
            <Route path="/inventory" element={<div>Gestión de Inventario</div>} />
        
          </Route>
          
          {/* Redirigir cualquier ruta desconocida a dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App