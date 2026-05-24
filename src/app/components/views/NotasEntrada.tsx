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
import { Search, Eye, Calendar, FileText } from "lucide-react";
import { getNotasEntrada, type NotaEntrada, type ProductoNE } from "../../lib/storage";

export default function NotasEntrada() {
  const [notas, setNotas] = useState<NotaEntrada[]>([]);
  const [filteredNotas, setFilteredNotas] = useState<NotaEntrada[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingNota, setViewingNota] = useState<NotaEntrada | null>(null);

  // Cargar notas de entrada al montar el componente
  useEffect(() => {
    loadNotas();
  }, []);

  const loadNotas = () => {
    const notasData = getNotasEntrada();
    setNotas(notasData);
    setFilteredNotas(notasData);
  };

  // Filtrado
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term);
  };

  const applyFilters = (search: string) => {
    let filtered = notas;

    // Filtro por búsqueda
    if (search.trim() !== "") {
      filtered = filtered.filter(
        (nota) =>
          nota.numero.toLowerCase().includes(search.toLowerCase()) ||
          nota.productos.some(p => p.nombre.toLowerCase().includes(search.toLowerCase()))
      );
    }

    setFilteredNotas(filtered);
  };


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary">Notas de Entrada</h1>
          <p className="text-muted-foreground">
            Historial de movimientos de entrada de inventario
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por N° o producto..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Notas de Entrada */}
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
                  <TableHead>Productos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No se encontraron notas de entrada
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
            <DialogTitle>Detalle de Nota de Entrada</DialogTitle>
            <DialogDescription>
              Información completa del movimiento de entrada
            </DialogDescription>
          </DialogHeader>

          {viewingNota && (
            <div className="space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
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