import { useEffect, useMemo, useState } from "react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Coins, FileText, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { obtenerCajaActual } from "../../services/cajaService";

type OrdenResumen = { id: string; fecha_creacion: string; estado: string; total: number; lineas: Array<{ nombre_producto: string; cantidad: number }> };

export function Dashboard() {
  const [ordenes, setOrdenes] = useState<OrdenResumen[]>([]);
  const [cajaAbierta, setCajaAbierta] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetch("/api/ventas/ordenes?estado=pagada", { headers: { Accept: "application/json" } }).then((response) => response.json()),
      obtenerCajaActual(),
    ]).then(([ventas, caja]) => {
      setOrdenes(ventas.ordenes || []);
      setCajaAbierta(caja.abierto);
    }).catch(() => { setOrdenes([]); setCajaAbierta(false); });
  }, []);

  const hoy = new Date().toISOString().slice(0, 10);
  const ventasHoy = ordenes.filter((orden) => orden.fecha_creacion?.slice(0, 10) === hoy);
  const totalHoy = ventasHoy.reduce((total, orden) => total + Number(orden.total), 0);

  const productos = useMemo(() => {
    const conteo = new Map<string, number>();
    ventasHoy.flatMap((orden) => orden.lineas).forEach((linea) => conteo.set(linea.nombre_producto, (conteo.get(linea.nombre_producto) || 0) + Number(linea.cantidad)));
    return Array.from(conteo, ([name, cantidad]) => ({ name, cantidad })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 6);
  }, [ventasHoy]);

  const masVendido = productos[0];

  return <div className="space-y-6">
    <div><h1>Dashboard</h1><p className="text-muted-foreground">Resumen real de Ventas y Finanzas.</p></div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Ventas del Día</CardTitle><Coins className="h-4 w-4 text-primary"/></CardHeader><CardContent><div className="text-2xl">S/ {totalHoy.toFixed(2)}</div><p className="text-xs text-muted-foreground">{ventasHoy.length} comprobantes</p></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Comprobantes Emitidos</CardTitle><FileText className="h-4 w-4 text-primary"/></CardHeader><CardContent><div className="text-2xl">{ordenes.length}</div><p className="text-xs text-muted-foreground">Histórico disponible</p></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Producto Más Vendido Hoy</CardTitle><TrendingUp className="h-4 w-4 text-primary"/></CardHeader><CardContent><div className="truncate text-lg">{masVendido?.name || "Sin ventas hoy"}</div><p className="text-xs text-muted-foreground">{masVendido ? masVendido.cantidad + " unidades" : "Sin ventas"}</p></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Caja</CardTitle><Wallet className="h-4 w-4 text-primary"/></CardHeader><CardContent><Badge className={cajaAbierta ? "bg-green-600" : "bg-gray-500"}>{cajaAbierta ? "ABIERTA" : "CERRADA"}</Badge><p className="mt-2 text-xs text-muted-foreground">{cajaAbierta ? "Cobros habilitados" : "Ventas bloqueadas"}</p></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Productos vendidos hoy</CardTitle></CardHeader><CardContent>{productos.length === 0 ? <div className="py-12 text-center text-muted-foreground"><ShoppingCart className="mx-auto mb-3 h-8 w-8"/>Todavía no hay ventas para mostrar.</div> : <ResponsiveContainer width="100%" height={320}><BarChart data={productos}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="cantidad" fill="#ff8c00"/></BarChart></ResponsiveContainer>}</CardContent></Card>
    <Card><CardHeader><CardTitle>Actividad reciente</CardTitle></CardHeader><CardContent className="space-y-2">{ordenes.slice(0, 5).map((orden) => <div key={orden.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-mono text-xs">{orden.id}</p><p className="text-sm text-muted-foreground">{new Date(orden.fecha_creacion).toLocaleString("es-PE")}</p></div><strong>S/ {Number(orden.total).toFixed(2)}</strong></div>)}{ordenes.length === 0 && <p className="py-8 text-center text-muted-foreground">No hay actividad reciente.</p>}</CardContent></Card>
  </div>;
}
