import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpDown, Edit, FileDown, Filter, Plus, Search, Trash2 } from "lucide-react"
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

// Datos de ejemplo
const goats = [
  {
    id: "CAP001",
    name: "Luna",
    breed: "Alpina",
    sex: "Hembra",
    birthDate: "2022-05-15",
    weight: 35,
    status: "Activo",
    offspring: 2,
    feedAmount: 1.2,
    lastCheckup: "2023-03-10",
    mother: "CAP000",
    father: "CAP000",
    notes: "Excelente productora de leche",
  },
  {
    id: "CAP002",
    name: "Sol",
    breed: "Saanen",
    sex: "Hembra",
    birthDate: "2021-08-22",
    weight: 42,
    status: "Activo",
    offspring: 3,
    feedAmount: 1.5,
    lastCheckup: "2023-02-15",
    mother: "CAP000",
    father: "CAP000",
    notes: "Ganadora de premio regional",
  },
  {
    id: "CAP003",
    name: "Rayo",
    breed: "Nubia",
    sex: "Macho",
    birthDate: "2022-02-10",
    weight: 48,
    status: "Activo",
    offspring: 0,
    feedAmount: 1.8,
    lastCheckup: "2023-04-05",
    mother: "CAP000",
    father: "CAP000",
    notes: "Reproductor principal",
  },
  {
    id: "CAP004",
    name: "Nube",
    breed: "Alpina",
    sex: "Hembra",
    birthDate: "2023-01-05",
    weight: 28,
    status: "Activo",
    offspring: 0,
    feedAmount: 1.0,
    lastCheckup: "2023-03-22",
    mother: "CAP002",
    father: "CAP003",
    notes: "Primera gestación",
  },
  {
    id: "CAP005",
    name: "Trueno",
    breed: "Boer",
    sex: "Macho",
    birthDate: "2021-11-18",
    weight: 52,
    status: "Activo",
    offspring: 5,
    feedAmount: 2.0,
    lastCheckup: "2023-02-28",
    mother: "CAP000",
    father: "CAP000",
    notes: "Excelente conformación",
  },
  {
    id: "CAP006",
    name: "Estrella",
    breed: "Saanen",
    sex: "Hembra",
    birthDate: "2022-07-12",
    weight: 38,
    status: "Activo",
    offspring: 1,
    feedAmount: 1.3,
    lastCheckup: "2023-04-10",
    mother: "CAP002",
    father: "CAP003",
    notes: "Alta producción de leche",
  },
  {
    id: "CAP007",
    name: "Tormenta",
    breed: "Toggenburg",
    sex: "Hembra",
    birthDate: "2022-03-25",
    weight: 36,
    status: "Activo",
    offspring: 2,
    feedAmount: 1.2,
    lastCheckup: "2023-03-15",
    mother: "CAP000",
    father: "CAP000",
    notes: "Temperamento dócil",
  },
  {
    id: "CAP008",
    name: "Relámpago",
    breed: "Nubia",
    sex: "Macho",
    birthDate: "2021-10-05",
    weight: 50,
    status: "Vendido",
    offspring: 8,
    feedAmount: 0,
    lastCheckup: "2023-01-20",
    mother: "CAP000",
    father: "CAP000",
    notes: "Vendido a granja vecina",
  },
]

export function GoatRegistry() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key; direction: "ascending" | "descending" } | null>(null)
  const [activeFilters, setActiveFilters] = useState<{
    breed
    sex
    status
  }>({
    breed: [],
    sex: [],
    status: [],
  })

  // Función para ordenar
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
        goat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goat.breed.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  // Aplicar filtros de dropdown
  if (activeFilters.breed.length > 0) {
    filteredGoats = filteredGoats.filter((goat) => activeFilters.breed.includes(goat.breed))
  }

  if (activeFilters.sex.length > 0) {
    filteredGoats = filteredGoats.filter((goat) => activeFilters.sex.includes(goat.sex))
  }

  if (activeFilters.status.length > 0) {
    filteredGoats = filteredGoats.filter((goat) => activeFilters.status.includes(goat.status))
  }

  // Aplicar ordenamiento
  if (sortConfig !== null) {
    filteredGoats.sort((a, b) => {
      if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }

  // Extraer valores únicos para los filtros
  const uniqueBreeds = [...new Set(goats.map((goat) => goat.breed))]
  const uniqueStatuses = [...new Set(goats.map((goat) => goat.status))]

  // Función para manejar cambios en los filtros
  const handleFilterChange = (type: "breed" | "sex" | "status", value) => {
    setActiveFilters((prev) => {
      const currentValues = [...prev[type]]
      const valueIndex = currentValues.indexOf(value)

      if (valueIndex === -1) {
        currentValues.push(value)
      } else {
        currentValues.splice(valueIndex, 1)
      }

      return {
        ...prev,
        [type]: currentValues,
      }
    })
  }

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setActiveFilters({
      breed: [],
      sex: [],
      status: [],
    })
    setSearchTerm("")
  }

  const [selectedGoat, setSelectedGoat] = useState<(typeof goats)[0] | null>(null)
  // Agregar un nuevo estado para controlar el diálogo de edición
  const [editOpen, setEditOpen] = useState(false)

  // Agregar esta línea después de la declaración de selectedGoat
  const [goatToEdit, setGoatToEdit] = useState<(typeof goats)[0] | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Registro Caprino</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Caprino
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Caprino</DialogTitle>
              <DialogDescription>
                Ingrese los datos del nuevo caprino. Haga clic en guardar cuando termine.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="id">ID</Label>
                  <Input id="id" placeholder="CAP000" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" placeholder="Nombre del caprino" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="breed">Raza</Label>
                  <Select>
                    <SelectTrigger id="breed">
                      <SelectValue placeholder="Seleccionar raza" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alpina">Alpina</SelectItem>
                      <SelectItem value="saanen">Saanen</SelectItem>
                      <SelectItem value="nubia">Nubia</SelectItem>
                      <SelectItem value="toggenburg">Toggenburg</SelectItem>
                      <SelectItem value="boer">Boer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sex">Sexo</Label>
                  <Select>
                    <SelectTrigger id="sex">
                      <SelectValue placeholder="Seleccionar sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="macho">Macho</SelectItem>
                      <SelectItem value="hembra">Hembra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                  <Input id="birthDate" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input id="weight" type="number" placeholder="0.0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="mother">Madre (ID)</Label>
                  <Input id="mother" placeholder="ID de la madre" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="father">Padre (ID)</Label>
                  <Input id="father" placeholder="ID del padre" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="offspring">Cantidad de Crías</Label>
                  <Input id="offspring" type="number" placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="feedAmount">Alimento Diario (kg)</Label>
                  <Input id="feedAmount" type="number" placeholder="0.0" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Estado</Label>
                <Select defaultValue="activo">
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="vendido">Vendido</SelectItem>
                    <SelectItem value="fallecido">Fallecido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notas</Label>
                <Input id="notes" placeholder="Observaciones adicionales" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="female">Hembras</TabsTrigger>
          <TabsTrigger value="male">Machos</TabsTrigger>
          <TabsTrigger value="young">Crías</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Listado de Caprinos</CardTitle>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por ID, nombre o raza..."
                      className="pl-8 w-full sm:w-[300px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="ml-auto">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtros
                        {(activeFilters.breed.length > 0 ||
                          activeFilters.sex.length > 0 ||
                          activeFilters.status.length > 0) && (
                          <Badge variant="secondary" className="ml-2 rounded-full">
                            {activeFilters.breed.length + activeFilters.sex.length + activeFilters.status.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuLabel className="font-normal">Raza</DropdownMenuLabel>
                      {uniqueBreeds.map((breed) => (
                        <DropdownMenuCheckboxItem
                          key={breed}
                          checked={activeFilters.breed.includes(breed)}
                          onCheckedChange={() => handleFilterChange("breed", breed)}
                        >
                          {breed}
                        </DropdownMenuCheckboxItem>
                      ))}

                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="font-normal">Sexo</DropdownMenuLabel>
                      <DropdownMenuCheckboxItem
                        checked={activeFilters.sex.includes("Macho")}
                        onCheckedChange={() => handleFilterChange("sex", "Macho")}
                      >
                        Macho
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={activeFilters.sex.includes("Hembra")}
                        onCheckedChange={() => handleFilterChange("sex", "Hembra")}
                      >
                        Hembra
                      </DropdownMenuCheckboxItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="font-normal">Estado</DropdownMenuLabel>
                      {uniqueStatuses.map((status) => (
                        <DropdownMenuCheckboxItem
                          key={status}
                          checked={activeFilters.status.includes(status)}
                          onCheckedChange={() => handleFilterChange("status", status)}
                        >
                          {status}
                        </DropdownMenuCheckboxItem>
                      ))}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={clearFilters}>Limpiar filtros</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button variant="outline" size="icon">
                    <FileDown className="h-4 w-4" />
                    <span className="sr-only">Descargar PDF</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">
                        <div className="flex items-center space-x-1 cursor-pointer" onClick={() => requestSort("id")}>
                          <span>ID</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-1 cursor-pointer" onClick={() => requestSort("name")}>
                          <span>Nombre</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div
                          className="flex items-center space-x-1 cursor-pointer"
                          onClick={() => requestSort("breed")}
                        >
                          <span>Raza</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-1 cursor-pointer" onClick={() => requestSort("sex")}>
                          <span>Sexo</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        <div
                          className="flex items-center space-x-1 cursor-pointer"
                          onClick={() => requestSort("birthDate")}
                        >
                          <span>Fecha Nac.</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        <div
                          className="flex items-center space-x-1 cursor-pointer"
                          onClick={() => requestSort("weight")}
                        >
                          <span>Peso (kg)</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        <div
                          className="flex items-center space-x-1 cursor-pointer"
                          onClick={() => requestSort("offspring")}
                        >
                          <span>Crías</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        <div
                          className="flex items-center space-x-1 cursor-pointer"
                          onClick={() => requestSort("status")}
                        >
                          <span>Estado</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGoats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center h-24">
                          No se encontraron registros que coincidan con los criterios de búsqueda.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredGoats.map((goat) => (
                        <TableRow key={goat.id}>
                          <TableCell className="font-medium">{goat.id}</TableCell>
                          <TableCell>{goat.name}</TableCell>
                          <TableCell>{goat.breed}</TableCell>
                          <TableCell>{goat.sex}</TableCell>
                          <TableCell className="hidden md:table-cell">{goat.birthDate}</TableCell>
                          <TableCell className="hidden md:table-cell">{goat.weight}</TableCell>
                          <TableCell className="hidden md:table-cell">{goat.offspring}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge
                              variant={
                                goat.status === "Activo"
                                  ? "default"
                                  : goat.status === "Vendido"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {goat.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedGoat(goat)
                                  setDetailsOpen(true)
                                }}
                              >
                                Detalles
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setGoatToEdit(goat)
                                  setEditOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-500">
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
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
              <div className="text-sm text-muted-foreground">
                Mostrando {filteredGoats.length} de {goats.length} registros
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Siguiente
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="female" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hembras</CardTitle>
              <CardDescription>Listado de caprinos hembras registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenido filtrado para hembras se mostrará aquí.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="male" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Machos</CardTitle>
              <CardDescription>Listado de caprinos machos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenido filtrado para machos se mostrará aquí.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="young" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crías</CardTitle>
              <CardDescription>Listado de crías recientes (menos de 6 meses)</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenido filtrado para crías se mostrará aquí.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de detalles */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Caprino</DialogTitle>
            <DialogDescription>Información detallada del caprino seleccionado.</DialogDescription>
          </DialogHeader>
          {selectedGoat && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">ID</h3>
                  <p>{selectedGoat.id}</p>
                </div>
                <div>
                  <h3 className="font-medium">Nombre</h3>
                  <p>{selectedGoat.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Raza</h3>
                  <p>{selectedGoat.breed}</p>
                </div>
                <div>
                  <h3 className="font-medium">Sexo</h3>
                  <p>{selectedGoat.sex}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Fecha de Nacimiento</h3>
                  <p>{selectedGoat.birthDate}</p>
                </div>
                <div>
                  <h3 className="font-medium">Peso</h3>
                  <p>{selectedGoat.weight} kg</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Madre</h3>
                  <p>{selectedGoat.mother}</p>
                </div>
                <div>
                  <h3 className="font-medium">Padre</h3>
                  <p>{selectedGoat.father}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Cantidad de Crías</h3>
                  <p>{selectedGoat.offspring}</p>
                </div>
                <div>
                  <h3 className="font-medium">Alimento Diario</h3>
                  <p>{selectedGoat.feedAmount} kg</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Estado</h3>
                  <Badge
                    variant={
                      selectedGoat.status === "Activo"
                        ? "default"
                        : selectedGoat.status === "Vendido"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {selectedGoat.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium">Último Chequeo</h3>
                  <p>{selectedGoat.lastCheckup}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium">Notas</h3>
                <p>{selectedGoat.notes}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Cerrar
            </Button>
            <Button>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Diálogo de edición */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Caprino</DialogTitle>
            <DialogDescription>Modifique los datos del caprino. Haga clic en guardar cuando termine.</DialogDescription>
          </DialogHeader>
          {goatToEdit && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-id">ID</Label>
                  <Input id="edit-id" defaultValue={goatToEdit.id} disabled />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nombre</Label>
                  <Input id="edit-name" defaultValue={goatToEdit.name} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-breed">Raza</Label>
                  <Select defaultValue={goatToEdit.breed.toLowerCase()}>
                    <SelectTrigger id="edit-breed">
                      <SelectValue placeholder="Seleccionar raza" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alpina">Alpina</SelectItem>
                      <SelectItem value="saanen">Saanen</SelectItem>
                      <SelectItem value="nubia">Nubia</SelectItem>
                      <SelectItem value="toggenburg">Toggenburg</SelectItem>
                      <SelectItem value="boer">Boer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-sex">Sexo</Label>
                  <Select defaultValue={goatToEdit.sex.toLowerCase()}>
                    <SelectTrigger id="edit-sex">
                      <SelectValue placeholder="Seleccionar sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="macho">Macho</SelectItem>
                      <SelectItem value="hembra">Hembra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-birthDate">Fecha de Nacimiento</Label>
                  <Input id="edit-birthDate" type="date" defaultValue={goatToEdit.birthDate} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-weight">Peso (kg)</Label>
                  <Input id="edit-weight" type="number" defaultValue={goatToEdit.weight} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-mother">Madre (ID)</Label>
                  <Input id="edit-mother" defaultValue={goatToEdit.mother} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-father">Padre (ID)</Label>
                  <Input id="edit-father" defaultValue={goatToEdit.father} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-offspring">Cantidad de Crías</Label>
                  <Input id="edit-offspring" type="number" defaultValue={goatToEdit.offspring} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-feedAmount">Alimento Diario (kg)</Label>
                  <Input id="edit-feedAmount" type="number" defaultValue={goatToEdit.feedAmount} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select defaultValue={goatToEdit.status.toLowerCase()}>
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="vendido">Vendido</SelectItem>
                    <SelectItem value="fallecido">Fallecido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notas</Label>
                <Input id="edit-notes" defaultValue={goatToEdit.notes} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                // Aquí iría la lógica para guardar los cambios
                setEditOpen(false)
                // Mostrar notificación de éxito
                alert("Caprino actualizado correctamente")
              }}
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

