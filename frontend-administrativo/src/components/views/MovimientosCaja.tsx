import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Loader2, RefreshCw, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { toast } from "sonner";
import { obtenerCajaActual, type TurnoCajaApi } from "../../services/cajaService";

export function MovimientosCaja() {
  const [turno, setTurno] = useState<TurnoCajaApi | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    try { setTurno((await obtenerCajaActual()).turno); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No se pudieron cargar los movimientos."); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const totales = useMemo(() => {
    const movimientos = turno?.movimientos || [];
    return {
      ingresos: movimientos.filter((item) => item.es_entrada).reduce((total, item) => total + Number(item.monto), 0),
      egresos: movimientos.filter((item) => !item.es_entrada).reduce((total, item) => total + Number(item.monto), 0),
    };
  }, [turno]);

  return <div className="p-6 space-y-6">
    <div className="flex items-center justify-between"><div><h1 className="text-primary">Movimientos de Caja</h1><p className="text-muted-foreground">Ingresos y egresos persistidos en Finanzas.</p></div><Button variant="outline" onClick={() => void cargar()}><RefreshCw className="mr-2 h-4 w-4"/>Actualizar</Button></div>
    {cargando ? <div className="flex items-center gap-2"><Loader2 className="animate-spin h-5 w-5"/>Consultando...</div> : !turno ? <Alert variant="destructive"><AlertDescription>No hay una caja abierta. Realiza primero la apertura.</AlertDescription></Alert> : <>
      <Card><CardContent className="pt-6 grid gap-4 md:grid-cols-4"><div><p className="text-sm text-muted-foreground">Fondo inicial</p><p className="text-2xl">S/ {Number(turno.monto_apertura).toFixed(2)}</p></div><div><TrendingUp className="h-4 w-4 text-green-600"/><p className="text-sm text-muted-foreground">Ingresos</p><p className="text-2xl text-green-600">S/ {totales.ingresos.toFixed(2)}</p></div><div><TrendingDown className="h-4 w-4 text-red-600"/><p className="text-sm text-muted-foreground">Egresos</p><p className="text-2xl text-red-600">S/ {totales.egresos.toFixed(2)}</p></div><div><Wallet className="h-4 w-4 text-primary"/><p className="text-sm text-muted-foreground">Saldo esperado</p><p className="text-2xl text-primary">S/ {Number(turno.saldo_esperado).toFixed(2)}</p></div></CardContent></Card>
      <Card><CardHeader><CardTitle>Detalle ({turno.movimientos.length})</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Tipo</TableHead><TableHead>Descripción</TableHead><TableHead className="text-right">Monto</TableHead></TableRow></TableHeader><TableBody>{turno.movimientos.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Todavía no hay movimientos.</TableCell></TableRow> : turno.movimientos.map((movimiento) => <TableRow key={movimiento.id}><TableCell>{new Date(movimiento.fecha_hora).toLocaleString("es-PE")}</TableCell><TableCell><Badge variant={movimiento.es_entrada ? "default" : "destructive"}>{movimiento.tipo.replaceAll("_", " ")}</Badge></TableCell><TableCell>{movimiento.descripcion || "Sin descripción"}</TableCell><TableCell className={"text-right " + (movimiento.es_entrada ? "text-green-600" : "text-red-600")}>{movimiento.es_entrada ? "+" : "-"} S/ {Number(movimiento.monto).toFixed(2)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    </>}
  </div>;
}
