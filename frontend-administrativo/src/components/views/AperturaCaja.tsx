import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CheckCircle2, Loader2, RefreshCw, Wallet } from "lucide-react";
import { toast } from "sonner";
import { abrirCaja, obtenerCajaActual, type TurnoCajaApi } from "../../services/cajaService";

export function AperturaCaja() {
  const [turno, setTurno] = useState<TurnoCajaApi | null>(null);
  const [monto, setMonto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const estado = await obtenerCajaActual();
      setTurno(estado.turno);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo consultar la caja.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const abrir = async () => {
    const montoInicial = Number(monto);
    if (!Number.isFinite(montoInicial) || montoInicial < 0) {
      toast.error("Ingresa un fondo inicial válido.");
      return;
    }
    setGuardando(true);
    try {
      await abrirCaja("admin-local", montoInicial);
      await cargar();
      setMonto("");
      toast.success("Caja abierta correctamente. Ya se pueden realizar ventas.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo abrir la caja.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="p-8 flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin"/>Consultando caja...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-primary">Apertura de Caja</h1><p className="text-muted-foreground">La caja debe estar abierta antes de cobrar cualquier venta.</p></div>
        <Button variant="outline" onClick={() => void cargar()}><RefreshCw className="mr-2 h-4 w-4"/>Actualizar</Button>
      </div>

      {turno ? (
        <>
          <Alert className="border-green-500 bg-green-50"><CheckCircle2 className="h-5 w-5 text-green-600"/><AlertDescription><strong>Caja abierta.</strong> El portal y el punto de venta pueden cobrar.</AlertDescription></Alert>
          <Card><CardHeader><CardTitle>Turno actual</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-4">
            <div><p className="text-sm text-muted-foreground">Turno</p><p className="font-medium break-all">{turno.id}</p></div>
            <div><p className="text-sm text-muted-foreground">Responsable</p><p className="font-medium">{turno.cajero_id}</p></div>
            <div><p className="text-sm text-muted-foreground">Fondo inicial</p><p className="font-medium">S/ {Number(turno.monto_apertura).toFixed(2)}</p></div>
            <div><p className="text-sm text-muted-foreground">Saldo esperado</p><p className="font-medium text-primary">S/ {Number(turno.saldo_esperado).toFixed(2)}</p></div>
          </CardContent></Card>
          <p className="text-sm text-muted-foreground">Para finalizar el turno utiliza la opción “Cierre de Caja”.</p>
        </>
      ) : (
        <Card className="max-w-2xl"><CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5"/>Abrir un nuevo turno</CardTitle></CardHeader><CardContent className="space-y-5">
          <Alert><AlertDescription>Mientras la caja esté cerrada, el backend rechazará cualquier intento de pago.</AlertDescription></Alert>
          <div className="space-y-2"><Label htmlFor="monto-apertura">Fondo inicial</Label><Input id="monto-apertura" type="number" min="0" step="0.01" value={monto} onChange={(event) => setMonto(event.target.value)} placeholder="0.00"/></div>
          <Button onClick={() => void abrir()} disabled={guardando || monto === ""}>{guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Abrir Caja</Button>
        </CardContent></Card>
      )}
    </div>
  );
}
