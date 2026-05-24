import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Search, Edit, Trash2, Plus, Save, X, ChefHat } from "lucide-react";
import {
  getProductos,
  saveProductos,
  addProducto,
  getNextId,
  getCategoriasByTipo,
  getInsumos,
  type Producto as ProductoType,
  type RecetaItem,
  type Insumo,
} from "../../lib/storage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { toast } from "sonner@2.0.3";

interface ProductosProps {
  userRole?: "Administrador" | "Empleado";
}

export function Productos({ userRole = "Administrador" }: ProductosProps) {
  const [productos, setProductos] = useState<ProductoType[]>([]);
  const [categoriasProductos, setCategoriasProductos] = useState<string[]>([]);
  const [insumosDisponibles, setInsumosDisponibles] = useState<Insumo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductoType | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newProduct, setNewProduct] = useState<ProductoType | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadProductos();
    loadCategorias();
    setInsumosDisponibles(getInsumos());
  }, []);

  const loadProductos = () => setProductos(getProductos());

  const loadCategorias = () => {
    const cats = getCategoriasByTipo("Producto")
      .filter(c => c.estado === "Activa")
      .map(c => c.nombre);
    setCategoriasProductos(cats);
  };

  const filteredProductos = productos.filter(prod =>
    prod.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (producto: ProductoType) => {
    setEditingProduct({ ...producto, receta: producto.receta ? [...producto.receta] : [] });
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingProduct) {
      const updatedProductos = productos.map(prod =>
        prod.id === editingProduct.id ? editingProduct : prod
      );
      saveProductos(updatedProductos);
      setProductos(updatedProductos);
      setShowEditDialog(false);
      setEditingProduct(null);
      toast.success("Producto actualizado exitosamente");
    }
  };

  const handleNewProduct = () => {
    const emptyProduct: ProductoType = {
      id: getNextId(productos),
      nombre: "",
      categoria: categoriasProductos.length > 0 ? categoriasProductos[0] : "",
      tipo_producto: "No Preparado",
      precio: 0,
      stock: 0,
      estado: "Disponible",
      receta: [],
    };
    setNewProduct(emptyProduct);
    setShowNewDialog(true);
  };

  const handleSaveNewProduct = () => {
    if (newProduct) {
      if (!newProduct.nombre.trim()) {
        toast.error("El nombre del producto es obligatorio");
        return;
      }
      addProducto(newProduct);
      loadProductos();
      setShowNewDialog(false);
      setNewProduct(null);
      toast.success(`Producto "${newProduct.nombre}" creado exitosamente`);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingProductId(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deletingProductId) {
      const producto = productos.find(p => p.id === deletingProductId);
      const updatedProductos = productos.filter(prod => prod.id !== deletingProductId);
      saveProductos(updatedProductos);
      setProductos(updatedProductos);
      setShowDeleteDialog(false);
      setDeletingProductId(null);
      toast.success(`Producto "${producto?.nombre}" eliminado exitosamente`);
    }
  };

  const updateEditingProduct = (field: keyof ProductoType, value: any) => {
    if (editingProduct) setEditingProduct({ ...editingProduct, [field]: value });
  };

  const updateNewProduct = (field: keyof ProductoType, value: any) => {
    if (newProduct) setNewProduct({ ...newProduct, [field]: value });
  };

  // ─── Receta helpers ───────────────────────────────────────────────────────

  const addRecetaItem = (target: "new" | "edit") => {
    const emptyItem: RecetaItem = { insumoId: 0, insumoNombre: "", cantidad: 1 };
    if (target === "new" && newProduct) {
      setNewProduct({ ...newProduct, receta: [...(newProduct.receta ?? []), emptyItem] });
    } else if (target === "edit" && editingProduct) {
      setEditingProduct({ ...editingProduct, receta: [...(editingProduct.receta ?? []), emptyItem] });
    }
  };

  const updateRecetaItem = (
    target: "new" | "edit",
    index: number,
    field: keyof RecetaItem,
    value: any
  ) => {
    const update = (receta: RecetaItem[]) => {
      const updated = [...receta];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    };
    if (target === "new" && newProduct) {
      setNewProduct({ ...newProduct, receta: update(newProduct.receta ?? []) });
    } else if (target === "edit" && editingProduct) {
      setEditingProduct({ ...editingProduct, receta: update(editingProduct.receta ?? []) });
    }
  };

  const selectInsumoReceta = (
    target: "new" | "edit",
    index: number,
    insumoId: number
  ) => {
    const insumo = insumosDisponibles.find(i => i.id === insumoId);
    if (!insumo) return;
    const update = (receta: RecetaItem[]) => {
      const updated = [...receta];
      updated[index] = { ...updated[index], insumoId: insumo.id, insumoNombre: insumo.nombre };
      return updated;
    };
    if (target === "new" && newProduct) {
      setNewProduct({ ...newProduct, receta: update(newProduct.receta ?? []) });
    } else if (target === "edit" && editingProduct) {
      setEditingProduct({ ...editingProduct, receta: update(editingProduct.receta ?? []) });
    }
  };

  const removeRecetaItem = (target: "new" | "edit", index: number) => {
    const update = (receta: RecetaItem[]) => receta.filter((_, i) => i !== index);
    if (target === "new" && newProduct) {
      setNewProduct({ ...newProduct, receta: update(newProduct.receta ?? []) });
    } else if (target === "edit" && editingProduct) {
      setEditingProduct({ ...editingProduct, receta: update(editingProduct.receta ?? []) });
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return "Agotado";
    if (stock < 20) return "Bajo Stock";
    return null;
  };

  const totalProductos = productos.length;
  const conStock = productos.filter(p => p.tipo_producto === "No Preparado").length;
  const preparados = productos.filter(p => p.tipo_producto === "Preparado").length;
  const bajoStock = productos.filter(p => p.tipo_producto === "No Preparado" && p.stock < 20 && p.stock > 0).length;
  const isReadOnly = userRole === "Empleado";

  // ─── Shared receta section renderer ──────────────────────────────────────

  const RecetaSection = ({
    receta,
    target,
  }: {
    receta: RecetaItem[];
    target: "new" | "edit";
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <ChefHat className="h-4 w-4" />
          Receta (Insumos por unidad vendida)
        </Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addRecetaItem(target)}
          disabled={insumosDisponibles.length === 0}
        >
          <Plus className="h-3 w-3 mr-1" />
          Agregar Insumo
        </Button>
      </div>

      {insumosDisponibles.length === 0 && (
        <p className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-md">
          No hay insumos registrados. Registra insumos primero en Inventario &gt; Insumos.
        </p>
      )}

      {receta.length === 0 && insumosDisponibles.length > 0 && (
        <p className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-md">
          Sin receta definida. Al vender este producto no se descontarán insumos.
        </p>
      )}

      {receta.length > 0 && (
        <div className="border rounded-md divide-y">
          {receta.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2">
              <Select
                value={item.insumoId ? String(item.insumoId) : ""}
                onValueChange={(v) => selectInsumoReceta(target, idx, parseInt(v))}
              >
                <SelectTrigger className="flex-1 h-8 text-sm">
                  <SelectValue placeholder="Seleccionar insumo..." />
                </SelectTrigger>
                <SelectContent>
                  {insumosDisponibles.map(ins => (
                    <SelectItem key={ins.id} value={String(ins.id)}>
                      {ins.nombre} ({ins.categoria})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1 w-28 shrink-0">
                <Input
                  type="number"
                  min="1"
                  value={item.cantidad}
                  onChange={(e) =>
                    updateRecetaItem(target, idx, "cantidad", parseInt(e.target.value) || 1)
                  }
                  onWheel={(e) => e.currentTarget.blur()}
                  className="h-8 text-sm w-16"
                />
                <span className="text-xs text-muted-foreground shrink-0">und.</span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeRecetaItem(target, idx)}
                className="h-8 w-8 p-0 shrink-0"
              >
                <X className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>{isReadOnly ? "Consultar Productos" : "Productos"}</h1>
          <p className="text-muted-foreground">
            {isReadOnly
              ? "Consulta de productos del negocio (solo lectura)"
              : "Gestión de productos del negocio"}
          </p>
        </div>
        {!isReadOnly && (
          <Button onClick={handleNewProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        )}
      </div>

      {isReadOnly && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-yellow-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Modo Solo Lectura</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Estás visualizando los productos en modo solo lectura. Para gestionar el inventario, contacta a un administrador.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl">{totalProductos}</div><p className="text-sm text-muted-foreground">Total Productos</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl text-primary">{conStock}</div><p className="text-sm text-muted-foreground">Con Stock</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl text-secondary">{preparados}</div><p className="text-sm text-muted-foreground">Al Momento</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl text-destructive">{bajoStock}</div><p className="text-sm text-muted-foreground">Bajo Stock</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Receta</TableHead>
                <TableHead>Estado</TableHead>
                {!isReadOnly && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductos.map((prod) => {
                const esPreparado = prod.tipo_producto === "Preparado";
                const stockStatus = esPreparado ? null : getStockStatus(prod.stock);
                return (
                  <TableRow key={prod.id}>
                    <TableCell>{prod.nombre}</TableCell>
                    <TableCell>{prod.categoria}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={esPreparado ? "border-amber-500 text-amber-700 bg-amber-50" : "border-blue-500 text-blue-700 bg-blue-50"}>
                        {esPreparado ? "Al Momento" : "Con Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">S/. {prod.precio.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {esPreparado ? <span className="text-xs text-muted-foreground">—</span> : prod.stock}
                    </TableCell>
                    <TableCell>
                      {prod.receta && prod.receta.length > 0 ? (
                        <Badge variant="outline" className="text-xs">
                          <ChefHat className="h-3 w-3 mr-1" />
                          {prod.receta.length} insumo{prod.receta.length !== 1 ? "s" : ""}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={prod.estado === "Disponible" ? "default" : "outline"}
                          className={prod.estado === "No Disponible" ? "bg-red-600 text-white border-red-600 hover:bg-red-700" : ""}
                        >
                          {prod.estado}
                        </Badge>
                        {stockStatus && (
                          <Badge className={stockStatus === "Agotado" ? "bg-red-600 text-white hover:bg-red-700" : "bg-orange-600 text-white hover:bg-orange-700"}>
                            {stockStatus}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(prod)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteClick(prod.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Dialog: Editar Producto ── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>Modifica la información y receta del producto</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre del Producto</Label>
                <Input
                  id="edit-nombre"
                  value={editingProduct.nombre}
                  onChange={(e) => updateEditingProduct("nombre", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={editingProduct.categoria} onValueChange={(v) => updateEditingProduct("categoria", v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                  <SelectContent>
                    {categoriasProductos.length > 0
                      ? categoriasProductos.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)
                      : <SelectItem value="_empty" disabled>No hay categorías disponibles</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Producto</Label>
                <RadioGroup
                  value={editingProduct.tipo_producto}
                  onValueChange={(v) => updateEditingProduct("tipo_producto", v as "Preparado" | "No Preparado")}
                  className="grid grid-cols-2 gap-3"
                >
                  <div className={`flex items-start space-x-2 border rounded-lg p-3 cursor-pointer ${editingProduct.tipo_producto === "No Preparado" ? "border-blue-500 bg-blue-50" : ""}`}>
                    <RadioGroupItem value="No Preparado" id="edit-no-preparado" className="mt-0.5" />
                    <div>
                      <Label htmlFor="edit-no-preparado" className="cursor-pointer font-medium">Con Stock</Label>
                      <p className="text-xs text-muted-foreground">Se descuenta al vender. Bloqueado cuando llega a 0.</p>
                    </div>
                  </div>
                  <div className={`flex items-start space-x-2 border rounded-lg p-3 cursor-pointer ${editingProduct.tipo_producto === "Preparado" ? "border-amber-500 bg-amber-50" : ""}`}>
                    <RadioGroupItem value="Preparado" id="edit-preparado" className="mt-0.5" />
                    <div>
                      <Label htmlFor="edit-preparado" className="cursor-pointer font-medium">Al Momento</Label>
                      <p className="text-xs text-muted-foreground">Preparado al instante. Solo descuenta insumos de receta.</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Precio (S/.)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingProduct.precio}
                  onChange={(e) => updateEditingProduct("precio", parseFloat(e.target.value) || 0)}
                  onWheel={(e) => e.currentTarget.blur()}
                />
                {editingProduct.tipo_producto === "No Preparado" && (
                  <p className="text-xs text-muted-foreground">
                    💡 El stock se gestiona con las Notas de Entrada y Salida
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <RadioGroup
                  value={editingProduct.estado}
                  onValueChange={(v) => updateEditingProduct("estado", v)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Disponible" id="edit-disponible" />
                    <Label htmlFor="edit-disponible" className="cursor-pointer">Disponible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No Disponible" id="edit-no-disponible" />
                    <Label htmlFor="edit-no-disponible" className="cursor-pointer">No Disponible</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="border-t pt-4">
                <RecetaSection receta={editingProduct.receta ?? []} target="edit" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingProduct(null); }}>
              <X className="mr-2 h-4 w-4" />Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="mr-2 h-4 w-4" />Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Nuevo Producto ── */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Producto</DialogTitle>
            <DialogDescription>Agrega un nuevo producto y define su receta de insumos</DialogDescription>
          </DialogHeader>
          {newProduct && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="new-nombre">Nombre del Producto</Label>
                <Input
                  id="new-nombre"
                  value={newProduct.nombre}
                  onChange={(e) => updateNewProduct("nombre", e.target.value)}
                  placeholder="Ej: Dona de Vainilla"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={newProduct.categoria} onValueChange={(v) => updateNewProduct("categoria", v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                  <SelectContent>
                    {categoriasProductos.length > 0
                      ? categoriasProductos.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)
                      : <SelectItem value="_empty" disabled>No hay categorías disponibles</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Producto</Label>
                <RadioGroup
                  value={newProduct.tipo_producto}
                  onValueChange={(v) => updateNewProduct("tipo_producto", v as "Preparado" | "No Preparado")}
                  className="grid grid-cols-2 gap-3"
                >
                  <div className={`flex items-start space-x-2 border rounded-lg p-3 cursor-pointer ${newProduct.tipo_producto === "No Preparado" ? "border-blue-500 bg-blue-50" : ""}`}>
                    <RadioGroupItem value="No Preparado" id="new-no-preparado" className="mt-0.5" />
                    <div>
                      <Label htmlFor="new-no-preparado" className="cursor-pointer font-medium">Con Stock</Label>
                      <p className="text-xs text-muted-foreground">Se descuenta al vender. Bloqueado cuando llega a 0.</p>
                    </div>
                  </div>
                  <div className={`flex items-start space-x-2 border rounded-lg p-3 cursor-pointer ${newProduct.tipo_producto === "Preparado" ? "border-amber-500 bg-amber-50" : ""}`}>
                    <RadioGroupItem value="Preparado" id="new-preparado" className="mt-0.5" />
                    <div>
                      <Label htmlFor="new-preparado" className="cursor-pointer font-medium">Al Momento</Label>
                      <p className="text-xs text-muted-foreground">Preparado al instante. Solo descuenta insumos de receta.</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Precio (S/.)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newProduct.precio}
                  onChange={(e) => updateNewProduct("precio", parseFloat(e.target.value) || 0)}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="0.00"
                />
                {newProduct.tipo_producto === "No Preparado" && (
                  <p className="text-xs text-muted-foreground">
                    💡 El stock inicial será 0 y se gestionará con las Notas de Entrada
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <RadioGroup
                  value={newProduct.estado}
                  onValueChange={(v) => updateNewProduct("estado", v)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Disponible" id="new-disponible" />
                    <Label htmlFor="new-disponible" className="cursor-pointer">Disponible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No Disponible" id="new-no-disponible" />
                    <Label htmlFor="new-no-disponible" className="cursor-pointer">No Disponible</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="border-t pt-4">
                <RecetaSection receta={newProduct.receta ?? []} target="new" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNewDialog(false); setNewProduct(null); }}>
              <X className="mr-2 h-4 w-4" />Cancelar
            </Button>
            <Button onClick={handleSaveNewProduct}>
              <Save className="mr-2 h-4 w-4" />Crear Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── AlertDialog: Confirmar Eliminación ── */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente del sistema.
              {deletingProductId && (
                <span className="block mt-2 font-medium">
                  {productos.find(p => p.id === deletingProductId)?.nombre}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowDeleteDialog(false); setDeletingProductId(null); }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
