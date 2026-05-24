import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Search, Eye, Building2, Calendar, Package, Coins, FileText, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { 
  getCompras, 
  saveCompras, 
  getInsumos,
  addInsumoSinNota,
  updateInsumo,
  findInsumoByNombre,
  getProductos,
  addProducto,
  updateProducto,
  findProductoByNombre,
  addNotaEntrada,
  generateNotaEntradaNumero,
  getNextId,
  type Compra as CompraType,
  type Insumo as InsumoType,
  type Producto as ProductoType,
  type NotaEntrada as NotaEntradaType,
  type ProductoNE,
} from "../../lib/storage";

export function Compras() {
  const [compras, setCompras] = useState<CompraType[]>([]);
  const [filteredCompras, setFilteredCompras] = useState<CompraType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("todos");
  const [fechaFilter, setFechaFilter] = useState<string>("todos");
  const [viewingCompra, setViewingCompra] = useState<CompraType | null>(null);
  const [editingEstadoId, setEditingEstadoId] = useState<number | null>(null);

  // Cargar compras al montar el componente
  useEffect(() => {
    loadCompras();
  }, []);

  const loadCompras = () => {
    const comprasData = getCompras();
    setCompras(comprasData);
    setFilteredCompras(comprasData);
  };

  // Filtrado
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, estadoFilter, fechaFilter);
  };

  const handleEstadoFilter = (estado: string) => {
    setEstadoFilter(estado);
    applyFilters(searchTerm, estado, fechaFilter);
  };

  const handleFechaFilter = (fecha: string) => {
    setFechaFilter(fecha);
    applyFilters(searchTerm, estadoFilter, fecha);
  };

  const applyFilters = (search: string, estado: string, fecha: string) => {
    let filtered = compras;

    if (search.trim() !== "") {
      filtered = filtered.filter(
        (item) =>
          item.numeroOrden.toLowerCase().includes(search.toLowerCase()) ||
          item.proveedor.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (estado !== "todos") {
      filtered = filtered.filter((item) => item.estado === estado);
    }

    if (fecha !== "todos") {
      const hoy = new Date();
      const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      
      filtered = filtered.filter((item) => {
        const fechaCompra = new Date(item.fechaCompra);
        
        switch (fecha) {
          case "hoy":
            return fechaCompra >= inicioHoy;
          case "semana":
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - 7);
            return fechaCompra >= inicioSemana;
          case "mes":
            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            return fechaCompra >= inicioMes;
          default:
            return true;
        }
      });
    }

    setFilteredCompras(filtered);
  };

  const handleCambiarEstadoRecibido = (id: number) => {
    const compra = compras.find(c => c.id === id);
    if (!compra) return;

    if (compra.estado === "Recibido") {
      toast.info("Esta orden ya está marcada como recibida");
      return;
    }

    // Actualizar estado a Recibido
    const compraActualizada = { ...compra, estado: "Recibido" as const };
    const updatedCompras = compras.map(c => c.id === id ? compraActualizada : c);
    saveCompras(updatedCompras);
    setCompras(updatedCompras);
    applyFilters(searchTerm, estadoFilter, fechaFilter);

    // Procesar la compra recibida (actualizar inventario)
    procesarCompraRecibida(compraActualizada);

    toast.success(`Orden "${compra.numeroOrden}" marcada como recibida. Inventario actualizado.`);
    setEditingEstadoId(null);
  };

  const procesarCompraRecibida = (compra: CompraType) => {
    const productosNE: ProductoNE[] = [];
    const insumos = getInsumos();
    const productos = getProductos();

    // Procesar insumos
    compra.detallesInsumos.forEach((detalle) => {
      const insumoExistente = findInsumoByNombre(detalle.nombre, detalle.categoria);

      if (insumoExistente) {
        // Actualizar cantidad del insumo existente
        updateInsumo(insumoExistente.id, detalle.cantidadInsumo);
      } else {
        // Crear nuevo insumo
        const nuevoInsumo: InsumoType = {
          id: getNextId(getInsumos()),
          categoria: detalle.categoria,
          nombre: detalle.nombre,
          unidadMedida: detalle.unidadMedida,
          cantidad: detalle.cantidadInsumo,
          estado: "Disponible",
        };
        addInsumoSinNota(nuevoInsumo);
      }

      // Agregar a productos de nota de entrada
      productosNE.push({
        id: Date.now() + Math.random(),
        nombre: `${detalle.categoria} - ${detalle.nombre}`,
        cantidad: detalle.cantidadInsumo,
        unidad: detalle.unidadMedida,
      });
    });

    // Procesar productos
    compra.detallesProductos.forEach((detalle) => {
      const productoExistente = findProductoByNombre(detalle.nombre);

      if (productoExistente) {
        // Actualizar stock del producto existente
        updateProducto(productoExistente.id, detalle.cantidad);
      } else {
        // Crear nuevo producto con la categoría de la compra
        const nuevoProducto: ProductoType = {
          id: getNextId(getProductos()),
          nombre: detalle.nombre,
          categoria: detalle.categoria || "Otros", // Usar categoría del detalle o "Otros" como fallback
          tipo_producto: "No Preparado",
          precio: detalle.importeTotal / detalle.cantidad,
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

  const getEstadoBadgeVariant = (estado: CompraType["estado"]) => {
    switch (estado) {
      case "Recibido":
        return "default";
      case "Pendiente":
        return "outline";
    }
  };

  const totalCompras = compras.length;
  const totalRecibidas = compras.filter(c => c.estado === "Recibido").length;
  const totalPendientes = compras.filter(c => c.estado === "Pendiente").length;
  const montoTotal = compras.reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Compras</h1>
          <p className="text-muted-foreground">
            Gestión de órdenes de compra a proveedores
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl">{totalCompras}</div>
            <p className="text-sm text-muted-foreground">Total Órdenes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-primary">{totalRecibidas}</div>
            <p className="text-sm text-muted-foreground">Recibidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-secondary">{totalPendientes}</div>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-primary">S/ {montoTotal.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Monto Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por orden, proveedor o RUC..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={estadoFilter} onValueChange={handleEstadoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Recibido">Solo Recibidas</SelectItem>
                <SelectItem value="Pendiente">Solo Pendientes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={fechaFilter} onValueChange={handleFechaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las fechas</SelectItem>
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="semana">Última semana</SelectItem>
                <SelectItem value="mes">Este mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Órdenes de Compra: {filteredCompras.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Orden</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Fecha Compra</TableHead>
                  <TableHead>Fecha Entrega</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompras.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron órdenes de compra
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompras.map((compra) => (
                    <TableRow key={compra.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {compra.numeroOrden}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>{compra.proveedor}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(compra.fechaCompra + 'T00:00:00').toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(compra.fechaEntrega + 'T00:00:00').toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {(compra.detallesInsumos.length + compra.detallesProductos.length)} items
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-muted-foreground" />
                          S/ {compra.total.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEstadoBadgeVariant(compra.estado)}>
                          {compra.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingCompra(compra)}
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {compra.estado === "Pendiente" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingEstadoId(compra.id)}
                              title="Marcar como recibido"
                              className="text-primary"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Vista Detallada */}
      <Dialog open={!!viewingCompra} onOpenChange={() => setViewingCompra(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Orden de Compra</DialogTitle>
            <DialogDescription>
              Información completa de la orden de compra
            </DialogDescription>
          </DialogHeader>

          {viewingCompra && (
            <div className="space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">N° de Orden</p>
                  <p className="font-medium">{viewingCompra.numeroOrden}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge variant={getEstadoBadgeVariant(viewingCompra.estado)}>
                    {viewingCompra.estado}
                  </Badge>
                </div>
              </div>

              {/* Información del Proveedor */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Información del Proveedor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{viewingCompra.proveedor}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Fecha de Compra</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{new Date(viewingCompra.fechaCompra + 'T00:00:00').toLocaleDateString('es-PE', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Fecha de Entrega</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{new Date(viewingCompra.fechaEntrega + 'T00:00:00').toLocaleDateString('es-PE', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>
              </div>

              {/* Detalles de la Compra */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Detalles de la Compra</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {viewingCompra.detallesInsumos.length > 0 && (
                    <div>
                      <h4 className="mb-2">Insumos</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Insumo</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="text-right">Importe</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewingCompra.detallesInsumos.map((detalle, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <span className="text-xs bg-primary/10 px-2 py-1 rounded">
                                  {detalle.categoria}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  {detalle.nombre}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {detalle.cantidadInsumo} {detalle.unidadMedida}
                              </TableCell>
                              <TableCell className="text-right">
                                S/ {detalle.importeTotal.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {viewingCompra.detallesProductos.length > 0 && (
                    <div>
                      <h4 className="mb-2">Productos</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="text-right">Importe</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewingCompra.detallesProductos.map((detalle, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  {detalle.nombre}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {detalle.cantidad} unidad
                              </TableCell>
                              <TableCell className="text-right">
                                S/ {detalle.importeTotal.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t">
                    <div className="space-y-2 text-right">
                      {viewingCompra.detallesInsumos.length > 0 && (
                        <div className="flex justify-between gap-8">
                          <span className="text-muted-foreground">Subtotal Insumos:</span>
                          <span>S/ {viewingCompra.totalInsumos.toFixed(2)}</span>
                        </div>
                      )}
                      {viewingCompra.detallesProductos.length > 0 && (
                        <div className="flex justify-between gap-8">
                          <span className="text-muted-foreground">Subtotal Productos:</span>
                          <span>S/ {viewingCompra.totalProductos.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between gap-8 pt-2 border-t">
                        <strong>TOTAL:</strong>
                        <strong>S/ {viewingCompra.total.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Observaciones */}
              {viewingCompra.observaciones && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Observaciones</p>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">{viewingCompra.observaciones}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setViewingCompra(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Cambio de Estado */}
      <AlertDialog open={!!editingEstadoId} onOpenChange={() => setEditingEstadoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Marcar Orden como Recibida?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>
                  Al marcar esta orden como recibida, se realizarán las siguientes acciones automáticamente:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Se actualizará el inventario de insumos y/o productos</li>
                  <li>Se creará una Nota de Entrada automática</li>
                  <li>El estado no se podrá modificar posteriormente</li>
                </ul>
                {editingEstadoId && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <strong>Orden: </strong>
                    {compras.find(c => c.id === editingEstadoId)?.numeroOrden}
                    <br />
                    <strong>Proveedor: </strong>
                    {compras.find(c => c.id === editingEstadoId)?.proveedor}
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditingEstadoId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => editingEstadoId && handleCambiarEstadoRecibido(editingEstadoId)} 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirmar Recepción
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}