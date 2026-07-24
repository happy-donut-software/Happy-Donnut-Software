import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Eye, Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

type LineaOrden = { id: string; producto_id: string; nombre_producto: string; cantidad: number; precio_unitario: number; subtotal: number };
type Orden = {
  id: string; cliente_id?: string | null; fecha_creacion: string; estado: string; total: number;
  monto_recibido?: number | null; vuelto?: number | null; metodo_pago?: string | null;
  tipo_comprobante: string; lineas: LineaOrden[];
};

async function cargarOrdenes(): Promise<Orden[]> {
  const response = await fetch("/api/ventas/ordenes?estado=pagada", { headers: { Accept: "application/json" } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || "No se pudieron cargar los comprobantes.");
  return data.ordenes || [];
}

export function Comprobantes() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [seleccionada, setSeleccionada] = useState<Orden | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try { setOrdenes(await cargarOrdenes()); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No se pudieron cargar los comprobantes."); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es");
    if (!termino) return ordenes;
    return ordenes.filter((orden) => orden.id.toLocaleLowerCase("es").includes(termino) ||
      (orden.cliente_id || "cliente general").toLocaleLowerCase("es").includes(termino) ||
      (orden.metodo_pago || "").toLocaleLowerCase("es").includes(termino));
  }, [ordenes, busqueda]);

  const total = ordenes.reduce((suma, orden) => suma + Number(orden.total), 0);
  const hoy = new Date().toISOString().slice(0, 10);
  const emitidasHoy = ordenes.filter((orden) => orden.fecha_creacion?.slice(0, 10) === hoy).length;

  return <div className="space-y-6">
    <div className="flex items-center justify-between"><div><h1>Comprobantes</h1><p className="text-muted-foreground">Ventas pagadas desde el portal y el punto de venta.</p></div><Button variant="outline" onClick={() => void cargar()}><RefreshCw className="mr-2 h-4 w-4"/>Actualizar</Button></div>
    <div className="grid gap-4 md:grid-cols-3"><Card><CardContent className="pt-6"><div className="text-2xl">{ordenes.length}</div><p className="text-sm text-muted-foreground">Comprobantes reales</p></CardContent></Card><Card><CardContent className="pt-6"><div className="text-2xl">{emitidasHoy}</div><p className="text-sm text-muted-foreground">Emitidos hoy</p></CardContent></Card><Card><CardContent className="pt-6"><div className="text-2xl text-primary">S/ {total.toFixed(2)}</div><p className="text-sm text-muted-foreground">Monto acumulado</p></CardContent></Card></div>
    <Card><CardHeader><div className="relative max-w-xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" placeholder="Buscar por orden, cliente o método de pago" value={busqueda} onChange={(event) => setBusqueda(event.target.value)}/></div></CardHeader><CardContent>{cargando ? <div className="flex items-center justify-center gap-2 py-10"><Loader2 className="h-5 w-5 animate-spin"/>Cargando comprobantes...</div> : <Table><TableHeader><TableRow><TableHead>Orden</TableHead><TableHead>Fecha</TableHead><TableHead>Comprobante</TableHead><TableHead>Pago</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Detalle</TableHead></TableRow></TableHeader><TableBody>{filtradas.length === 0 ? <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No se encontraron comprobantes.</TableCell></TableRow> : filtradas.map((orden) => <TableRow key={orden.id}><TableCell className="font-mono text-xs">{orden.id}</TableCell><TableCell>{new Date(orden.fecha_creacion).toLocaleString("es-PE")}</TableCell><TableCell>{orden.tipo_comprobante}</TableCell><TableCell>{orden.metodo_pago || "—"}</TableCell><TableCell className="text-right">S/ {Number(orden.total).toFixed(2)}</TableCell><TableCell><Badge>{orden.estado.toUpperCase()}</Badge></TableCell><TableCell className="text-right"><Button aria-label={"Ver " + orden.id} size="sm" variant="outline" onClick={() => setSeleccionada(orden)}><Eye className="h-4 w-4"/></Button></TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card>
    <Dialog open={Boolean(seleccionada)} onOpenChange={(open) => { if (!open) setSeleccionada(null); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[720px]"><DialogHeader><DialogTitle>Detalle del comprobante</DialogTitle><DialogDescription>{seleccionada?.id}</DialogDescription></DialogHeader>{seleccionada && <div className="space-y-5"><div className="grid gap-3 rounded-lg bg-muted p-4 sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Fecha</p><p>{new Date(seleccionada.fecha_creacion).toLocaleString("es-PE")}</p></div><div><p className="text-xs text-muted-foreground">Método</p><p>{seleccionada.metodo_pago}</p></div><div><p className="text-xs text-muted-foreground">Cliente</p><p>{seleccionada.cliente_id || "Cliente general"}</p></div></div><Table><TableHeader><TableRow><TableHead>Producto</TableHead><TableHead className="text-center">Cantidad</TableHead><TableHead className="text-right">Precio</TableHead><TableHead className="text-right">Subtotal</TableHead></TableRow></TableHeader><TableBody>{seleccionada.lineas.map((linea) => <TableRow key={linea.id}><TableCell>{linea.nombre_producto}</TableCell><TableCell className="text-center">{linea.cantidad}</TableCell><TableCell className="text-right">S/ {Number(linea.precio_unitario).toFixed(2)}</TableCell><TableCell className="text-right">S/ {Number(linea.subtotal).toFixed(2)}</TableCell></TableRow>)}</TableBody></Table><div className="flex justify-between rounded-lg bg-primary/10 p-4 text-xl"><span>Total</span><strong>S/ {Number(seleccionada.total).toFixed(2)}</strong></div></div>}</DialogContent></Dialog>
  </div>;
}
