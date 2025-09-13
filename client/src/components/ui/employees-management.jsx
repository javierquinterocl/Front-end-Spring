import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowUpDown, Calendar, Edit, FileDown, Filter, Mail, MapPin, Phone, Plus, Search, Trash2, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from '@/components/ui/use-toast';
import { Staff, CreateStaffData, UpdateStaffData } from '@/interfaces/staff';
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '@/services/api';

// Datos de ejemplo
const employees = [
  {
    id: "EMP001",
    firstName: "Juan",
    lastName: "Pérez",
    position: "Encargado de Producción",
    department: "Producción",
    email: "juan.perez@caprisystem.com",
    phone: "555-123-4567",
    address: "Calle Principal 123, Ciudad",
    hireDate: "2020-05-15",
    status: "Activo",
    permissions: ["Inventario", "Producción", "Ventas"],
  },
  {
    id: "EMP002",
    firstName: "María",
    lastName: "Gómez",
    position: "Veterinaria",
    department: "Salud Animal",
    email: "maria.gomez@caprisystem.com",
    phone: "555-234-5678",
    address: "Av. Central 456, Ciudad",
    hireDate: "2021-03-10",
    status: "Activo",
    permissions: ["Registro Caprino", "Salud Animal"],
  },
  {
    id: "EMP003",
    firstName: "Carlos",
    lastName: "Rodríguez",
    position: "Encargado de Ventas",
    department: "Ventas",
    email: "carlos.rodriguez@caprisystem.com",
    phone: "555-345-6789",
    address: "Calle 10 #45, Ciudad",
    hireDate: "2019-11-20",
    status: "Activo",
    permissions: ["Ventas", "Clientes"],
  },
  {
    id: "EMP004",
    firstName: "Ana",
    lastName: "Martínez",
    position: "Asistente Administrativo",
    department: "Administración",
    email: "ana.martinez@caprisystem.com",
    phone: "555-456-7890",
    address: "Av. Sur 789, Ciudad",
    hireDate: "2022-01-15",
    status: "Activo",
    permissions: ["Inventario", "Proveedores", "Reportes"],
  },
  {
    id: "EMP005",
    firstName: "Roberto",
    lastName: "Sánchez",
    position: "Encargado de Almacén",
    department: "Inventario",
    email: "roberto.sanchez@caprisystem.com",
    phone: "555-567-8901",
    address: "Camino Rural 234, Ciudad",
    hireDate: "2020-08-05",
    status: "Activo",
    permissions: ["Inventario"],
  },
  {
    id: "EMP006",
    firstName: "Laura",
    lastName: "Torres",
    position: "Asistente de Producción",
    department: "Producción",
    email: "laura.torres@caprisystem.com",
    phone: "555-678-9012",
    address: "Calle Industrial 567, Ciudad",
    hireDate: "2021-06-10",
    status: "Inactivo",
    permissions: ["Producción"],
  },
  {
    id: "EMP007",
    firstName: "Pedro",
    lastName: "Díaz",
    position: "Gerente General",
    department: "Dirección",
    email: "pedro.diaz@caprisystem.com",
    phone: "555-789-0123",
    address: "Av. Principal 890, Ciudad",
    hireDate: "2018-03-01",
    status: "Activo",
    permissions: ["Administración", "Reportes", "Configuración"],
  },
  {
    id: "EMP008",
    firstName: "Sofía",
    lastName: "López",
    position: "Contadora",
    department: "Finanzas",
    email: "sofia.lopez@caprisystem.com",
    phone: "555-890-1234",
    address: "Calle Comercial 123, Ciudad",
    hireDate: "2019-07-15",
    status: "Activo",
    permissions: ["Finanzas", "Reportes"],
  },
]

export function EmployeesManagement() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateStaffData>({
    staff_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    dni: '',
    salary,
    year_experience: '',
    specialization: '',
    period,
    degree: '',
    staff_type: 'ADMINISTRATIVO',
    manager_id
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Obtener datos de empleados
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    const fetchStaff = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        console.log("Iniciando carga de empleados...");
        const data = await getAllStaff();
        console.log("Empleados obtenidos:", data);
        if (isMounted) {
          setStaff(data);
        }
      } catch (error) {
        console.error("Error al cargar empleados:", error);
        if (isMounted && retryCount < maxRetries) {
          retryCount++;
          console.log(`Reintentando carga (${retryCount}/${maxRetries})...`);
          setTimeout(fetchStaff, 1000 * retryCount);
        } else if (isMounted) {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "No se pudieron cargar los empleados",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStaff();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Función para refrescar la lista de empleados
  const refreshStaff = async () => {
    try {
      setIsLoading(true);
      console.log("Solicitando actualización de lista de empleados...");
      const data = await getAllStaff();
      setStaff(data);
      console.log("Lista de empleados actualizada:", data.length);
    } catch (error) {
      console.error("Error al recargar empleados:", error);
      toast({
        title: "Error",
        description: "No se pudieron recargar los empleados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en el select de tipo de empleado
  const handleStaffTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      staff_type: value as 'ADMINISTRATIVO' | 'PRACTICANTE'
    }));
  };

  // Manejar cambios en el select de manager
  const handleManagerChange = (value) => {
    setFormData(prev => ({
      ...prev,
      manager_id: value === 'none' ? undefined : value
    }));
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      staff_id: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      dni: '',
      salary,
      year_experience: '',
      specialization: '',
      period,
      degree: '',
      staff_type: 'ADMINISTRATIVO',
      manager_id
    });
    setFormErrors({});
  };

  // Validar el formulario
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.staff_id.trim()) {
      errors.staff_id = "El ID del empleado es obligatorio";
    }
    
    if (!formData.first_name.trim()) {
      errors.first_name = "El nombre es obligatorio";
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = "El apellido es obligatorio";
    }
    
    if (!formData.dni.trim()) {
      errors.dni = "El DNI es obligatorio";
    }
    
    if (!formData.staff_type) {
      errors.staff_type = "El tipo de empleado es obligatorio";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar el envío del formulario para crear empleado
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsFormLoading(true);
    
    try {
      console.log("Enviando datos para crear empleado:", formData);
      await createStaff(formData);
      
      toast({
        title: "Empleado creado",
        description: "El empleado ha sido creado exitosamente",
      });
      
      resetForm();
      setCreateOpen(false);
      await refreshStaff();
    } catch (error) {
      console.error("Error al crear empleado:", error);
      
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "No se pudo crear el empleado",
          variant: "destructive",
        });
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  // Cargar datos de empleado para edición
  const loadStaffForEdit = (staff: Staff) => {
    setFormData({
      staff_id: staff.staff_id,
      first_name: staff.first_name,
      middle_name: staff.middle_name || '',
      last_name: staff.last_name,
      dni: staff.dni,
      salary: staff.salary,
      year_experience: staff.year_experience || '',
      specialization: staff.specialization || '',
      period: staff.period,
      degree: staff.degree || '',
      staff_type: staff.staff_type,
      manager_id: staff.manager_id
    });
    
    setEditingId(staff.staff_id);
  };

  // Manejar el envío del formulario para actualizar empleado
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !editingId) {
      return;
    }
    
    setIsFormLoading(true);
    
    try {
      const updateData: UpdateStaffData = {
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        salary: formData.salary,
        year_experience: formData.year_experience,
        specialization: formData.specialization,
        period: formData.period,
        degree: formData.degree,
        staff_type: formData.staff_type,
        manager_id: formData.manager_id
      };
      
      console.log(`Enviando datos para actualizar empleado ID ${editingId}:`, updateData);
      await updateStaff(editingId, updateData);
      
      toast({
        title: "Empleado actualizado",
        description: "El empleado ha sido actualizado exitosamente",
      });
      
      resetForm();
      setEditOpen(false);
      setEditingId(null);
      await refreshStaff();
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "No se pudo actualizar el empleado",
          variant: "destructive",
        });
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  // Función para manejar la eliminación de un empleado
  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;

    try {
      setIsDeleting(true);
      await deleteStaff(staffToDelete.staff_id);
      
      // Actualizar lista de empleados usando staff_id
      setStaff(staff.filter(s => s.staff_id !== staffToDelete.staff_id));
      
      toast({
        title: "Empleado eliminado",
        description: "El empleado ha sido eliminado correctamente",
      });
      
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el empleado",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrar empleados según el término de búsqueda
  const filteredStaff = staff.filter(s => 
    s.staff_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.dni.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Empleados</h2>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Empleado
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Listado de Empleados</CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por ID, nombre o DNI..."
                  className="pl-8 w-full sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button variant="outline" size="icon" onClick={refreshStaff}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                <span className="sr-only">Refrescar</span>
              </Button>

              <Button variant="outline" size="icon">
                <FileDown className="h-4 w-4" />
                <span className="sr-only">Exportar</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <div className="flex items-center space-x-1 cursor-pointer" onClick={() => requestSort("staff_id")}>
                        <span>ID</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center space-x-1 cursor-pointer" onClick={() => requestSort("first_name")}>
                        <span>Nombre</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <div className="flex items-center space-x-1 cursor-pointer" onClick={() => requestSort("dni")}>
                        <span>DNI</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <div className="flex items-center space-x-1 cursor-pointer" onClick={() => requestSort("staff_type")}>
                        <span>Tipo</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      <div className="flex items-center space-x-1 cursor-pointer" onClick={() => requestSort("manager_id")}>
                        <span>Manager</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        No se encontraron registros que coincidan con los criterios de búsqueda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((s) => (
                      <TableRow key={s.staff_id}>
                        <TableCell className="font-medium">{s.staff_id}</TableCell>
                        <TableCell>{s.first_name} {s.middle_name} {s.last_name}</TableCell>
                        <TableCell className="hidden md:table-cell">{s.dni}</TableCell>
                        <TableCell className="hidden md:table-cell">{s.staff_type}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {s.manager ? `${s.manager.first_name} ${s.manager.last_name}` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStaff(s);
                                setDetailsOpen(true);
                              }}
                            >
                              Detalles
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                loadStaffForEdit(s);
                                setEditOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => {
                                setStaffToDelete(s);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredStaff.length} de {staff.length} registros
          </div>
        </CardFooter>
      </Card>

      {/* Diálogo de detalles */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Empleado</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div key="staff-id">
                  <h3 className="font-medium">ID</h3>
                  <p>{selectedStaff.staff_id}</p>
                </div>
                <div key="staff-dni">
                  <h3 className="font-medium">DNI</h3>
                  <p>{selectedStaff.dni}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div key="staff-first-name">
                  <h3 className="font-medium">Nombre</h3>
                  <p>{selectedStaff.first_name}</p>
                </div>
                <div key="staff-middle-name">
                  <h3 className="font-medium">Segundo Nombre</h3>
                  <p>{selectedStaff.middle_name || '-'}</p>
                </div>
              </div>
              <div key="staff-last-name">
                <h3 className="font-medium">Apellido</h3>
                <p>{selectedStaff.last_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div key="staff-type">
                  <h3 className="font-medium">Tipo de Empleado</h3>
                  <p>{selectedStaff.staff_type}</p>
                </div>
                <div key="staff-manager">
                  <h3 className="font-medium">Manager</h3>
                  <p>
                    {selectedStaff.manager
                      ? `${selectedStaff.manager.first_name} ${selectedStaff.manager.last_name}`
                      : '-'}
                  </p>
                </div>
              </div>
              {selectedStaff.salary && (
                <div key="staff-salary">
                  <h3 className="font-medium">Salario</h3>
                  <p>${selectedStaff.salary.toLocaleString()}</p>
                </div>
              )}
              {selectedStaff.year_experience && (
                <div key="staff-experience">
                  <h3 className="font-medium">Años de Experiencia</h3>
                  <p>{selectedStaff.year_experience}</p>
                </div>
              )}
              {selectedStaff.specialization && (
                <div key="staff-specialization">
                  <h3 className="font-medium">Especialización</h3>
                  <p>{selectedStaff.specialization}</p>
                </div>
              )}
              {selectedStaff.period && (
                <div key="staff-period">
                  <h3 className="font-medium">Período</h3>
                  <p>{new Date(selectedStaff.period).toLocaleDateString()}</p>
                </div>
              )}
              {selectedStaff.degree && (
                <div key="staff-degree">
                  <h3 className="font-medium">Grado</h3>
                  <p>{selectedStaff.degree}</p>
                </div>
              )}
              {selectedStaff.created_at && (
                <div className="grid grid-cols-2 gap-4">
                  <div key="staff-created">
                    <h3 className="font-medium">Fecha de Creación</h3>
                    <p>{new Date(selectedStaff.created_at).toLocaleDateString()}</p>
                  </div>
                  {selectedStaff.updated_at && (
                    <div key="staff-updated">
                      <h3 className="font-medium">Última Actualización</h3>
                      <p>{new Date(selectedStaff.updated_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para crear nuevo empleado */}
      <Dialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open);
        if (open) {
          console.log("Abriendo diálogo de creación de empleado");
          resetForm();
        }
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Nuevo Empleado</DialogTitle>
            <DialogDescription>Complete el formulario para registrar un nuevo empleado.</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div key="create-staff-id" className="space-y-2">
                <Label htmlFor="staff_id">ID del Empleado *</Label>
                <Input
                  id="staff_id"
                  name="staff_id"
                  value={formData.staff_id}
                  onChange={handleFormChange}
                  placeholder="Ej: EMP001"
                  className={formErrors.staff_id ? "border-red-500" : ""}
                  disabled={isFormLoading}
                />
                {formErrors.staff_id && (
                  <p className="text-sm text-red-500">{formErrors.staff_id}</p>
                )}
              </div>
              
              <div key="create-staff-dni" className="space-y-2">
                <Label htmlFor="dni">DNI *</Label>
                <Input
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleFormChange}
                  placeholder="Ej: 12345678"
                  className={formErrors.dni ? "border-red-500" : ""}
                  disabled={isFormLoading}
                />
                {formErrors.dni && (
                  <p className="text-sm text-red-500">{formErrors.dni}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div key="create-staff-first-name" className="space-y-2">
                <Label htmlFor="first_name">Nombre *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleFormChange}
                  className={formErrors.first_name ? "border-red-500" : ""}
                  disabled={isFormLoading}
                />
                {formErrors.first_name && (
                  <p className="text-sm text-red-500">{formErrors.first_name}</p>
                )}
              </div>
              
              <div key="create-staff-middle-name" className="space-y-2">
                <Label htmlFor="middle_name">Segundo Nombre</Label>
                <Input
                  id="middle_name"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleFormChange}
                  disabled={isFormLoading}
                />
              </div>
              
              <div key="create-staff-last-name" className="space-y-2">
                <Label htmlFor="last_name">Apellido *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleFormChange}
                  className={formErrors.last_name ? "border-red-500" : ""}
                  disabled={isFormLoading}
                />
                {formErrors.last_name && (
                  <p className="text-sm text-red-500">{formErrors.last_name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div key="create-staff-type" className="space-y-2">
                <Label htmlFor="staff_type">Tipo de Empleado *</Label>
                <Select
                  value={formData.staff_type}
                  onValueChange={handleStaffTypeChange}
                  disabled={isFormLoading}
                >
                  <SelectTrigger className={formErrors.staff_type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                    <SelectItem value="PRACTICANTE">Practicante</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.staff_type && (
                  <p className="text-sm text-red-500">{formErrors.staff_type}</p>
                )}
              </div>
              
              <div key="create-staff-manager" className="space-y-2">
                <Label htmlFor="manager_id">Manager</Label>
                <Select
                  value={formData.manager_id || ''}
                  onValueChange={handleManagerChange}
                  disabled={isFormLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin manager</SelectItem>
                    {staff.map((s) => (
                      <SelectItem key={`manager-${s.staff_id}`} value={s.staff_id}>
                        {s.first_name} {s.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div key="create-staff-salary" className="space-y-2">
                <Label htmlFor="salary">Salario</Label>
                <Input
                  id="salary"
                  name="salary"
                  type="number"
                  value={formData.salary || ''}
                  onChange={handleFormChange}
                  disabled={isFormLoading}
                />
              </div>
              
              <div key="create-staff-experience" className="space-y-2">
                <Label htmlFor="year_experience">Años de Experiencia</Label>
                <Input
                  id="year_experience"
                  name="year_experience"
                  value={formData.year_experience}
                  onChange={handleFormChange}
                  disabled={isFormLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div key="create-staff-specialization" className="space-y-2">
                <Label htmlFor="specialization">Especialización</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleFormChange}
                  disabled={isFormLoading}
                />
              </div>
              
              <div key="create-staff-degree" className="space-y-2">
                <Label htmlFor="degree">Grado</Label>
                <Input
                  id="degree"
                  name="degree"
                  value={formData.degree}
                  onChange={handleFormChange}
                  disabled={isFormLoading}
                />
              </div>
            </div>

            <div key="create-staff-period" className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <Input
                id="period"
                name="period"
                type="date"
                value={formData.period ? new Date(formData.period).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    period: e.target.value ? new Date(e.target.value) 
                  }));
                }}
                disabled={isFormLoading}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCreateOpen(false)} 
                disabled={isFormLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isFormLoading}
              >
                {isFormLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Empleado
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar empleado */}
      <Dialog open={editOpen} onOpenChange={(open) => {
        setEditOpen(open);
        if (open) {
          console.log("Abriendo diálogo de edición de empleado");
        }
        if (!open) {
          resetForm();
          setEditingId(null);
        }
      }}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Editar Empleado</DialogTitle>
            <DialogDescription>Modifique los datos del empleado.</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div key="edit-staff-first-name" className="space-y-2">
                <Label htmlFor="first_name">Nombre *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleFormChange}
                  className={formErrors.first_name ? "border-red-500" : ""}
                  disabled={isFormLoading}
                />
                {formErrors.first_name && (
                  <p className="text-sm text-red-500">{formErrors.first_name}</p>
                )}
              </div>
              
              <div key="edit-staff-middle-name" className="space-y-2">
                <Label htmlFor="middle_name">Segundo Nombre</Label>
                <Input
                  id="middle_name"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleFormChange}
                  disabled={isFormLoading}
                />
              </div>
              
              <div key="edit-staff-last-name" className="space-y-2">
                <Label htmlFor="last_name">Apellido *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleFormChange}
                  className={formErrors.last_name ? "border-red-500" : ""}
                  disabled={isFormLoading}
                />
                {formErrors.last_name && (
                  <p className="text-sm text-red-500">{formErrors.last_name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div key="edit-staff-type" className="space-y-2">
                <Label htmlFor="staff_type">Tipo de Empleado *</Label>
                <Select
                  value={formData.staff_type}
                  onValueChange={handleStaffTypeChange}
                  disabled={isFormLoading}
                >
                  <SelectTrigger className={formErrors.staff_type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                    <SelectItem value="PRACTICANTE">Practicante</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.staff_type && (
                  <p className="text-sm text-red-500">{formErrors.staff_type}</p>
                )}
              </div>
              
              <div key="edit-staff-manager" className="space-y-2">
                <Label htmlFor="manager_id">Manager</Label>
                <Select
                  value={formData.manager_id || ''}
                  onValueChange={handleManagerChange}
                  disabled={isFormLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin manager</SelectItem>
                    {staff.map((s) => (
                      <SelectItem key={`edit-manager-${s.staff_id}`} value={s.staff_id}>
                        {s.first_name} {s.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div key="edit-staff-salary" className="space-y-2">
                <Label htmlFor="salary">Salario</Label>
                <Input
                  id="salary"
                  name="salary"
                  type="number"
                  value={formData.salary || ''}
                  onChange={handleFormChange}
                  disabled={isFormLoading}
                />
              </div>
              
              <div key="edit-staff-experience" className="space-y-2">
                <Label htmlFor="year_experience">Años de Experiencia</Label>
                <Input
                  id="year_experience"
                  name="year_experience"
                  value={formData.year_experience}
                  onChange={handleFormChange}
                  disabled={isFormLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div key="edit-staff-specialization" className="space-y-2">
                <Label htmlFor="specialization">Especialización</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleFormChange}
                  disabled={isFormLoading}
                />
              </div>
              
              <div key="edit-staff-degree" className="space-y-2">
                <Label htmlFor="degree">Grado</Label>
                <Input
                  id="degree"
                  name="degree"
                  value={formData.degree}
                  onChange={handleFormChange}
                  disabled={isFormLoading}
                />
              </div>
            </div>

            <div key="edit-staff-period" className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <Input
                id="period"
                name="period"
                type="date"
                value={formData.period ? new Date(formData.period).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    period: e.target.value ? new Date(e.target.value) 
                  }));
                }}
                disabled={isFormLoading}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditOpen(false)} 
                disabled={isFormLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isFormLoading}
              >
                {isFormLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Actualizar Empleado
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar este empleado? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {staffToDelete && (
            <div className="py-4">
              <p className="text-sm font-medium">Se eliminará el siguiente empleado:</p>
              <p className="text-sm font-bold mt-2">
                {staffToDelete.first_name} {staffToDelete.last_name} (ID: {staffToDelete.staff_id})
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteStaff} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

