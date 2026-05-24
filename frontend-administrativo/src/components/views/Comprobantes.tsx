import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Search, Eye, Download, Filter, Printer, FileText, FileSpreadsheet, X, Calendar as CalendarIcon, Ban } from "lucide-react";
import { getComprobantes, saveComprobantes, type Comprobante as ComprobanteType, type ItemComprobante } from "../../lib/storage";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner@2.0.3";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function Comprobantes() {
  const [comprobantes, setComprobantes] = useState<ComprobanteType[]>([]);
  
  // Cargar comprobantes desde localStorage
  useEffect(() => {
    const loadComprobantes = () => {
      const data = getComprobantes();
      setComprobantes(data);
    };
    
    loadComprobantes();
    
    // Configurar listener para actualizar cuando cambie localStorage
    const handleStorageChange = () => {
      loadComprobantes();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar eventos personalizados para actualización inmediata
    window.addEventListener('comprobantes-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('comprobantes-updated', handleStorageChange);
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingComprobante, setViewingComprobante] = useState<ComprobanteType | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAnularDialog, setShowAnularDialog] = useState(false);
  const [comprobanteToAnular, setComprobanteToAnular] = useState<ComprobanteType | null>(null);

  // Filtros
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterMetodoPago, setFilterMetodoPago] = useState<string>("todos");
  const [filterFechaDesde, setFilterFechaDesde] = useState<Date | undefined>(undefined);
  const [filterFechaHasta, setFilterFechaHasta] = useState<Date | undefined>(undefined);

  const filteredComprobantes = comprobantes.filter(comp => {
    const matchSearch =
      comp.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comp.cliente && comp.cliente.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchEstado = filterEstado === "todos" || comp.estado === filterEstado;
    const matchMetodoPago = filterMetodoPago === "todos" || comp.metodoPago === filterMetodoPago;

    let matchFecha = true;
    const fechaComp = new Date(comp.fecha);
    if (filterFechaDesde) {
      matchFecha = matchFecha && fechaComp >= filterFechaDesde;
    }
    if (filterFechaHasta) {
      matchFecha = matchFecha && fechaComp <= filterFechaHasta;
    }

    return matchSearch && matchEstado && matchMetodoPago && matchFecha;
  });

  const handleView = (comprobante: ComprobanteType) => {
    setViewingComprobante(comprobante);
    setShowViewDialog(true);
  };

  const handleExportPDF = () => {
    toast.success("Exportando comprobantes a PDF...");
    // Aquí iría la lógica de exportación a PDF
  };

  const handleExportExcel = () => {
    toast.success("Exportando comprobantes a Excel...");
    // Aquí iría la lógica de exportación a Excel
  };

  const handlePrint = () => {
    toast.success("Imprimiendo comprobantes...");
    window.print();
  };

  const handleDownloadComprobante = (comprobante: ComprobanteType) => {
    const correlativo = `${comprobante.serie}-${comprobante.numero}`;
    toast.success(`Descargando comprobante ${correlativo}`);
  };

  const handleLimpiarFiltros = () => {
    setFilterEstado("todos");
    setFilterMetodoPago("todos");
    setFilterFechaDesde(undefined);
    setFilterFechaHasta(undefined);
    toast.info("Filtros limpiados");
  };

  const handleAnularClick = (comprobante: ComprobanteType) => {
    setComprobanteToAnular(comprobante);
    setShowAnularDialog(true);
  };

  const handleConfirmAnular = () => {
    if (comprobanteToAnular) {
      const updatedComprobantes = comprobantes.map(comp =>
        comp.id === comprobanteToAnular.id
          ? { ...comp, estado: "Anulado" as const }
          : comp
      );
      
      setComprobantes(updatedComprobantes);
      saveComprobantes(updatedComprobantes);
      
      // Si estamos viendo el comprobante, actualizar el estado en la vista
      if (viewingComprobante && viewingComprobante.id === comprobanteToAnular.id) {
        setViewingComprobante({ ...viewingComprobante, estado: "Anulado" });
      }

      const correlativo = `${comprobanteToAnular.serie}-${comprobanteToAnular.numero}`;
      toast.success(`Comprobante ${correlativo} anulado exitosamente`);
      setShowAnularDialog(false);
      setComprobanteToAnular(null);
    }
  };

  const handleCancelAnular = () => {
    setShowAnularDialog(false);
    setComprobanteToAnular(null);
  };

  const totalComprobantes = comprobantes.length;
  const emitidos = comprobantes.filter(c => c.estado === "Emitido").length;
  const anulados = comprobantes.filter(c => c.estado === "Anulado").length;
  const montoTotal = comprobantes
    .filter(c => c.estado === "Emitido")
    .reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Comprobantes</h1>
          <p className="text-muted-foreground">Gestión de todos los comprobantes emitidos (Régimen RUS)</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Exportar como</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportPDF}>
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl">{totalComprobantes}</div>
            <p className="text-sm text-muted-foreground">Total Comprobantes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-primary">{emitidos}</div>
            <p className="text-sm text-muted-foreground">Emitidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-destructive">{anulados}</div>
            <p className="text-sm text-muted-foreground">Anulados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-secondary">S/. {montoTotal.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Monto Total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Panel de Filtros */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm">Filtros Avanzados</h3>
                <Button variant="ghost" size="sm" onClick={handleLimpiarFiltros}>
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Estado</Label>
                  <Select value={filterEstado} onValueChange={setFilterEstado}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="Emitido">Emitido</SelectItem>
                      <SelectItem value="Anulado">Anulado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Método de Pago</Label>
                  <Select value={filterMetodoPago} onValueChange={setFilterMetodoPago}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="YAPE">YAPE</SelectItem>
                      <SelectItem value="PLIN">PLIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Fecha Desde</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filterFechaDesde ? format(filterFechaDesde, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filterFechaDesde}
                        onSelect={setFilterFechaDesde}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Fecha Hasta</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filterFechaHasta ? format(filterFechaHasta, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filterFechaHasta}
                        onSelect={setFilterFechaHasta}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Mostrando {filteredComprobantes.length} de {comprobantes.length} comprobantes
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Método Pago</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComprobantes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No se encontraron comprobantes
                  </TableCell>
                </TableRow>
              ) : (
                filteredComprobantes.map((comp) => (
                  <TableRow key={comp.id}>
                    <TableCell>{comp.serie}-{comp.numero}</TableCell>
                    <TableCell>{new Date(comp.fecha).toLocaleDateString('es-PE')}</TableCell>
                    <TableCell>{comp.cliente || "Cliente General"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{comp.metodoPago.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell className="text-right">S/. {comp.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={comp.estado === "Emitido" ? "default" : "destructive"}>
                        {comp.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(comp)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadComprobante(comp)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo de Ver Comprobante */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Comprobante</DialogTitle>
            <DialogDescription>
              Información completa del comprobante de venta
            </DialogDescription>
          </DialogHeader>
          {viewingComprobante && (
            <div className="space-y-6 py-4">
              {/* Encabezado */}
              <div className="text-center border-b pb-4">
                <h2 className="text-xl">HappyDonuts</h2>
                <p className="text-sm text-muted-foreground">Régimen RUS</p>
                <p className="text-sm text-muted-foreground">
                  {viewingComprobante.tipoComprobante === "boleta" ? "BOLETA DE VENTA" : "FACTURA"}
                </p>
                <p className="font-medium mt-2">{viewingComprobante.serie}-{viewingComprobante.numero}</p>
              </div>

              {/* Información General */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Emisión</p>
                  <p className="font-medium">{new Date(viewingComprobante.fecha).toLocaleDateString('es-PE')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hora de Registro</p>
                  <p className="font-medium">{viewingComprobante.hora}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{viewingComprobante.cliente || "Cliente General"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Método de Pago</p>
                  <Badge variant="outline">{viewingComprobante.metodoPago.toUpperCase()}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge variant={viewingComprobante.estado === "Emitido" ? "default" : "destructive"}>
                    {viewingComprobante.estado}
                  </Badge>
                </div>
              </div>

              {/* Productos */}
              <div>
                <h3 className="mb-3">Productos</h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-center">Cant.</TableHead>
                        <TableHead className="text-right">Precio Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingComprobante.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.producto}</TableCell>
                          <TableCell className="text-center">{item.cantidad}</TableCell>
                          <TableCell className="text-right">S/. {item.precio.toFixed(2)}</TableCell>
                          <TableCell className="text-right">S/. {(item.cantidad * item.precio).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Total */}
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex justify-between pt-2 border-t">
                  <span>Total a Pagar:</span>
                  <span className="text-xl">S/. {viewingComprobante.total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  * Régimen RUS - No incluye IGV
                </p>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleDownloadComprobante(viewingComprobante)}>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" />
                </Button>
                {viewingComprobante.estado === "Emitido" && (
                  <Button 
                    variant="destructive" 
                    onClick={() => handleAnularClick(viewingComprobante)}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Anular
                  </Button>
                )}
              </div>
              
              {viewingComprobante.estado === "Anulado" && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-sm text-destructive text-center">
                    ⚠️ Este comprobante ha sido anulado y no puede ser revertido
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Anulación */}
      <AlertDialog open={showAnularDialog} onOpenChange={setShowAnularDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Anular Comprobante?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es <strong>irreversible</strong>. El comprobante {comprobanteToAnular && `${comprobanteToAnular.serie}-${comprobanteToAnular.numero}`} será marcado como anulado y no podrá ser revertido.
              <br /><br />
              ¿Está seguro que desea continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAnular}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAnular}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sí, Anular Comprobante
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}