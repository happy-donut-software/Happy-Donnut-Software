import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { getNotasSalida, type NotaSalida as NotaSalidaType } from "../../lib/storage";
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
import { Search, Eye, Calendar, FileText, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function NotasSalida() {
  const [notas, setNotas] = useState<NotaSalidaType[]>([]);
  const [filteredNotas, setFilteredNotas] = useState<NotaSalidaType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [motivoFilter, setMotivoFilter] = useState<string>("todos");
  const [viewingNota, setViewingNota] = useState<NotaSalidaType | null>(null);
  
  // Cargar notas desde localStorage
  useEffect(() => {
    const loadNotas = () => {
      const data = getNotasSalida();
      setNotas(data);
      setFilteredNotas(data);
    };
    
    loadNotas();
    
    // Configurar listener para actualizar cuando cambie localStorage
    const handleStorageChange = () => {
      loadNotas();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('notas-salida-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notas-salida-updated', handleStorageChange);
    };
  }, []);

  // Filtrado
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, motivoFilter);
  };

  const handleMotivoFilter = (motivo: string) => {
    setMotivoFilter(motivo);
    applyFilters(searchTerm, motivo);
  };

  const applyFilters = (search: string, motivo: string) => {
    let filtered = notas;

    // Filtro por búsqueda
    if (search.trim() !== "") {
      filtered = filtered.filter(
        (nota) =>
          nota.numero.toLowerCase().includes(search.toLowerCase()) ||
          nota.docReferencia?.toLowerCase().includes(search.toLowerCase()) ||
          nota.productos.some(p => p.nombre.toLowerCase().includes(search.toLowerCase())) ||
          nota.usuario.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtro por motivo
    if (motivo !== "todos") {
      filtered = filtered.filter((nota) => nota.motivo === motivo);
    }

    setFilteredNotas(filtered);
  };

  const getMotivoColor = (motivo: NotaSalida["motivo"]) => {
    switch (motivo) {
      case "Por Venta":
        return "default";
      case "Por Uso Interno / Producción":
        return "secondary";
      case "Por Merma / Pérdida":
        return "destructive";
      case "Por Devolución a Proveedor":
        return "outline";
      case "Por Ajuste de Inventario":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary">Notas de Salida</h1>
          <p className="text-muted-foreground">
            Historial de movimientos de salida de inventario
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por N°, documento, producto o usuario..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={motivoFilter} onValueChange={handleMotivoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los motivos</SelectItem>
                <SelectItem value="Por Venta">Por Venta</SelectItem>
                <SelectItem value="Por Uso Interno / Producción">Por Uso Interno / Producción</SelectItem>
                <SelectItem value="Por Merma / Pérdida">Por Merma / Pérdida</SelectItem>
                <SelectItem value="Por Devolución a Proveedor">Por Devolución a Proveedor</SelectItem>
                <SelectItem value="Por Ajuste de Inventario">Por Ajuste de Inventario</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Notas de Salida */}
      <Card>
        <CardHeader>
          <CardTitle>
            Registros Encontrados: {filteredNotas.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Nota</TableHead>
                  <TableHead>Fecha / Hora</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Doc. Referencia</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron notas de salida
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotas.map((nota) => (
                    <TableRow key={nota.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {nota.numero}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{new Date(nota.fecha).toLocaleDateString('es-PE')}</div>
                            <div className="text-xs text-muted-foreground">{nota.hora}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getMotivoColor(nota.motivo)}>
                          {nota.motivo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {nota.docReferencia || (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {nota.productos.length === 1 ? (
                            <span>
                              {nota.productos[0].nombre} ({nota.productos[0].cantidad} {nota.productos[0].unidad})
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {nota.productos.length} productos
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {nota.usuario}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingNota(nota)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Detalle */}
      <Dialog open={!!viewingNota} onOpenChange={() => setViewingNota(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Nota de Salida</DialogTitle>
            <DialogDescription>
              Información completa del movimiento de salida
            </DialogDescription>
          </DialogHeader>

          {viewingNota && (
            <div className="space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">N° Nota</p>
                  <p>{viewingNota.numero}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p>{new Date(viewingNota.fecha).toLocaleDateString('es-PE')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hora</p>
                  <p>{viewingNota.hora}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Usuario</p>
                  <p>{viewingNota.usuario}</p>
                </div>
              </div>

              {/* Motivo y Referencia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Motivo</p>
                  <Badge variant={getMotivoColor(viewingNota.motivo)}>
                    {viewingNota.motivo}
                  </Badge>
                </div>
                {viewingNota.docReferencia && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Documento de Referencia</p>
                    <p>{viewingNota.docReferencia}</p>
                  </div>
                )}
              </div>

              {/* Productos */}
              <div>
                <h3 className="mb-3">Productos</h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-center">Unidad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingNota.productos.map((producto) => (
                        <TableRow key={producto.id}>
                          <TableCell>{producto.nombre}</TableCell>
                          <TableCell className="text-center">{producto.cantidad}</TableCell>
                          <TableCell className="text-center">{producto.unidad}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Observaciones */}
              {viewingNota.observaciones && (
                <div>
                  <h3 className="mb-2">Observaciones</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">{viewingNota.observaciones}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setViewingNota(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
