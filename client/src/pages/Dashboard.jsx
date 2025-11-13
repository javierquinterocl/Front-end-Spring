import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { userService, supplierService, productService, goatService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSuppliers: 0,
    totalGoats: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        
        // Cargar todas las estadísticas en paralelo
        const [users, suppliers, goats, products] = await Promise.all([
          userService.getAllUsers().catch((err) => {
            console.log('Error loading users:', err);
            return [];
          }),
          supplierService.getAllSuppliers().catch((err) => {
            console.log('Error loading suppliers:', err);
            return [];
          }),
          goatService.getAllGoats().catch((err) => {
            console.log('Error loading goats:', err);
            return [];
          }),
          productService.getAllProducts().catch((err) => {
            console.log('Error loading products:', err);
            return [];
          })
        ]);

        console.log('Dashboard data:', {
          users,
          suppliers,
          goats,
          products
        });

        const newStats = {
          totalUsers: users?.length || 0,
          totalSuppliers: suppliers?.length || 0,
          totalGoats: goats?.length || 0,
          totalProducts: products?.length || 0
        };

        console.log('Setting stats to:', newStats);
        setStats(newStats);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las estadísticas del dashboard"
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [toast]);

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
              Empleados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a2e02]">
              {loading ? '...' : stats.totalUsers}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total registrados
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
            <div className="text-3xl font-bold text-[#1a2e02]">
              {loading ? '...' : stats.totalSuppliers}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Proveedores activos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Registro Caprino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a2e02]">
              {loading ? '...' : stats.totalGoats}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Cabras registradas
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
            <div className="text-3xl font-bold text-[#1a2e02]">
              {loading ? '...' : stats.totalProducts}
            </div>
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