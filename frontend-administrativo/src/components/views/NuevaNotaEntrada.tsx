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
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  productosAPI,
  type ProductoAPI as Producto
} from "../../src/services/api/productos.service";
import { 
  notasEntradaService,
  type CreateNotaEntradaRequest
} from "../../src/services/api/notasEntrada.service";

interface ItemEntrada {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
}

export default function NuevaNotaEntrada() {
  const [fecha, setFecha] = useState<Date>(new Date());
  const [motivo, setMotivo] = useState<string>("");
  const [docReferencia, setDocReferencia] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [items, setItems] = useState<ItemEntrada[]>([]);
  
  const [productos, setProductos] = useState<Producto[]>([]);

  // Estado para agregar item
  const [selectedProductoId, setSelectedProductoId] = useState<string>("");
  const [cantidadItem, setCantidadItem] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await productosAPI.getProductos();
      setProductos(response.data);
    } catch (error) {
      console.error('Error cargando productos:', error);
      toast.error('Error cargando productos');
    }
  };

  const handleAgregarItem = () => {
    if (!selectedProductoId) {
      toast.error("Debe seleccionar un producto");
      return;
    }

    if (!cantidadItem || parseFloat(cantidadItem) <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    const producto = productos.find((p) => p.id === parseInt(selectedProductoId));
    if (!producto) return;

    // Validar si ya existe el producto
    const yaExiste = items.find((i) => i.id === producto.id);
    if (yaExiste) {
      toast.error("Este producto ya fue agregado");
      return;
    }

    const nuevoItem: ItemEntrada = {
      id: producto.id,
      nombre: producto.nombre,
      cantidad: parseFloat(cantidadItem),
      unidad: "und",
    };

    setItems([...items, nuevoItem]);
    setSelectedProductoId("");
    setCantidadItem("");
    toast.success("Producto agregado");
  };

  const handleEliminarItem = (index: number) => {
    const nuevosItems = items.filter((_, i) => i !== index);
    setItems(nuevosItems);
    toast.success("Item eliminado");
  };

  const handleGenerarNota = async () => {
    if (!motivo) {
      toast.error("Debe seleccionar un motivo");
      return;
    }

    if (items.length === 0) {
      toast.error("Debe agregar al menos un producto");
      return;
    }

    try {
      const currentUser = localStorage.getItem('currentUser') || 'Sistema';
      const now = new Date();
      const hora = now.toTimeString().split(' ')[0].substring(0, 5);

      const notaEntradaRequest: CreateNotaEntradaRequest = {
        fecha: format(fecha, 'yyyy-MM-dd'),
        hora: hora,
        motivo: motivo,
        doc_referencia: docReferencia || undefined,
        observaciones: observaciones || undefined,
        usuario: currentUser,
        productos: items.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          unidad: item.unidad,
        })),
      };

      const notaCreada = await notasEntradaService.create(notaEntradaRequest);

      toast.success(`Nota de Entrada ${notaCreada.numero} generada exitosamente`);
      
      setFecha(new Date());
      setMotivo("");
      setDocReferencia("");
      setObservaciones("");
      setItems([]);
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error guardando nota de entrada:', error);
      toast.error('Error guardando nota de entrada');
    }
  };

  const handleCancelar = () => {
    setFecha(new Date());
    setMotivo("");
    setDocReferencia("");
    setObservaciones("");
    setItems([]);
    setSelectedProductoId("");
    setCantidadItem("");
    toast.info("Operación cancelada");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Nueva Nota de Entrada</h1>
        <p className="text-muted-foreground">
          Registra el ingreso de productos al inventario
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
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="motivo">Motivo *</Label>
                  <Select value={motivo} onValueChange={setMotivo}>
                    <SelectTrigger id="motivo">
                      <SelectValue placeholder="Seleccionar motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Por Compra">Por Compra</SelectItem>
                      <SelectItem value="Por Producción Interna">Por Producción Interna</SelectItem>
                      <SelectItem value="Por Devolución de Cliente">Por Devolución de Cliente</SelectItem>
                      <SelectItem value="Por Ajuste de Inventario">Por Ajuste de Inventario</SelectItem>
                      <SelectItem value="Por Donación/Cortesía">Por Donación/Cortesía</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="docReferencia">Documento de Referencia (Opcional)</Label>
                <Input
                  id="docReferencia"
                  value={docReferencia}
                  onChange={(e) => setDocReferencia(e.target.value)}
                  placeholder="Ej: OC-202411-0001"
                />
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
                Agregar Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="producto">Producto</Label>
                    <Select value={selectedProductoId} onValueChange={setSelectedProductoId}>
                      <SelectTrigger id="producto">
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {productos.map((producto) => (
                          <SelectItem key={producto.id} value={producto.id.toString()}>
                            {producto.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cantidad">Cantidad</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cantidad"
                        type="number"
                        step="1"
                        value={cantidadItem}
                        onChange={(e) => setCantidadItem(e.target.value)}
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
              <CardTitle>Productos a Ingresar ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay productos agregados
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
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
                <p className="text-sm text-muted-foreground">Total de Productos</p>
                <p className="text-2xl text-primary">{items.length}</p>
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
                  disabled={items.length === 0 || !motivo}
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
                  💡 Los productos agregados incrementarán automáticamente el stock en el inventario.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
