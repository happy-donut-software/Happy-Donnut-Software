import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Search, Edit, Trash2, Plus, Save, X, Package } from "lucide-react";
import { toast } from "sonner@2.0.3";
import {
  getInsumos,
  addInsumo,
  updateInsumoFull,
  deleteInsumo,
  getNextId,
  getCategoriasByTipo,
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

interface InsumosProps {
  userRole: "Administrador" | "Empleado";
}

export function Insumos({ userRole }: InsumosProps) {
  const isReadOnly = userRole === "Empleado";

  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("todas");

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newInsumo, setNewInsumo] = useState<Partial<Insumo>>({});

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setInsumos(getInsumos());
    const cats = getCategoriasByTipo("Insumo")
      .filter(c => c.estado === "Activa")
      .map(c => c.nombre);
    setCategorias(cats);
  };

  const filtered = insumos.filter(ins => {
    const matchSearch =
      ins.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCategoria === "todas" || ins.categoria === filterCategoria;
    return matchSearch && matchCat;
  });

  // Stats
  const totalInsumos = insumos.length;
  const stockTotal = insumos.reduce((s, i) => s + i.cantidad, 0);
  const bajoStock = insumos.filter(i => i.cantidad > 0 && i.cantidad < 10).length;
  const sinStock = insumos.filter(i => i.cantidad === 0).length;

  // New
  const handleOpenNew = () => {
    setNewInsumo({
      nombre: "",
      categoria: categorias[0] ?? "",
      cantidad: 0,
      unidadMedida: "und.",
      estado: "Disponible",
    });
    setShowNewDialog(true);
  };

  const handleSaveNew = () => {
    if (!newInsumo.nombre?.trim()) {
      toast.error("El nombre del insumo es obligatorio");
      return;
    }
    if (!newInsumo.categoria) {
      toast.error("La categoría es obligatoria");
      return;
    }
    const insumoToAdd: Insumo = {
      id: getNextId(getInsumos()),
      nombre: newInsumo.nombre.trim(),
      categoria: newInsumo.categoria,
      unidadMedida: "und.",
      cantidad: newInsumo.cantidad ?? 0,
      estado: newInsumo.estado ?? "Disponible",
    };
    addInsumo(insumoToAdd);
    loadData();
    setShowNewDialog(false);
    toast.success(`Insumo "${insumoToAdd.nombre}" registrado exitosamente`);
  };

  // Edit
  const handleOpenEdit = (insumo: Insumo) => {
    setEditingInsumo({ ...insumo });
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editingInsumo) return;
    if (!editingInsumo.nombre.trim()) {
      toast.error("El nombre del insumo es obligatorio");
      return;
    }
    updateInsumoFull(editingInsumo.id, editingInsumo);
    loadData();
    setShowEditDialog(false);
    setEditingInsumo(null);
    toast.success("Insumo actualizado exitosamente");
  };

  // Delete
  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId === null) return;
    const ins = insumos.find(i => i.id === deletingId);
    deleteInsumo(deletingId);
    loadData();
    setShowDeleteDialog(false);
    setDeletingId(null);
    toast.success(`Insumo "${ins?.nombre}" eliminado`);
  };

  const getStockBadge = (cantidad: number) => {
    if (cantidad === 0) return <Badge className="bg-red-600 text-white hover:bg-red-700">Sin Stock</Badge>;
    if (cantidad < 10) return <Badge className="bg-orange-500 text-white hover:bg-orange-600">Bajo Stock</Badge>;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Insumos</h1>
          <p className="text-muted-foreground">
            {isReadOnly ? "Consulta de insumos del negocio" : "Gestión de insumos del negocio"}
          </p>
        </div>
        {!isReadOnly && (
          <Button onClick={handleOpenNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Insumo
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl">{totalInsumos}</div>
            <p className="text-sm text-muted-foreground">Total Insumos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-primary">{stockTotal}</div>
            <p className="text-sm text-muted-foreground">Stock Total (und.)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-orange-500">{bajoStock}</div>
            <p className="text-sm text-muted-foreground">Bajo Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-destructive">{sinStock}</div>
            <p className="text-sm text-muted-foreground">Sin Stock</p>
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
                placeholder="Buscar insumos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categorias.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No se encontraron insumos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insumo</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Estado</TableHead>
                  {!isReadOnly && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(ins => (
                  <TableRow key={ins.id}>
                    <TableCell className="font-medium">{ins.nombre}</TableCell>
                    <TableCell>{ins.categoria}</TableCell>
                    <TableCell className="text-right">{ins.cantidad}</TableCell>
                    <TableCell className="text-muted-foreground">und.</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={ins.estado === "Disponible" ? "default" : "outline"}
                          className={ins.estado === "No Disponible" ? "bg-red-600 text-white border-red-600 hover:bg-red-700" : ""}>
                          {ins.estado}
                        </Badge>
                        {getStockBadge(ins.cantidad)}
                      </div>
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(ins)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteClick(ins.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Nuevo Insumo */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Nuevo Insumo</DialogTitle>
            <DialogDescription>Registra un nuevo insumo en el sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre del Insumo *</Label>
              <Input
                value={newInsumo.nombre ?? ""}
                onChange={(e) => setNewInsumo({ ...newInsumo, nombre: e.target.value })}
                placeholder="Ej: Harina de trigo"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select
                value={newInsumo.categoria ?? ""}
                onValueChange={(v) => setNewInsumo({ ...newInsumo, categoria: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.length > 0 ? (
                    categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)
                  ) : (
                    <SelectItem value="_empty" disabled>No hay categorías de insumo</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stock Inicial (und.)</Label>
              <Input
                type="number"
                min="0"
                value={newInsumo.cantidad ?? 0}
                onChange={(e) => setNewInsumo({ ...newInsumo, cantidad: parseInt(e.target.value) || 0 })}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">Todos los insumos se miden en unidades (und.)</p>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={newInsumo.estado ?? "Disponible"}
                onValueChange={(v) => setNewInsumo({ ...newInsumo, estado: v as Insumo["estado"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="No Disponible">No Disponible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              <X className="mr-2 h-4 w-4" />Cancelar
            </Button>
            <Button onClick={handleSaveNew}>
              <Save className="mr-2 h-4 w-4" />Registrar Insumo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Insumo */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Editar Insumo</DialogTitle>
            <DialogDescription>Modifica la información del insumo</DialogDescription>
          </DialogHeader>
          {editingInsumo && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nombre del Insumo *</Label>
                <Input
                  value={editingInsumo.nombre}
                  onChange={(e) => setEditingInsumo({ ...editingInsumo, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select
                  value={editingInsumo.categoria}
                  onValueChange={(v) => setEditingInsumo({ ...editingInsumo, categoria: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stock (und.)</Label>
                <Input
                  type="number"
                  min="0"
                  value={editingInsumo.cantidad}
                  onChange={(e) => setEditingInsumo({ ...editingInsumo, cantidad: parseInt(e.target.value) || 0 })}
                  onWheel={(e) => e.currentTarget.blur()}
                />
                <p className="text-xs text-muted-foreground">Todos los insumos se miden en unidades (und.)</p>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={editingInsumo.estado}
                  onValueChange={(v) => setEditingInsumo({ ...editingInsumo, estado: v as Insumo["estado"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Disponible">Disponible</SelectItem>
                    <SelectItem value="No Disponible">No Disponible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingInsumo(null); }}>
              <X className="mr-2 h-4 w-4" />Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="mr-2 h-4 w-4" />Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Confirmar Eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Insumo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El insumo será eliminado permanentemente.
              {deletingId !== null && (
                <span className="block mt-2 font-medium">
                  {insumos.find(i => i.id === deletingId)?.nombre}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowDeleteDialog(false); setDeletingId(null); }}>
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
