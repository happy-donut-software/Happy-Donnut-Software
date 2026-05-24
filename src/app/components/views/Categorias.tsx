import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Search, Edit, Trash2, Plus, Save, X, Tags, Package, FlaskConical } from "lucide-react";
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
import { Textarea } from "../ui/textarea";
import { toast } from "sonner@2.0.3";
import {
  getCategorias,
  saveCategorias,
  addCategoria,
  deleteCategoria,
  getNextId,
  getProductos,
  getInsumos,
  type Categoria,
} from "../../lib/storage";

export function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<"todas" | "Producto" | "Insumo">("todas");

  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [newCategoria, setNewCategoria] = useState<Categoria | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);

  const [deletingCategoriaId, setDeletingCategoriaId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = () => {
    const todas = getCategorias();
    const productos = getProductos();
    const insumos = getInsumos();

    const conCuentas = todas.map(cat => {
      const count =
        cat.tipo === "Producto"
          ? productos.filter(p => p.categoria === cat.nombre).length
          : insumos.filter(i => i.categoria === cat.nombre).length;
      return { ...cat, itemsCount: count };
    });

    setCategorias(conCuentas);
  };

  const filtered = categorias.filter(cat => {
    const matchSearch =
      cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === "todas" || cat.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  // Stats
  const totalProductoCats = categorias.filter(c => c.tipo === "Producto").length;
  const totalInsumoCats = categorias.filter(c => c.tipo === "Insumo").length;
  const totalActivas = categorias.filter(c => c.estado === "Activa").length;

  // Edit
  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria({ ...categoria });
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editingCategoria) return;
    if (!editingCategoria.nombre.trim()) {
      toast.error("El nombre de la categoría es obligatorio");
      return;
    }
    const todas = getCategorias();
    const updated = todas.map(c => c.id === editingCategoria.id ? editingCategoria : c);
    saveCategorias(updated);
    loadCategorias();
    setShowEditDialog(false);
    setEditingCategoria(null);
    toast.success("Categoría actualizada exitosamente");
  };

  // New
  const handleNewCategoria = () => {
    setNewCategoria({
      id: getNextId(getCategorias()),
      tipo: "Producto",
      nombre: "",
      descripcion: "",
      itemsCount: 0,
      estado: "Activa",
    });
    setShowNewDialog(true);
  };

  const handleSaveNew = () => {
    if (!newCategoria) return;
    if (!newCategoria.nombre.trim()) {
      toast.error("El nombre de la categoría es obligatorio");
      return;
    }
    const todas = getCategorias();
    const existe = todas.find(
      c =>
        c.nombre.toLowerCase() === newCategoria.nombre.toLowerCase() &&
        c.tipo === newCategoria.tipo
    );
    if (existe) {
      toast.error(`Ya existe una categoría de ${newCategoria.tipo} con ese nombre`);
      return;
    }
    addCategoria(newCategoria);
    loadCategorias();
    setShowNewDialog(false);
    setNewCategoria(null);
    toast.success(`Categoría "${newCategoria.nombre}" creada exitosamente`);
  };

  // Delete
  const handleDeleteClick = (id: number) => {
    const cat = categorias.find(c => c.id === id);
    if (cat && cat.itemsCount > 0) {
      toast.error(
        `No se puede eliminar: tiene ${cat.itemsCount} ${cat.tipo === "Producto" ? "producto(s)" : "insumo(s)"} asociado(s)`
      );
      return;
    }
    setDeletingCategoriaId(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingCategoriaId) return;
    const cat = categorias.find(c => c.id === deletingCategoriaId);
    deleteCategoria(deletingCategoriaId);
    loadCategorias();
    setShowDeleteDialog(false);
    setDeletingCategoriaId(null);
    toast.success(`Categoría "${cat?.nombre}" eliminada exitosamente`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Categorías</h1>
          <p className="text-muted-foreground">Gestión de categorías para productos e insumos</p>
        </div>
        <Button onClick={handleNewCategoria}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl text-primary">{totalProductoCats}</div>
                <p className="text-sm text-muted-foreground">Categorías de Productos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl text-orange-500">{totalInsumoCats}</div>
                <p className="text-sm text-muted-foreground">Categorías de Insumos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Tags className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl text-green-600">{totalActivas}</div>
                <p className="text-sm text-muted-foreground">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTipo} onValueChange={(v) => setFilterTipo(v as typeof filterTipo)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="Producto">Solo Productos</SelectItem>
                <SelectItem value="Insumo">Solo Insumos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Ítems</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No se encontraron categorías
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.nombre}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          cat.tipo === "Producto"
                            ? "border-primary text-primary"
                            : "border-orange-500 text-orange-500"
                        }
                      >
                        {cat.tipo === "Producto" ? (
                          <Package className="h-3 w-3 mr-1" />
                        ) : (
                          <FlaskConical className="h-3 w-3 mr-1" />
                        )}
                        {cat.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{cat.descripcion}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{cat.itemsCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cat.estado === "Activa" ? "default" : "outline"}>
                        {cat.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(cat)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(cat.id)}
                          disabled={cat.itemsCount > 0}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog: Editar Categoría */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>Modifica la información de la categoría</DialogDescription>
          </DialogHeader>
          {editingCategoria && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de Categoría</Label>
                <Select
                  value={editingCategoria.tipo}
                  onValueChange={(v) =>
                    setEditingCategoria({ ...editingCategoria, tipo: v as Categoria["tipo"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Producto">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        Producto
                      </div>
                    </SelectItem>
                    <SelectItem value="Insumo">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-orange-500" />
                        Insumo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Las categorías de Producto aplican en el módulo de Productos; las de Insumo en el módulo de Insumos.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre de la Categoría</Label>
                <Input
                  id="edit-nombre"
                  value={editingCategoria.nombre}
                  onChange={(e) =>
                    setEditingCategoria({ ...editingCategoria, nombre: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-desc">Descripción</Label>
                <Textarea
                  id="edit-desc"
                  value={editingCategoria.descripcion}
                  onChange={(e) =>
                    setEditingCategoria({ ...editingCategoria, descripcion: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe brevemente esta categoría..."
                />
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={editingCategoria.estado === "Activa" ? "default" : "outline"}
                    onClick={() => setEditingCategoria({ ...editingCategoria, estado: "Activa" })}
                    className="flex-1"
                  >
                    Activa
                  </Button>
                  <Button
                    type="button"
                    variant={editingCategoria.estado === "Inactiva" ? "default" : "outline"}
                    onClick={() => setEditingCategoria({ ...editingCategoria, estado: "Inactiva" })}
                    className="flex-1"
                  >
                    Inactiva
                  </Button>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
                <strong>Ítems asociados:</strong> {editingCategoria.itemsCount}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingCategoria(null); }}>
              <X className="mr-2 h-4 w-4" />Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="mr-2 h-4 w-4" />Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Nueva Categoría */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nueva Categoría</DialogTitle>
            <DialogDescription>Agrega una nueva categoría para productos o insumos</DialogDescription>
          </DialogHeader>
          {newCategoria && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de Categoría *</Label>
                <Select
                  value={newCategoria.tipo}
                  onValueChange={(v) =>
                    setNewCategoria({ ...newCategoria, tipo: v as Categoria["tipo"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Producto">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        Producto
                      </div>
                    </SelectItem>
                    <SelectItem value="Insumo">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-orange-500" />
                        Insumo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {newCategoria.tipo === "Producto"
                    ? "Esta categoría estará disponible al crear o editar Productos."
                    : "Esta categoría estará disponible al crear o editar Insumos."}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-nombre">Nombre de la Categoría *</Label>
                <Input
                  id="new-nombre"
                  value={newCategoria.nombre}
                  onChange={(e) => setNewCategoria({ ...newCategoria, nombre: e.target.value })}
                  placeholder={
                    newCategoria.tipo === "Producto"
                      ? "Ej: Donas, Bebidas, Postres..."
                      : "Ej: Lácteos, Panadería, Condimentos..."
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-desc">Descripción</Label>
                <Textarea
                  id="new-desc"
                  value={newCategoria.descripcion}
                  onChange={(e) => setNewCategoria({ ...newCategoria, descripcion: e.target.value })}
                  rows={3}
                  placeholder="Describe brevemente esta categoría..."
                />
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newCategoria.estado === "Activa" ? "default" : "outline"}
                    onClick={() => setNewCategoria({ ...newCategoria, estado: "Activa" })}
                    className="flex-1"
                  >
                    Activa
                  </Button>
                  <Button
                    type="button"
                    variant={newCategoria.estado === "Inactiva" ? "default" : "outline"}
                    onClick={() => setNewCategoria({ ...newCategoria, estado: "Inactiva" })}
                    className="flex-1"
                  >
                    Inactiva
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNewDialog(false); setNewCategoria(null); }}>
              <X className="mr-2 h-4 w-4" />Cancelar
            </Button>
            <Button onClick={handleSaveNew}>
              <Save className="mr-2 h-4 w-4" />Crear Categoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Confirmar Eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La categoría será eliminada permanentemente.
              {deletingCategoriaId !== null && (() => {
                const cat = categorias.find(c => c.id === deletingCategoriaId);
                return cat ? (
                  <span className="block mt-2 font-medium">{cat.nombre} ({cat.tipo})</span>
                ) : null;
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowDeleteDialog(false); setDeletingCategoriaId(null); }}>
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
