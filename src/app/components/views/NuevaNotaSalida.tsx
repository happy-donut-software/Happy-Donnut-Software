import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
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
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "../ui/utils";
import { CalendarIcon, Plus, Trash2, Save, X, PackageMinus } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  getProductos,
  getInsumos,
  addNotaSalida,
  updateProducto,
  updateInsumo,
  generateNotaSalidaNumero,
  getNextId,
  getNotasSalida,
  type Producto,
  type Insumo,
  type NotaSalida as NotaSalidaType,
  type ProductoNS
} from "../../lib/storage";

interface ItemSalida {
  id: number;
  tipo: "Producto" | "Insumo";
  nombre: string;
  cantidad: number;
  unidad: string;
  stockDisponible: number;
}

export default function NuevaNotaSalida() {
  const [fecha, setFecha] = useState<Date>(new Date());
  const [observaciones, setObservaciones] = useState("");
  const [items, setItems] = useState<ItemSalida[]>([]);

  // Estado para agregar item
  const [tipoItem, setTipoItem] = useState<"Producto" | "Insumo">("Producto");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [cantidadItem, setCantidadItem] = useState<string>("");

  // Items disponibles desde inventario
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [insumosDisponibles, setInsumosDisponibles] = useState<Insumo[]>([]);

  useEffect(() => {
    // Filtrar solo productos que pueden manejar stock (tipo "No Preparado")
    const todosProductos = getProductos();
    const productosConStock = todosProductos.filter(p => p.tipo_producto === "No Preparado");
    setProductosDisponibles(productosConStock);

    // Cargar todos los insumos (todos manejan stock)
    setInsumosDisponibles(getInsumos());
  }, []);

  const handleAgregarItem = () => {
    if (!selectedItemId) {
      toast.error(`Debe seleccionar un ${tipoItem.toLowerCase()}`);
      return;
    }

    if (!cantidadItem || parseInt(cantidadItem) <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    let nuevoItem: ItemSalida;

    if (tipoItem === "Producto") {
      const id = parseInt(selectedItemId);
      const producto = productosDisponibles.find(p => p.id === id);

      if (!producto) {
        toast.error("Producto no encontrado");
        return;
      }

      // Validar stock disponible
      if (parseInt(cantidadItem) > producto.stock) {
        toast.error(`Stock insuficiente. Disponible: ${producto.stock} unidades`);
        return;
      }

      // Validar si ya existe el producto
      const yaExiste = items.find((i) => i.tipo === "Producto" && i.id === id);
      if (yaExiste) {
        toast.error("Este producto ya fue agregado");
        return;
      }

      nuevoItem = {
        id: id,
        tipo: "Producto",
        nombre: producto.nombre,
        cantidad: parseInt(cantidadItem),
        unidad: "und",
        stockDisponible: producto.stock
      };
    } else {
      const id = parseInt(selectedItemId);
      const insumo = insumosDisponibles.find(i => i.id === id);

      if (!insumo) {
        toast.error("Insumo no encontrado");
        return;
      }

      // Validar stock disponible
      if (parseInt(cantidadItem) > insumo.cantidad) {
        toast.error(`Stock insuficiente. Disponible: ${insumo.cantidad} ${insumo.unidadMedida}`);
        return;
      }

      // Validar si ya existe el insumo
      const yaExiste = items.find((i) => i.tipo === "Insumo" && i.id === id);
      if (yaExiste) {
        toast.error("Este insumo ya fue agregado");
        return;
      }

      nuevoItem = {
        id: id,
        tipo: "Insumo",
        nombre: insumo.nombre,
        cantidad: parseInt(cantidadItem),
        unidad: insumo.unidadMedida,
        stockDisponible: insumo.cantidad
      };
    }

    setItems([...items, nuevoItem]);
    setSelectedItemId("");
    setCantidadItem("");
    toast.success(`${tipoItem} agregado`);
  };

  const handleEliminarItem = (index: number) => {
    const nuevosItems = items.filter((_, i) => i !== index);
    setItems(nuevosItems);
    toast.success("Item eliminado");
  };

  const handleLimpiar = () => {
    setFecha(new Date());
    setObservaciones("");
    setItems([]);
    setTipoItem("Producto");
    setSelectedItemId("");
    setCantidadItem("");
    toast.success("Formulario limpiado");
  };

  const handleGuardar = () => {
    // Validaciones
    if (items.length === 0) {
      toast.error("Debe agregar al menos un item");
      return;
    }

    try {
      // Generar número de nota de salida
      const numeroNota = generateNotaSalidaNumero();

      // Obtener hora actual
      const now = new Date();
      const hora = now.toTimeString().split(' ')[0].substring(0, 5);

      // Crear productos para la nota de salida
      const productosNS: ProductoNS[] = items.map(item => ({
        id: item.id,
        nombre: `${item.tipo === "Insumo" ? "[Insumo] " : ""}${item.nombre}`,
        cantidad: item.cantidad,
        unidad: item.unidad
      }));

      // Crear nota de salida
      const nuevaNotaSalida: NotaSalidaType = {
        id: getNextId(getNotasSalida()),
        numero: numeroNota,
        fecha: fecha.toISOString().split('T')[0],
        hora: hora,
        productos: productosNS,
        observaciones: observaciones.trim() || undefined
      };

      // Guardar nota de salida
      addNotaSalida(nuevaNotaSalida);

      // Disparar evento para actualizar la lista de notas de salida
      window.dispatchEvent(new Event('notas-salida-updated'));

      // Actualizar stock - decrementar según tipo
      items.forEach(item => {
        if (item.tipo === "Producto") {
          updateProducto(item.id, -item.cantidad);
        } else {
          updateInsumo(item.id, -item.cantidad);
        }
      });

      toast.success(`Nota de Salida ${numeroNota} generada correctamente`);
      toast.success(`Stock actualizado para ${items.length} item(s)`);

      // Limpiar formulario
      handleLimpiar();
    } catch (error) {
      toast.error("Error al guardar la nota de salida");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Generar Nota de Salida</h1>
        <p className="text-muted-foreground">
          Registrar salida de productos e insumos del inventario
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageMinus className="h-5 w-5" />
                Información de la Nota de Salida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left",
                        !fecha && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fecha}
                      onSelect={(date) => date && setFecha(date)}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Ingrese observaciones adicionales..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Agregar Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Agregar Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Selector de Tipo */}
                <div className="space-y-2">
                  <Label>Tipo de Item</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={tipoItem === "Producto" ? "default" : "outline"}
                      onClick={() => {
                        setTipoItem("Producto");
                        setSelectedItemId("");
                      }}
                      className="flex-1"
                    >
                      Producto
                    </Button>
                    <Button
                      type="button"
                      variant={tipoItem === "Insumo" ? "default" : "outline"}
                      onClick={() => {
                        setTipoItem("Insumo");
                        setSelectedItemId("");
                      }}
                      className="flex-1"
                    >
                      Insumo
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="item">
                      {tipoItem === "Producto" ? "Producto" : "Insumo"}
                    </Label>
                    <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                      <SelectTrigger id="item">
                        <SelectValue placeholder={`Seleccionar ${tipoItem.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {tipoItem === "Producto" ? (
                          productosDisponibles.filter((p) => !items.find((item) => item.tipo === "Producto" && item.id === p.id)).length === 0 ? (
                            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                              No hay productos disponibles
                            </div>
                          ) : (
                            productosDisponibles
                              .filter((p) => !items.find((item) => item.tipo === "Producto" && item.id === p.id))
                              .map((producto) => (
                                <SelectItem key={producto.id} value={producto.id.toString()}>
                                  {producto.nombre} (Stock: {producto.stock})
                                </SelectItem>
                              ))
                          )
                        ) : (
                          insumosDisponibles.filter((i) => !items.find((item) => item.tipo === "Insumo" && item.id === i.id)).length === 0 ? (
                            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                              No hay insumos disponibles
                            </div>
                          ) : (
                            insumosDisponibles
                              .filter((i) => !items.find((item) => item.tipo === "Insumo" && item.id === i.id))
                              .map((insumo) => (
                                <SelectItem key={insumo.id} value={insumo.id.toString()}>
                                  {insumo.nombre} ({insumo.categoria})
                                </SelectItem>
                              ))
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {tipoItem === "Producto"
                        ? 'Solo productos tipo "No Preparado"'
                        : "Todos los insumos manejan stock"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cantidad">Cantidad</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cantidad"
                        type="number"
                        step="1"
                        min="1"
                        placeholder="0"
                        value={cantidadItem}
                        onChange={(e) => setCantidadItem(e.target.value)}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                      <Button onClick={handleAgregarItem}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Items Agregados */}
          <Card>
            <CardHeader>
              <CardTitle>Items a Retirar ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay items agregados
                </p>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-center">Unidad</TableHead>
                        <TableHead className="text-center">Stock</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                item.tipo === "Producto"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-orange-500/10 text-orange-500"
                              }`}
                            >
                              {item.tipo}
                            </span>
                          </TableCell>
                          <TableCell>{item.nombre}</TableCell>
                          <TableCell className="text-center">{item.cantidad}</TableCell>
                          <TableCell className="text-center">{item.unidad}</TableCell>
                          <TableCell className="text-center text-muted-foreground text-sm">
                            {item.stockDisponible}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEliminarItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel de Acciones */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total de Items</p>
                <p className="text-2xl text-primary">{items.length}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Productos:</p>
                  <p className="font-semibold">{items.filter(i => i.tipo === "Producto").length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Insumos:</p>
                  <p className="font-semibold">{items.filter(i => i.tipo === "Insumo").length}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Unidades Totales</p>
                <p className="text-2xl text-secondary">
                  {items.reduce((sum, item) => sum + item.cantidad, 0)}
                </p>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  className="w-full"
                  onClick={handleGuardar}
                  disabled={items.length === 0}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Generar Nota de Salida
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLimpiar}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  💡 Los items agregados decrementarán automáticamente el stock. Productos: solo tipo "No Preparado". Insumos: todos.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Package({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  );
}
