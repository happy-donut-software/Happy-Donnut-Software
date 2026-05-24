import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Alert, AlertDescription } from "../ui/alert";
import { Tag, Plus, Trash2, Save, X, Check, ChevronsUpDown, AlertCircle, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { 
  getProductos, 
  addPromocion, 
  getPromociones,
  type Producto,
  type ProductoPromocion 
} from "../../lib/storage";

export function NuevaPromocion() {
  const [nombre, setNombre] = useState("");
  const [precioPromocion, setPrecioPromocion] = useState("");
  const [activo, setActivo] = useState(true);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoPromocion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [openProducto, setOpenProducto] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = () => {
    const data = getProductos();
    // Solo productos disponibles
    const disponibles = data.filter(p => p.estado === "Disponible");
    setProductos(disponibles);
  };

  const handleAgregarProducto = (producto: Producto) => {
    const yaAgregado = productosSeleccionados.find(p => p.id === producto.id);
    
    if (yaAgregado) {
      toast.error("Este producto ya está agregado a la promoción");
      return;
    }

    const nuevoProducto: ProductoPromocion = {
      id: producto.id,
      nombre: producto.nombre,
      cantidad: 1
    };

    setProductosSeleccionados([...productosSeleccionados, nuevoProducto]);
    setOpenProducto(false);
    toast.success(`Producto "${producto.nombre}" agregado`);
  };

  const handleCantidadChange = (id: number, cantidad: string) => {
    const cantidadNum = parseInt(cantidad);
    if (cantidadNum > 0) {
      const updated = productosSeleccionados.map(p =>
        p.id === id ? { ...p, cantidad: cantidadNum } : p
      );
      setProductosSeleccionados(updated);
    }
  };

  const handleEliminarProducto = (id: number) => {
    const producto = productosSeleccionados.find(p => p.id === id);
    setProductosSeleccionados(productosSeleccionados.filter(p => p.id !== id));
    toast.success(`Producto "${producto?.nombre}" eliminado de la promoción`);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nombre.trim()) {
      newErrors.nombre = "El nombre de la promoción es obligatorio";
    }

    if (productosSeleccionados.length === 0) {
      newErrors.productos = "Debe agregar al menos un producto a la promoción";
    }

    if (!precioPromocion || parseFloat(precioPromocion) <= 0) {
      newErrors.precioPromocion = "El precio de la promoción debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGuardar = () => {
    if (!validateForm()) {
      toast.error("Por favor, corrija los errores del formulario");
      return;
    }

    const currentUser = localStorage.getItem('currentUser') || 'Admin';
    const promociones = getPromociones();
    const nuevoId = promociones.length > 0 
      ? Math.max(...promociones.map(p => p.id)) + 1 
      : 1;

    const nuevaPromocion = {
      id: nuevoId,
      nombre: nombre.trim(),
      productos: productosSeleccionados,
      precioPromocion: parseFloat(precioPromocion),
      activo: activo,
      fechaCreacion: new Date().toISOString().split('T')[0],
      usuario: currentUser
    };

    addPromocion(nuevaPromocion);
    
    toast.success(`Promoción "${nombre}" creada exitosamente`);
    
    // Limpiar formulario
    setNombre("");
    setPrecioPromocion("");
    setActivo(true);
    setProductosSeleccionados([]);
    setErrors({});
  };

  const handleCancelar = () => {
    setNombre("");
    setPrecioPromocion("");
    setActivo(true);
    setProductosSeleccionados([]);
    setErrors({});
  };

  const calcularPrecioNormal = (): number => {
    let total = 0;
    productosSeleccionados.forEach(prodPromo => {
      const producto = productos.find(p => p.id === prodPromo.id);
      if (producto) {
        total += producto.precio * prodPromo.cantidad;
      }
    });
    return total;
  };

  const precioNormal = calcularPrecioNormal();
  const ahorro = precioPromocion ? precioNormal - parseFloat(precioPromocion) : 0;
  const porcentajeDescuento = precioNormal > 0 && precioPromocion 
    ? ((ahorro / precioNormal) * 100).toFixed(1) 
    : "0";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-primary">Nueva Promoción</h1>
        <p className="text-muted-foreground">
          Crea una nueva promoción de productos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Promoción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Promoción *</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (errors.nombre) setErrors({ ...errors, nombre: "" });
                  }}
                  placeholder="Ej: Combo Familiar, Pack Desayuno, etc."
                  className={errors.nombre ? 'border-destructive' : ''}
                />
                {errors.nombre && (
                  <p className="text-sm text-destructive">{errors.nombre}</p>
                )}
              </div>

              {/* Precio */}
              <div className="space-y-2">
                <Label htmlFor="precio">Precio de la Promoción *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm text-muted-foreground">S/</span>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={precioPromocion}
                    onChange={(e) => {
                      setPrecioPromocion(e.target.value);
                      if (errors.precioPromocion) setErrors({ ...errors, precioPromocion: "" });
                    }}
                    placeholder="0.00"
                    className={`pl-10 ${errors.precioPromocion ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.precioPromocion && (
                  <p className="text-sm text-destructive">{errors.precioPromocion}</p>
                )}
                {precioPromocion && precioNormal > 0 && (
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">
                      Precio normal: S/ {precioNormal.toFixed(2)}
                    </p>
                    {ahorro > 0 && (
                      <p className="text-green-600">
                        Ahorro: S/ {ahorro.toFixed(2)} ({porcentajeDescuento}% de descuento)
                      </p>
                    )}
                    {ahorro < 0 && (
                      <p className="text-destructive">
                        ⚠️ El precio de la promoción es mayor al precio normal
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Estado */}
              <div className="flex items-center justify-between space-x-2">
                <div>
                  <Label htmlFor="activo">Estado de la Promoción</Label>
                  <p className="text-xs text-muted-foreground">
                    {activo ? "La promoción estará disponible para la venta" : "La promoción NO estará disponible"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="activo"
                    checked={activo}
                    onCheckedChange={setActivo}
                  />
                  <Badge variant={activo ? "default" : "secondary"}>
                    {activo ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Productos de la Promoción */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Productos de la Promoción</CardTitle>
                <Popover open={openProducto} onOpenChange={setOpenProducto}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Producto
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <Command>
                      <CommandInput placeholder="Buscar producto..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron productos</CommandEmpty>
                        <CommandGroup>
                          {productos.map((producto) => (
                            <CommandItem
                              key={producto.id}
                              value={producto.nombre}
                              onSelect={() => handleAgregarProducto(producto)}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  productosSeleccionados.find(p => p.id === producto.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              <div className="flex-1">
                                <p>{producto.nombre}</p>
                                <p className="text-xs text-muted-foreground">
                                  S/ {producto.precio.toFixed(2)} - Stock: {producto.stock}
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
            </CardHeader>
            <CardContent>
              {errors.productos && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.productos}</AlertDescription>
                </Alert>
              )}

              {productosSeleccionados.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    No hay productos agregados a la promoción
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Haz clic en "Agregar Producto" para comenzar
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Precio Unitario</TableHead>
                        <TableHead className="w-32">Cantidad</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productosSeleccionados.map((prodPromo) => {
                        const producto = productos.find(p => p.id === prodPromo.id);
                        const subtotal = producto ? producto.precio * prodPromo.cantidad : 0;
                        
                        return (
                          <TableRow key={prodPromo.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{prodPromo.nombre}</p>
                                <p className="text-xs text-muted-foreground">
                                  {producto?.categoria}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              S/ {producto?.precio.toFixed(2) || '0.00'}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={prodPromo.cantidad}
                                onChange={(e) => handleCantidadChange(prodPromo.id, e.target.value)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              S/ {subtotal.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEliminarProducto(prodPromo.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📊 Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Productos</p>
                <p className="text-lg">{productosSeleccionados.length}</p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Cantidad Total</p>
                <p className="text-lg">
                  {productosSeleccionados.reduce((sum, p) => sum + p.cantidad, 0)} unidades
                </p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Precio Normal</p>
                <p className="text-lg">S/ {precioNormal.toFixed(2)}</p>
              </div>

              <div className="p-3 bg-primary/10 border-2 border-primary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Precio Promoción</p>
                <p className="text-xl text-primary">
                  S/ {precioPromocion ? parseFloat(precioPromocion).toFixed(2) : '0.00'}
                </p>
              </div>

              {ahorro > 0 && (
                <div className="p-3 bg-green-50 border-2 border-green-600 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Ahorro</p>
                  <p className="text-lg text-green-600">
                    S/ {ahorro.toFixed(2)} ({porcentajeDescuento}%)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información */}
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-base">💡 Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-2">Consejos:</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Asigna un nombre descriptivo</li>
                  <li>• Incluye productos complementarios</li>
                  <li>• El precio debe ser menor al normal</li>
                  <li>• Puedes activar/desactivar después</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="space-y-2">
            <Button onClick={handleGuardar} className="w-full" size="lg">
              <Save className="mr-2 h-4 w-4" />
              Guardar Promoción
            </Button>
            <Button onClick={handleCancelar} variant="outline" className="w-full">
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
