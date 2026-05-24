import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Plus, Trash2, Save, Check, ChevronsUpDown, AlertCircle } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Alert, AlertDescription } from "../ui/alert";
import {
  getProductos,
  getClientes,
  addComprobante,
  addNotaSalida,
  generateComprobanteNumero,
  generateNotaSalidaNumero,
  getNextId,
  getComprobantes,
  getNotasSalida,
  updateProducto,
  isCajaAbierta,
  addMovimientoCaja,
  getMovimientosCaja,
  getPromocionesActivas,
  deductInsumosFromSale,
  updateCliente,
  type Producto,
  type Cliente,
  type Comprobante,
  type NotaSalida,
  type ProductoNS,
  type MovimientoCaja,
  type Promocion
} from "../../lib/storage";

interface ItemComprobante {
  id: number;
  productoId: number;
  producto: string;
  cantidad: number;
  precio: number;
  esPromocion?: boolean;
  promocionId?: number;
  productosPromocion?: { id: number; nombre: string; cantidad: number }[];
}

export function NuevoComprobante() {
  // Estados para productos, clientes y promociones
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [clientesRegistrados, setClientesRegistrados] = useState<Cliente[]>([]);
  const [promocionesActivas, setPromocionesActivas] = useState<Promocion[]>([]);

  // Verificar si la caja está abierta
  const [cajaAbierta, setCajaAbierta] = useState(false);

  useEffect(() => {
    // Cargar datos iniciales
    setCajaAbierta(isCajaAbierta());
    loadData();

    // Listener para actualizar cuando cambie localStorage
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('clientes-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('clientes-updated', handleStorageChange);
    };
  }, []);

  const loadData = () => {
    setProductosDisponibles(getProductos());
    setClientesRegistrados(getClientes());
    setPromocionesActivas(getPromocionesActivas());
  };
  
  // Obtener fecha de hoy en formato YYYY-MM-DD
  const getFechaHoy = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  const [items, setItems] = useState<ItemComprobante[]>([]);
  const [nextId, setNextId] = useState(1);
  const [fecha, setFecha] = useState(getFechaHoy());
  const [tipoComprobante, setTipoComprobante] = useState("boleta");
  const [metodoPago, setMetodoPago] = useState("efectivo");

  // Cliente con búsqueda
  const [clienteInput, setClienteInput] = useState("");
  const [openClientes, setOpenClientes] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("");

  // Cálculo de vuelto
  const [montoPagado, setMontoPagado] = useState<string>("");

  // Para cada item necesitamos controlar el popover de productos
  const [openProductos, setOpenProductos] = useState<{ [key: number]: boolean }>({});
  
  // Control del popover de promociones
  const [openPromociones, setOpenPromociones] = useState(false);

  const addItem = () => {
    setItems([...items, { id: nextId, productoId: 0, producto: "", cantidad: 1, precio: 0 }]);
    setNextId(nextId + 1);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    toast.success("Producto eliminado");
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const selectProducto = (itemId: number, producto: Producto) => {
    if (producto.tipo_producto === "No Preparado" && producto.stock <= 0) {
      toast.error(`"${producto.nombre}" no tiene stock disponible`);
      return;
    }
    setItems(items.map(item =>
      item.id === itemId ? {
        ...item,
        productoId: producto.id,
        producto: producto.nombre,
        precio: producto.precio
      } : item
    ));
    setOpenProductos({ ...openProductos, [itemId]: false });
    toast.success(`Producto "${producto.nombre}" seleccionado`);
  };

  const selectPromocion = (promocion: Promocion) => {
    // Verificar stock de todos los productos de la promoción
    for (const prodPromo of promocion.productos) {
      const producto = productosDisponibles.find(p => Number(p.id) === Number(prodPromo.id));

      if (!producto) {
        toast.error(`Producto "${prodPromo.nombre}" no encontrado en el sistema`);
        return;
      }

      // Solo validar stock para productos "No Preparado"
      if (producto.tipo_producto === "No Preparado" && producto.stock < prodPromo.cantidad) {
        toast.error(`Stock insuficiente para "${prodPromo.nombre}" (Disponible: ${producto.stock}, Requerido: ${prodPromo.cantidad})`);
        return;
      }
    }

    // Agregar la promoción como UN SOLO ITEM con su precio fijo
    const nuevoItem: ItemComprobante = {
      id: nextId,
      productoId: 0, // Las promociones no tienen un productoId único
      producto: promocion.nombre,
      cantidad: 1,
      precio: promocion.precioPromocion,
      esPromocion: true,
      promocionId: promocion.id,
      productosPromocion: promocion.productos
    };

    setItems([...items, nuevoItem]);
    setNextId(nextId + 1);
    setOpenPromociones(false);
    toast.success(`Promoción "${promocion.nombre}" agregada`);
  };

  const handleClienteSelect = (nombre: string) => {
    setClienteSeleccionado(nombre);
    setClienteInput(nombre);
    setOpenClientes(false);
  };

  const handleClienteInputChange = (value: string) => {
    setClienteInput(value);
    setClienteSeleccionado(value);
  };

  const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);

  // Calcular vuelto automáticamente
  const montoPagadoNum = parseFloat(montoPagado) || 0;
  const vuelto = montoPagadoNum > 0 ? montoPagadoNum - total : 0;

  const handleSubmit = () => {
    // Validar que la caja esté abierta
    if (!cajaAbierta) {
      toast.error("Debe aperturar la caja antes de realizar una venta");
      toast.info("Vaya a 'Caja > Apertura de Caja' para abrir la caja");
      return;
    }

    // Validaciones - Cliente ya NO es obligatorio
    if (items.length === 0) {
      toast.error("Debe agregar al menos un producto");
      return;
    }

    const productosIncompletos = items.filter(item => !item.producto || item.cantidad <= 0 || item.precio <= 0);
    if (productosIncompletos.length > 0) {
      toast.error("Complete todos los datos de los productos");
      return;
    }

    // Validar monto pagado si es efectivo
    if (metodoPago === "efectivo" && montoPagado) {
      const montoPagadoNum = parseFloat(montoPagado);
      if (isNaN(montoPagadoNum) || montoPagadoNum < total) {
        toast.error(`El monto pagado (S/ ${montoPagadoNum.toFixed(2)}) es menor al total (S/ ${total.toFixed(2)})`);
        return;
      }
    }

    // Verificar stock para productos "No Preparado"
    for (const item of items) {
      if (item.esPromocion && item.productosPromocion) {
        // Validar stock de cada producto en la promoción
        for (const prodPromo of item.productosPromocion) {
          const prod = productosDisponibles.find(p => Number(p.id) === Number(prodPromo.id));
          const cantidadRequerida = prodPromo.cantidad * item.cantidad;
          if (prod && prod.tipo_producto === "No Preparado" && prod.stock < cantidadRequerida) {
            toast.error(`Stock insuficiente para "${prodPromo.nombre}" en promoción "${item.producto}" (disponible: ${prod.stock}, requerido: ${cantidadRequerida})`);
            return;
          }
        }
      } else if (item.productoId > 0) {
        const prod = productosDisponibles.find(p => Number(p.id) === Number(item.productoId));
        if (prod && prod.tipo_producto === "No Preparado" && prod.stock < item.cantidad) {
          toast.error(`Stock insuficiente para "${prod.nombre}" (disponible: ${prod.stock}, requerido: ${item.cantidad})`);
          return;
        }
      }
    }

    try {
      // Generar número de comprobante
      const { serie, numero, correlativo } = generateComprobanteNumero(tipoComprobante as "boleta" | "factura");
      const currentUser = localStorage.getItem('currentUser') || 'Sistema';
      const now = new Date();
      const hora = now.toTimeString().split(' ')[0].substring(0, 5);
      
      // Crear comprobante
      const nuevoComprobante: Comprobante = {
        id: getNextId(getComprobantes()),
        numero,
        serie,
        tipoComprobante: tipoComprobante as "boleta" | "factura",
        fecha,
        hora,
        cliente: clienteInput.trim() || undefined, // Opcional
        metodoPago: metodoPago as "efectivo" | "tarjeta" | "yape" | "plin",
        items: items.map(item => ({
          id: item.id,
          productoId: item.productoId,
          producto: item.producto,
          cantidad: item.cantidad,
          precio: item.precio
        })),
        subtotal: total,
        total: total,
        usuario: currentUser,
        estado: "Emitido"
      };
      
      // Guardar comprobante
      addComprobante(nuevoComprobante);

      // Incrementar contador de compras del cliente si existe
      if (clienteSeleccionado) {
        const todosClientes = getClientes();
        const cliente = todosClientes.find(c => c.nombreCompleto === clienteSeleccionado);
        if (cliente) {
          const clienteActualizado = {
            ...cliente,
            cantidadCompras: (cliente.cantidadCompras || 0) + 1
          };
          updateCliente(cliente.id, clienteActualizado);
          window.dispatchEvent(new Event('clientes-updated'));
        }
      }

      // Disparar evento para actualizar la lista de comprobantes
      window.dispatchEvent(new Event('comprobantes-updated'));
      
      // Registrar movimiento de ingreso en caja
      const movimientoIngreso: MovimientoCaja = {
        id: getNextId(getMovimientosCaja()),
        fecha: fecha,
        hora: hora,
        tipo: "Ingreso",
        concepto: `Venta - ${correlativo}`,
        metodoPago: metodoPago as "efectivo" | "tarjeta" | "yape" | "plin",
        monto: total,
        referencia: clienteInput.trim() ? `Cliente: ${clienteInput}` : undefined,
        usuario: currentUser
      };
      
      addMovimientoCaja(movimientoIngreso);
      
      // Descontar stock solo para productos "No Preparado" (con stock físico)
      items.forEach(item => {
        if (item.esPromocion && item.productosPromocion) {
          // Si es una promoción, descontar stock de cada producto incluido
          item.productosPromocion.forEach(prodPromo => {
            const prod = productosDisponibles.find(p => Number(p.id) === Number(prodPromo.id));
            if (prod && prod.tipo_producto === "No Preparado") {
              updateProducto(Number(prodPromo.id), -(prodPromo.cantidad * item.cantidad));
            }
          });
        } else if (item.productoId > 0) {
          // Si es un producto individual
          const prod = productosDisponibles.find(p => Number(p.id) === Number(item.productoId));
          if (prod && prod.tipo_producto === "No Preparado") {
            updateProducto(Number(item.productoId), -item.cantidad);
          }
        }
      });

      // Descontar insumos según la receta de cada producto vendido
      const productosParaInsumos: { productoId: number; cantidad: number }[] = [];

      items.forEach(item => {
        if (item.esPromocion && item.productosPromocion) {
          // Si es una promoción, agregar cada producto de la promoción
          item.productosPromocion.forEach(prodPromo => {
            productosParaInsumos.push({
              productoId: Number(prodPromo.id),
              cantidad: prodPromo.cantidad * item.cantidad
            });
          });
        } else if (item.productoId > 0) {
          // Si es un producto individual
          productosParaInsumos.push({
            productoId: Number(item.productoId),
            cantidad: item.cantidad
          });
        }
      });

      deductInsumosFromSale(productosParaInsumos, correlativo);
      
      // Crear nota de salida automáticamente por venta
      const productosNS: ProductoNS[] = [];

      items.forEach(item => {
        if (item.esPromocion && item.productosPromocion) {
          // Si es una promoción, agregar cada producto de la promoción
          item.productosPromocion.forEach(prodPromo => {
            productosNS.push({
              id: Number(prodPromo.id),
              nombre: `[PROMO: ${item.producto}] ${prodPromo.nombre}`,
              cantidad: prodPromo.cantidad * item.cantidad,
              unidad: "und"
            });
          });
        } else {
          // Si es un producto individual
          productosNS.push({
            id: item.productoId,
            nombre: item.producto,
            cantidad: item.cantidad,
            unidad: "und"
          });
        }
      });

      const nuevaNotaSalida: NotaSalida = {
        id: getNextId(getNotasSalida()),
        numero: generateNotaSalidaNumero(),
        fecha,
        hora,
        productos: productosNS,
        observaciones: clienteInput.trim()
          ? `Venta registrada en ${correlativo} - Cliente: ${clienteInput}`
          : `Venta registrada en ${correlativo}`
      };
      
      // Guardar nota de salida
      addNotaSalida(nuevaNotaSalida);
      
      // Disparar evento para actualizar la lista de notas de salida
      window.dispatchEvent(new Event('notas-salida-updated'));

      toast.success(`Comprobante ${correlativo} creado exitosamente`);
      toast.success(`Nota de salida ${nuevaNotaSalida.numero} generada automáticamente`);
      toast.success(`Stock actualizado para ${items.length} producto(s)`);
      toast.success(`Ingreso registrado en movimientos de caja: S/ ${total.toFixed(2)}`);

      // Mostrar vuelto si aplica
      if (metodoPago === "efectivo" && montoPagado && vuelto > 0) {
        toast.info(`Vuelto a entregar: S/ ${vuelto.toFixed(2)}`);
      }

      // Limpiar formulario
      handleLimpiar();
    } catch (error) {
      toast.error("Error al guardar el comprobante");
      console.error(error);
    }
  };

  const handleLimpiar = () => {
    setItems([]);
    setNextId(1);
    setFecha(getFechaHoy());
    setClienteInput("");
    setClienteSeleccionado("");
    setMetodoPago("efectivo");
    setMontoPagado("");
    loadData(); // Recargar productos para actualizar stock
    toast.info("Formulario limpiado");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Nuevo Comprobante</h1>
        <p className="text-muted-foreground">Crear un nuevo comprobante de venta</p>
      </div>

      {/* Mensaje de Caja Cerrada */}
      {!cajaAbierta && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Caja Cerrada:</strong> Debe aperturar la caja antes de realizar una venta. Diríjase al módulo de <strong>Apertura de Caja</strong> para comenzar.
          </AlertDescription>
        </Alert>
      )}

      {/* Contenido principal - Solo visible si la caja está abierta */}
      {cajaAbierta && (
        <>
          {/* Alerta de Régimen */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sistema configurado en <strong>Régimen RUS</strong> - Solo se pueden emitir Boletas de Venta
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Comprobante</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Comprobante</Label>
                      <Select value={tipoComprobante} onValueChange={setTipoComprobante}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="boleta">Boleta</SelectItem>
                          <SelectItem value="factura" disabled>Factura (No disponible en RUS)</SelectItem>
                          <SelectItem value="nota-credito" disabled>Nota de Crédito (No disponible en RUS)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Input 
                        type="date" 
                        value={fecha} 
                        onChange={(e) => setFecha(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cliente (Opcional)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Escribir nombre del cliente..."
                        value={clienteInput}
                        onChange={(e) => setClienteInput(e.target.value)}
                        className="flex-1"
                      />
                      <Popover open={openClientes} onOpenChange={setOpenClientes}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openClientes}
                            className="shrink-0"
                          >
                            <ChevronsUpDown className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="end">
                          <Command>
                            <CommandInput placeholder="Buscar cliente registrado..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                              <CommandGroup heading="Clientes Registrados">
                                {clientesRegistrados.map((cliente) => (
                                  <CommandItem
                                    key={cliente.id}
                                    value={cliente.nombreCompleto}
                                    onSelect={() => handleClienteSelect(cliente.nombreCompleto)}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        clienteSeleccionado === cliente.nombreCompleto ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    <div>
                                      <p>{cliente.nombreCompleto}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {cliente.tipoDocumento}: {cliente.numeroDocumento}
                                      </p>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Escribe libremente o selecciona de la lista de clientes registrados
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Método de Pago</Label>
                    <Select value={metodoPago} onValueChange={setMetodoPago}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="yape">YAPE</SelectItem>
                        <SelectItem value="plin">PLIN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Productos</CardTitle>
                  <div className="flex gap-2">
                    <Popover open={openPromociones} onOpenChange={setOpenPromociones}>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Promoción
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0">
                        <Command>
                          <CommandInput placeholder="Buscar promoción..." />
                          <CommandList>
                            <CommandEmpty>No hay promociones activas</CommandEmpty>
                            <CommandGroup>
                              {promocionesActivas.map((promocion) => (
                                <CommandItem
                                  key={promocion.id}
                                  value={promocion.nombre}
                                  onSelect={() => selectPromocion(promocion)}
                                >
                                  <div className="flex-1">
                                    <p className="font-medium">{promocion.nombre}</p>
                                    <p className="text-xs text-muted-foreground">
                                      S/ {promocion.precioPromocion.toFixed(2)} - {promocion.productos.length} productos
                                    </p>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button onClick={addItem} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Producto
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead className="w-24">Cantidad</TableHead>
                          <TableHead className="w-32 text-right">Precio Unit.</TableHead>
                          <TableHead className="w-32 text-right">Subtotal</TableHead>
                          <TableHead className="w-16"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {item.esPromocion ? (
                                <div className="space-y-1">
                                  <p className="font-medium flex items-center gap-2">
                                    🏷️ {item.producto}
                                    <Badge variant="secondary" className="text-xs">Promoción</Badge>
                                  </p>
                                  {item.productosPromocion && (
                                    <p className="text-xs text-muted-foreground">
                                      Incluye: {item.productosPromocion.map(p => `${p.cantidad}x ${p.nombre}`).join(', ')}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <Popover 
                                  open={openProductos[item.id] || false} 
                                  onOpenChange={(open) => setOpenProductos({ ...openProductos, [item.id]: open })}
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className="w-full justify-between"
                                    >
                                      {item.producto || "Seleccionar producto..."}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[350px] p-0">
                                    <Command>
                                      <CommandInput placeholder="Buscar producto..." />
                                      <CommandList>
                                        <CommandEmpty>No se encontró el producto.</CommandEmpty>
                                        <CommandGroup>
                                          {productosDisponibles.map((producto) => {
                                            const agotado = producto.tipo_producto === "No Preparado" && producto.stock <= 0;
                                            return (
                                              <CommandItem
                                                key={producto.id}
                                                value={producto.nombre}
                                                onSelect={() => selectProducto(item.id, producto)}
                                                disabled={agotado}
                                                className={agotado ? "opacity-50 cursor-not-allowed" : ""}
                                              >
                                                <Check
                                                  className={`mr-2 h-4 w-4 ${
                                                    item.productoId === producto.id ? "opacity-100" : "opacity-0"
                                                  }`}
                                                />
                                                <div className="flex-1">
                                                  <p>{producto.nombre}</p>
                                                  <p className="text-xs text-muted-foreground">
                                                    S/ {producto.precio.toFixed(2)}
                                                    {producto.tipo_producto === "Preparado"
                                                      ? " · Al momento"
                                                      : ` · Stock: ${producto.stock}${agotado ? " — Sin stock" : ""}`}
                                                  </p>
                                                </div>
                                              </CommandItem>
                                            );
                                          })}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={item.cantidad}
                                onChange={(e) => updateItem(item.id, 'cantidad', parseInt(e.target.value) || 1)}
                                onWheel={(e) => e.currentTarget.blur()}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              S/. {item.precio.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              S/. {(item.cantidad * item.precio).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay productos agregados
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm py-2 border-b">
                            <div className="flex-1">
                              <p className="font-medium">{item.producto || "Sin producto"}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.cantidad} x S/. {item.precio.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">S/. {(item.cantidad * item.precio).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <span>Productos: {items.length}</span>
                          <span>Unidades: {items.reduce((sum, item) => sum + item.cantidad, 0)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span>Total:</span>
                          <span className="text-2xl text-primary">S/. {total.toFixed(2)}</span>
                        </div>

                        {/* Cálculo de vuelto - Solo para efectivo */}
                        {metodoPago === "efectivo" && total > 0 && (
                          <div className="border-t pt-3 space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="montoPagado" className="text-sm">
                                Monto Recibido (Opcional)
                              </Label>
                              <Input
                                id="montoPagado"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="S/. 0.00"
                                value={montoPagado}
                                onChange={(e) => setMontoPagado(e.target.value)}
                                className={montoPagadoNum > 0 && montoPagadoNum < total ? "border-destructive" : ""}
                              />
                            </div>

                            {montoPagado && montoPagadoNum > 0 && (
                              <div className="space-y-2">
                                {montoPagadoNum < total ? (
                                  <div className="flex justify-between items-center text-sm text-destructive">
                                    <span className="font-medium">⚠️ Falta:</span>
                                    <span className="font-bold">S/. {(total - montoPagadoNum).toFixed(2)}</span>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-green-700">Vuelto:</span>
                                    <span className="text-xl font-bold text-green-700">S/. {vuelto.toFixed(2)}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground mt-2">
                          * Régimen RUS no incluye IGV
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-muted">
                <CardContent className="pt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Serie:</span>
                    <span>B001</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Número:</span>
                    <span>{String(Math.floor(Math.random() * 10000)).padStart(6, '0')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fecha:</span>
                    <span>{new Date(fecha).toLocaleDateString('es-PE')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Método:</span>
                    <span className="capitalize">{metodoPago}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button onClick={handleSubmit} className="w-full" size="lg">
                  <Save className="mr-2 h-5 w-5" />
                  Guardar Comprobante
                </Button>
                <Button variant="outline" className="w-full" onClick={handleLimpiar}>
                  Limpiar Formulario
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}