import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Wallet, Calendar, User, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { 
  getCajaAbierta, 
  setCajaAbierta, 
  cerrarCaja,
  addMovimientoCaja,
  getNextId,
  getMovimientosCaja,
  type CajaAbierta as CajaAbiertaType,
  type MovimientoCaja
} from "../../lib/storage";

export function AperturaCaja() {
  const [fondoInicial, setFondoInicial] = useState("");
  const [fondoInicialYape, setFondoInicialYape] = useState("");
  const [fondoInicialPlin, setFondoInicialPlin] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [cajaAbierta, setCajaAbiertaState] = useState<CajaAbiertaType | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fechaActual = new Date().toISOString().split('T')[0];
  const horaActual = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  // Cargar caja abierta al montar el componente
  useEffect(() => {
    const caja = getCajaAbierta();
    setCajaAbiertaState(caja);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fondoInicial || parseFloat(fondoInicial) < 0) {
      newErrors.fondoInicial = "El fondo inicial debe ser mayor o igual a 0";
    }

    if (fondoInicialYape && parseFloat(fondoInicialYape) < 0) {
      newErrors.fondoInicialYape = "El fondo inicial de Yape debe ser mayor o igual a 0";
    }

    if (fondoInicialPlin && parseFloat(fondoInicialPlin) < 0) {
      newErrors.fondoInicialPlin = "El fondo inicial de Plin debe ser mayor o igual a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAbrirCaja = () => {
    if (!validateForm()) {
      toast.error("Por favor, corrija los errores del formulario");
      return;
    }

    const currentUser = localStorage.getItem('currentUser') || 'Usuario';
    const now = new Date();
    const hora = now.toTimeString().split(' ')[0].substring(0, 5);

    const apertura: CajaAbiertaType = {
      fecha: fechaActual,
      hora: hora,
      fondoInicial: parseFloat(fondoInicial) || 0,
      fondoInicialYape: parseFloat(fondoInicialYape) || 0,
      fondoInicialPlin: parseFloat(fondoInicialPlin) || 0,
      usuario: currentUser,
    };

    // Guardar apertura
    setCajaAbierta(apertura);
    
    setCajaAbiertaState(apertura);
    
    const totalFondo = apertura.fondoInicial + apertura.fondoInicialYape + apertura.fondoInicialPlin;
    toast.success(`Caja abierta exitosamente con S/ ${totalFondo.toFixed(2)}`);
  };

  const handleNuevaApertura = () => {
    cerrarCaja();
    setCajaAbiertaState(null);
    setFondoInicial("");
    setObservaciones("");
    setErrors({});
    toast.info("Caja cerrada. Puede realizar una nueva apertura");
  };

  if (cajaAbierta) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-primary">Apertura de Caja</h1>
          <p className="text-muted-foreground">
            Iniciar el día con el fondo inicial de caja
          </p>
        </div>

        <Alert className="bg-primary/10 border-primary">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium text-primary">✅ Caja abierta exitosamente</p>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Responsable:</p>
                  <p className="font-medium">{cajaAbierta.usuario}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fondo Inicial Efectivo:</p>
                  <p className="font-medium text-primary">S/ {(cajaAbierta.fondoInicial || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fondo Inicial Yape:</p>
                  <p className="font-medium text-primary">S/ {(cajaAbierta.fondoInicialYape || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fondo Inicial Plin:</p>
                  <p className="font-medium text-primary">S/ {(cajaAbierta.fondoInicialPlin || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha:</p>
                  <p className="font-medium">{new Date(cajaAbierta.fecha).toLocaleDateString('es-PE')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Hora:</p>
                  <p className="font-medium">{cajaAbierta.hora}</p>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                La caja ya está abierta para el día de hoy. Puede realizar ventas y registrar movimientos.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleNuevaApertura}>
                  Cerrar y Abrir Nueva Caja
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted">
          <CardHeader>
            <CardTitle className="text-base">💡 Próximos Pasos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✅ <strong>Paso 1:</strong> Caja abierta - Completado</p>
            <p>📝 <strong>Paso 2:</strong> Realizar ventas en "Nuevo Comprobante"</p>
            <p>💰 <strong>Paso 3:</strong> Registrar egresos del día si es necesario</p>
            <p>📊 <strong>Paso 4:</strong> Ver movimientos en "Movimientos del Día"</p>
            <p>🔒 <strong>Paso 5:</strong> Realizar "Cierre de Caja" al finalizar</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-primary">Apertura de Caja</h1>
        <p className="text-muted-foreground">
          Iniciar el día con el fondo inicial de caja
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          La apertura de caja debe realizarse al inicio de cada jornada laboral antes de realizar cualquier venta.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información de Apertura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fecha y Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Fecha</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {new Date(fechaActual).toLocaleDateString('es-PE', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Hora</p>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{horaActual}</p>
                  </div>
                </div>
              </div>

              {/* Fondo Inicial */}
              <div className="space-y-2">
                <Label htmlFor="fondoInicial">Fondo Inicial *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm text-muted-foreground">S/</span>
                  <Input
                    id="fondoInicial"
                    type="number"
                    step="0.01"
                    min="0"
                    value={fondoInicial}
                    onChange={(e) => {
                      setFondoInicial(e.target.value);
                      if (errors.fondoInicial) setErrors({ ...errors, fondoInicial: "" });
                    }}
                    placeholder="0.00"
                    className={`pl-10 text-lg ${errors.fondoInicial ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.fondoInicial && (
                  <p className="text-sm text-destructive">{errors.fondoInicial}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Monto en efectivo con el que inicia la caja
                </p>
              </div>

              {/* Fondo Inicial Yape */}
              <div className="space-y-2">
                <Label htmlFor="fondoInicialYape">Fondo Inicial Yape</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm text-muted-foreground">S/</span>
                  <Input
                    id="fondoInicialYape"
                    type="number"
                    step="0.01"
                    min="0"
                    value={fondoInicialYape}
                    onChange={(e) => {
                      setFondoInicialYape(e.target.value);
                      if (errors.fondoInicialYape) setErrors({ ...errors, fondoInicialYape: "" });
                    }}
                    placeholder="0.00"
                    className={`pl-10 text-lg ${errors.fondoInicialYape ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.fondoInicialYape && (
                  <p className="text-sm text-destructive">{errors.fondoInicialYape}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Monto en Yape con el que inicia la caja
                </p>
              </div>

              {/* Fondo Inicial Plin */}
              <div className="space-y-2">
                <Label htmlFor="fondoInicialPlin">Fondo Inicial Plin</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm text-muted-foreground">S/</span>
                  <Input
                    id="fondoInicialPlin"
                    type="number"
                    step="0.01"
                    min="0"
                    value={fondoInicialPlin}
                    onChange={(e) => {
                      setFondoInicialPlin(e.target.value);
                      if (errors.fondoInicialPlin) setErrors({ ...errors, fondoInicialPlin: "" });
                    }}
                    placeholder="0.00"
                    className={`pl-10 text-lg ${errors.fondoInicialPlin ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.fondoInicialPlin && (
                  <p className="text-sm text-destructive">{errors.fondoInicialPlin}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Monto en Plin con el que inicia la caja
                </p>
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Notas adicionales sobre la apertura..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                />
              </div>

              {/* Botón de Abrir Caja */}
              <Button onClick={handleAbrirCaja} className="w-full" size="lg">
                <Save className="mr-2 h-4 w-4" />
                Abrir Caja
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Vista Previa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📋 Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Fecha de Apertura</p>
                <p>{new Date(fechaActual).toLocaleDateString('es-PE')}</p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Hora</p>
                <p>{horaActual}</p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Responsable</p>
                <p className={!localStorage.getItem('currentUser') ? "text-muted-foreground" : ""}>
                  {localStorage.getItem('currentUser') || "Sin especificar"}
                </p>
              </div>

              <div className="p-3 bg-primary/10 border-2 border-primary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Fondo Inicial</p>
                <p className="text-xl text-primary">
                  S/ {fondoInicial ? parseFloat(fondoInicial).toFixed(2) : "0.00"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Información */}
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-base">💡 Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-2">Fondo Inicial:</p>
                <p className="text-xs text-muted-foreground">
                  Es el dinero en efectivo con el que se inicia el día en caja. Generalmente incluye billetes y monedas para dar vuelto.
                </p>
              </div>

              <div>
                <p className="font-medium mb-2">Importante:</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Solo se puede abrir una caja por día</li>
                  <li>• Debe cerrarse al finalizar la jornada</li>
                  <li>• Todas las ventas se registrarán contra esta apertura</li>
                </ul>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Los campos con asterisco (*) son obligatorios
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Flujo del Día */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📝 Flujo del Día</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                  1
                </div>
                <div>
                  <p className="font-medium">Apertura de Caja</p>
                  <p className="text-xs text-muted-foreground">Registrar fondo inicial</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs">
                  2
                </div>
                <div>
                  <p className="font-medium">Ventas del Día</p>
                  <p className="text-xs text-muted-foreground">Registrar comprobantes</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs">
                  3
                </div>
                <div>
                  <p className="font-medium">Egresos</p>
                  <p className="text-xs text-muted-foreground">Gastos menores del día</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs">
                  4
                </div>
                <div>
                  <p className="font-medium">Cierre de Caja</p>
                  <p className="text-xs text-muted-foreground">Arqueo y cuadre final</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}