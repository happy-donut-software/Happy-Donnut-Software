import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { API_CONFIG, buildURL } from "../../src/config/api.config";

type Producto = { id: string; nombre: string; precio: number };
type Cliente = { id: string; nombre: string; telefono: string; direccion?: string | null };
type ItemCarrito = Producto & { cantidad: number };
type MetodoPago = "EFECTIVO" | "YAPE" | "PLIN";
type TipoComprobante = "BOLETA" | "NOTA_PEDIDO";

export function NuevoComprobante() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoId, setProductoId] = useState("");
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [cobroAbierto, setCobroAbierto] = useState(false);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("EFECTIVO");
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>("BOLETA");
  const [montoRecibido, setMontoRecibido] = useState("");

  const total = useMemo(() => carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0), [carrito]);
  const monto = metodoPago === "EFECTIVO" ? Number(montoRecibido || 0) : total;
  const vuelto = monto - total;

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await fetch(buildURL(API_CONFIG.services.ventas, API_CONFIG.endpoints.ventas.productos));
        if (!respuesta.ok) throw new Error("No se pudo cargar el catalogo de venta.");
        const datos = await respuesta.json();
        setProductos(datos.productos ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar productos.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const buscarClientes = async () => {
    try {
      const endpoint = `${API_CONFIG.endpoints.clientes.frecuentes}?buscar=${encodeURIComponent(busquedaCliente)}`;
      const respuesta = await fetch(buildURL(API_CONFIG.services.usuarios, endpoint));
      if (!respuesta.ok) throw new Error("No se pudo buscar clientes.");
      const datos = await respuesta.json();
      setClientes(datos.clientes ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error buscando clientes.");
    }
  };

  const agregarProducto = () => {
    const producto = productos.find((actual) => actual.id === productoId);
    if (!producto) return;
    setCarrito((actual) => {
      const existe = actual.find((item) => item.id === producto.id);
      return existe
        ? actual.map((item) => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item)
        : [...actual, { ...producto, cantidad: 1 }];
    });
  };

  const actualizarCantidad = (id: string, cantidad: number) => {
    setCarrito((actual) => actual.map((item) => item.id === id ? { ...item, cantidad: Math.max(1, cantidad) } : item));
  };

  const cobrar = async () => {
    if (carrito.length === 0 || (metodoPago === "EFECTIVO" && vuelto < 0)) return;
    setProcesando(true);
    setError("");
    try {
      const crear = await fetch(buildURL(API_CONFIG.services.ventas, API_CONFIG.endpoints.ventas.ordenes), {
        method: "POST",
        headers: API_CONFIG.defaultHeaders,
        body: JSON.stringify({
          cliente_id: cliente?.id ?? null,
          items: carrito.map((item) => ({ producto_id: item.id, nombre_producto: item.nombre, cantidad: item.cantidad, precio_unitario: item.precio })),
        }),
      });
      const orden = await crear.json();
      if (!crear.ok) throw new Error(orden.error || orden.message || "No se pudo crear la orden.");

      const pagar = await fetch(buildURL(API_CONFIG.services.ventas, API_CONFIG.endpoints.ventas.pagar.replace(":id", orden.orden_id)), {
        method: "POST",
        headers: API_CONFIG.defaultHeaders,
        body: JSON.stringify({ monto_recibido: monto, metodo_pago: metodoPago, tipo_comprobante: tipoComprobante }),
      });
      const pago = await pagar.json();
      if (!pagar.ok) throw new Error(pago.error || pago.message || "No se pudo registrar el pago.");

      toast.success(`Venta ${pago.orden_id} pagada. Vuelto: S/ ${Number(pago.vuelto).toFixed(2)}`);
      setCarrito([]);
      setCliente(null);
      setMontoRecibido("");
      setCobroAbierto(false);
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "Error al procesar la venta.";
      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold">Punto de Venta</h1><p className="text-muted-foreground">Venta fisica conectada a los microservicios.</p></div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card><CardHeader><CardTitle>Cliente frecuente (opcional)</CardTitle></CardHeader><CardContent className="space-y-3">
            <div className="flex gap-2"><Input value={busquedaCliente} onChange={(e) => setBusquedaCliente(e.target.value)} placeholder="Nombre o telefono"/><Button variant="outline" onClick={buscarClientes}><Search className="h-4 w-4"/></Button></div>
            {clientes.length > 0 && <div className="grid gap-2 sm:grid-cols-2">{clientes.map((actual) => <Button key={actual.id} variant={cliente?.id === actual.id ? "default" : "outline"} className="h-auto justify-start py-3" onClick={() => setCliente(actual)}><span className="text-left"><strong>{actual.nombre}</strong><br/><small>{actual.telefono}</small></span></Button>)}</div>}
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Productos</CardTitle></CardHeader><CardContent className="space-y-4">
            {cargando ? <Loader2 className="animate-spin"/> : <div className="flex gap-2"><Select value={productoId} onValueChange={setProductoId}><SelectTrigger><SelectValue placeholder="Seleccionar producto"/></SelectTrigger><SelectContent>{productos.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre} - S/ {Number(p.precio).toFixed(2)}</SelectItem>)}</SelectContent></Select><Button onClick={agregarProducto} disabled={!productoId}><Plus className="mr-2 h-4 w-4"/>Agregar</Button></div>}
            <Table><TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Cantidad</TableHead><TableHead>Precio</TableHead><TableHead>Subtotal</TableHead><TableHead/></TableRow></TableHeader><TableBody>
              {carrito.map((item) => <TableRow key={item.id}><TableCell>{item.nombre}</TableCell><TableCell><Input className="w-20" type="number" min={1} value={item.cantidad} onChange={(e) => actualizarCantidad(item.id, Number(e.target.value))}/></TableCell><TableCell>S/ {Number(item.precio).toFixed(2)}</TableCell><TableCell>S/ {(item.precio * item.cantidad).toFixed(2)}</TableCell><TableCell><Button size="icon" variant="ghost" onClick={() => setCarrito((actual) => actual.filter((p) => p.id !== item.id))}><Trash2 className="h-4 w-4"/></Button></TableCell></TableRow>)}
            </TableBody></Table>
          </CardContent></Card>
        </div>
        <Card className="h-fit"><CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5"/>Resumen</CardTitle></CardHeader><CardContent className="space-y-4"><p>{carrito.reduce((s, i) => s + i.cantidad, 0)} unidades</p><p className="text-3xl font-semibold">S/ {total.toFixed(2)}</p>{cliente && <p className="text-sm">Cliente: {cliente.nombre}</p>}<Button className="w-full" size="lg" disabled={carrito.length === 0} onClick={() => { setMontoRecibido(total.toFixed(2)); setCobroAbierto(true); }}>Cobrar</Button></CardContent></Card>
      </div>

      <Dialog open={cobroAbierto} onOpenChange={setCobroAbierto}><DialogContent><DialogHeader><DialogTitle>Confirmar cobro</DialogTitle></DialogHeader><div className="space-y-4">
        <div><Label>Comprobante</Label><Select value={tipoComprobante} onValueChange={(v) => setTipoComprobante(v as TipoComprobante)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="BOLETA">Boleta</SelectItem><SelectItem value="NOTA_PEDIDO">Nota de pedido</SelectItem></SelectContent></Select></div>
        <div><Label>Metodo de pago</Label><Select value={metodoPago} onValueChange={(v) => setMetodoPago(v as MetodoPago)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="EFECTIVO">Efectivo</SelectItem><SelectItem value="YAPE">Yape</SelectItem><SelectItem value="PLIN">Plin</SelectItem></SelectContent></Select></div>
        <div><Label>Monto recibido</Label><Input type="number" min={0} step="0.10" disabled={metodoPago !== "EFECTIVO"} value={metodoPago === "EFECTIVO" ? montoRecibido : total.toFixed(2)} onChange={(e) => setMontoRecibido(e.target.value)}/></div>
        <div className={`rounded-lg p-4 text-center text-2xl font-semibold ${vuelto < 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{vuelto < 0 ? `Faltan S/ ${Math.abs(vuelto).toFixed(2)}` : `Vuelto S/ ${vuelto.toFixed(2)}`}</div>
      </div><DialogFooter><Button variant="outline" onClick={() => setCobroAbierto(false)}>Cancelar</Button><Button disabled={procesando || (metodoPago === "EFECTIVO" && vuelto < 0)} onClick={cobrar}>{procesando && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Confirmar venta</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}