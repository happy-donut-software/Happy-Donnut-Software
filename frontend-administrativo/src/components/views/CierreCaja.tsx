import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Wallet, AlertCircle, TrendingUp, TrendingDown, Lock, CheckCircle2, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { 
  getMovimientosDelDia, 
  limpiarMovimientosDelDia,
  getCajaAbierta,
  getCompras,
  type MovimientoCaja,
  type Compra 
} from "../../lib/storage";

export function CierreCaja() {
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [dineroContadoEfectivo, setDineroContadoEfectivo] = useState("");
  const [dineroContadoYape, setDineroContadoYape] = useState("");
  const [dineroContadoPlin, setDineroContadoPlin] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [cierreFinalizado, setCierreFinalizado] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cajaAbierta = getCajaAbierta();
  const datosApertura = cajaAbierta;

  const fechaActual = new Date().toISOString().split('T')[0];
  const horaActual = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

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

  // Cálculos de ingresos por método de pago (excluyendo el fondo inicial de apertura)
  const totalIngresosEfectivo = movimientos
    .filter(m => m.tipo === "Ingreso" && m.metodoPago === "efectivo" && m.concepto !== "Apertura de Caja - Fondo Inicial")
    .reduce((sum, m) => sum + m.monto, 0);

  const totalIngresosYape = movimientos
    .filter(m => m.tipo === "Ingreso" && m.metodoPago === "yape")
    .reduce((sum, m) => sum + m.monto, 0);

  const totalIngresosPlin = movimientos
    .filter(m => m.tipo === "Ingreso" && m.metodoPago === "plin")
    .reduce((sum, m) => sum + m.monto, 0);

  const totalIngresos = totalIngresosEfectivo + totalIngresosYape + totalIngresosPlin;

  // Cálculos de egresos por método de pago
  const totalEgresosEfectivo = movimientos
    .filter(m => m.tipo === "Egreso" && m.metodoPago === "efectivo")
    .reduce((sum, m) => sum + m.monto, 0);

  const totalEgresosYape = movimientos
    .filter(m => m.tipo === "Egreso" && m.metodoPago === "yape")
    .reduce((sum, m) => sum + m.monto, 0);

  const totalEgresosPlin = movimientos
    .filter(m => m.tipo === "Egreso" && m.metodoPago === "plin")
    .reduce((sum, m) => sum + m.monto, 0);

  const totalEgresos = totalEgresosEfectivo + totalEgresosYape + totalEgresosPlin;
  
  // Obtener compras del día
  const comprasDelDia = getCompras().filter(c => c.fechaCompra === fechaActual);
  const totalCompras = comprasDelDia.reduce((sum, c) => sum + c.total, 0);
  
  const fondoInicial = datosApertura?.fondoInicial || 0;
  const fondoInicialYape = datosApertura?.fondoInicialYape || 0;
  const fondoInicialPlin = datosApertura?.fondoInicialPlin || 0;
  
  // ARQUEO POR CADA MÉTODO DE PAGO
  
  // 1. EFECTIVO
  const efectivoEsperado = fondoInicial + totalIngresosEfectivo - totalEgresosEfectivo;
  const efectivoContado = dineroContadoEfectivo ? parseFloat(dineroContadoEfectivo) : 0;
  const diferenciaEfectivo = efectivoContado - efectivoEsperado;
  
  // 2. YAPE
  const yapeEsperado = fondoInicialYape + totalIngresosYape - totalEgresosYape;
  const yapeContado = dineroContadoYape ? parseFloat(dineroContadoYape) : 0;
  const diferenciaYape = yapeContado - yapeEsperado;
  
  // 3. PLIN
  const plinEsperado = fondoInicialPlin + totalIngresosPlin - totalEgresosPlin;
  const plinContado = dineroContadoPlin ? parseFloat(dineroContadoPlin) : 0;
  const diferenciaPlin = plinContado - plinEsperado;
  
  // TOTALES
  const totalEsperado = efectivoEsperado + yapeEsperado + plinEsperado;
  const totalContado = efectivoContado + yapeContado + plinContado;
  const diferenciaTotal = totalContado - totalEsperado;
  
  // GANANCIA NETA = Total Contado - Todos los Fondos Iniciales - Compras - Total Egresos
  const ganancia = totalContado - (fondoInicial + fondoInicialYape + fondoInicialPlin) - totalCompras - totalEgresos;
  
  // Validaciones por método de pago
  const haySobranteEfectivo = diferenciaEfectivo > 0;
  const hayFaltanteEfectivo = diferenciaEfectivo < 0;
  const cuadraEfectivo = diferenciaEfectivo === 0 && dineroContadoEfectivo !== "";
  
  const haySobranteYape = diferenciaYape > 0;
  const hayFaltanteYape = diferenciaYape < 0;
  const cuadraYape = diferenciaYape === 0 && dineroContadoYape !== "";
  
  const haySobrantePlin = diferenciaPlin > 0;
  const hayFaltantePlin = diferenciaPlin < 0;
  const cuadraPlin = diferenciaPlin === 0 && dineroContadoPlin !== "";
  
  const hayDiferencia = diferenciaTotal !== 0;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!dineroContadoEfectivo || parseFloat(dineroContadoEfectivo) < 0) {
      newErrors.efectivo = "Debe ingresar el dinero contado en efectivo";
    }
    
    if (!dineroContadoYape || parseFloat(dineroContadoYape) < 0) {
      newErrors.yape = "Debe ingresar el dinero contado en Yape";
    }
    
    if (!dineroContadoPlin || parseFloat(dineroContadoPlin) < 0) {
      newErrors.plin = "Debe ingresar el dinero contado en Plin";
    }

    if (hayDiferencia && !observaciones.trim()) {
      newErrors.observaciones = "Debe explicar el motivo de las diferencias";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCerrarCaja = () => {
    if (!validateForm()) {
      toast.error("Por favor, corrija los errores del formulario");
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmarCierre = () => {
    const cierre = {
      id: Date.now(),
      fecha: fechaActual,
      hora: new Date().toLocaleTimeString('es-PE'),
      responsable: datosApertura?.responsable,
      fondoInicial,
      totalIngresos,
      totalEgresos,
      totalCompras,
      totalEsperado,
      totalContado,
      diferenciaTotal,
      ganancia,
      observaciones: observaciones || undefined,
      arqueo: {
        efectivo: {
          esperado: efectivoEsperado,
          contado: efectivoContado,
          diferencia: diferenciaEfectivo,
        },
        yape: {
          esperado: yapeEsperado,
          contado: yapeContado,
          diferencia: diferenciaYape,
        },
        plin: {
          esperado: plinEsperado,
          contado: plinContado,
          diferencia: diferenciaPlin,
        }
      },
      desglose: {
        ingresos: {
          efectivo: totalIngresosEfectivo,
          yape: totalIngresosYape,
          plin: totalIngresosPlin,
        },
        egresos: {
          efectivo: totalEgresosEfectivo,
          yape: totalEgresosYape,
          plin: totalEgresosPlin,
        }
      },
      movimientos: movimientos
    };

    // Guardar cierre en historial
    const cierresAnteriores = JSON.parse(localStorage.getItem('historialCierres') || '[]');
    cierresAnteriores.unshift(cierre);
    localStorage.setItem('historialCierres', JSON.stringify(cierresAnteriores));
    
    // Limpiar movimientos del día
    limpiarMovimientosDelDia();
    
    // Cerrar caja
    localStorage.removeItem('cajaAbierta');
    
    setShowConfirmDialog(false);
    setCierreFinalizado(true);
    toast.success("Cierre de caja realizado exitosamente");
  };

  if (!cajaAbierta) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-primary">Cierre de Caja</h1>
          <p className="text-muted-foreground">
            Realizar el arqueo y cierre de caja del día
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">No hay una caja abierta</p>
            <p className="text-sm mt-1">
              No existe una caja abierta para cerrar.
            </p>
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Por favor, diríjase a "Apertura de Caja" para iniciar una nueva jornada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cierreFinalizado) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-primary">Cierre de Caja</h1>
          <p className="text-muted-foreground">
            Realizar el arqueo y cierre de caja del día
          </p>
        </div>

        <Alert className="bg-primary/10 border-primary">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium text-primary">✅ Cierre de caja completado exitosamente</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Responsable:</p>
                  <p className="font-medium">{datosApertura.responsable}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Esperado:</p>
                  <p className="font-medium">S/ {totalEsperado.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Contado:</p>
                  <p className="font-medium">S/ {totalContado.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ganancia Neta:</p>
                  <p className={`font-medium ${ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    S/ {ganancia.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground">
                La caja ha sido cerrada. Puede consultar el detalle en "Historial de Cierres".
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Button onClick={() => window.location.reload()}>
                  Ir a Historial de Cierres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary">Cierre de Caja</h1>
          <p className="text-muted-foreground">
            Realizar el arqueo y cierre de caja del día
          </p>
        </div>
        <Button onClick={handleCerrarCaja} size="lg">
          <Lock className="mr-2 h-4 w-4" />
          Cerrar Caja
        </Button>
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
                <p className="font-medium">{datosApertura.responsable}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Fecha de Cierre</p>
              <p className="font-medium">
                {new Date(fechaActual).toLocaleDateString('es-PE')} - {horaActual}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resumen del Día */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Arqueo de Caja por Método de Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ARQUEO 1: EFECTIVO */}
              <div className={`border-2 rounded-lg p-4 ${
                cuadraEfectivo ? 'border-green-200 bg-green-50' : 
                haySobranteEfectivo ? 'border-yellow-200 bg-yellow-50' : 
                hayFaltanteEfectivo ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span className="text-lg">💵</span>
                  EFECTIVO
                </p>
                <div className="space-y-2 ml-6">
                  <div className="flex justify-between text-sm">
                    <span>Fondo Inicial</span>
                    <span className="font-medium">S/ {fondoInicial.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ingresos en Efectivo</span>
                    <span className="text-green-600">+ S/ {totalIngresosEfectivo.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Egresos en Efectivo</span>
                    <span className="text-red-600">- S/ {totalEgresosEfectivo.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-medium">Esperado</span>
                    <span className="font-bold">S/ {efectivoEsperado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Contado</span>
                    <span className={efectivoContado > 0 ? "font-medium" : "text-muted-foreground"}>
                      {efectivoContado > 0 ? `S/ ${efectivoContado.toFixed(2)}` : "Pendiente..."}
                    </span>
                  </div>
                  {dineroContadoEfectivo && (
                    <div className={`border-t-2 pt-2 flex justify-between ${
                      cuadraEfectivo ? 'border-green-400' : 
                      haySobranteEfectivo ? 'border-yellow-400' : 'border-red-400'
                    }`}>
                      <span className="font-medium">Diferencia</span>
                      <span className={`font-bold ${
                        cuadraEfectivo ? 'text-green-600' : 
                        haySobranteEfectivo ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {cuadraEfectivo ? '✓ Cuadra' : `${diferenciaEfectivo > 0 ? '+' : ''}S/ ${diferenciaEfectivo.toFixed(2)}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ARQUEO 2: YAPE */}
              <div className={`border-2 rounded-lg p-4 ${
                cuadraYape ? 'border-green-200 bg-green-50' : 
                haySobranteYape ? 'border-yellow-200 bg-yellow-50' : 
                hayFaltanteYape ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span className="text-lg">📱</span>
                  YAPE
                </p>
                <div className="space-y-2 ml-6">
                  <div className="flex justify-between text-sm">
                    <span>Ingresos en Yape</span>
                    <span className="text-green-600">+ S/ {totalIngresosYape.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Egresos en Yape</span>
                    <span className="text-red-600">- S/ {totalEgresosYape.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-medium">Esperado</span>
                    <span className="font-bold">S/ {yapeEsperado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Contado</span>
                    <span className={yapeContado > 0 ? "font-medium" : "text-muted-foreground"}>
                      {yapeContado > 0 ? `S/ ${yapeContado.toFixed(2)}` : "Pendiente..."}
                    </span>
                  </div>
                  {dineroContadoYape && (
                    <div className={`border-t-2 pt-2 flex justify-between ${
                      cuadraYape ? 'border-green-400' : 
                      haySobranteYape ? 'border-yellow-400' : 'border-red-400'
                    }`}>
                      <span className="font-medium">Diferencia</span>
                      <span className={`font-bold ${
                        cuadraYape ? 'text-green-600' : 
                        haySobranteYape ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {cuadraYape ? '✓ Cuadra' : `${diferenciaYape > 0 ? '+' : ''}S/ ${diferenciaYape.toFixed(2)}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ARQUEO 3: PLIN */}
              <div className={`border-2 rounded-lg p-4 ${
                cuadraPlin ? 'border-green-200 bg-green-50' : 
                haySobrantePlin ? 'border-yellow-200 bg-yellow-50' : 
                hayFaltantePlin ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span className="text-lg">📲</span>
                  PLIN
                </p>
                <div className="space-y-2 ml-6">
                  <div className="flex justify-between text-sm">
                    <span>Ingresos en Plin</span>
                    <span className="text-green-600">+ S/ {totalIngresosPlin.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Egresos en Plin</span>
                    <span className="text-red-600">- S/ {totalEgresosPlin.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-medium">Esperado</span>
                    <span className="font-bold">S/ {plinEsperado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Contado</span>
                    <span className={plinContado > 0 ? "font-medium" : "text-muted-foreground"}>
                      {plinContado > 0 ? `S/ ${plinContado.toFixed(2)}` : "Pendiente..."}
                    </span>
                  </div>
                  {dineroContadoPlin && (
                    <div className={`border-t-2 pt-2 flex justify-between ${
                      cuadraPlin ? 'border-green-400' : 
                      haySobrantePlin ? 'border-yellow-400' : 'border-red-400'
                    }`}>
                      <span className="font-medium">Diferencia</span>
                      <span className={`font-bold ${
                        cuadraPlin ? 'text-green-600' : 
                        haySobrantePlin ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {cuadraPlin ? '✓ Cuadra' : `${diferenciaPlin > 0 ? '+' : ''}S/ ${diferenciaPlin.toFixed(2)}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* CÁLCULO FINAL: GANANCIA NETA */}
              <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
                <p className="text-sm font-medium text-primary mb-3">💰 GANANCIA NETA DEL DÍA</p>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between text-sm">
                    <span>Total Contado (Todos los métodos)</span>
                    <span className="font-medium">{totalContado > 0 ? `S/ ${totalContado.toFixed(2)}` : "Pendiente..."}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>(-) Fondo Inicial</span>
                    <span className="text-red-600">- S/ {fondoInicial.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>(-) Compras del Día</span>
                    <span className="text-red-600">- S/ {totalCompras.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>(-) Total Egresos</span>
                    <span className="text-red-600">- S/ {totalEgresos.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-primary pt-2 flex justify-between">
                    <span className="font-bold text-primary">GANANCIA NETA</span>
                    <span className={`text-xl font-bold ${ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalContado > 0 ? `S/ ${ganancia.toFixed(2)}` : "Pendiente..."}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Movimientos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ScrollText className="h-5 w-5" />
                  Movimientos del Día ({movimientos.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {movimientos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ScrollText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay movimientos registrados en el día</p>
                </div>
              ) : (
                <div className="border rounded-lg max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hora</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movimientos.map((mov) => (
                        <TableRow key={mov.id}>
                          <TableCell className="text-sm">{mov.hora}</TableCell>
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
                          <TableCell className="max-w-xs truncate">
                            {mov.concepto}
                            {mov.referencia && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({mov.referencia})
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {mov.metodoPago === "efectivo" && "💵"}
                              {mov.metodoPago === "yape" && "📱"}
                              {mov.metodoPago === "plin" && "📲"}
                              {" "}
                              {mov.metodoPago.charAt(0).toUpperCase() + mov.metodoPago.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={mov.tipo === "Ingreso" ? "text-green-600" : "text-red-600"}>
                              {mov.tipo === "Ingreso" ? "+" : "-"} S/ {mov.monto.toFixed(2)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Arqueo de Caja */}
          <Card>
            <CardHeader>
              <CardTitle>💰 Ingresar Arqueo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Efectivo */}
              <div className="space-y-2">
                <Label htmlFor="efectivo" className="flex items-center gap-2">
                  <span>💵</span>
                  Efectivo Contado *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm text-muted-foreground">S/</span>
                  <Input
                    id="efectivo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dineroContadoEfectivo}
                    onChange={(e) => {
                      setDineroContadoEfectivo(e.target.value);
                      if (errors.efectivo) setErrors({ ...errors, efectivo: "" });
                    }}
                    placeholder="0.00"
                    className={`pl-10 ${errors.efectivo ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.efectivo && (
                  <p className="text-sm text-destructive">{errors.efectivo}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Esperado: S/ {efectivoEsperado.toFixed(2)}
                </p>
              </div>

              {/* Yape */}
              <div className="space-y-2">
                <Label htmlFor="yape" className="flex items-center gap-2">
                  <span>📱</span>
                  Yape Contado *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm text-muted-foreground">S/</span>
                  <Input
                    id="yape"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dineroContadoYape}
                    onChange={(e) => {
                      setDineroContadoYape(e.target.value);
                      if (errors.yape) setErrors({ ...errors, yape: "" });
                    }}
                    placeholder="0.00"
                    className={`pl-10 ${errors.yape ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.yape && (
                  <p className="text-sm text-destructive">{errors.yape}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Esperado: S/ {yapeEsperado.toFixed(2)}
                </p>
              </div>

              {/* Plin */}
              <div className="space-y-2">
                <Label htmlFor="plin" className="flex items-center gap-2">
                  <span>📲</span>
                  Plin Contado *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm text-muted-foreground">S/</span>
                  <Input
                    id="plin"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dineroContadoPlin}
                    onChange={(e) => {
                      setDineroContadoPlin(e.target.value);
                      if (errors.plin) setErrors({ ...errors, plin: "" });
                    }}
                    placeholder="0.00"
                    className={`pl-10 ${errors.plin ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.plin && (
                  <p className="text-sm text-destructive">{errors.plin}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Esperado: S/ {plinEsperado.toFixed(2)}
                </p>
              </div>

              {/* Resultado Total */}
              {totalContado > 0 && (
                <div className={`p-4 border-2 rounded-lg ${
                  diferenciaTotal === 0 ? 'bg-green-50 border-green-600' :
                  diferenciaTotal > 0 ? 'bg-yellow-50 border-yellow-600' :
                  'bg-red-50 border-red-600'
                }`}>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Total Contado:</span>
                      <span className="font-bold">S/ {totalContado.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Esperado:</span>
                      <span className="font-bold">S/ {totalEsperado.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex items-center justify-between">
                      <span className="font-medium">Diferencia Total:</span>
                      <span className={`text-lg font-bold ${
                        diferenciaTotal === 0 ? 'text-green-600' :
                        diferenciaTotal > 0 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {diferenciaTotal === 0 ? '✓ Cuadra' : `${diferenciaTotal > 0 ? '+' : ''}S/ ${diferenciaTotal.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {diferenciaTotal === 0 && '¡Perfecto! Todo cuadra correctamente.'}
                    {diferenciaTotal > 0 && 'Hay sobrante. Explique el motivo en observaciones.'}
                    {diferenciaTotal < 0 && 'Hay faltante. Explique el motivo en observaciones.'}
                  </p>
                </div>
              )}

              {/* Observaciones */}
              <div className="space-y-2">
                <Label htmlFor="observaciones">
                  Observaciones {hayDiferencia && '*'}
                </Label>
                <Textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => {
                    setObservaciones(e.target.value);
                    if (errors.observaciones) setErrors({ ...errors, observaciones: "" });
                  }}
                  placeholder={
                    hayDiferencia
                      ? "Explique el motivo de las diferencias..."
                      : "Notas adicionales sobre el cierre..."
                  }
                  rows={3}
                  className={errors.observaciones ? 'border-destructive' : ''}
                />
                {errors.observaciones && (
                  <p className="text-sm text-destructive">{errors.observaciones}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Estado del Cierre */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📊 Estado del Cierre</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Esperado</p>
                <p className="text-lg">S/ {totalEsperado.toFixed(2)}</p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Contado</p>
                <p className="text-lg">
                  {totalContado > 0 ? `S/ ${totalContado.toFixed(2)}` : "Pendiente..."}
                </p>
              </div>

              <div className={`p-3 border-2 rounded-lg ${
                totalContado === 0 ? 'bg-muted' :
                diferenciaTotal === 0 ? 'bg-green-50 border-green-600' :
                diferenciaTotal > 0 ? 'bg-yellow-50 border-yellow-600' :
                'bg-red-50 border-red-600'
              }`}>
                <p className="text-xs text-muted-foreground mb-1">Estado</p>
                <p className={`font-medium ${
                  totalContado === 0 ? '' :
                  diferenciaTotal === 0 ? 'text-green-600' :
                  diferenciaTotal > 0 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {totalContado === 0 && 'Pendiente de arqueo'}
                  {totalContado > 0 && diferenciaTotal === 0 && '✓ Todo cuadra'}
                  {totalContado > 0 && diferenciaTotal > 0 && `Sobrante: S/ ${diferenciaTotal.toFixed(2)}`}
                  {totalContado > 0 && diferenciaTotal < 0 && `Faltante: S/ ${Math.abs(diferenciaTotal).toFixed(2)}`}
                </p>
              </div>

              {totalContado > 0 && (
                <div className="p-3 bg-primary/10 border-2 border-primary rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Ganancia Neta</p>
                  <p className={`text-lg font-bold ${ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    S/ {ganancia.toFixed(2)}
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
                <p className="font-medium mb-2">Arqueo de Caja:</p>
                <p className="text-xs text-muted-foreground">
                  Es el proceso de contar el dinero físico en efectivo y compararlo con el monto esperado según los registros del sistema.
                </p>
              </div>

              <div>
                <p className="font-medium mb-2">Importante:</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Cuente cuidadosamente el efectivo</li>
                  <li>• Verifique billetes y monedas</li>
                  <li>• Si hay diferencia, explique el motivo</li>
                  <li>• El cierre es irreversible</li>
                </ul>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Una vez cerrada la caja, no podrá realizar más movimientos del día
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Desglose Digital */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">💳 Ingresos Digitales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-xs text-muted-foreground mb-2">
                Estos montos NO están en efectivo
              </p>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>📱 Yape</span>
                <span>S/ {totalIngresosYape.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>📲 Plin</span>
                <span>S/ {totalIngresosPlin.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total Digital</span>
                <span>S/ {(totalIngresosYape + totalIngresosPlin).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Botón de Cierre */}
          <Button onClick={handleCerrarCaja} className="w-full" size="lg">
            <Lock className="mr-2 h-4 w-4" />
            Cerrar Caja
          </Button>
        </div>
      </div>

      {/* Diálogo de Confirmación */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar Cierre de Caja?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 mt-4">
                <p>Esta acción cerrará la caja del día y no podrá deshacerse.</p>
                
                <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Fondo Inicial:</span>
                    <span className="font-medium">S/ {fondoInicial.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Ingresos:</span>
                    <span className="font-medium text-green-600">+ S/ {totalIngresos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Egresos:</span>
                    <span className="font-medium text-red-600">- S/ {totalEgresos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compras del Día:</span>
                    <span className="font-medium text-red-600">- S/ {totalCompras.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span>Total Esperado:</span>
                    <span className="font-medium">S/ {totalEsperado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Contado:</span>
                    <span className="font-medium">S/ {totalContado.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span>Diferencia Total:</span>
                    <span className={diferenciaTotal === 0 ? 'text-green-600' : diferenciaTotal > 0 ? 'text-yellow-600' : 'text-red-600'}>
                      {diferenciaTotal === 0 ? '✓ Cuadra' : `${diferenciaTotal > 0 ? '+' : ''}S/ ${diferenciaTotal.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Ganancia Neta:</span>
                    <span className={ganancia >= 0 ? 'text-green-600' : 'text-red-600'}>
                      S/ {ganancia.toFixed(2)}
                    </span>
                  </div>
                </div>

                {observaciones && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Observaciones:</p>
                    <p className="text-sm">{observaciones}</p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarCierre} className="bg-primary">
              <Lock className="mr-2 h-4 w-4" />
              Confirmar Cierre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}