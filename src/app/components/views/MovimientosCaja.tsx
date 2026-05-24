import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Wallet, TrendingUp, TrendingDown, Coins, Calendar, AlertCircle, CreditCard, Banknote } from "lucide-react";
import { getMovimientosDelDia, getCajaAbierta, type MovimientoCaja } from "../../lib/storage";

export function MovimientosCaja() {
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroMetodo, setFiltroMetodo] = useState<string>("todos");

  const cajaAbierta = getCajaAbierta();
  const datosApertura = cajaAbierta;

  // Cargar movimientos del día
  useEffect(() => {
    const cargarMovimientos = () => {
      const movs = getMovimientosDelDia();
      setMovimientos(movs);
    };
    
    cargarMovimientos();
    
    // Actualizar cada segundo para reflejar cambios en tiempo real
    const interval = setInterval(cargarMovimientos, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Filtrar movimientos
  const movimientosFiltrados = movimientos.filter(mov => {
    if (filtroTipo !== "todos" && mov.tipo !== filtroTipo) return false;
    if (filtroMetodo !== "todos" && mov.metodoPago !== filtroMetodo) return false;
    return true;
  });

  // Calcular totales
  const totalIngresos = movimientos
    .filter(m => m.tipo === "Ingreso" && m.concepto !== "Apertura de Caja - Fondo Inicial")
    .reduce((sum, m) => sum + m.monto, 0);
  
  const totalEgresos = movimientos
    .filter(m => m.tipo === "Egreso")
    .reduce((sum, m) => sum + m.monto, 0);

  const totalEfectivo = movimientos
    .filter(m => m.metodoPago === "efectivo" && m.concepto !== "Apertura de Caja - Fondo Inicial")
    .reduce((sum, m) => m.tipo === "Ingreso" ? sum + m.monto : sum - m.monto, 0);

  const totalYape = movimientos
    .filter(m => m.metodoPago === "yape" && m.tipo === "Ingreso")
    .reduce((sum, m) => sum + m.monto, 0);

  const totalPlin = movimientos
    .filter(m => m.metodoPago === "plin" && m.tipo === "Ingreso")
    .reduce((sum, m) => sum + m.monto, 0);

  const fondoInicial = datosApertura?.fondoInicial || 0;
  const saldoFinal = fondoInicial + totalIngresos - totalEgresos;

  if (!cajaAbierta) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-primary">Movimientos del Día</h1>
          <p className="text-muted-foreground">
            Visualización de todos los ingresos y egresos del día
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">No hay una caja abierta</p>
            <p className="text-sm mt-1">
              Debe realizar la apertura de caja antes de ver los movimientos del día.
            </p>
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Por favor, diríjase a "Apertura de Caja" para iniciar la jornada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-primary">Movimientos del Día</h1>
        <p className="text-muted-foreground">
          Visualización de todos los ingresos y egresos del día
        </p>
      </div>

      {/* Información de Apertura */}
      <Card className="bg-primary/5 border-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Caja abierta por</p>
                <p className="font-medium">{datosApertura.usuario}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Fondo Inicial</p>
              <p className="text-xl text-primary">S/ {fondoInicial.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm text-muted-foreground">Ingresos</p>
            </div>
            <div className="text-2xl text-green-600">S/ {totalIngresos.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {movimientos.filter(m => m.tipo === "Ingreso" && m.concepto !== "Apertura de Caja - Fondo Inicial").length} movimientos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <p className="text-sm text-muted-foreground">Egresos</p>
            </div>
            <div className="text-2xl text-red-600">S/ {totalEgresos.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {movimientos.filter(m => m.tipo === "Egreso").length} movimientos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Banknote className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Efectivo</p>
            </div>
            <div className="text-2xl">S/ {(fondoInicial + totalEfectivo).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              En caja
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Digital</p>
            </div>
            <div className="text-2xl">S/ {(totalYape + totalPlin).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Yape, Plin
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">Saldo Total</p>
            </div>
            <div className="text-2xl text-primary">S/ {saldoFinal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Fondo + Movimientos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Desglose por Método de Pago */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">💵 Efectivo</p>
            <p className="text-xl">S/ {(fondoInicial + totalEfectivo).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">📱 Yape</p>
            <p className="text-xl">S/ {totalYape.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">📲 Plin</p>
            <p className="text-xl">S/ {totalPlin.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los movimientos</SelectItem>
                <SelectItem value="Ingreso">Solo Ingresos</SelectItem>
                <SelectItem value="Egreso">Solo Egresos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroMetodo} onValueChange={setFiltroMetodo}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los métodos</SelectItem>
                <SelectItem value="efectivo">Solo Efectivo</SelectItem>
                <SelectItem value="yape">Solo Yape</SelectItem>
                <SelectItem value="plin">Solo Plin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Movimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Movimientos ({movimientosFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay movimientos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  movimientosFiltrados.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {mov.hora}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={mov.tipo === "Ingreso" ? "default" : "destructive"}>
                          {mov.tipo === "Ingreso" ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {mov.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{mov.concepto}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {mov.metodoPago !== "N/A" ? (
                          <Badge variant="outline">
                            {mov.metodoPago === "efectivo" && "💵"}
                            {mov.metodoPago === "yape" && "📱"}
                            {mov.metodoPago === "plin" && "📲"}
                            {" "}{mov.metodoPago.charAt(0).toUpperCase() + mov.metodoPago.slice(1)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {mov.referencia ? (
                          <span className="text-sm text-muted-foreground">{mov.referencia}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={mov.tipo === "Ingreso" ? "text-green-600" : "text-red-600"}>
                          {mov.tipo === "Ingreso" ? "+" : "-"} S/ {mov.monto.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}