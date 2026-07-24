import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CheckCircle2, Loader2, LockKeyhole, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cerrarCaja, obtenerCajaActual, type TurnoCajaApi } from "../../services/cajaService";

export function CierreCaja() {
  const [turno, setTurno] = useState<TurnoCajaApi | null>(null);
  const [montoContado, setMontoContado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [cerrando, setCerrando] = useState(false);
  const [cerrada, setCerrada] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const estado = await obtenerCajaActual();
      setTurno(estado.turno);
      if (estado.turno) setMontoContado(Number(estado.turno.saldo_esperado).toFixed(2));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo consultar la caja.");
    } finally { setCargando(false); }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const cerrar = async () => {
    const total = Number(montoContado);
    if (!Number.isFinite(total) || total < 0) { toast.error("Ingresa un monto contado válido."); return; }
    setCerrando(true);
    try {
      await cerrarCaja(total);
      setTurno(null);
      setCerrada(true);
      toast.success("Caja cerrada correctamente. Las nuevas ventas quedaron bloqueadas.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cerrar la caja.");
    } finally { setCerrando(false); }
  };

  return <div className="p-6 space-y-6">
    <div className="flex items-center justify-between"><div><h1 className="text-primary">Cierre de Caja</h1><p className="text-muted-foreground">Finaliza el turno y bloquea nuevos cobros.</p></div><Button variant="outline" onClick={() => void cargar()}><RefreshCw className="mr-2 h-4 w-4"/>Actualizar</Button></div>
    {cargando ? <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin"/>Consultando...</div> : cerrada ? <Alert className="border-green-500 bg-green-50"><CheckCircle2 className="h-5 w-5 text-green-600"/><AlertDescription>Caja cerrada. Para vender nuevamente debes abrir otro turno.</AlertDescription></Alert> : !turno ? <Alert variant="destructive"><AlertDescription>No existe un turno abierto para cerrar.</AlertDescription></Alert> : <Card className="max-w-2xl"><CardHeader><CardTitle className="flex items-center gap-2"><LockKeyhole className="h-5 w-5"/>Arqueo del turno</CardTitle></CardHeader><CardContent className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2"><div><p className="text-sm text-muted-foreground">Fondo inicial</p><p className="text-2xl">S/ {Number(turno.monto_apertura).toFixed(2)}</p></div><div><p className="text-sm text-muted-foreground">Saldo esperado</p><p className="text-2xl text-primary">S/ {Number(turno.saldo_esperado).toFixed(2)}</p></div></div>
      <div className="space-y-2"><Label htmlFor="monto-contado">Monto total confirmado</Label><Input id="monto-contado" type="number" min="0" step="0.01" value={montoContado} onChange={(event) => setMontoContado(event.target.value)}/><p className="text-xs text-muted-foreground">Incluye el total confirmado en efectivo y medios digitales para este turno.</p></div>
      <Button variant="destructive" onClick={() => void cerrar()} disabled={cerrando || montoContado === ""}>{cerrando && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Cerrar Caja</Button>
    </CardContent></Card>}
  </div>;
}
