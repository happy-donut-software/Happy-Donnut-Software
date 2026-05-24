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
import { CalendarIcon, Plus, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  getProductos,
  addNotaSalida,
  updateProducto,
  generateNotaSalidaNumero,
  getNextId,
  getNotasSalida,
  type Producto,
  type NotaSalida as NotaSalidaType,
  type ProductoNS
} from "../../lib/storage";

interface ProductoSalida {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
}

export default function NuevaNotaSalida() {
  const [fecha, setFecha] = useState<Date>(new Date());
  const [motivo, setMotivo] = useState<string>("");
  const [docReferencia, setDocReferencia] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [productos, setProductos] = useState<ProductoSalida[]>([]);

  // Estado para agregar producto
  const [selectedProductoId, setSelectedProductoId] = useState<string>("");
  const [cantidadProducto, setCantidadProducto] = useState<string>("");

  // Productos disponibles desde inventario
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);

  useEffect(() => {
    setProductosDisponibles(getProductos());
  }, []);

  const handleAgregarProducto = () => {
    if (!selectedProductoId) {
      toast.error("Debe seleccionar un producto");
      return;
    }

    if (!cantidadProducto || parseFloat(cantidadProducto) <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    const id = parseInt(selectedProductoId);
    const producto = productosDisponibles.find(p => p.id === id);

    if (!producto) {
      toast.error("Producto no encontrado");
      return;
    }

    // Validar stock disponible
    if (parseFloat(cantidadProducto) > producto.stock) {
      toast.error(`Stock insuficiente. Disponible: ${producto.stock} unidades`);
      return;
    }

    // Validar si ya existe el producto
    const yaExiste = productos.find((p) => p.id === id);
    if (yaExiste) {
      toast.error("Este producto ya fue agregado");
      return;
    }

    const nuevoProducto: ProductoSalida = {
      id: id,
      nombre: producto.nombre,
      cantidad: parseFloat(cantidadProducto),
      unidad: "und"
    };

    setProductos([...productos, nuevoProducto]);
    setSelectedProductoId("");
    setCantidadProducto("");
    toast.success("Producto agregado");
  };

  const handleEliminarProducto = (id: number) => {
    setProductos(productos.filter((p) => p.id !== id));
    toast.success("Producto eliminado");
  };

  const handleLimpiar = () => {
    setFecha(new Date());
    setMotivo("");
    setDocReferencia("");
    setObservaciones("");
    setProductos([]);
    setSelectedProductoId("");
    setCantidadProducto("");
    toast.success("Formulario limpiado");
  };

  const handleGuardar = () => {
    // Validaciones
    if (!motivo) {
      toast.error("Debe seleccionar un motivo");
      return;
    }

    if (productos.length === 0) {
      toast.error("Debe agregar al menos un producto");
      return;
    }

    // Validar documento de referencia si el motivo es "Por Venta"
    if (motivo === "Por Venta" && !docReferencia.trim()) {
      toast.error("Debe ingresar el documento de referencia (N° de Boleta)");
      return;
    }

    try {
      // Generar número de nota de salida
      const numeroNota = generateNotaSalidaNumero();
      
      // Obtener hora actual
      const now = new Date();
      const hora = now.toTimeString().split(' ')[0].substring(0, 5);

      // Obtener usuario actual
      const currentUser = localStorage.getItem('currentUser') || 'Sistema';

      // Crear productos para la nota de salida
      const productosNS: ProductoNS[] = productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        cantidad: p.cantidad,
        unidad: p.unidad
      }));

      // Crear nota de salida
      const nuevaNotaSalida: NotaSalidaType = {
        id: getNextId(getNotasSalida()),
        numero: numeroNota,
        fecha: fecha.toISOString().split('T')[0],
        hora: hora,
        motivo: motivo as any,
        docReferencia: docReferencia.trim() || undefined,
        productos: productosNS,
        observaciones: observaciones.trim() || undefined,
        usuario: currentUser
      };

      // Guardar nota de salida
      addNotaSalida(nuevaNotaSalida);

      // Disparar evento para actualizar la lista de notas de salida
      window.dispatchEvent(new Event('notas-salida-updated'));

      // Actualizar stock de productos
      productos.forEach(item => {
        updateProducto(item.id, -item.cantidad);
      });

      toast.success(`Nota de Salida ${numeroNota} generada correctamente`);
      toast.success(`Stock actualizado para ${productos.length} producto(s)`);

      // Limpiar formulario
      handleLimpiar();
    } catch (error) {
      toast.error("Error al guardar la nota de salida");
      console.error(error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary">Generar Nota de Salida</h1>
          <p className="text-muted-foreground">
            Registrar movimientos de salida de inventario
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleLimpiar}>
            <X className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
          <Button onClick={handleGuardar}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Nota
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Información General */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos Principales */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha */}
                <div className="space-y-2">
                  <Label>Fecha de Salida</Label>
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

                {/* Motivo */}
                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo / Tipo de Movimiento *</Label>
                  <Select value={motivo} onValueChange={setMotivo}>
                    <SelectTrigger id="motivo">
                      <SelectValue placeholder="Seleccionar motivo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Por Venta">Por Venta</SelectItem>
                      <SelectItem value="Por Uso Interno / Producción">
                        Por Uso Interno / Producción
                      </SelectItem>
                      <SelectItem value="Por Merma / Pérdida">
                        Por Merma / Pérdida
                      </SelectItem>
                      <SelectItem value="Por Devolución a Proveedor">
                        Por Devolución a Proveedor
                      </SelectItem>
                      <SelectItem value="Por Ajuste de Inventario">
                        Por Ajuste de Inventario
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Documento de Referencia */}
              <div className="space-y-2">
                <Label htmlFor="docReferencia">
                  Documento de Referencia {motivo === "Por Venta" && <span className="text-destructive">*</span>}
                  <span className="text-muted-foreground text-xs ml-2">
                    {motivo === "Por Venta" ? "(N° de Boleta)" : "(Opcional)"}
                  </span>
                </Label>
                <Input
                  id="docReferencia"
                  placeholder={
                    motivo === "Por Venta" 
                      ? "Ej: B001-00247" 
                      : "Ej: PROV-FC-0458, N° de referencia..."
                  }
                  value={docReferencia}
                  onChange={(e) => setDocReferencia(e.target.value)}
                />
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones / Notas</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Explicar el motivo de la salida..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Productos Agregados */}
          <Card>
            <CardHeader>
              <CardTitle>Productos ({productos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {productos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay productos agregados</p>
                  <p className="text-sm">Use el panel lateral para agregar productos</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-center">Unidad</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productos.map((producto) => (
                        <TableRow key={producto.id}>
                          <TableCell>{producto.nombre}</TableCell>
                          <TableCell className="text-center">{producto.cantidad}</TableCell>
                          <TableCell className="text-center">{producto.unidad}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEliminarProducto(producto.id)}
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

        {/* Columna Derecha: Agregar Productos */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agregar Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="producto">Seleccionar Producto</Label>
                <Select value={selectedProductoId} onValueChange={setSelectedProductoId}>
                  <SelectTrigger id="producto">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {productosDisponibles
                      .filter((p) => !productos.find((prod) => prod.id === p.id))
                      .map((producto) => (
                        <SelectItem key={producto.id} value={producto.id.toString()}>
                          {producto.nombre} (Stock: {producto.stock} unidades)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad a Sacar</Label>
                <Input
                  id="cantidad"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={cantidadProducto}
                  onChange={(e) => setCantidadProducto(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Unidad: und
                </p>
              </div>

              <Button 
                onClick={handleAgregarProducto} 
                className="w-full"
                disabled={!selectedProductoId || !cantidadProducto}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Producto
              </Button>
            </CardContent>
          </Card>

          {/* Card de Ayuda */}
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-base">💡 Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="font-medium">¿Cuándo usar cada motivo?</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• <strong>Por Venta:</strong> Salida por venta al cliente (requiere N° de Boleta)</li>
                  <li>• <strong>Uso Interno:</strong> Productos para consumo interno</li>
                  <li>• <strong>Merma:</strong> Productos dañados o perdidos</li>
                  <li>• <strong>Devolución:</strong> Devolver al proveedor</li>
                  <li>• <strong>Ajuste:</strong> Corregir diferencias de inventario</li>
                </ul>
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
