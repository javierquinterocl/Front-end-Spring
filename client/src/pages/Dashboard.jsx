import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSuppliers: 0,
    totalEmployees: 0,
    totalProducts: 0
  });

  useEffect(() => {
    // Aquí podrías cargar estadísticas reales desde tu API
    // Por ahora usaremos datos de ejemplo
    setStats({
      totalUsers: 25,
      totalSuppliers: 12,
      totalEmployees: 8,
      totalProducts: 34
    });
  }, []);

  return (
  <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1a2e02] mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Bienvenido al sistema de gestión Granme, {user?.firstName || 'Usuario'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Usuarios Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a2e02]">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">
              +3% que el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Proveedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a2e02]">{stats.totalSuppliers}</div>
            <p className="text-xs text-gray-500 mt-1">
              +2 nuevos esta semana
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Empleados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a2e02]">{stats.totalEmployees}</div>
            <p className="text-xs text-gray-500 mt-1">
              Total en planilla
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a2e02]">{stats.totalProducts}</div>
            <p className="text-xs text-gray-500 mt-1">
              En inventario actual
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Nueva venta registrada</p>
                  <p className="text-sm text-gray-500">Hace 3 horas</p>
                </div>
                <span className="text-sm bg-green-100 text-green-800 py-1 px-2 rounded-full">
                  Venta
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Ingreso de inventario</p>
                  <p className="text-sm text-gray-500">Hace 5 horas</p>
                </div>
                <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                  Inventario
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Nuevo usuario registrado</p>
                  <p className="text-sm text-gray-500">Hace 1 día</p>
                </div>
                <span className="text-sm bg-purple-100 text-purple-800 py-1 px-2 rounded-full">
                  Usuario
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Recordatorios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Vacunación programada</p>
                  <p className="text-sm text-gray-500">Mañana, 9:00 AM</p>
                </div>
                <span className="text-sm bg-yellow-100 text-yellow-800 py-1 px-2 rounded-full">
                  Urgente
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Pago a proveedor</p>
                  <p className="text-sm text-gray-500">En 3 días</p>
                </div>
                <span className="text-sm bg-orange-100 text-orange-800 py-1 px-2 rounded-full">
                  Pendiente
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Mantenimiento de equipos</p>
                  <p className="text-sm text-gray-500">En 7 días</p>
                </div>
                <span className="text-sm bg-gray-100 text-gray-800 py-1 px-2 rounded-full">
                  Programado
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}