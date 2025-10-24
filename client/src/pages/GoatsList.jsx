import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Filter, Download, Eye, Edit2, Trash2, ArrowUpDown, X } from "lucide-react"
import { goatService } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function GoatsListPage() {
  const [goats, setGoats] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" })
  const [page, setPage] = useState(1)
  const pageSize = 8
  const { toast } = useToast()

  // Estados para modales
  const [viewDialog, setViewDialog] = useState({ open: false, goat: null })
  const [editDialog, setEditDialog] = useState({ open: false, goat: null })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, goat: null })
  const [createDialog, setCreateDialog] = useState(false)
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    goatId: "",
    name: "",
    breed: "",
    birthDate: "",
    gender: "",
    goatType: "LEVANTE",
    weight: 0,
    milkProduction: 0,
    foodConsumption: 0,
    vaccinationsCount: 0,
    heatPeriods: 0,
    offspringCount: 0,
    parentId: "",
    status: "ACTIVE",
    notes: ""
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadGoats = useCallback(async () => {
    try {
      setIsLoading(true)
      const goatsData = await goatService.getAllGoats()
      setGoats(Array.isArray(goatsData) ? goatsData : [])
    } catch (error) {
      console.error("Error cargando cabras:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las cabras",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadGoats()
  }, [loadGoats])

  // Funciones para abrir modales
  const handleView = (goat) => {
    setViewDialog({ open: true, goat })
  }

  const handleEdit = (goat) => {
    setFormData({
      goatId: goat.goatId || "",
      name: goat.name || "",
      breed: goat.breed || "",
      birthDate: goat.birthDate || "",
      gender: goat.gender || "",
      goatType: goat.goatType || "LEVANTE",
      weight: goat.weight || 0,
      milkProduction: goat.milkProduction || 0,
      foodConsumption: goat.foodConsumption || 0,
      vaccinationsCount: goat.vaccinationsCount || 0,
      heatPeriods: goat.heatPeriods || 0,
      offspringCount: goat.offspringCount || 0,
      parentId: goat.parentId || "",
      status: goat.status || "ACTIVE",
      notes: goat.notes || ""
    })
    setFormErrors({})
    setEditDialog({ open: true, goat })
  }

  const handleDelete = (goat) => {
    setDeleteDialog({ open: true, goat })
  }

  const handleCreate = () => {
    setFormData({
      goatId: "",
      name: "",
      breed: "",
      birthDate: "",
      gender: "",
      goatType: "LEVANTE",
      weight: 0,
      milkProduction: 0,
      foodConsumption: 0,
      vaccinationsCount: 0,
      heatPeriods: 0,
      offspringCount: 0,
      parentId: "",
      status: "ACTIVE",
      notes: ""
    })
    setFormErrors({})
    setCreateDialog(true)
  }

  // Validación de formulario
  const validateForm = () => {
    const errors = {}
    
    if (!formData.goatId?.trim()) errors.goatId = "El ID de cabra es requerido"
    if (!formData.name?.trim()) errors.name = "El nombre es requerido"
    if (!formData.breed?.trim()) errors.breed = "La raza es requerida"
    if (!formData.birthDate?.trim()) errors.birthDate = "La fecha de nacimiento es requerida"
    if (!formData.gender?.trim()) errors.gender = "El género es requerido"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manejar creación
  const handleCreateSubmit = async () => {
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      await goatService.createGoat(formData)
      toast({
        title: "Éxito",
        description: "Cabra creada correctamente",
        className: "bg-green-50 border-green-200"
      })
      setCreateDialog(false)
      loadGoats()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la cabra",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejar edición
  const handleEditSubmit = async () => {
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      await goatService.updateGoat(editDialog.goat.id, formData)
      toast({
        title: "Éxito",
        description: "Cabra actualizada correctamente",
        className: "bg-green-50 border-green-200"
      })
      setEditDialog({ open: false, goat: null })
      loadGoats()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la cabra",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejar eliminación
  const handleDeleteConfirm = async () => {
    try {
      setIsSubmitting(true)
      await goatService.deleteGoat(deleteDialog.goat.id)
      toast({
        title: "Éxito",
        description: "Cabra eliminada correctamente",
        className: "bg-green-50 border-green-200"
      })
      setDeleteDialog({ open: false, goat: null })
      loadGoats()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la cabra",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim()
    let data = [...goats]
    
    if (term) {
      const isNumeric = /^\d+$/.test(term)
      
      if (isNumeric) {
        const searchId = parseInt(term, 10)
        data = data.filter(g => g.id === searchId)
      } else {
        const termLower = term.toLowerCase()
        data = data.filter(g => {
          return [g.goatId, g.name, g.breed, g.gender, g.goatType, g.status]
            .filter(Boolean)
            .some(v => v.toLowerCase().includes(termLower))
        })
      }
    }
    
    data.sort((a, b) => {
      const { key, direction } = sortConfig
      const av = (a[key] ?? "").toString().toLowerCase()
      const bv = (b[key] ?? "").toString().toLowerCase()
      if (av < bv) return direction === "asc" ? -1 : 1
      if (av > bv) return direction === "asc" ? 1 : -1
      return 0
    })
    return data
  }, [goats, search, sortConfig])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const toggleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" }
      }
      return { key, direction: "asc" }
    })
  }

  const SortButton = ({ colKey, children }) => (
    <button
      type="button"
      onClick={() => toggleSort(colKey)}
      className="inline-flex items-center gap-1 group"
    >
      {children}
      <ArrowUpDown className={`h-3.5 w-3.5 opacity-50 group-hover:opacity-80 ${sortConfig.key === colKey ? 'text-primary opacity-100' : ''}`} />
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header con título y botón */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Cabras</h1>
        <Button 
          onClick={handleCreate}
          className="bg-[#6b7c45] hover:bg-[#5a6b35] text-white"
        >
          + Nueva Cabra
        </Button>
      </div>

      {/* Card principal con tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Barra de búsqueda */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Listado de Cabras</h2>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por ID, nombre, raza..."
                className="pl-9 bg-white border-gray-300"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <Button variant="outline" className="gap-2 border-gray-300">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline" className="gap-2 border-gray-300">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="font-medium text-gray-600">
                  <SortButton colKey="id">ID</SortButton>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <SortButton colKey="goatId">ID Cabra</SortButton>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <SortButton colKey="name">Nombre</SortButton>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <SortButton colKey="breed">Raza</SortButton>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <SortButton colKey="gender">Género</SortButton>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <SortButton colKey="goatType">Tipo</SortButton>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <SortButton colKey="status">Estado</SortButton>
                </TableHead>
                <TableHead className="font-medium text-gray-600 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && goats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                    Cargando cabras...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && pageData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                    No se encontraron cabras
                  </TableCell>
                </TableRow>
              )}
              {pageData.map((goat) => (
                <TableRow key={goat.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium text-gray-900">{goat.id}</TableCell>
                  <TableCell className="text-gray-700">{goat.goatId}</TableCell>
                  <TableCell className="text-gray-700">{goat.name}</TableCell>
                  <TableCell className="text-gray-600">{goat.breed}</TableCell>
                  <TableCell className="text-gray-600">
                    {goat.gender === 'MALE' ? 'Macho' : goat.gender === 'FEMALE' ? 'Hembra' : goat.gender}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {goat.goatType === 'LEVANTE' ? 'Levante' : 
                       goat.goatType === 'REPRODUCTORA' ? 'Reproductora' :
                       goat.goatType === 'LECHERA' ? 'Lechera' :
                       goat.goatType === 'CRIA' ? 'Cría' : goat.goatType}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      goat.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      goat.status === 'SOLD' ? 'bg-yellow-100 text-yellow-800' :
                      goat.status === 'DECEASED' ? 'bg-red-100 text-red-800' :
                      goat.status === 'SACRIFICED' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {goat.status === 'ACTIVE' ? 'Activo' :
                       goat.status === 'SOLD' ? 'Vendida' :
                       goat.status === 'DECEASED' ? 'Fallecida' :
                       goat.status === 'SACRIFICED' ? 'Sacrificada' : goat.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleView(goat)}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-blue-600"
                        title="Detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(goat)}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-green-600"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(goat)}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-red-600"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer con paginación */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {pageData.length} de {filtered.length} registros
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-gray-300"
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-gray-300"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      {/* Modal para Ver Detalles */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => !open && setViewDialog({ open: false, goat: null })}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Cabra</DialogTitle>
            <DialogDescription>
              Información completa de la cabra seleccionada
            </DialogDescription>
          </DialogHeader>
          {viewDialog.goat && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">ID</Label>
                  <p className="text-sm mt-1">{viewDialog.goat.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">ID Cabra</Label>
                  <p className="text-sm mt-1">{viewDialog.goat.goatId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Estado</Label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      viewDialog.goat.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      viewDialog.goat.status === 'SOLD' ? 'bg-yellow-100 text-yellow-800' :
                      viewDialog.goat.status === 'DECEASED' ? 'bg-red-100 text-red-800' :
                      viewDialog.goat.status === 'SACRIFICED' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {viewDialog.goat.status === 'ACTIVE' ? 'Activo' :
                       viewDialog.goat.status === 'SOLD' ? 'Vendida' :
                       viewDialog.goat.status === 'DECEASED' ? 'Fallecida' :
                       viewDialog.goat.status === 'SACRIFICED' ? 'Sacrificada' : viewDialog.goat.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nombre</Label>
                  <p className="text-sm mt-1">{viewDialog.goat.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Raza</Label>
                  <p className="text-sm mt-1">{viewDialog.goat.breed}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha Nacimiento</Label>
                  <p className="text-sm mt-1">{viewDialog.goat.birthDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Género</Label>
                  <p className="text-sm mt-1">
                    {viewDialog.goat.gender === 'MALE' ? 'Macho' : 
                     viewDialog.goat.gender === 'FEMALE' ? 'Hembra' : viewDialog.goat.gender}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tipo</Label>
                  <p className="text-sm mt-1">
                    {viewDialog.goat.goatType === 'LEVANTE' ? 'Levante' : 
                     viewDialog.goat.goatType === 'REPRODUCTORA' ? 'Reproductora' :
                     viewDialog.goat.goatType === 'LECHERA' ? 'Lechera' :
                     viewDialog.goat.goatType === 'CRIA' ? 'Cría' : viewDialog.goat.goatType}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Peso (kg)</Label>
                  <p className="text-sm mt-1">{viewDialog.goat.weight}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Producción Leche (L)</Label>
                  <p className="text-sm mt-1">{viewDialog.goat.milkProduction}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Consumo Alimento (kg)</Label>
                  <p className="text-sm mt-1">{viewDialog.goat.foodConsumption}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Vacunaciones</Label>
                  <p className="text-sm mt-1">{viewDialog.goat.vaccinationsCount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Períodos Celo</Label>
                  <p className="text-sm mt-1">{viewDialog.goat.heatPeriods}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Crías</Label>
                  <p className="text-sm mt-1">{viewDialog.goat.offspringCount}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">ID Padre/Madre</Label>
                <p className="text-sm mt-1">{viewDialog.goat.parentId || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Notas</Label>
                <p className="text-sm mt-1">{viewDialog.goat.notes || 'Sin notas'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog({ open: false, goat: null })}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Crear Cabra */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Cabra</DialogTitle>
            <DialogDescription>
              Complete los campos para registrar una nueva cabra
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-goatId">ID Cabra *</Label>
                <Input
                  id="create-goatId"
                  value={formData.goatId}
                  onChange={(e) => handleFormChange('goatId', e.target.value)}
                  className={formErrors.goatId ? 'border-red-500' : ''}
                />
                {formErrors.goatId && <p className="text-xs text-red-500 mt-1">{formErrors.goatId}</p>}
              </div>
              <div>
                <Label htmlFor="create-name">Nombre *</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-breed">Raza *</Label>
                <Select value={formData.breed} onValueChange={(value) => handleFormChange('breed', value)}>
                  <SelectTrigger className={`bg-white ${formErrors.breed ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Seleccione raza" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Saanen">Saanen</SelectItem>
                    <SelectItem value="Alpina">Alpina</SelectItem>
                    <SelectItem value="Toggenburg">Toggenburg</SelectItem>
                    <SelectItem value="Nubian">Nubian</SelectItem>
                    <SelectItem value="LaMancha">LaMancha</SelectItem>
                    <SelectItem value="Boer">Boer</SelectItem>
                    <SelectItem value="Oberhasli">Oberhasli</SelectItem>
                    <SelectItem value="Anglo-Nubian">Anglo-Nubian</SelectItem>
                    <SelectItem value="Criolla">Criolla</SelectItem>
                    <SelectItem value="Murciano-Granadina">Murciano-Granadina</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.breed && <p className="text-xs text-red-500 mt-1">{formErrors.breed}</p>}
              </div>
              <div>
                <Label htmlFor="create-birthDate">Fecha Nacimiento *</Label>
                <Input
                  id="create-birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleFormChange('birthDate', e.target.value)}
                  className={formErrors.birthDate ? 'border-red-500' : ''}
                />
                {formErrors.birthDate && <p className="text-xs text-red-500 mt-1">{formErrors.birthDate}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-gender">Género *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleFormChange('gender', value)}>
                  <SelectTrigger className={`bg-white ${formErrors.gender ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Seleccione género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Macho</SelectItem>
                    <SelectItem value="FEMALE">Hembra</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.gender && <p className="text-xs text-red-500 mt-1">{formErrors.gender}</p>}
              </div>
              <div>
                <Label htmlFor="create-goatType">Tipo</Label>
                <Select value={formData.goatType} onValueChange={(value) => handleFormChange('goatType', value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEVANTE">Levante</SelectItem>
                    <SelectItem value="REPRODUCTORA">Reproductora</SelectItem>
                    <SelectItem value="LECHERA">Lechera</SelectItem>
                    <SelectItem value="CRIA">Cría</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="create-weight">Peso (kg)</Label>
                <Input
                  id="create-weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleFormChange('weight', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="create-milkProduction">Prod. Leche (L)</Label>
                <Input
                  id="create-milkProduction"
                  type="number"
                  step="0.1"
                  value={formData.milkProduction}
                  onChange={(e) => handleFormChange('milkProduction', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="create-foodConsumption">Consumo Alimento (kg)</Label>
                <Input
                  id="create-foodConsumption"
                  type="number"
                  step="0.1"
                  value={formData.foodConsumption}
                  onChange={(e) => handleFormChange('foodConsumption', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="create-vaccinationsCount">Vacunaciones</Label>
                <Input
                  id="create-vaccinationsCount"
                  type="number"
                  value={formData.vaccinationsCount}
                  onChange={(e) => handleFormChange('vaccinationsCount', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="create-heatPeriods">Períodos Celo</Label>
                <Input
                  id="create-heatPeriods"
                  type="number"
                  value={formData.heatPeriods}
                  onChange={(e) => handleFormChange('heatPeriods', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="create-offspringCount">Crías</Label>
                <Input
                  id="create-offspringCount"
                  type="number"
                  value={formData.offspringCount}
                  onChange={(e) => handleFormChange('offspringCount', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-parentId">ID Padre/Madre</Label>
                <Input
                  id="create-parentId"
                  value={formData.parentId}
                  onChange={(e) => handleFormChange('parentId', e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <Label htmlFor="create-status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleFormChange('status', value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="SOLD">Vendida</SelectItem>
                    <SelectItem value="DECEASED">Fallecida</SelectItem>
                    <SelectItem value="SACRIFICED">Sacrificada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="create-notes">Notas</Label>
              <Input
                id="create-notes"
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Notas adicionales"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateSubmit} 
              disabled={isSubmitting}
              className="bg-[#6b7c45] hover:bg-[#5a6b35] text-white"
            >
              {isSubmitting ? "Creando..." : "Crear Cabra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Editar Cabra */}
      <Dialog open={editDialog.open} onOpenChange={(open) => !open && setEditDialog({ open: false, goat: null })}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cabra</DialogTitle>
            <DialogDescription>
              Modifique los campos que desea actualizar
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-goatId">ID Cabra *</Label>
                <Input
                  id="edit-goatId"
                  value={formData.goatId}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">El ID de cabra no se puede modificar</p>
              </div>
              <div>
                <Label htmlFor="edit-name">Nombre *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-breed">Raza *</Label>
                <Select value={formData.breed} onValueChange={(value) => handleFormChange('breed', value)}>
                  <SelectTrigger className={`bg-white ${formErrors.breed ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Seleccione raza" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Saanen">Saanen</SelectItem>
                    <SelectItem value="Alpina">Alpina</SelectItem>
                    <SelectItem value="Toggenburg">Toggenburg</SelectItem>
                    <SelectItem value="Nubian">Nubian</SelectItem>
                    <SelectItem value="LaMancha">LaMancha</SelectItem>
                    <SelectItem value="Boer">Boer</SelectItem>
                    <SelectItem value="Oberhasli">Oberhasli</SelectItem>
                    <SelectItem value="Anglo-Nubian">Anglo-Nubian</SelectItem>
                    <SelectItem value="Criolla">Criolla</SelectItem>
                    <SelectItem value="Murciano-Granadina">Murciano-Granadina</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.breed && <p className="text-xs text-red-500 mt-1">{formErrors.breed}</p>}
              </div>
              <div>
                <Label htmlFor="edit-birthDate">Fecha Nacimiento *</Label>
                <Input
                  id="edit-birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleFormChange('birthDate', e.target.value)}
                  className={formErrors.birthDate ? 'border-red-500' : ''}
                />
                {formErrors.birthDate && <p className="text-xs text-red-500 mt-1">{formErrors.birthDate}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-gender">Género *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleFormChange('gender', value)}>
                  <SelectTrigger className={`bg-white ${formErrors.gender ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Seleccione género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Macho</SelectItem>
                    <SelectItem value="FEMALE">Hembra</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.gender && <p className="text-xs text-red-500 mt-1">{formErrors.gender}</p>}
              </div>
              <div>
                <Label htmlFor="edit-goatType">Tipo</Label>
                <Select value={formData.goatType} onValueChange={(value) => handleFormChange('goatType', value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEVANTE">Levante</SelectItem>
                    <SelectItem value="REPRODUCTORA">Reproductora</SelectItem>
                    <SelectItem value="LECHERA">Lechera</SelectItem>
                    <SelectItem value="CRIA">Cría</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-weight">Peso (kg)</Label>
                <Input
                  id="edit-weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleFormChange('weight', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="edit-milkProduction">Prod. Leche (L)</Label>
                <Input
                  id="edit-milkProduction"
                  type="number"
                  step="0.1"
                  value={formData.milkProduction}
                  onChange={(e) => handleFormChange('milkProduction', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="edit-foodConsumption">Consumo Alimento (kg)</Label>
                <Input
                  id="edit-foodConsumption"
                  type="number"
                  step="0.1"
                  value={formData.foodConsumption}
                  onChange={(e) => handleFormChange('foodConsumption', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-vaccinationsCount">Vacunaciones</Label>
                <Input
                  id="edit-vaccinationsCount"
                  type="number"
                  value={formData.vaccinationsCount}
                  onChange={(e) => handleFormChange('vaccinationsCount', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="edit-heatPeriods">Períodos Celo</Label>
                <Input
                  id="edit-heatPeriods"
                  type="number"
                  value={formData.heatPeriods}
                  onChange={(e) => handleFormChange('heatPeriods', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="edit-offspringCount">Crías</Label>
                <Input
                  id="edit-offspringCount"
                  type="number"
                  value={formData.offspringCount}
                  onChange={(e) => handleFormChange('offspringCount', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-parentId">ID Padre/Madre</Label>
                <Input
                  id="edit-parentId"
                  value={formData.parentId}
                  onChange={(e) => handleFormChange('parentId', e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleFormChange('status', value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="SOLD">Vendida</SelectItem>
                    <SelectItem value="DECEASED">Fallecida</SelectItem>
                    <SelectItem value="SACRIFICED">Sacrificada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-notes">Notas</Label>
              <Input
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Notas adicionales"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, goat: null })} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEditSubmit} 
              disabled={isSubmitting}
              className="bg-[#6b7c45] hover:bg-[#5a6b35] text-white"
            >
              {isSubmitting ? "Actualizando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Confirmar Eliminación */}
      {/* Modal de Eliminación */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, goat: null })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar esta cabra? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {deleteDialog.goat && (
            <div className="py-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Cabra:</span> {deleteDialog.goat.name} ({deleteDialog.goat.goatId})
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">Raza:</span> {deleteDialog.goat.breed}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ open: false, goat: null })} 
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              disabled={isSubmitting}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
