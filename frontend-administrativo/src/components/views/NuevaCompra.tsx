import { useState, useEffect } from "react";
import {
  getCompras,
  addCompra,
  getNextId,
  getProductos,
  addProducto,
  updateProducto,
  findProductoByNombre,
  addNotaEntrada,
  generateNotaEntradaNumero,
  getCategorias,
  isCajaAbierta,
  addMovimientoCaja,
  getMovimientosCaja,
  getProveedores,
  type Compra as CompraType,
  type Producto as ProductoType,
  type NotaEntrada as NotaEntradaType,
  type ProductoNE,
  type Categoria,
  type MovimientoCaja,
  type ClienteProveedor,
} from "../../lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  FileText,
  Calendar,
  ShoppingCart,
  Plus,
  Trash2,
  Save,
  X,
  AlertCircle,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";

interface DetalleProducto {
  id: string;
  categoria: string;
  nombre: string;
  cantidad: number;
  importeTotal: number;
}

interface Proveedor {
  id: number;
  nombre: string;
  ruc: string;
}

// Datos de ejemplo de proveedores
const proveedoresSugeridos: Proveedor[] = [
  { id: 2, nombre: "Distribuidora San Juan S.A.C.", ruc: "20458963214" },
  { id: 3, nombre: "Comercial Lácteos del Norte E.I.R.L.", ruc: "20147852369" },
  { id: 5, nombre: "Café & Más Distribuciones S.R.L.", ruc: "20258741369" },
  { id: 7, nombre: "Insumos Reposteros Lima S.A.", ruc: "20336985214" },
];

export function NuevaCompra() {
  // Verificar si la caja está abierta
  const [cajaAbierta, setCajaAbierta] = useState(false);
  
  useEffect(() => {
    setCajaAbierta(isCajaAbierta());
  }, []);

  const [numeroOrden, setNumeroOrden] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [proveedorSeleccionadoId, setProveedorSeleccionadoId] = useState<number | null>(null);
  const [openProveedorPicker, setOpenProveedorPicker] = useState(false);
  const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().split('T')[0]);
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [estado, setEstado] = useState<"Pendiente" | "Recibido">("Pendiente");
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "yape" | "plin">("efectivo");
  const [observaciones, setObservaciones] = useState("");
  
  const [detallesProductos, setDetallesProductos] = useState<DetalleProducto[]>([]);
  
  // Estado para agregar nuevo producto
  const [categoriaProducto, setCategoriaProducto] = useState("");
  const [nuevoProducto, setNuevoProducto] = useState("");
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<number | null>(null);
  const [openProductoPicker, setOpenProductoPicker] = useState(false);
  const [cantidadProducto, setCantidadProducto] = useState("");
  const [importeProducto, setImporteProducto] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar categorías y productos desde storage
  const [categoriasProducto, setCategoriasProducto] = useState<Categoria[]>([]);
  const [productosInventario, setProductosInventario] = useState<ProductoType[]>([]);
  const [proveedoresRegistrados, setProveedoresRegistrados] = useState<ClienteProveedor[]>([]);

  useEffect(() => {
    const todasCategorias = getCategorias();
    setCategoriasProducto(todasCategorias.filter(c => c.tipo === "Producto" && c.estado === "Activa"));
    setProductosInventario(getProductos());
    setProveedoresRegistrados(getProveedores());
  }, []);

  const calcularTotal = () => {
    return detallesProductos.reduce((sum, item) => sum + item.importeTotal, 0);
  };

  const handleAgregarProducto = () => {
    if (!categoriaProducto.trim()) {
      toast.error("Ingrese la categoría del producto");
      return;
    }

    if (!nuevoProducto.trim()) {
      toast.error("Ingrese el nombre del producto");
      return;
    }

    if (!cantidadProducto || parseFloat(cantidadProducto) <= 0) {
      toast.error("Ingrese una cantidad válida");
      return;
    }

    if (!importeProducto || parseFloat(importeProducto) <= 0) {
      toast.error("Ingrese un importe total válido");
      return;
    }

    const detalle: DetalleProducto = {
      id: Date.now().toString(),
      categoria: categoriaProducto,
      nombre: nuevoProducto,
      cantidad: parseFloat(cantidadProducto),
      importeTotal: parseFloat(importeProducto),
    };

    setDetallesProductos([...detallesProductos, detalle]);
    
    // Limpiar campos
    setCategoriaProducto("");
    setNuevoProducto("");
    setProductoSeleccionadoId(null);
    setCantidadProducto("");
    setImporteProducto("");
    
    toast.success(`Producto agregado a la orden`);
  };

  const handleEliminarProducto = (id: string) => {
    const producto = detallesProductos.find(d => d.id === id);
    setDetallesProductos(detallesProductos.filter(d => d.id !== id));
    toast.success(`${producto?.nombre} eliminado de la orden`);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fechaCompra) {
      newErrors.fechaCompra = "La fecha de compra es obligatoria";
    }

    if (!fechaEntrega) {
      newErrors.fechaEntrega = "La fecha de entrega es obligatoria";
    }

    if (fechaEntrega && fechaCompra && new Date(fechaEntrega) < new Date(fechaCompra)) {
      newErrors.fechaEntrega = "La fecha de entrega no puede ser anterior a la fecha de compra";
    }

    if (detallesProductos.length === 0) {
      newErrors.detalles = "Debe agregar al menos un producto a la orden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLimpiar = () => {
    setNumeroOrden("");
    setProveedor("");
    setFechaCompra(new Date().toISOString().split('T')[0]);
    setFechaEntrega("");
    setEstado("Pendiente");
    setMetodoPago("efectivo");
    setObservaciones("");
    setDetallesProductos([]);
    setCategoriaProducto("");
    setNuevoProducto("");
    setProductoSeleccionadoId(null);
    setCantidadProducto("");
    setImporteProducto("");
    setErrors({});
    toast.success("Formulario limpiado");
  };

  const handleGuardar = () => {
    if (!validateForm()) {
      toast.error("Por favor, corrija los errores del formulario");
      return;
    }

    const compras = getCompras();
    const totalProductos = detallesProductos.reduce((sum, item) => sum + item.importeTotal, 0);
    
    const nuevaCompra: CompraType = {
      id: getNextId(compras),
      numeroOrden: numeroOrden || `OC-${Date.now()}`,
      proveedor: proveedor || "Sin especificar",
      fechaCompra,
      fechaEntrega,
      estado,
      detallesInsumos: [], // Ya no usamos insumos
      detallesProductos,
      totalInsumos: 0, // Ya no usamos insumos
      totalProductos,
      total: calcularTotal(),
      observaciones,
      creadoPor: "Usuario Actual",
      fechaCreacion: new Date().toISOString(),
    };

    // Guardar la compra
    addCompra(nuevaCompra);

    // Si el estado es "Recibido", actualizar inventario y crear nota de entrada
    if (estado === "Recibido") {
      procesarCompraRecibida(nuevaCompra);
      
      // Registrar movimiento de caja como egreso
      const currentUser = localStorage.getItem('currentUser') || 'Sistema';
      const now = new Date();
      const movimientos = getMovimientosCaja();
      
      const nuevoMovimiento: MovimientoCaja = {
        id: getNextId(movimientos),
        fecha: now.toISOString().split('T')[0],
        hora: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        tipo: "Egreso",
        concepto: `Compra a ${proveedor || "Sin especificar"}`,
        metodoPago: metodoPago,
        monto: nuevaCompra.total,
        referencia: nuevaCompra.numeroOrden,
        usuario: currentUser
      };
      
      addMovimientoCaja(nuevoMovimiento);
    }

    toast.success(
      estado === "Recibido"
        ? `Orden de compra registrada y recibida. Inventario actualizado.`
        : `Orden de compra registrada exitosamente`
    );
    
    // Limpiar formulario después de guardar
    handleLimpiar();
  };

  const procesarCompraRecibida = (compra: CompraType) => {
    const productosNE: ProductoNE[] = [];
    const productos = getProductos();

    // Procesar productos
    compra.detallesProductos.forEach((detalle) => {
      const productoExistente = findProductoByNombre(detalle.nombre);

      if (productoExistente) {
        // Actualizar stock del producto existente
        updateProducto(productoExistente.id, detalle.cantidad);
      } else {
        // Crear nuevo producto
        const nuevoProducto: ProductoType = {
          id: getNextId(productos),
          nombre: detalle.nombre,
          categoria: detalle.categoria,
          tipo_producto: "No Preparado",
          precio: detalle.importeTotal / detalle.cantidad, // Precio unitario aproximado
          stock: detalle.cantidad,
          estado: "Disponible",
        };
        addProducto(nuevoProducto);
      }

      // Agregar a productos de nota de entrada
      productosNE.push({
        id: Date.now() + Math.random(),
        nombre: detalle.nombre,
        cantidad: detalle.cantidad,
        unidad: "unidad",
      });
    });

    // Crear nota de entrada automática
    const nuevaNotaEntrada: NotaEntradaType = {
      id: Date.now(),
      numero: generateNotaEntradaNumero(),
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      motivo: "Por Compra",
      docReferencia: compra.numeroOrden,
      productos: productosNE,
      observaciones: `Generada automáticamente desde orden de compra ${compra.numeroOrden}`,
      usuario: "Usuario Actual",
    };

    addNotaEntrada(nuevaNotaEntrada);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary">Nueva Orden de Compra</h1>
          <p className="text-muted-foreground">
            Registrar una nueva orden de compra a proveedor
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleLimpiar}>
            <X className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
          <Button onClick={handleGuardar} disabled={!cajaAbierta}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Orden
          </Button>
        </div>
      </div>

      {/* Alerta de caja cerrada */}
      {!cajaAbierta && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">No se puede registrar compras - Caja cerrada</p>
            <p className="text-sm mt-1">
              Debe realizar la apertura de caja antes de registrar compras. Las compras recibidas generan movimientos de egreso en la caja.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal - Formulario */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Número de Orden */}
                <div className="space-y-2">
                  <Label htmlFor="numeroOrden">Número de Orden (Opcional)</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="numeroOrden"
                      value={numeroOrden}
                      onChange={(e) => setNumeroOrden(e.target.value)}
                      placeholder="Ej: OC-2025-001"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <RadioGroup
                    value={estado}
                    onValueChange={(value) => setEstado(value as "Pendiente" | "Recibido")}
                    className="flex gap-4 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Pendiente" id="pendiente" />
                      <Label htmlFor="pendiente" className="cursor-pointer">Pendiente</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Recibido" id="recibido" />
                      <Label htmlFor="recibido" className="cursor-pointer">Recibido</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Proveedor - Campo con sugerencias */}
              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor (Opcional)</Label>
                <Popover open={openProveedorPicker} onOpenChange={setOpenProveedorPicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openProveedorPicker}
                      className="w-full justify-between"
                    >
                      {proveedor || "Seleccionar o escribir proveedor..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar o escribir proveedor..." 
                        value={proveedor}
                        onValueChange={(value) => {
                          setProveedor(value);
                          setProveedorSeleccionadoId(null);
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-2 text-center">
                            <p className="text-sm text-muted-foreground">
                              Proveedor nuevo: <span className="font-medium text-foreground">"{proveedor}"</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Se creará al guardar la compra
                            </p>
                          </div>
                        </CommandEmpty>
                        <CommandGroup heading="Proveedores sugeridos">
                          {proveedoresSugeridos.map((prov) => (
                            <CommandItem
                              key={prov.id}
                              value={prov.nombre}
                              onSelect={() => {
                                setProveedor(prov.nombre);
                                setProveedorSeleccionadoId(prov.id);
                                setOpenProveedorPicker(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  proveedorSeleccionadoId === prov.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <div className="flex-1">
                                <div>{prov.nombre}</div>
                                <div className="text-xs text-muted-foreground">
                                  RUC: {prov.ruc}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandGroup heading="Proveedores registrados">
                          {proveedoresRegistrados.map((prov) => (
                            <CommandItem
                              key={prov.id}
                              value={prov.razonSocial}
                              onSelect={() => {
                                setProveedor(prov.razonSocial);
                                setProveedorSeleccionadoId(prov.id);
                                setOpenProveedorPicker(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  proveedorSeleccionadoId === prov.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <div className="flex-1">
                                <div>{prov.razonSocial}</div>
                                <div className="text-xs text-muted-foreground">
                                  {prov.tipoDocumento}: {prov.numeroDocumento}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  💡 Selecciona un proveedor existente o escribe uno nuevo
                </p>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaCompra">Fecha de Compra *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fechaCompra"
                      type="date"
                      value={fechaCompra}
                      onChange={(e) => {
                        setFechaCompra(e.target.value);
                        if (errors.fechaCompra) setErrors({ ...errors, fechaCompra: "" });
                      }}
                      className={`pl-10 ${errors.fechaCompra ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.fechaCompra && (
                    <p className="text-sm text-destructive">{errors.fechaCompra}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaEntrega">Fecha de Entrega *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fechaEntrega"
                      type="date"
                      value={fechaEntrega}
                      onChange={(e) => {
                        setFechaEntrega(e.target.value);
                        if (errors.fechaEntrega) setErrors({ ...errors, fechaEntrega: "" });
                      }}
                      className={`pl-10 ${errors.fechaEntrega ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.fechaEntrega && (
                    <p className="text-sm text-destructive">{errors.fechaEntrega}</p>
                  )}
                </div>
              </div>

              {/* Método de Pago */}
              <div className="space-y-2">
                <Label>Método de Pago *</Label>
                <RadioGroup
                  value={metodoPago}
                  onValueChange={(value) => setMetodoPago(value as "efectivo" | "yape" | "plin")}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="efectivo" id="efectivo" />
                    <Label htmlFor="efectivo" className="cursor-pointer">💵 Efectivo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yape" id="yape" />
                    <Label htmlFor="yape" className="cursor-pointer">📱 Yape</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="plin" id="plin" />
                    <Label htmlFor="plin" className="cursor-pointer">📲 Plin</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Agregar Productos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Agregar Productos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoriaProducto">Categoría *</Label>
                  <Select
                    value={categoriaProducto}
                    onValueChange={(value) => setCategoriaProducto(value)}
                  >
                    <SelectTrigger id="categoriaProducto">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriasProducto.length > 0 ? (
                        categoriasProducto.map((cat) => (
                          <SelectItem key={cat.id} value={cat.nombre}>
                            {cat.nombre}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-categorias" disabled>
                          No hay categorías de producto disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {categoriasProducto.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Cree categorías de producto en el módulo de Categorías
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="producto">Producto *</Label>
                  <Popover open={openProductoPicker} onOpenChange={setOpenProductoPicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openProductoPicker}
                        className="w-full justify-between"
                      >
                        {nuevoProducto || "Seleccionar o escribir producto..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Buscar o escribir producto..." 
                          value={nuevoProducto}
                          onValueChange={(value) => {
                            setNuevoProducto(value);
                            setProductoSeleccionadoId(null);
                          }}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <div className="p-2 text-center">
                              <p className="text-sm text-muted-foreground">
                                Producto nuevo: <span className="font-medium text-foreground">"{nuevoProducto}"</span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Se creará al guardar la compra
                              </p>
                            </div>
                          </CommandEmpty>
                          <CommandGroup heading="Productos en inventario">
                            {productosInventario.map((producto) => (
                              <CommandItem
                                key={producto.id}
                                value={producto.nombre}
                                onSelect={() => {
                                  setNuevoProducto(producto.nombre);
                                  setProductoSeleccionadoId(producto.id);
                                  setCategoriaProducto(producto.categoria);
                                  setOpenProductoPicker(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    productoSeleccionadoId === producto.id ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                <div className="flex-1">
                                  <div>{producto.nombre}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {producto.categoria} - Stock actual: {producto.stock}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    💡 Selecciona un producto existente o escribe uno nuevo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cantidadProducto">Cantidad</Label>
                  <Input
                    id="cantidadProducto"
                    type="number"
                    step="1"
                    min="0"
                    value={cantidadProducto}
                    onChange={(e) => setCantidadProducto(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="importeProducto">Importe Total</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-sm text-muted-foreground">S/</span>
                    <Input
                      id="importeProducto"
                      type="number"
                      step="0.01"
                      min="0"
                      value={importeProducto}
                      onChange={(e) => setImporteProducto(e.target.value)}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleAgregarProducto} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Producto
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Productos Agregados */}
          {detallesProductos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Productos Agregados ({detallesProductos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Importe Total</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detallesProductos.map((detalle) => (
                        <TableRow key={detalle.id}>
                          <TableCell>
                            <span className="text-xs bg-green-100 px-2 py-1 rounded">
                              {detalle.categoria}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                              {detalle.nombre}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {detalle.cantidad}
                          </TableCell>
                          <TableCell className="text-right">
                            S/ {detalle.importeTotal.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEliminarProducto(detalle.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error general */}
          {errors.detalles && detallesProductos.length === 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.detalles}</AlertDescription>
            </Alert>
          )}

          {/* Observaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="observaciones">Notas adicionales</Label>
                <Textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Información adicional sobre la orden de compra..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Lateral - Resumen */}
        <div className="space-y-6">
          {/* Resumen de la Orden */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📋 Resumen de la Orden</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">N° de Orden</p>
                <p className={!numeroOrden ? "text-muted-foreground" : ""}>
                  {numeroOrden || "Sin especificar"}
                </p>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Proveedor</p>
                <p className={!proveedor ? "text-muted-foreground" : ""}>
                  {proveedor || "Sin especificar"}
                </p>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Fecha de Compra</p>
                <p className={!fechaCompra ? "text-muted-foreground" : ""}>
                  {fechaCompra ? new Date(fechaCompra + 'T00:00:00').toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }) : "Sin especificar"}
                </p>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Fecha de Entrega</p>
                <p className={!fechaEntrega ? "text-muted-foreground" : ""}>
                  {fechaEntrega ? new Date(fechaEntrega + 'T00:00:00').toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }) : "Sin especificar"}
                </p>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Estado</p>
                <p className={estado === "Pendiente" ? "text-secondary" : "text-primary"}>
                  {estado}
                </p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Productos</p>
                <p>{detallesProductos.length} {detallesProductos.length === 1 ? 'producto' : 'productos'}</p>
              </div>
              
              <div className="p-3 bg-primary/10 border-2 border-primary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">TOTAL</p>
                <p className="text-xl text-primary">
                  S/ {calcularTotal().toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Información */}
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-base">💡 Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-2">Estados de Orden:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Pendiente:</strong> Orden creada, esperando entrega</li>
                  <li>• <strong>Recibido:</strong> Productos entregados y verificados</li>
                </ul>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Los campos marcados con asterisco (*) son obligatorios. Debe agregar al menos un producto a la orden.
                </AlertDescription>
              </Alert>

              <div>
                <p className="font-medium mb-2">Nota:</p>
                <p className="text-xs text-muted-foreground">
                  El número de orden y el proveedor son opcionales. Puede escribir libremente el nombre del proveedor o producto.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">⚡ Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={handleGuardar}
                className="w-full"
                disabled={!cajaAbierta}
              >
                <Save className="mr-2 h-4 w-4" />
                Guardar Orden
              </Button>
              <Button 
                variant="outline"
                onClick={handleLimpiar}
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Limpiar Formulario
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}