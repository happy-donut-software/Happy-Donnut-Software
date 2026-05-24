import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Alert, AlertDescription } from "../ui/alert";
import { Save, X, AlertCircle, TrendingDown, Calendar } from "lucide-react";
import { toast } from "sonner@2.0.3";
import {
  addMovimientoCaja,
  getMovimientosCaja,
  getNextId,
  type MovimientoCaja
} from "../../lib/storage";

export function RegistrarEgreso() {
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState<"Efectivo" | "Yape" | "Plin">("Efectivo");
  const [descripcion, setDescripcion] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cajaAbierta = localStorage.getItem('cajaAbierta');
  const datosApertura = cajaAbierta ? JSON.parse(cajaAbierta) : null;
  const fechaActual = new Date().toISOString().split('T')[0];
  const horaActual = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!monto || parseFloat(monto) <= 0) {
      newErrors.monto = "El monto debe ser mayor a 0";
    }

    if (!descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLimpiar = () => {
    setMonto("");
    setMetodoPago("Efectivo");
    setDescripcion("");
    setErrors({});
    toast.success("Formulario limpiado");
  };

  const handleGuardar = () => {
    if (!validateForm()) {
      toast.error("Por favor, corrija los errores del formulario");
      return;
    }

    // Obtener usuario actual
    const currentUser = localStorage.getItem('currentUser') || 'Sistema';
    const now = new Date();
    const movimientos = getMovimientosCaja();
    
    // Crear movimiento de caja
    const nuevoMovimiento: MovimientoCaja = {
      id: getNextId(movimientos),
      fecha: now.toISOString().split('T')[0],
      hora: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      tipo: "Egreso",
      concepto: descripcion,
      metodoPago: metodoPago.toLowerCase() as "efectivo" | "yape" | "plin",
      monto: parseFloat(monto),
      usuario: currentUser
    };

    // Guardar en movimientos de caja
    addMovimientoCaja(nuevoMovimiento);

    toast.success(`Egreso registrado: S/ ${parseFloat(monto).toFixed(2)}`);
    
    // Limpiar formulario
    handleLimpiar();
  };

  if (!cajaAbierta) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-primary">Registrar Egreso</h1>
          <p className="text-muted-foreground">
            Registrar gastos y salidas de dinero de caja
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">No hay una caja abierta</p>
            <p className="text-sm mt-1">
              Debe realizar la apertura de caja antes de registrar egresos.
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary">Registrar Egreso</h1>
          <p className="text-muted-foreground">
            Registrar gastos y salidas de dinero de caja
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleLimpiar}>
            <X className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
          <Button onClick={handleGuardar}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Egreso
          </Button>
        </div>
      </div>

      {/* Información de Caja */}
      <Card className="bg-primary/5 border-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Caja abierta por</p>
              <p className="font-medium">{datosApertura.responsable}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-medium">
                {new Date(fechaActual).toLocaleDateString('es-PE')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Egreso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fecha y Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Fecha</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {new Date(fechaActual).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Hora</p>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <p className="font-medium">{horaActual}</p>
                  </div>
                </div>
              </div>

              {/* Monto */}
              <div className="space-y-2">
                <Label htmlFor="monto">Monto del Egreso *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm text-muted-foreground">S/</span>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    min="0"
                    value={monto}
                    onChange={(e) => {
                      setMonto(e.target.value);
                      if (errors.monto) setErrors({ ...errors, monto: "" });
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="0.00"
                    className={`pl-10 text-lg ${errors.monto ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.monto && (
                  <p className="text-sm text-destructive">{errors.monto}</p>
                )}
              </div>

              {/* Método de Pago */}
              <div className="space-y-2">
                <Label>Método de Pago *</Label>
                <RadioGroup
                  value={metodoPago}
                  onValueChange={(value) => setMetodoPago(value as "Efectivo" | "Yape" | "Plin")}
                  className="grid grid-cols-1 md:grid-cols-3 gap-3"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="Efectivo" id="efectivo" />
                    <Label htmlFor="efectivo" className="cursor-pointer">
                      💵 Efectivo
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="Yape" id="yape" />
                    <Label htmlFor="yape" className="cursor-pointer">
                      📱 Yape
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="Plin" id="plin" />
                    <Label htmlFor="plin" className="cursor-pointer">
                      📲 Plin
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción del Gasto *</Label>
                <Textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => {
                    setDescripcion(e.target.value);
                    if (errors.descripcion) setErrors({ ...errors, descripcion: "" });
                  }}
                  placeholder="Detalle del gasto realizado..."
                  rows={4}
                  className={errors.descripcion ? 'border-destructive' : ''}
                />
                {errors.descripcion && (
                  <p className="text-sm text-destructive">{errors.descripcion}</p>
                )}
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📋 Resumen del Egreso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Fecha y Hora</p>
                <p>{new Date(fechaActual).toLocaleDateString('es-PE')}</p>
                <p className="text-xs text-muted-foreground mt-1">{horaActual}</p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Método de Pago</p>
                <p>
                  {metodoPago === "Efectivo" && "💵"}
                  {metodoPago === "Yape" && "📱"}
                  {metodoPago === "Plin" && "📲"}
                  {" "}{metodoPago}
                </p>
              </div>

              <div className="p-3 bg-red-50 border-2 border-red-600 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Monto del Egreso</p>
                <p className="text-xl text-red-600">
                  - S/ {monto ? parseFloat(monto).toFixed(2) : "0.00"}
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
                <p className="font-medium mb-2">¿Qué son los egresos?</p>
                <p className="text-xs text-muted-foreground">
                  Son las salidas de dinero de la caja por gastos menores del día, como compras pequeñas, propinas, servicios, etc.
                </p>
              </div>

              <div>
                <p className="font-medium mb-2">Importante:</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Registre todos los gastos del día</li>
                  <li>• Guarde los comprobantes físicos</li>
                  <li>• Verifique el monto antes de guardar</li>
                  <li>• El egreso afecta el saldo de caja</li>
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

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">⚡ Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={handleGuardar} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Guardar Egreso
              </Button>
              <Button variant="outline" onClick={handleLimpiar} className="w-full">
                <X className="mr-2 h-4 w-4" />
                Limpiar Formulario
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}