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
import { CalendarIcon, Plus, Trash2, Save, X, PackagePlus } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  getProductos,
  updateProducto,
  getInsumos,
  updateInsumo,
  addNotaEntrada,
  generateNotaEntradaNumero,
  getNextId,
  getNotasEntrada,
  type Producto,
  type Insumo
} from "../../lib/storage";

interface ItemEntrada {
  id: number;
  tipo: "Producto" | "Insumo";
  nombre: string;
  cantidad: number;
  unidad: string;
}

export default function NuevaNotaEntrada() {
  const [fecha, setFecha] = useState<Date>(new Date());
  const [observaciones, setObservaciones] = useState("");
  const [items, setItems] = useState<ItemEntrada[]>([]);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);

  // Estado para agregar item
  const [tipoItem, setTipoItem] = useState<"Producto" | "Insumo">("Producto");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [cantidadItem, setCantidadItem] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Filtrar solo productos que pueden manejar stock (tipo "No Preparado")
    const todosProductos = getProductos();
    const productosConStock = todosProductos.filter(p => p.tipo_producto === "No Preparado");
    setProductos(productosConStock);

    // Cargar todos los insumos (todos manejan stock)
    setInsumos(getInsumos());
  };

  const handleAgregarItem = () => {
    if (!selectedItemId) {
      toast.error(`Debe seleccionar un ${tipoItem.toLowerCase()}`);
      return;
    }

    if (!cantidadItem || parseInt(cantidadItem) <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    let nuevoItem: ItemEntrada;

    if (tipoItem === "Producto") {
      const producto = productos.find((p) => p.id === parseInt(selectedItemId));
      if (!producto) return;

      // Validar si ya existe el producto
      const yaExiste = items.find((i) => i.tipo === "Producto" && i.id === producto.id);
      if (yaExiste) {
        toast.error("Este producto ya fue agregado");
        return;
      }

      nuevoItem = {
        id: producto.id,
        tipo: "Producto",
        nombre: producto.nombre,
        cantidad: parseInt(cantidadItem),
        unidad: "und",
      };
    } else {
      const insumo = insumos.find((i) => i.id === parseInt(selectedItemId));
      if (!insumo) return;

      // Validar si ya existe el insumo
      const yaExiste = items.find((i) => i.tipo === "Insumo" && i.id === insumo.id);
      if (yaExiste) {
        toast.error("Este insumo ya fue agregado");
        return;
      }

      nuevoItem = {
        id: insumo.id,
        tipo: "Insumo",
        nombre: insumo.nombre,
        cantidad: parseInt(cantidadItem),
        unidad: insumo.unidadMedida,
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

  const handleGenerarNota = () => {
    // Validaciones
    if (items.length === 0) {
      toast.error("Debe agregar al menos un item");
      return;
    }

    // Procesar la nota de entrada
    const now = new Date();
    const hora = now.toTimeString().split(' ')[0].substring(0, 5);

    // Crear la nota de entrada
    const notaEntrada = {
      id: getNextId(getNotasEntrada()),
      numero: generateNotaEntradaNumero(),
      fecha: format(fecha, 'yyyy-MM-dd'),
      hora: hora,
      productos: items.map(item => ({
        id: item.id,
        nombre: `${item.tipo === "Insumo" ? "[Insumo] " : ""}${item.nombre}`,
        cantidad: item.cantidad,
        unidad: item.unidad,
      })),
      observaciones: observaciones || undefined,
    };

    // Guardar la nota
    addNotaEntrada(notaEntrada);

    // Actualizar inventarios - incrementar stock
    for (const item of items) {
      if (item.tipo === "Producto") {
        updateProducto(item.id, item.cantidad);
      } else {
        updateInsumo(item.id, item.cantidad);
      }
    }

    toast.success(`Nota de Entrada ${notaEntrada.numero} generada exitosamente`);

    // Limpiar formulario
    setFecha(new Date());
    setObservaciones("");
    setItems([]);
    loadData(); // Recargar datos
  };

  const handleCancelar = () => {
    setFecha(new Date());
    setObservaciones("");
    setItems([]);
    setTipoItem("Producto");
    setSelectedItemId("");
    setCantidadItem("");
    toast.info("Operación cancelada");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Nueva Nota de Entrada</h1>
        <p className="text-muted-foreground">
          Registra el ingreso de productos e insumos al inventario
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackagePlus className="h-5 w-5" />
                Información de la Nota de Entrada
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
                      {fecha ? (
                        format(fecha, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fecha}
                      onSelect={(date) => date && setFecha(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ingrese observaciones adicionales..."
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
                          productos.length === 0 ? (
                            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                              No hay productos disponibles
                            </div>
                          ) : (
                            productos.map((producto) => (
                              <SelectItem key={producto.id} value={producto.id.toString()}>
                                {producto.nombre}
                              </SelectItem>
                            ))
                          )
                        ) : (
                          insumos.length === 0 ? (
                            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                              No hay insumos disponibles
                            </div>
                          ) : (
                            insumos.map((insumo) => (
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
                        value={cantidadItem}
                        onChange={(e) => setCantidadItem(e.target.value)}
                        onWheel={(e) => e.currentTarget.blur()}
                        placeholder="0"
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

          {/* Tabla de Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items a Ingresar ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay items agregados
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Unidad</TableHead>
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
                        <TableCell>{item.cantidad}</TableCell>
                        <TableCell>{item.unidad}</TableCell>
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
                  onClick={handleGenerarNota}
                  disabled={items.length === 0}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Generar Nota de Entrada
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCancelar}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  💡 Los items agregados incrementarán automáticamente el stock. Productos: solo tipo "No Preparado". Insumos: todos.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
