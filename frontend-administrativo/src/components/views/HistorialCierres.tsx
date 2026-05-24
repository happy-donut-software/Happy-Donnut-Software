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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Search, Eye, Calendar, User, Coins, FileText, TrendingUp, TrendingDown } from "lucide-react";

interface Cierre {
  id: number;
  fecha: string;
  hora: string;
  responsable: string;
  fondoInicial: number;
  fondoInicialYape?: number;
  fondoInicialPlin?: number;
  totalIngresos: number;
  totalEgresos: number;
  totalCompras: number;
  totalEsperado: number;
  totalContado: number;
  diferenciaTotal: number;
  ganancia: number;
  observaciones?: string;
  arqueo: {
    efectivo: {
      esperado: number;
      contado: number;
      diferencia: number;
    };
    yape: {
      esperado: number;
      contado: number;
      diferencia: number;
    };
    plin: {
      esperado: number;
      contado: number;
      diferencia: number;
    };
  };
  desglose: {
    ingresos: {
      efectivo: number;
      yape: number;
      plin: number;
    };
    egresos: {
      efectivo: number;
      yape: number;
      plin: number;
    };
  };
  movimientos: any[];
}

export function HistorialCierres() {
  const [cierres, setCierres] = useState<Cierre[]>([]);
  const [filteredCierres, setFilteredCierres] = useState<Cierre[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("todos");
  const [fechaFilter, setFechaFilter] = useState<string>("todos");
  const [viewingCierre, setViewingCierre] = useState<Cierre | null>(null);

  // Cargar cierres del localStorage al montar el componente
  useEffect(() => {
    const cargarCierres = () => {
      const historial = localStorage.getItem('historialCierres');
      if (historial) {
        const cierresGuardados = JSON.parse(historial);
        setCierres(cierresGuardados);
        setFilteredCierres(cierresGuardados);
      }
    };
    
    cargarCierres();
    
    // Actualizar cada 2 segundos para reflejar cambios
    const interval = setInterval(cargarCierres, 2000);
    
    return () => clearInterval(interval);
  }, []);

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
    let filtered = cierres;

    if (search.trim() !== "") {
      filtered = filtered.filter(
        (item) =>
          item.responsable.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (estado !== "todos") {
      filtered = filtered.filter((item) => {
        if (estado === "cuadrado") return item.diferenciaTotal === 0;
        if (estado === "sobrante") return item.diferenciaTotal > 0;
        if (estado === "faltante") return item.diferenciaTotal < 0;
        return true;
      });
    }

    if (fecha !== "todos") {
      const hoy = new Date();
      const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      
      filtered = filtered.filter((item) => {
        const fechaCierre = new Date(item.fecha);
        
        switch (fecha) {
          case "hoy":
            return fechaCierre >= inicioHoy;
          case "semana":
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - 7);
            return fechaCierre >= inicioSemana;
          case "mes":
            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            return fechaCierre >= inicioMes;
          default:
            return true;
        }
      });
    }

    setFilteredCierres(filtered);
  };

  const getDiferenciaBadge = (diferencia: number) => {
    if (diferencia === 0) {
      return <Badge variant="default" className="bg-green-600">✓ Cuadrado</Badge>;
    } else if (diferencia > 0) {
      return <Badge variant="outline" className="border-primary text-primary">Sobrante</Badge>;
    } else {
      return <Badge variant="destructive">Faltante</Badge>;
    }
  };

  const totalCierres = cierres.length;
  const cierresCuadrados = cierres.filter(c => c.diferenciaTotal === 0).length;
  const cierresSobrante = cierres.filter(c => c.diferenciaTotal > 0).length;
  const cierresFaltante = cierres.filter(c => c.diferenciaTotal < 0).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-primary">Historial de Cierres de Caja</h1>
        <p className="text-muted-foreground">
          Consulta de cierres de caja realizados
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl">{totalCierres}</div>
            <p className="text-sm text-muted-foreground">Total Cierres</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-green-600">{cierresCuadrados}</div>
            <p className="text-sm text-muted-foreground">Cuadrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-primary">{cierresSobrante}</div>
            <p className="text-sm text-muted-foreground">Con Sobrante</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-red-600">{cierresFaltante}</div>
            <p className="text-sm text-muted-foreground">Con Faltante</p>
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
                placeholder="Buscar por responsable..."
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
                <SelectItem value="cuadrado">Solo Cuadrados</SelectItem>
                <SelectItem value="sobrante">Solo Sobrantes</SelectItem>
                <SelectItem value="faltante">Solo Faltantes</SelectItem>
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
          <CardTitle>Cierres Registrados: {filteredCierres.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Fondo Inicial</TableHead>
                  <TableHead>Total Ingresos</TableHead>
                  <TableHead>Total Egresos</TableHead>
                  <TableHead>Esperado</TableHead>
                  <TableHead>Contado</TableHead>
                  <TableHead>Diferencia</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCierres.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No se encontraron cierres de caja
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCierres.map((cierre) => (
                    <TableRow key={cierre.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{new Date(cierre.fecha).toLocaleDateString('es-PE')}</div>
                            <div className="text-xs text-muted-foreground">{cierre.hora}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {cierre.responsable}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Coins className="h-3 w-3 text-muted-foreground" />
                          S/ {cierre.fondoInicial.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          S/ {cierre.totalIngresos.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-red-600">
                          <TrendingDown className="h-3 w-3" />
                          S/ {cierre.totalEgresos.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>S/ {cierre.totalEsperado.toFixed(2)}</TableCell>
                      <TableCell>S/ {cierre.totalContado.toFixed(2)}</TableCell>
                      <TableCell>{getDiferenciaBadge(cierre.diferenciaTotal)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingCierre(cierre)}
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

      {/* Dialog de Vista Detallada */}
      <Dialog open={!!viewingCierre} onOpenChange={() => setViewingCierre(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Cierre de Caja</DialogTitle>
            <DialogDescription>
              Información completa del cierre de caja
            </DialogDescription>
          </DialogHeader>

          {viewingCierre && (
            <div className="space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                  <p className="font-medium">
                    {new Date(viewingCierre.fecha).toLocaleDateString('es-PE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} - {viewingCierre.hora}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Responsable</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{viewingCierre.responsable}</p>
                  </div>
                </div>
              </div>

              {/* Resumen Financiero */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resumen Financiero</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Fondo Inicial</p>
                      <p className="text-xl">S/ {viewingCierre.fondoInicial.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Ingresos</p>
                      <p className="text-xl text-green-600">+ S/ {viewingCierre.totalIngresos.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Egresos</p>
                      <p className="text-xl text-red-600">- S/ {viewingCierre.totalEgresos.toFixed(2)}</p>
                    </div>
                    {viewingCierre.totalCompras !== undefined && viewingCierre.totalCompras > 0 && (
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Compras del Día</p>
                        <p className="text-xl text-orange-600">- S/ {viewingCierre.totalCompras.toFixed(2)}</p>
                      </div>
                    )}
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Esperado</p>
                      <p className="text-xl text-primary">S/ {viewingCierre.totalEsperado.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Desglose de Ingresos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Desglose de Ingresos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-2xl mb-1">💵</p>
                      <p className="text-sm text-muted-foreground">Efectivo</p>
                      <p className="font-medium">S/ {viewingCierre.desglose.ingresos.efectivo.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-2xl mb-1">📱</p>
                      <p className="text-sm text-muted-foreground">Yape</p>
                      <p className="font-medium">S/ {viewingCierre.desglose.ingresos.yape.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-2xl mb-1">📲</p>
                      <p className="text-sm text-muted-foreground">Plin</p>
                      <p className="font-medium">S/ {viewingCierre.desglose.ingresos.plin.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Arqueo por Método de Pago */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Arqueo Detallado por Método de Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Efectivo */}
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <p className="font-medium mb-3 flex items-center gap-2">
                      <span className="text-lg">💵</span>
                      EFECTIVO
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Esperado</p>
                        <p className="font-medium">S/ {viewingCierre.arqueo.efectivo.esperado.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Contado</p>
                        <p className="font-medium">S/ {viewingCierre.arqueo.efectivo.contado.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Diferencia</p>
                        <p className={`font-medium ${
                          viewingCierre.arqueo.efectivo.diferencia === 0 ? 'text-green-600' :
                          viewingCierre.arqueo.efectivo.diferencia > 0 ? 'text-primary' :
                          'text-red-600'
                        }`}>
                          {viewingCierre.arqueo.efectivo.diferencia === 0 ? '✓ Cuadra' :
                           `${viewingCierre.arqueo.efectivo.diferencia > 0 ? '+' : ''}S/ ${viewingCierre.arqueo.efectivo.diferencia.toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Yape */}
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <p className="font-medium mb-3 flex items-center gap-2">
                      <span className="text-lg">📱</span>
                      YAPE
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Esperado</p>
                        <p className="font-medium">S/ {viewingCierre.arqueo.yape.esperado.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Contado</p>
                        <p className="font-medium">S/ {viewingCierre.arqueo.yape.contado.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Diferencia</p>
                        <p className={`font-medium ${
                          viewingCierre.arqueo.yape.diferencia === 0 ? 'text-green-600' :
                          viewingCierre.arqueo.yape.diferencia > 0 ? 'text-primary' :
                          'text-red-600'
                        }`}>
                          {viewingCierre.arqueo.yape.diferencia === 0 ? '✓ Cuadra' :
                           `${viewingCierre.arqueo.yape.diferencia > 0 ? '+' : ''}S/ ${viewingCierre.arqueo.yape.diferencia.toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Plin */}
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <p className="font-medium mb-3 flex items-center gap-2">
                      <span className="text-lg">📲</span>
                      PLIN
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Esperado</p>
                        <p className="font-medium">S/ {viewingCierre.arqueo.plin.esperado.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Contado</p>
                        <p className="font-medium">S/ {viewingCierre.arqueo.plin.contado.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Diferencia</p>
                        <p className={`font-medium ${
                          viewingCierre.arqueo.plin.diferencia === 0 ? 'text-green-600' :
                          viewingCierre.arqueo.plin.diferencia > 0 ? 'text-primary' :
                          'text-red-600'
                        }`}>
                          {viewingCierre.arqueo.plin.diferencia === 0 ? '✓ Cuadra' :
                           `${viewingCierre.arqueo.plin.diferencia > 0 ? '+' : ''}S/ ${viewingCierre.arqueo.plin.diferencia.toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Totales Finales */}
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="text-base text-primary">Totales Finales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">Total Esperado</p>
                      <p className="text-2xl font-medium">S/ {viewingCierre.totalEsperado.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">Total Contado</p>
                      <p className="text-2xl font-medium">S/ {viewingCierre.totalContado.toFixed(2)}</p>
                    </div>
                    <div className={`p-4 rounded-lg text-center border-2 ${
                      viewingCierre.diferenciaTotal === 0 ? 'bg-green-50 border-green-600' :
                      viewingCierre.diferenciaTotal > 0 ? 'bg-primary/10 border-primary' :
                      'bg-red-50 border-red-600'
                    }`}>
                      <p className="text-sm text-muted-foreground mb-2">Diferencia Total</p>
                      <p className={`text-2xl font-medium ${
                        viewingCierre.diferenciaTotal === 0 ? 'text-green-600' :
                        viewingCierre.diferenciaTotal > 0 ? 'text-primary' :
                        'text-red-600'
                      }`}>
                        {viewingCierre.diferenciaTotal === 0 ? '✓ Cuadrado' :
                         `${viewingCierre.diferenciaTotal > 0 ? '+' : ''}S/ ${viewingCierre.diferenciaTotal.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ganancia Neta */}
              <Card className={`border-2 ${viewingCierre.ganancia >= 0 ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'}`}>
                <CardHeader>
                  <CardTitle className="text-base">💰 Ganancia Neta del Día</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className={`text-4xl font-medium ${viewingCierre.ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      S/ {viewingCierre.ganancia.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Calculado: Total Contado - Fondo Inicial - Compras - Egresos
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Observaciones */}
              {viewingCierre.observaciones && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Observaciones</p>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">{viewingCierre.observaciones}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setViewingCierre(null)}>
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