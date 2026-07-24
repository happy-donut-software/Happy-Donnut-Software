import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit, FolderPlus, Plus, RefreshCw, Save, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Textarea } from "../ui/textarea";

interface ProductosProps { userRole?: "Administrador" | "Empleado"; }
interface CategoriaCatalogo { id: number; nombre: string; slug: string; descripcion?: string | null; productos_count: number; }
interface ProductoCatalogo {
  id: string; nombre: string; descripcion?: string | null; precio: number; imagen_url?: string | null;
  activo: boolean; categoria_id: number | null; categoria?: { id: number; nombre: string; slug: string } | null;
  stock: number; stock_minimo: number;
}
interface FormularioProducto {
  nombre: string; descripcion: string; precio: number; imagen_url: string; activo: boolean;
  categoria_id: number; stock: number; stock_minimo: number;
}

const formularioVacio: FormularioProducto = {
  nombre: "", descripcion: "", precio: 0, imagen_url: "", activo: true,
  categoria_id: 0, stock: 0, stock_minimo: 5,
};

async function apiJson(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const validation = data.errors ? Object.values(data.errors).flat().join(" ") : "";
    throw new Error(validation || data.message || data.error || ("Error HTTP " + response.status));
  }
  return data;
}

export function ProductosSimple({ userRole = "Administrador" }: ProductosProps) {
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [categorias, setCategorias] = useState<CategoriaCatalogo[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [dialogoProducto, setDialogoProducto] = useState(false);
  const [productoEditado, setProductoEditado] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<FormularioProducto>(formularioVacio);
  const [productoAEliminar, setProductoAEliminar] = useState<string | null>(null);
  const [dialogoCategoria, setDialogoCategoria] = useState(false);
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [descripcionCategoria, setDescripcionCategoria] = useState("");

  const cargarCatalogo = useCallback(async () => {
    setCargando(true);
    try {
      const [catalogo, inventario] = await Promise.all([
        apiJson("/api/ventas/productos?incluir_inactivos=1"),
        apiJson("/api/inventario/productos"),
      ]);
      const stockPorProducto = new Map((inventario.productos || []).map((item: any) => [item.id, item]));
      setProductos((catalogo.productos || []).map((producto: any) => {
        const stock: any = stockPorProducto.get(producto.id);
        return {
          ...producto,
          precio: Number(producto.precio),
          stock: Number(stock?.stock_disponible || 0),
          stock_minimo: Number(stock?.stock_minimo || 0),
        };
      }));
      setCargando(false);
    } catch (error) {
      setCargando(false);
      toast.error(error instanceof Error ? error.message : "No se pudo cargar el catálogo");
    }
  }, []);

  const cargarCategorias = useCallback(async () => {
    try {
      const data = await apiJson("/api/ventas/categorias");
      setCategorias(data.categorias || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar las categorías");
    }
  }, []);

  useEffect(() => { void Promise.all([cargarCatalogo(), cargarCategorias()]); }, [cargarCatalogo, cargarCategorias]);

  const abrirNuevoProducto = () => {
    setProductoEditado(null);
    setFormulario({ ...formularioVacio, categoria_id: categorias[0]?.id || 0 });
    setDialogoProducto(true);
  };

  const abrirEdicion = (producto: ProductoCatalogo) => {
    setProductoEditado(producto.id);
    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: producto.precio,
      imagen_url: producto.imagen_url || "",
      activo: producto.activo,
      categoria_id: producto.categoria_id || categorias[0]?.id || 0,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
    });
    setDialogoProducto(true);
  };

  const guardarProducto = async () => {
    if (!formulario.nombre.trim() || formulario.precio <= 0 || !formulario.categoria_id) {
      toast.error("Completa nombre, categoría y un precio mayor que cero.");
      return;
    }
    setGuardando(true);
    const datosCatalogo = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim() || null,
      precio: formulario.precio,
      imagen_url: formulario.imagen_url.trim() || null,
      activo: formulario.activo,
      categoria_id: formulario.categoria_id,
    };
    try {
      if (productoEditado) {
        await apiJson("/api/ventas/productos/" + productoEditado, { method: "PUT", body: JSON.stringify(datosCatalogo) });
        await apiJson("/api/inventario/productos/" + productoEditado, {
          method: "PUT",
          body: JSON.stringify({ nombre: datosCatalogo.nombre, stock_disponible: formulario.stock, stock_minimo: formulario.stock_minimo }),
        });
        toast.success("Producto actualizado en catálogo e inventario.");
      } else {
        const creado = await apiJson("/api/ventas/productos", { method: "POST", body: JSON.stringify(datosCatalogo) });
        const idCreado = creado.producto.id;
        try {
          await apiJson("/api/inventario/productos", {
            method: "POST",
            body: JSON.stringify({ id: idCreado, nombre: datosCatalogo.nombre, stock_disponible: formulario.stock, stock_minimo: formulario.stock_minimo }),
          });
        } catch (error) {
          await fetch("/api/ventas/productos/" + idCreado, { method: "DELETE" });
          throw error;
        }
        toast.success("Producto creado y visible en ambos frontends.");
      }
      setDialogoProducto(false);
      await Promise.all([cargarCatalogo(), cargarCategorias()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el producto");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarProducto = async () => {
    if (!productoAEliminar) return;
    try {
      await apiJson("/api/ventas/productos/" + productoAEliminar, { method: "DELETE" });
      const inventario = await fetch("/api/inventario/productos/" + productoAEliminar, { method: "DELETE" });
      if (!inventario.ok && inventario.status !== 404) throw new Error("El catálogo se desactivó, pero falló la limpieza del inventario.");
      toast.success("Producto retirado del catálogo.");
      setProductoAEliminar(null);
      await Promise.all([cargarCatalogo(), cargarCategorias()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el producto");
    }
  };

  const crearCategoria = async () => {
    if (!nombreCategoria.trim()) return;
    setGuardando(true);
    try {
      await apiJson("/api/ventas/categorias", {
        method: "POST",
        body: JSON.stringify({ nombre: nombreCategoria.trim(), descripcion: descripcionCategoria.trim() || null }),
      });
      setNombreCategoria("");
      setDescripcionCategoria("");
      setDialogoCategoria(false);
      await cargarCategorias();
      toast.success("Categoría creada correctamente.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la categoría");
    } finally {
      setGuardando(false);
    }
  };

  const renombrarCategoria = async (categoria: CategoriaCatalogo) => {
    const nombre = window.prompt("Nuevo nombre de la categoría", categoria.nombre)?.trim();
    if (!nombre || nombre === categoria.nombre) return;
    try {
      await apiJson("/api/ventas/categorias/" + categoria.id, {
        method: "PUT",
        body: JSON.stringify({ nombre, descripcion: categoria.descripcion || null }),
      });
      await Promise.all([cargarCategorias(), cargarCatalogo()]);
      toast.success("Categoría actualizada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar la categoría");
    }
  };

  const eliminarCategoria = async (categoria: CategoriaCatalogo) => {
    if (!window.confirm("¿Eliminar la categoría " + categoria.nombre + "?")) return;
    try {
      await apiJson("/api/ventas/categorias/" + categoria.id, { method: "DELETE" });
      await cargarCategorias();
      toast.success("Categoría eliminada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la categoría");
    }
  };

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.toLocaleLowerCase("es");
    return productos.filter((producto) =>
      producto.nombre.toLocaleLowerCase("es").includes(termino) ||
      (producto.categoria?.nombre || "").toLocaleLowerCase("es").includes(termino));
  }, [productos, busqueda]);

  const isAdmin = userRole === "Administrador";

  return (
    <div className="p-6 space-y-5">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-2xl">Productos ({productosFiltrados.length})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => void cargarCatalogo()} disabled={cargando}><RefreshCw className="h-4 w-4 mr-2" />Actualizar</Button>
              {isAdmin && <Button variant="outline" onClick={() => setDialogoCategoria(true)}><FolderPlus className="h-4 w-4 mr-2" />Nueva categoría</Button>}
              {isAdmin && <Button onClick={abrirNuevoProducto} disabled={!categorias.length}><Plus className="h-4 w-4 mr-2" />Nuevo producto</Button>}
            </div>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar por producto o categoría" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            {categorias.map((categoria) => (
              <div key={categoria.id} className="flex items-center gap-1 rounded-full border px-3 py-1 text-sm">
                <span>{categoria.nombre} ({categoria.productos_count})</span>
                {isAdmin && <button title="Renombrar" onClick={() => void renombrarCategoria(categoria)}><Edit className="h-3.5 w-3.5" /></button>}
                {isAdmin && <button title="Eliminar" onClick={() => void eliminarCategoria(categoria)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>}
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Categoría</TableHead><TableHead>Precio</TableHead><TableHead>Stock</TableHead><TableHead>Estado</TableHead>{isAdmin && <TableHead className="text-right">Acciones</TableHead>}</TableRow></TableHeader>
            <TableBody>
              {productosFiltrados.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell><div className="font-medium">{producto.nombre}</div><div className="text-xs text-muted-foreground">{producto.descripcion}</div></TableCell>
                  <TableCell>{producto.categoria?.nombre || "Sin categoría"}</TableCell>
                  <TableCell>S/ {producto.precio.toFixed(2)}</TableCell>
                  <TableCell><span className={producto.stock <= producto.stock_minimo ? "text-red-600 font-semibold" : ""}>{producto.stock}</span><span className="text-xs text-muted-foreground"> / mín. {producto.stock_minimo}</span></TableCell>
                  <TableCell><Badge variant={producto.activo ? "default" : "secondary"}>{producto.activo ? "Disponible" : "Oculto"}</Badge></TableCell>
                  {isAdmin && <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => abrirEdicion(producto)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setProductoAEliminar(producto.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>}
                </TableRow>
              ))}
              {!cargando && productosFiltrados.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay productos para mostrar.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogoProducto} onOpenChange={setDialogoProducto}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader><DialogTitle>{productoEditado ? "Editar producto" : "Nuevo producto"}</DialogTitle><DialogDescription>Los cambios se guardan en Ventas e Inventario y aparecen en el portal de clientes.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nombre</Label><Input value={formulario.nombre} onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Descripción</Label><Textarea value={formulario.descripcion} onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Categoría</Label><Select value={formulario.categoria_id ? String(formulario.categoria_id) : ""} onValueChange={(value) => setFormulario({ ...formulario, categoria_id: Number(value) })}><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger><SelectContent>{categorias.map((categoria) => <SelectItem key={categoria.id} value={String(categoria.id)}>{categoria.nombre}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label>Precio (S/)</Label><Input type="number" min="0.01" step="0.01" value={formulario.precio || ""} onChange={(e) => setFormulario({ ...formulario, precio: Number(e.target.value) })} /></div>
              <div className="grid gap-2"><Label>Stock</Label><Input type="number" min="0" value={formulario.stock} onChange={(e) => setFormulario({ ...formulario, stock: Number(e.target.value) })} /></div>
              <div className="grid gap-2"><Label>Stock mínimo</Label><Input type="number" min="0" value={formulario.stock_minimo} onChange={(e) => setFormulario({ ...formulario, stock_minimo: Number(e.target.value) })} /></div>
            </div>
            <div className="grid gap-2"><Label>URL de imagen (opcional)</Label><Input value={formulario.imagen_url} onChange={(e) => setFormulario({ ...formulario, imagen_url: e.target.value })} placeholder="https://..." /></div>
            <div className="flex items-center justify-between rounded border p-3"><Label htmlFor="producto-activo">Visible para clientes</Label><Switch id="producto-activo" checked={formulario.activo} onCheckedChange={(activo) => setFormulario({ ...formulario, activo })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogoProducto(false)}>Cancelar</Button><Button onClick={() => void guardarProducto()} disabled={guardando}><Save className="h-4 w-4 mr-2" />{guardando ? "Guardando..." : "Guardar"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogoCategoria} onOpenChange={setDialogoCategoria}>
        <DialogContent><DialogHeader><DialogTitle>Nueva categoría</DialogTitle><DialogDescription>La categoría estará disponible inmediatamente para administrar productos.</DialogDescription></DialogHeader><div className="grid gap-4 py-2"><div className="grid gap-2"><Label>Nombre</Label><Input value={nombreCategoria} onChange={(e) => setNombreCategoria(e.target.value)} placeholder="Ej. Bebidas" /></div><div className="grid gap-2"><Label>Descripción</Label><Textarea value={descripcionCategoria} onChange={(e) => setDescripcionCategoria(e.target.value)} /></div></div><DialogFooter><Button variant="outline" onClick={() => setDialogoCategoria(false)}>Cancelar</Button><Button onClick={() => void crearCategoria()} disabled={guardando || !nombreCategoria.trim()}>Crear categoría</Button></DialogFooter></DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(productoAEliminar)} onOpenChange={(open) => !open && setProductoAEliminar(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Retirar producto?</AlertDialogTitle><AlertDialogDescription>Se ocultará del portal de clientes y se retirará del inventario.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => void eliminarProducto()}>Retirar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
