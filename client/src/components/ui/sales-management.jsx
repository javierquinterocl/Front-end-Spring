import { useState, useEffect } from "react"
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
import { ArrowUpDown, Calendar, FileDown, Filter, Plus, Search, User, DollarSign } from "lucide-react"
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
import { getAllSales, createSale, updateSale, deleteSale } from "@/services/api"
import { getAllStaff } from "@/services/api"
import { Sale, CreateSaleData, UpdateSaleData } from "@/interfaces/sale"
import { Staff } from "@/interfaces/staff"
import { useToast } from "@/components/ui/use-toast"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Datos de ejemplo
const salesData = [
  {
    id: "VEN001",
    date: "2023-04-15",
    product: "Leche",
    quantity: 25,
    unit: "L",
    price: 5,
    total: 125,
    customer: "Lácteos Regionales",
    paymentMethod: "Transferencia",
    paymentStatus: "Pagado",
    notes: "Entrega semanal",
  },
  {
    id: "VEN002",
    date: "2023-04-12",
    product: "Leche",
    quantity: 30,
    unit: "L",
    price: 5,
    total: 150,
    customer: "Tienda Orgánica",
    paymentMethod: "Efectivo",
    paymentStatus: "Pagado",
    notes: "Cliente nuevo",
  },
  {
    id: "VEN003",
    date: "2023-04-10",
    product: "Queso",
    quantity: 5,
    unit: "kg",
    price: 12,
    total: 60,
    customer: "Restaurante El Sabor",
    paymentMethod: "Crédito",
    paymentStatus: "Pendiente",
    notes: "Pago a 15 días",
  },
  {
    id: "VEN004",
    date: "2023-04-05",
    product: "Cabrito",
    quantity: 1,
    unit: "unidad",
    price: 120,
    total: 120,
    customer: "Carnicería Local",
    paymentMethod: "Transferencia",
    paymentStatus: "Pagado",
    notes: "Entrega en carnicería",
  },
  {
    id: "VEN005",
    date: "2023-04-01",
    product: "Leche",
    quantity: 20,
    unit: "L",
    price: 5,
    total: 100,
    customer: "Lácteos Regionales",
    paymentMethod: "Transferencia",
    paymentStatus: "Pagado",
    notes: "Entrega semanal",
  },
  {
    id: "VEN006",
    date: "2023-03-28",
    product: "Yogurt",
    quantity: 15,
    unit: "L",
    price: 8,
    total: 120,
    customer: "Tienda Orgánica",
    paymentMethod: "Efectivo",
    paymentStatus: "Pagado",
    notes: "Producto nuevo",
  },
  {
    id: "VEN007",
    date: "2023-03-25",
    product: "Queso",
    quantity: 8,
    unit: "kg",
    price: 12,
    total: 96,
    customer: "Restaurante El Sabor",
    paymentMethod: "Crédito",
    paymentStatus: "Pendiente",
    notes: "Pago a 15 días",
  },
  {
    id: "VEN008",
    date: "2023-03-20",
    product: "Leche",
    quantity: 25,
    unit: "L",
    price: 5,
    total: 125,
    customer: "Lácteos Regionales",
    paymentMethod: "Transferencia",
    paymentStatus: "Pagado",
    notes: "Entrega semanal",
  },
]

// Datos de ejemplo para clientes
const customers = [
  {
    id: "CLI001",
    name: "Lácteos Regionales",
    contact: "Juan Pérez",
    phone: "555-123-4567",
    email: "juan@lacteosregionales.com",
  },
  {
    id: "CLI002",
    name: "Tienda Orgánica",
    contact: "María López",
    phone: "555-234-5678",
    email: "maria@tiendaorganica.com",
  },
  {
    id: "CLI003",
    name: "Restaurante El Sabor",
    contact: "Carlos Gómez",
    phone: "555-345-6789",
    email: "carlos@elsabor.com",
  },
  {
    id: "CLI004",
    name: "Carnicería Local",
    contact: "Ana Martínez",
    phone: "555-456-7890",
    email: "ana@carnicerialocal.com",
  },
]

// Función para exportar el detalle de una venta a PDF
function exportSaleToPDF(sale: Sale) {
  const doc = new jsPDF();
  // Encabezado con color verde claro
  doc.setFillColor(230, 240, 220); // Verde claro similar al fondo de la app
  doc.rect(0, 0, 210, 30, 'F');
  doc.setFontSize(18);
  doc.setTextColor(60, 80, 40); // Verde oscuro
  doc.setFont('helvetica', 'bold');
  doc.text("Gestión de Ventas - Detalle de Venta", 14, 20);

  // Fecha de generación
  doc.setFontSize(10);
  doc.setTextColor(100);
  const fechaGen = new Date().toLocaleString();
  doc.text(`Generado: ${fechaGen}`, 150, 27);

  // Datos principales en tabla
  doc.setFontSize(12);
  doc.setTextColor(33, 37, 41);
  doc.setFont('helvetica', 'normal');
  autoTable(doc, {
    startY: 36,
    head: [["Campo", "Valor"]],
    body: [
      ["ID", sale.id],
      ["Fecha", sale.date],
      ["Cliente", sale.client_id],
      ["Producto", sale.product_type],
      ["Cantidad", `${sale.quantity} ${sale.unit}`],
      ["Precio Unitario", `$${sale.unit_price}`],
      ["Total", `$${sale.total}`],
      ["Método de Pago", sale.payment_method],
      ["Estado de Pago", sale.payment_status],
      ["Notas", sale.notes || "-"]
    ],
    headStyles: {
      fillColor: [230, 240, 220], // Verde claro
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

  doc.save(`venta_${sale.id}.pdf`);
}

export function SalesManagement() {
  const { toast } = useToast()
  const [sales, setSales] = useState<Sale[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [formData, setFormData] = useState<CreateSaleData>({
    sale_id: "",
    user_id: "",
    client_id: "",
    product_type: "leche",
    quantity: 0,
    unit: "lt",
    unit_price: 0,
    date: "",
    payment_method: "efectivo",
    payment_status: "pagado",
    notes: ""
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Cargar ventas y usuarios
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [salesData, staffData] = await Promise.all([
          getAllSales(),
          getAllStaff()
        ])
        setSales(salesData)
        setStaffList(staffData)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "No se pudieron cargar los datos",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [toast])

  // Registrar nueva venta
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setIsFormLoading(true)
    try {
      const sale = await createSale(formData)
      setSales(prev => [sale, ...prev])
      toast({ title: "Venta registrada", description: "La venta se registró correctamente" })
      
      // Cerrar el formulario y limpiar los datos
      setCreateOpen(false)
      setFormData({
        sale_id: "",
        user_id: "",
        client_id: "",
        product_type: "leche",
        quantity: 0,
        unit: "lt",
        unit_price: 0,
        date: "",
        payment_method: "efectivo",
        payment_status: "pagado",
        notes: ""
      })
      setFormErrors({})
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo registrar la venta",
        variant: "destructive"
      })
    } finally {
      setIsFormLoading(false)
    }
  }

  // Manejar cambios en el formulario
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Manejar cambios en selects personalizados
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Validar el formulario
  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.sale_id.trim()) errors.sale_id = "El ID de la venta es obligatorio"
    if (!formData.user_id) errors.user_id = "Debe seleccionar un usuario"
    if (!formData.client_id || formData.client_id.length !== 10) errors.client_id = "La cédula debe tener 10 dígitos"
    if (!formData.product_type) errors.product_type = "Seleccione el tipo de producto"
    if (!formData.quantity || Number(formData.quantity) <= 0) errors.quantity = "Ingrese una cantidad válida"
    if (!formData.unit) errors.unit = "Seleccione la unidad"
    if (!formData.unit_price || Number(formData.unit_price) <= 0) errors.unit_price = "Ingrese un valor unitario válido"
    if (!formData.date) errors.date = "Seleccione la fecha"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Eliminar venta
  const handleDeleteSale = async (id) => {
    try {
      await deleteSale(id)
      setSales(prev => prev.filter(s => s.id !== id))
      toast({ title: "Venta eliminada", description: "La venta fue eliminada correctamente" })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la venta",
        variant: "destructive"
      })
    }
  }

  // TODO: Implementar edición de venta (similar a creación)

  const [sortConfig, setSortConfig] = useState<{ key; direction: "ascending" | "descending" } | null>(null)
  const [activeFilters, setActiveFilters] = useState<{
    product
    customer
    paymentStatus
  }>({
    product: [],
    customer: [],
    paymentStatus: [],
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
  let filteredSales = [...sales]

  // Aplicar filtros de búsqueda
  if (searchTerm) {
    filteredSales = filteredSales.filter(
      (sale) =>
        String(sale.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(sale.product_type).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(sale.client_id).toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  // Aplicar filtros de dropdown
  if (activeFilters.product.length > 0) {
    filteredSales = filteredSales.filter((sale) => activeFilters.product.includes(String(sale.product_type)))
  }

  if (activeFilters.customer.length > 0) {
    filteredSales = filteredSales.filter((sale) => activeFilters.customer.includes(String(sale.client_id)))
  }

  if (activeFilters.paymentStatus.length > 0) {
    filteredSales = filteredSales.filter((sale) => activeFilters.paymentStatus.includes(String(sale.payment_status)))
  }

  // Aplicar ordenamiento
  if (sortConfig !== null) {
    filteredSales.sort((a, b) => {
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
  const uniqueProducts = [...new Set(sales.map((sale) => String(sale.product_type)))]
  const uniqueCustomers = [...new Set(sales.map((sale) => String(sale.client_id)))]
  const uniquePaymentStatuses = [...new Set(sales.map((sale) => String(sale.payment_status)))]

  // Función para manejar cambios en los filtros
  const handleFilterChange = (type: "product" | "customer" | "paymentStatus", value) => {
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
      product: [],
      customer: [],
      paymentStatus: [],
    })
    setSearchTerm("")
  }

  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Ventas</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Venta</DialogTitle>
              <DialogDescription>
                Ingrese los datos de la nueva venta. Haga clic en guardar cuando termine.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sale_id">ID</Label>
                    <Input 
                      id="sale_id" 
                      name="sale_id"
                      value={formData.sale_id}
                      onChange={handleFormChange}
                      placeholder="VEN000" 
                    />
                    {formErrors.sale_id && <span className="text-red-500 text-xs">{formErrors.sale_id}</span>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input 
                      id="date" 
                      name="date"
                      type="date" 
                      value={formData.date}
                      onChange={handleFormChange}
                    />
                    {formErrors.date && <span className="text-red-500 text-xs">{formErrors.date}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="product_type">Producto</Label>
                    <Select 
                      value={formData.product_type} 
                      onValueChange={(value) => handleSelectChange("product_type", value)}
                    >
                      <SelectTrigger id="product_type">
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leche">Leche</SelectItem>
                        <SelectItem value="carne">Carne</SelectItem>
                        <SelectItem value="cabra de a pie">Cabrito</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.product_type && <span className="text-red-500 text-xs">{formErrors.product_type}</span>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="client_id">Cliente</Label>
                    <Input 
                      id="client_id" 
                      name="client_id"
                      value={formData.client_id}
                      onChange={handleFormChange}
                      placeholder="Ingrese la cédula del cliente"
                    />
                    {formErrors.client_id && <span className="text-red-500 text-xs">{formErrors.client_id}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Cantidad</Label>
                    <Input 
                      id="quantity" 
                      name="quantity"
                      type="number" 
                      value={formData.quantity}
                      onChange={handleFormChange}
                      placeholder="0" 
                    />
                    {formErrors.quantity && <span className="text-red-500 text-xs">{formErrors.quantity}</span>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unidad</Label>
                    <Select 
                      value={formData.unit} 
                      onValueChange={(value) => handleSelectChange("unit", value)}
                    >
                      <SelectTrigger id="unit">
                        <SelectValue placeholder="Unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lt">Litros (L)</SelectItem>
                        <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                        <SelectItem value="unidad">Unidades</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.unit && <span className="text-red-500 text-xs">{formErrors.unit}</span>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit_price">Precio Unitario</Label>
                    <Input 
                      id="unit_price" 
                      name="unit_price"
                      type="number" 
                      value={formData.unit_price}
                      onChange={handleFormChange}
                      placeholder="0.00" 
                    />
                    {formErrors.unit_price && <span className="text-red-500 text-xs">{formErrors.unit_price}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="payment_method">Método de Pago</Label>
                    <Select 
                      value={formData.payment_method} 
                      onValueChange={(value) => handleSelectChange("payment_method", value)}
                    >
                      <SelectTrigger id="payment_method">
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                        <SelectItem value="credito">Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="payment_status">Estado de Pago</Label>
                    <Select 
                      value={formData.payment_status} 
                      onValueChange={(value) => handleSelectChange("payment_status", value)}
                    >
                      <SelectTrigger id="payment_status">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pagado">Pagado</SelectItem>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Input 
                    id="notes" 
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    placeholder="Observaciones adicionales" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="user_id">Usuario que realiza la venta</Label>
                  <Select value={formData.user_id} onValueChange={value => handleSelectChange("user_id", value)}>
                    <SelectTrigger id="user_id">
                      <SelectValue placeholder="Seleccionar usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList.map((staff) => (
                        <SelectItem key={staff.staff_id} value={staff.staff_id}>
                          {staff.first_name} {staff.last_name} ({staff.staff_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.user_id && <span className="text-red-500 text-xs">{formErrors.user_id}</span>}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isFormLoading}>
                  {isFormLoading ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Listado de Ventas</CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por ID, producto o cliente..."
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
                    {(activeFilters.product.length > 0 ||
                      activeFilters.customer.length > 0 ||
                      activeFilters.paymentStatus.length > 0) && (
                      <Badge variant="secondary" className="ml-2 rounded-full">
                        {activeFilters.product.length +
                          activeFilters.customer.length +
                          activeFilters.paymentStatus.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuLabel className="font-normal">Producto</DropdownMenuLabel>
                  {uniqueProducts.map((product) => (
                    <DropdownMenuCheckboxItem
                      key={product}
                      checked={activeFilters.product.includes(product)}
                      onCheckedChange={() => handleFilterChange("product", product)}
                    >
                      {product}
                    </DropdownMenuCheckboxItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="font-normal">Cliente</DropdownMenuLabel>
                  {uniqueCustomers.map((customer) => (
                    <DropdownMenuCheckboxItem
                      key={customer}
                      checked={activeFilters.customer.includes(customer)}
                      onCheckedChange={() => handleFilterChange("customer", customer)}
                    >
                      {customer}
                    </DropdownMenuCheckboxItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="font-normal">Estado de Pago</DropdownMenuLabel>
                  {uniquePaymentStatuses.map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={activeFilters.paymentStatus.includes(status)}
                      onCheckedChange={() => handleFilterChange("paymentStatus", status)}
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
                    <div className="flex items-center space-x-1 cursor-pointer" onClick={() => requestSort("date")}> 
                      <span>Fecha</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1 cursor-pointer" onClick={() => requestSort("product_type")}> 
                      <span>Producto</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1 cursor-pointer" onClick={() => requestSort("quantity")}> 
                      <span>Cantidad</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    <div className="flex items-center space-x-1 cursor-pointer" onClick={() => requestSort("total")}> 
                      <span>Total</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <div className="flex items-center space-x-1 cursor-pointer" onClick={() => requestSort("client_id")}> 
                      <span>Cliente</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <div className="flex items-center space-x-1 cursor-pointer" onClick={() => requestSort("payment_status")}> 
                      <span>Estado</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      No se encontraron registros que coincidan con los criterios de búsqueda.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{sale.date}</TableCell>
                      <TableCell>{sale.product_type}</TableCell>
                      <TableCell>
                        {sale.quantity} {sale.unit}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">${sale.total}</TableCell>
                      <TableCell className="hidden lg:table-cell">{sale.client_id}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={sale.payment_status === "Pagado" ? "default" : "secondary"}>
                          {sale.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSale(sale)
                              setDetailsOpen(true)
                            }}
                          >
                            Detalles
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => exportSaleToPDF(sale)}>
                            <FileDown className="h-4 w-4" />
                            <span className="sr-only">PDF</span>
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
            Mostrando {filteredSales.length} de {sales.length} registros
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

      {/* Diálogo de detalles */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Venta</DialogTitle>
            <DialogDescription>Información detallada de la venta seleccionada.</DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Información General
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="font-medium">ID:</span> {selectedSale.id}
                    </p>
                    <p>
                      <span className="font-medium">Fecha:</span> {selectedSale.date}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" /> Cliente
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p>{selectedSale.client_id}</p>
                    <p>{customers.find((c) => c.id === selectedSale.client_id)?.contact}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Detalle del Producto</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Producto</p>
                    <p>{selectedSale.product_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cantidad</p>
                    <p>
                      {selectedSale.quantity} {selectedSale.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Precio Unit.</p>
                    <p>${selectedSale.unit_price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-bold">${selectedSale.total}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Información de Pago
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="font-medium">Método:</span> {selectedSale.payment_method}
                    </p>
                    <p>
                      <span className="font-medium">Estado:</span>
                      <Badge
                        variant={selectedSale.payment_status === "Pagado" ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {selectedSale.payment_status}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Notas</h3>
                  <p className="mt-2">{selectedSale.notes}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => selectedSale && exportSaleToPDF(selectedSale)}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

