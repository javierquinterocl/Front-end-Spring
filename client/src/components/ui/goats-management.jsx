import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Edit, Filter, Plus, Search, Trash2, ArrowDownUp } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Importar funciones de API
import { 
  getAllGoats, 
  createGoat, 
  updateGoat, 
  deleteGoat,
  getAllVaccines,
  createVaccine
} from "@/services/api"

// Importar interfaces
import { Goat, CreateGoatData, UpdateGoatData } from "@/interfaces/goat"
import { Vaccine, CreateVaccineData } from '@/interfaces/vaccine'

export function GoatsManagement() {
  const { toast } = useToast()
  
  // Estados para datos
  const [goats, setGoats] = useState<Goat[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para UI
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key; direction: "ascending" | "descending" } | null>(null)
  const [activeFilters, setActiveFilters] = useState<{
    sex
    goat_
  }>({
    sex: [],
    goat_type: [],
    breed: []
  })

  // Estados para diálogos
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedGoat, setSelectedGoat] = useState<Goat | null>(null)
  const [goatToEdit, setGoatToEdit] = useState<Goat | null>(null)

  // Estados para formularios
  const [formData, setFormData] = useState<CreateGoatData>({
    goat_id: "",
    name: "",
    birthDate: "",
    gender: "female",
    breed: "",
    goat_type: "CRIA",
    weight: 0,
    milk_production: 0,
    food_consumption: 0,
    vaccinations_count: 0,
    heat_periods: 0,
    offspring_count: 0
  })

  // Estados para vacunas
  const [vaccines, setVaccines] = useState<Vaccine[]>([])
  const [loadingVaccines, setLoadingVaccines] = useState(true)
  const [vaccineForm, setVaccineForm] = useState<CreateVaccineData>({
    goat_id: 0,
    name: '',
    dose: 0,
    unit: 'lt',
    application_date: ''
  })
  const [vaccineDialogOpen, setVaccineDialogOpen] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
    loadVaccines()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const goatsData = await getAllGoats()
      
      // Validar y filtrar datos para asegurar que tengan IDs válidos
      const validGoats = (goatsData || []).filter(goat => 
        goat && goat.id && goat.goat_id && goat.name
      ).map(goat => ({
        ...goat,
        weight: typeof goat.weight === 'number' ? goat.weight : parseFloat(goat.weight || '0'),
        milk_production: typeof goat.milk_production === 'number' ? goat.milk_production : parseFloat(goat.milk_production || '0'),
        food_consumption: typeof goat.food_consumption === 'number' ? goat.food_consumption : parseFloat(goat.food_consumption || '0'),
        vaccinations_count: typeof goat.vaccinations_count === 'number' ? goat.vaccinations_count : parseInt(goat.vaccinations_count || '0'),
        heat_periods: typeof goat.heat_periods === 'number' ? goat.heat_periods : parseInt(goat.heat_periods || '0'),
        offspring_count: typeof goat.offspring_count === 'number' ? goat.offspring_count : parseInt(goat.offspring_count || '0')
      }))
      
      setGoats(validGoats)
      
      toast({
        title: "Datos cargados",
        description: `${validGoats.length} caprinos cargados correctamente.`,
      })
    } catch {
      toast({
        title: "Error",
        description: "Error al cargar los datos de caprinos. Verifica que el servidor esté funcionando.",
        variant: "destructive",
      })
      setGoats([])
    } finally {
      setLoading(false)
    }
  }

  const loadVaccines = async () => {
    try {
      setLoadingVaccines(true)
      const data = await getAllVaccines()
      setVaccines(data)
    } catch {
      toast({
        title: "Error",
        description: "Error al cargar vacunas",
        variant: "destructive",
      })
      setVaccines([])
    } finally {
      setLoadingVaccines(false)
    }
  }

  // Función para crear caprino
  const handleCreateGoat = async () => {
    try {
      if (!formData.goat_id || !formData.name || !formData.birthDate || !formData.gender || !formData.breed || !formData.goat_type) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos obligatorios.",
          variant: "destructive",
        })
        return
      }

      const newGoat = await createGoat(formData)
      
      // Normalizar tipos de datos del nuevo caprino
      const normalizedGoat = {
        ...newGoat,
        weight: typeof newGoat.weight === 'number' ? newGoat.weight : parseFloat(newGoat.weight || '0'),
        milk_production: typeof newGoat.milk_production === 'number' ? newGoat.milk_production : parseFloat(newGoat.milk_production || '0'),
        food_consumption: typeof newGoat.food_consumption === 'number' ? newGoat.food_consumption : parseFloat(newGoat.food_consumption || '0'),
        vaccinations_count: typeof newGoat.vaccinations_count === 'number' ? newGoat.vaccinations_count : parseInt(newGoat.vaccinations_count || '0'),
        heat_periods: typeof newGoat.heat_periods === 'number' ? newGoat.heat_periods : parseInt(newGoat.heat_periods || '0'),
        offspring_count: typeof newGoat.offspring_count === 'number' ? newGoat.offspring_count : parseInt(newGoat.offspring_count || '0')
      }
      
      setGoats([normalizedGoat, ...goats])
      setCreateOpen(false)
      resetFormData()
      
      toast({
        title: "Caprino creado",
        description: `El caprino ${newGoat.name} ha sido creado exitosamente.`,
      })
    } catch {
      toast({
        title: "Error",
        description: "Error al crear el caprino.",
        variant: "destructive",
      })
    }
  }

  // Función para actualizar caprino
  const handleUpdateGoat = async () => {
    try {
      if (!goatToEdit) return

      const updateData: UpdateGoatData = {
        name: formData.name,
        birthDate: formData.birthDate,
        gender: formData.gender,
        breed: formData.breed,
        goat_type: formData.goat_type,
        weight: formData.weight,
        milk_production: formData.milk_production,
        food_consumption: formData.food_consumption,
        vaccinations_count: formData.vaccinations_count,
        heat_periods: formData.heat_periods,
        offspring_count: formData.offspring_count,
        parent_id: formData.parent_id
      }

      const updatedGoat = await updateGoat(goatToEdit.id, updateData)
      
      // Normalizar tipos de datos del caprino actualizado
      const normalizedGoat = {
        ...updatedGoat,
        weight: typeof updatedGoat.weight === 'number' ? updatedGoat.weight : parseFloat(updatedGoat.weight || '0'),
        milk_production: typeof updatedGoat.milk_production === 'number' ? updatedGoat.milk_production : parseFloat(updatedGoat.milk_production || '0'),
        food_consumption: typeof updatedGoat.food_consumption === 'number' ? updatedGoat.food_consumption : parseFloat(updatedGoat.food_consumption || '0'),
        vaccinations_count: typeof updatedGoat.vaccinations_count === 'number' ? updatedGoat.vaccinations_count : parseInt(updatedGoat.vaccinations_count || '0'),
        heat_periods: typeof updatedGoat.heat_periods === 'number' ? updatedGoat.heat_periods : parseInt(updatedGoat.heat_periods || '0'),
        offspring_count: typeof updatedGoat.offspring_count === 'number' ? updatedGoat.offspring_count : parseInt(updatedGoat.offspring_count || '0')
      }
      
      setGoats(goats.map(g => g.id === goatToEdit.id ? normalizedGoat : g))
      setEditOpen(false)
      setGoatToEdit(null)
      resetFormData()
      
      toast({
        title: "Caprino actualizado",
        description: `El caprino ${updatedGoat.name} ha sido actualizado exitosamente.`,
      })
    } catch {
      toast({
        title: "Error",
        description: "Error al actualizar el caprino.",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar caprino
  const handleDeleteGoat = async (goat: Goat) => {
    try {
      await deleteGoat(goat.id)
      setGoats(goats.filter(g => g.id !== goat.id))
      
      toast({
        title: "Caprino eliminado",
        description: `El caprino ${goat.name} ha sido eliminado exitosamente.`,
      })
    } catch {
      toast({
        title: "Error",
        description: "Error al eliminar el caprino.",
        variant: "destructive",
      })
    }
  }

  const resetFormData = () => {
    setFormData({
      goat_id: "",
      name: "",
      birthDate: "",
      gender: "female",
      breed: "",
      goat_type: "CRIA",
      weight: 0,
      milk_production: 0,
      food_consumption: 0,
      vaccinations_count: 0,
      heat_periods: 0,
      offspring_count: 0
    })
  }

  const openEditDialog = (goat: Goat) => {
    setGoatToEdit(goat)
    setFormData({
      goat_id: goat.goat_id,
      name: goat.name,
      birthDate: goat.birthDate,
      gender: goat.gender,
      breed: goat.breed,
      goat_type: goat.goat_type,
      weight: goat.weight,
      milk_production: goat.milk_production,
      food_consumption: goat.food_consumption,
      vaccinations_count: goat.vaccinations_count,
      heat_periods: goat.heat_periods,
      offspring_count: goat.offspring_count,
      parent_id: goat.parent_id
    })
    setEditOpen(true)
  }

  const openDetailsDialog = (goat: Goat) => {
    setSelectedGoat(goat)
    setDetailsOpen(true)
  }

  const requestSort = (key) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Aplicar filtros y ordenamiento
  let filteredGoats = [...goats]

  // Aplicar filtros de búsqueda
  if (searchTerm) {
    filteredGoats = filteredGoats.filter(
      (goat) =>
        goat.goat_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goat.breed.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Aplicar filtros de sexo, tipo y raza
  if (activeFilters.sex.length > 0) {
    filteredGoats = filteredGoats.filter(goat =>
      activeFilters.sex.includes(goat.gender)
    )
  }

  if (activeFilters.goat_type.length > 0) {
    filteredGoats = filteredGoats.filter(goat =>
      activeFilters.goat_type.includes(goat.goat_type)
    )
  }

  if (activeFilters.breed.length > 0) {
    filteredGoats = filteredGoats.filter(goat =>
      activeFilters.breed.includes(goat.breed)
    )
  }

  // Aplicar ordenamiento
  if (sortConfig !== null) {
    filteredGoats.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Goat]
      const bValue = b[sortConfig.key as keyof Goat]
      
      if (aValue && bValue) {
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
      }
      return 0
    })
  }

  const handleFilterChange = (type: "sex" | "goat_type" | "breed", value) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }))
  }

  const clearFilters = () => {
    setActiveFilters({
      sex: [],
      goat_type: [],
      breed: []
    })
  }

  const handleCreateVaccine = async () => {
    try {
      if (!vaccineForm.goat_id || !vaccineForm.name || !vaccineForm.dose || !vaccineForm.unit || !vaccineForm.application_date) {
        toast({ title: 'Error', description: 'Complete todos los campos de vacuna', variant: 'destructive' })
        return
      }
      await createVaccine(vaccineForm)
      setVaccineDialogOpen(false)
      setVaccineForm({ goat_id: 0, name: '', dose: 0, unit: 'lt', application_date: '' })
      loadVaccines()
      toast({ title: 'Vacuna registrada', description: 'Vacuna registrada correctamente.' })
    } catch {
      toast({ title: 'Error', description: 'Error al registrar vacuna', variant: 'destructive' })
    }
  }

  // Función para exportar vacunas a PDF
  function exportVaccinesToPDF(vaccines) {
    const doc = new jsPDF();
    // Encabezado con color verde claro
    doc.setFillColor(230, 240, 220);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFontSize(18);
    doc.setTextColor(60, 80, 40);
    doc.setFont('helvetica', 'bold');
    doc.text("Gestión de Caprinos - Registro de Vacunas", 14, 20);

    // Fecha de generación
    doc.setFontSize(10);
    doc.setTextColor(100);
    const fechaGen = new Date().toLocaleString();
    doc.text(`Generado: ${fechaGen}`, 150, 27);

    // Tabla de vacunas
    doc.setFontSize(12);
    doc.setTextColor(33, 37, 41);
    doc.setFont('helvetica', 'normal');
    autoTable(doc, {
      startY: 36,
      head: [["ID", "Caprino", "Nombre Vacuna", "Dosis", "Unidad", "Fecha Aplicación"]],
      body: vaccines.map(v => [
        v.id,
        v.goat?.name || v.goat_id,
        v.name,
        v.dose,
        v.unit,
        new Date(v.application_date).toLocaleDateString()
      ]),
      headStyles: {
        fillColor: [230, 240, 220],
        textColor: [60, 80, 40],
        fontStyle: 'bold',
        fontSize: 12
      },
      bodyStyles: {
        fontSize: 11,
        textColor: [33, 37, 41],
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 14, right: 14 }
    });

    // Pie de página
    doc.setFontSize(10);
    doc.setTextColor(180);
    doc.text("Software Capri - www.tusitio.com", 14, 285);

    doc.save(`vacunas_registro.pdf`);
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Caprinos</CardTitle>
          <CardDescription>
            Administra los caprinos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Buscar caprinos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Sexo</DropdownMenuLabel>
                  {["male", "female"].map((sex) => (
                    <DropdownMenuCheckboxItem
                      key={sex}
                      checked={activeFilters.sex.includes(sex)}
                      onCheckedChange={() => handleFilterChange("sex", sex)}
                    >
                      {sex === "male" ? "Macho" : "Hembra"}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Tipo</DropdownMenuLabel>
                  {["REPRODUCTOR", "LECHERA", "CRIA"].map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={activeFilters.goat_type.includes(type)}
                      onCheckedChange={() => handleFilterChange("goat_type", type)}
                    >
                      {type}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Raza</DropdownMenuLabel>
                  {Array.from(new Set(goats.map(g => g.breed))).map((breed) => (
                    <DropdownMenuCheckboxItem
                      key={breed}
                      checked={activeFilters.breed.includes(breed)}
                      onCheckedChange={() => handleFilterChange("breed", breed)}
                    >
                      {breed}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearFilters}>
                    Limpiar filtros
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Caprino
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("goat_id")}
                      className="flex items-center"
                    >
                      ID
                      <ArrowDownUp className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("name")}
                      className="flex items-center"
                    >
                      Nombre
                      <ArrowDownUp className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("breed")}
                      className="flex items-center"
                    >
                      Raza
                      <ArrowDownUp className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("gender")}
                      className="flex items-center"
                    >
                      Sexo
                      <ArrowDownUp className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("goat_type")}
                      className="flex items-center"
                    >
                      Tipo
                      <ArrowDownUp className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("weight")}
                      className="flex items-center"
                    >
                      Peso (kg)
                      <ArrowDownUp className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Cargando caprinos...
                    </TableCell>
                  </TableRow>
                ) : filteredGoats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No se encontraron caprinos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGoats.map((goat) => (
                    <TableRow key={goat.id}>
                      <TableCell>{goat.goat_id}</TableCell>
                      <TableCell>{goat.name}</TableCell>
                      <TableCell>{goat.breed}</TableCell>
                      <TableCell>{goat.gender === "male" ? "Macho" : "Hembra"}</TableCell>
                      <TableCell>{goat.goat_type}</TableCell>
                      <TableCell>{goat.weight.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDetailsDialog(goat)}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(goat)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteGoat(goat)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para crear caprino */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Caprino</DialogTitle>
            <DialogDescription>
              Complete los datos del nuevo caprino
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goat_id">ID del Caprino</Label>
                <Input
                  id="goat_id"
                  value={formData.goat_id}
                  onChange={(e) => setFormData({ ...formData, goat_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Sexo</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as "male" | "female" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Macho</SelectItem>
                    <SelectItem value="female">Hembra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="breed">Raza</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goat_type">Tipo</Label>
                <Select
                  value={formData.goat_type}
                  onValueChange={(value) => setFormData({ ...formData, goat_type: value as "REPRODUCTOR" | "LECHERA" | "CRIA" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REPRODUCTOR">Reproductor</SelectItem>
                    <SelectItem value="LECHERA">Lechera</SelectItem>
                    <SelectItem value="CRIA">Cría</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="milk_production">Producción de Leche (L)</Label>
                <Input
                  id="milk_production"
                  type="number"
                  value={formData.milk_production}
                  onChange={(e) => setFormData({ ...formData, milk_production: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="food_consumption">Consumo de Alimento (kg)</Label>
                <Input
                  id="food_consumption"
                  type="number"
                  value={formData.food_consumption}
                  onChange={(e) => setFormData({ ...formData, food_consumption: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vaccinations_count">Número de Vacunas</Label>
                <Input
                  id="vaccinations_count"
                  type="number"
                  value={formData.vaccinations_count}
                  onChange={(e) => setFormData({ ...formData, vaccinations_count: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heat_periods">Períodos de Celo</Label>
                <Input
                  id="heat_periods"
                  type="number"
                  value={formData.heat_periods}
                  onChange={(e) => setFormData({ ...formData, heat_periods: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offspring_count">Número de Hijos</Label>
                <Input
                  id="offspring_count"
                  type="number"
                  value={formData.offspring_count}
                  onChange={(e) => setFormData({ ...formData, offspring_count: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateGoat}>Crear Caprino</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar caprino */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Caprino</DialogTitle>
            <DialogDescription>
              Modifique los datos del caprino
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Nombre</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_birthDate">Fecha de Nacimiento</Label>
                <Input
                  id="edit_birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_gender">Sexo</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as "male" | "female" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Macho</SelectItem>
                    <SelectItem value="female">Hembra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_breed">Raza</Label>
                <Input
                  id="edit_breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_goat_type">Tipo</Label>
                <Select
                  value={formData.goat_type}
                  onValueChange={(value) => setFormData({ ...formData, goat_type: value as "REPRODUCTOR" | "LECHERA" | "CRIA" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REPRODUCTOR">Reproductor</SelectItem>
                    <SelectItem value="LECHERA">Lechera</SelectItem>
                    <SelectItem value="CRIA">Cría</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_weight">Peso (kg)</Label>
                <Input
                  id="edit_weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_milk_production">Producción de Leche (L)</Label>
                <Input
                  id="edit_milk_production"
                  type="number"
                  value={formData.milk_production}
                  onChange={(e) => setFormData({ ...formData, milk_production: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_food_consumption">Consumo de Alimento (kg)</Label>
                <Input
                  id="edit_food_consumption"
                  type="number"
                  value={formData.food_consumption}
                  onChange={(e) => setFormData({ ...formData, food_consumption: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_vaccinations_count">Número de Vacunas</Label>
                <Input
                  id="edit_vaccinations_count"
                  type="number"
                  value={formData.vaccinations_count}
                  onChange={(e) => setFormData({ ...formData, vaccinations_count: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_heat_periods">Períodos de Celo</Label>
                <Input
                  id="edit_heat_periods"
                  type="number"
                  value={formData.heat_periods}
                  onChange={(e) => setFormData({ ...formData, heat_periods: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_offspring_count">Número de Hijos</Label>
              <Input
                id="edit_offspring_count"
                type="number"
                value={formData.offspring_count}
                onChange={(e) => setFormData({ ...formData, offspring_count: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateGoat}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para ver detalles del caprino */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Caprino</DialogTitle>
          </DialogHeader>
          {selectedGoat && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID del Caprino</Label>
                  <p>{selectedGoat.goat_id}</p>
                </div>
                <div>
                  <Label>Nombre</Label>
                  <p>{selectedGoat.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha de Nacimiento</Label>
                  <p>{new Date(selectedGoat.birthDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Sexo</Label>
                  <p>{selectedGoat.gender === "male" ? "Macho" : "Hembra"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Raza</Label>
                  <p>{selectedGoat.breed}</p>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <p>{selectedGoat.goat_type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Peso</Label>
                  <p>{selectedGoat.weight.toFixed(2)} kg</p>
                </div>
                <div>
                  <Label>Producción de Leche</Label>
                  <p>{selectedGoat.milk_production.toFixed(2)} L</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Consumo de Alimento</Label>
                  <p>{selectedGoat.food_consumption.toFixed(2)} kg</p>
                </div>
                <div>
                  <Label>Número de Vacunas</Label>
                  <p>{selectedGoat.vaccinations_count}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Períodos de Celo</Label>
                  <p>{selectedGoat.heat_periods}</p>
                </div>
                <div>
                  <Label>Número de Hijos</Label>
                  <p>{selectedGoat.offspring_count}</p>
                </div>
              </div>
              {selectedGoat.parent && (
                <div>
                  <Label>Padre/Madre</Label>
                  <p>{selectedGoat.parent.name} ({selectedGoat.parent.goat_id})</p>
                </div>
              )}
              {selectedGoat.offspring && selectedGoat.offspring.length > 0 && (
                <div>
                  <Label>Hijos</Label>
                  <ul>
                    {selectedGoat.offspring.map((child) => (
                      <li key={child.id}>
                        {child.name} ({child.goat_id})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sección de Vacunas */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Vacunas</CardTitle>
          <CardDescription>Registro y listado de vacunas aplicadas a los caprinos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Button onClick={() => setVaccineDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Registrar Vacuna
            </Button>
            <Button variant="outline" onClick={() => exportVaccinesToPDF(vaccines)}>
              <span className="mr-2">Exportar PDF</span>
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Caprino</TableHead>
                  <TableHead>Nombre Vacuna</TableHead>
                  <TableHead>Dosis</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Fecha Aplicación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingVaccines ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Cargando vacunas...</TableCell>
                  </TableRow>
                ) : vaccines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No hay vacunas registradas</TableCell>
                  </TableRow>
                ) : (
                  vaccines.map((vaccine) => (
                    <TableRow key={vaccine.id}>
                      <TableCell>{vaccine.id}</TableCell>
                      <TableCell>{vaccine.goat?.name || vaccine.goat_id}</TableCell>
                      <TableCell>{vaccine.name}</TableCell>
                      <TableCell>{vaccine.dose}</TableCell>
                      <TableCell>{vaccine.unit}</TableCell>
                      <TableCell>{new Date(vaccine.application_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para registrar vacuna */}
      <Dialog open={vaccineDialogOpen} onOpenChange={setVaccineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Vacuna</DialogTitle>
            <DialogDescription>Complete los datos de la vacuna aplicada</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goat_id">Caprino</Label>
              <Select
                value={vaccineForm.goat_id ? String(vaccineForm.goat_id) : ''}
                onValueChange={val => setVaccineForm({ ...vaccineForm, goat_id: Number(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un caprino" />
                </SelectTrigger>
                <SelectContent>
                  {goats.map(goat => (
                    <SelectItem key={goat.id} value={String(goat.id)}>{goat.name} ({goat.goat_id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Vacuna</Label>
              <Input id="name" value={vaccineForm.name} onChange={e => setVaccineForm({ ...vaccineForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dose">Dosis</Label>
              <Input id="dose" type="number" value={vaccineForm.dose} onChange={e => setVaccineForm({ ...vaccineForm, dose: parseFloat(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unidad de Medida</Label>
              <Input id="unit" value={vaccineForm.unit} onChange={e => setVaccineForm({ ...vaccineForm, unit: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="application_date">Fecha de Aplicación</Label>
              <Input id="application_date" type="date" value={vaccineForm.application_date} onChange={e => setVaccineForm({ ...vaccineForm, application_date: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVaccineDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateVaccine}>Registrar Vacuna</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 