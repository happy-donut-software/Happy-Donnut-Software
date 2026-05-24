import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
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
import { Search, Edit, Trash2, Plus, Save, X, Store, MapPin } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Local {
  id: number;
  nombre: string;
  codigo: string;
  direccion: string;
  telefono: string;
  responsable: string;
  estado: "Activo" | "Inactivo";
  fechaApertura: string;
  observaciones?: string;
}

const localesIniciales: Local[] = [
  {
    id: 1,
    nombre: "HappyDonuts - Local Principal",
    codigo: "LOC-001",
    direccion: "Av. Principal 123, Lima, Perú",
    telefono: "01-234-5678",
    responsable: "María González",
    estado: "Activo",
    fechaApertura: "2024-01-15",
    observaciones: "Local principal - Matriz"
  }
];

export default function Locales() {
  const [locales, setLocales] = useState<Local[]>(localesIniciales);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLocal, setEditingLocal] = useState<Local | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newLocal, setNewLocal] = useState<Local | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [deletingLocalId, setDeletingLocalId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const filteredLocales = locales.filter(local =>
    local.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    local.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    local.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (local: Local) => {
    setEditingLocal({ ...local });
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingLocal) {
      if (!editingLocal.nombre.trim()) {
        toast.error("El nombre del local es obligatorio");
        return;
      }
      if (!editingLocal.codigo.trim()) {
        toast.error("El código del local es obligatorio");
        return;
      }
      if (!editingLocal.direccion.trim()) {
        toast.error("La dirección es obligatoria");
        return;
      }

      // Verificar código duplicado
      const codigoDuplicado = locales.find(
        l => l.codigo === editingLocal.codigo && l.id !== editingLocal.id
      );
      if (codigoDuplicado) {
        toast.error("Ya existe un local con ese código");
        return;
      }

      setLocales(locales.map(l => l.id === editingLocal.id ? editingLocal : l));
      setShowEditDialog(false);
      setEditingLocal(null);
      toast.success("Local actualizado exitosamente");
    }
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingLocal(null);
  };

  const handleNewLocal = () => {
    const nextNumber = locales.length + 1;
    const emptyLocal: Local = {
      id: Math.max(...locales.map(l => l.id), 0) + 1,
      nombre: "",
      codigo: `LOC-${String(nextNumber).padStart(3, '0')}`,
      direccion: "",
      telefono: "",
      responsable: "",
      estado: "Activo",
      fechaApertura: new Date().toISOString().split('T')[0]
    };
    setNewLocal(emptyLocal);
    setShowNewDialog(true);
  };

  const handleSaveNewLocal = () => {
    if (newLocal) {
      if (!newLocal.nombre.trim()) {
        toast.error("El nombre del local es obligatorio");
        return;
      }
      if (!newLocal.codigo.trim()) {
        toast.error("El código del local es obligatorio");
        return;
      }
      if (!newLocal.direccion.trim()) {
        toast.error("La dirección es obligatoria");
        return;
      }

      // Verificar código duplicado
      const codigoDuplicado = locales.find(l => l.codigo === newLocal.codigo);
      if (codigoDuplicado) {
        toast.error("Ya existe un local con ese código");
        return;
      }

      setLocales([...locales, newLocal]);
      setShowNewDialog(false);
      setNewLocal(null);
      toast.success(`Local "${newLocal.nombre}" creado exitosamente`);
    }
  };

  const handleCancelNewLocal = () => {
    setShowNewDialog(false);
    setNewLocal(null);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingLocalId(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deletingLocalId) {
      const local = locales.find(l => l.id === deletingLocalId);
      setLocales(locales.filter(l => l.id !== deletingLocalId));
      setShowDeleteDialog(false);
      setDeletingLocalId(null);
      toast.success(`Local "${local?.nombre}" eliminado exitosamente`);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletingLocalId(null);
  };

  const updateEditingLocal = (field: keyof Local, value: any) => {
    if (editingLocal) {
      setEditingLocal({ ...editingLocal, [field]: value });
    }
  };

  const updateNewLocal = (field: keyof Local, value: any) => {
    if (newLocal) {
      setNewLocal({ ...newLocal, [field]: value });
    }
  };

  const totalActivos = locales.filter(l => l.estado === "Activo").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Locales</h1>
          <p className="text-muted-foreground">
            Gestión de locales y sucursales
          </p>
        </div>
        <Button onClick={handleNewLocal}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Local
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl">{locales.length}</div>
            <p className="text-sm text-muted-foreground">Total Locales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-green-600">{totalActivos}</div>
            <p className="text-sm text-muted-foreground">Locales Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-orange-600">
              {locales.filter(l => l.estado === "Inactivo").length}
            </div>
            <p className="text-sm text-muted-foreground">Locales Inactivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, código o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabla de Locales */}
      <Card>
        <CardHeader>
          <CardTitle>Locales Registrados ({filteredLocales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLocales.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron locales</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre del Local</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Apertura</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocales.map((local) => (
                  <TableRow key={local.id}>
                    <TableCell className="font-mono">{local.codigo}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        {local.nombre}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {local.direccion}
                      </div>
                    </TableCell>
                    <TableCell>{local.responsable || "-"}</TableCell>
                    <TableCell>
                      {local.estado === "Activo" ? (
                        <Badge variant="default">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(local.fechaApertura).toLocaleDateString('es-PE')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(local)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(local.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Editar Local */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Local</DialogTitle>
            <DialogDescription>
              Modifica los datos del local
            </DialogDescription>
          </DialogHeader>
          {editingLocal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-codigo">Código *</Label>
                  <Input
                    id="edit-codigo"
                    value={editingLocal.codigo}
                    onChange={(e) => updateEditingLocal("codigo", e.target.value.toUpperCase())}
                    placeholder="LOC-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-estado">Estado</Label>
                  <select
                    id="edit-estado"
                    value={editingLocal.estado}
                    onChange={(e) => updateEditingLocal("estado", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre del Local *</Label>
                <Input
                  id="edit-nombre"
                  value={editingLocal.nombre}
                  onChange={(e) => updateEditingLocal("nombre", e.target.value)}
                  placeholder="HappyDonuts - Sucursal Norte"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-direccion">Dirección *</Label>
                <Textarea
                  id="edit-direccion"
                  value={editingLocal.direccion}
                  onChange={(e) => updateEditingLocal("direccion", e.target.value)}
                  placeholder="Av. Principal 123, Lima, Perú"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-telefono">Teléfono</Label>
                  <Input
                    id="edit-telefono"
                    value={editingLocal.telefono}
                    onChange={(e) => updateEditingLocal("telefono", e.target.value)}
                    placeholder="01-234-5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-responsable">Responsable</Label>
                  <Input
                    id="edit-responsable"
                    value={editingLocal.responsable}
                    onChange={(e) => updateEditingLocal("responsable", e.target.value)}
                    placeholder="María González"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-observaciones">Observaciones</Label>
                <Textarea
                  id="edit-observaciones"
                  value={editingLocal.observaciones || ""}
                  onChange={(e) => updateEditingLocal("observaciones", e.target.value)}
                  placeholder="Información adicional del local..."
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Nuevo Local */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo Local</DialogTitle>
            <DialogDescription>
              Registra un nuevo local o sucursal
            </DialogDescription>
          </DialogHeader>
          {newLocal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-codigo">Código *</Label>
                  <Input
                    id="new-codigo"
                    value={newLocal.codigo}
                    onChange={(e) => updateNewLocal("codigo", e.target.value.toUpperCase())}
                    placeholder="LOC-002"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-fecha">Fecha de Apertura</Label>
                  <Input
                    id="new-fecha"
                    type="date"
                    value={newLocal.fechaApertura}
                    onChange={(e) => updateNewLocal("fechaApertura", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-nombre">Nombre del Local *</Label>
                <Input
                  id="new-nombre"
                  value={newLocal.nombre}
                  onChange={(e) => updateNewLocal("nombre", e.target.value)}
                  placeholder="HappyDonuts - Sucursal Norte"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-direccion">Dirección *</Label>
                <Textarea
                  id="new-direccion"
                  value={newLocal.direccion}
                  onChange={(e) => updateNewLocal("direccion", e.target.value)}
                  placeholder="Av. Principal 123, Lima, Perú"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-telefono">Teléfono</Label>
                  <Input
                    id="new-telefono"
                    value={newLocal.telefono}
                    onChange={(e) => updateNewLocal("telefono", e.target.value)}
                    placeholder="01-234-5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-responsable">Responsable</Label>
                  <Input
                    id="new-responsable"
                    value={newLocal.responsable}
                    onChange={(e) => updateNewLocal("responsable", e.target.value)}
                    placeholder="María González"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-observaciones">Observaciones</Label>
                <Textarea
                  id="new-observaciones"
                  value={newLocal.observaciones || ""}
                  onChange={(e) => updateNewLocal("observaciones", e.target.value)}
                  placeholder="Información adicional del local..."
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelNewLocal}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveNewLocal}>
              <Save className="h-4 w-4 mr-2" />
              Crear Local
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el local "
              {locales.find(l => l.id === deletingLocalId)?.nombre}".
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
