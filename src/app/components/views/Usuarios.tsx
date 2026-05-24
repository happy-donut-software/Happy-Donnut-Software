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
import { Search, Edit, Trash2, Plus, Save, X, User, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Usuario {
  id: number;
  nombreCompleto: string;
  usuario: string;
  contraseña: string;
  rol: "Administrador" | "Empleado";
  estado: "Activo" | "Inactivo";
  fechaCreacion: string;
  ultimoAcceso?: string;
}

const usuariosIniciales: Usuario[] = [
  {
    id: 1,
    nombreCompleto: "Administrador del Sistema",
    usuario: "admin",
    contraseña: "admin123",
    rol: "Administrador",
    estado: "Activo",
    fechaCreacion: "2025-01-01",
    ultimoAcceso: "2025-11-10 14:30"
  },
  {
    id: 2,
    nombreCompleto: "Empleado de Ventas",
    usuario: "empleado",
    contraseña: "emp123",
    rol: "Empleado",
    estado: "Activo",
    fechaCreacion: "2025-01-15",
    ultimoAcceso: "2025-11-10 09:15"
  }
];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciales);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newUsuario, setNewUsuario] = useState<Usuario | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [deletingUsuarioId, setDeletingUsuarioId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({});

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRolBadge = (rol: Usuario["rol"]) => {
    if (rol === "Administrador") {
      return <Badge className="bg-purple-600 text-white hover:bg-purple-700">Administrador</Badge>;
    }
    return <Badge className="bg-green-600 text-white hover:bg-green-700">Empleado</Badge>;
  };

  const togglePasswordVisibility = (id: number) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario({ ...usuario });
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingUsuario) {
      if (!editingUsuario.nombreCompleto.trim()) {
        toast.error("El nombre completo es obligatorio");
        return;
      }
      if (!editingUsuario.usuario.trim()) {
        toast.error("El nombre de usuario es obligatorio");
        return;
      }
      if (!editingUsuario.contraseña.trim()) {
        toast.error("La contraseña es obligatoria");
        return;
      }
      if (editingUsuario.contraseña.length < 6) {
        toast.error("La contraseña debe tener al menos 6 caracteres");
        return;
      }

      // Verificar usuario duplicado
      const usuarioDuplicado = usuarios.find(
        u => u.usuario === editingUsuario.usuario && u.id !== editingUsuario.id
      );
      if (usuarioDuplicado) {
        toast.error("Ya existe un usuario con ese nombre de usuario");
        return;
      }

      setUsuarios(usuarios.map(u => u.id === editingUsuario.id ? editingUsuario : u));
      setShowEditDialog(false);
      setEditingUsuario(null);
      toast.success("Usuario actualizado exitosamente");
    }
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingUsuario(null);
  };

  const handleNewUsuario = () => {
    const emptyUsuario: Usuario = {
      id: Math.max(...usuarios.map(u => u.id), 0) + 1,
      nombreCompleto: "",
      usuario: "",
      contraseña: "",
      rol: "Empleado",
      estado: "Activo",
      fechaCreacion: new Date().toISOString().split('T')[0]
    };
    setNewUsuario(emptyUsuario);
    setShowNewDialog(true);
  };

  const handleSaveNewUsuario = () => {
    if (newUsuario) {
      if (!newUsuario.nombreCompleto.trim()) {
        toast.error("El nombre completo es obligatorio");
        return;
      }
      if (!newUsuario.usuario.trim()) {
        toast.error("El nombre de usuario es obligatorio");
        return;
      }
      if (!newUsuario.contraseña.trim()) {
        toast.error("La contraseña es obligatoria");
        return;
      }
      if (newUsuario.contraseña.length < 6) {
        toast.error("La contraseña debe tener al menos 6 caracteres");
        return;
      }

      // Verificar usuario duplicado
      const usuarioDuplicado = usuarios.find(u => u.usuario === newUsuario.usuario);
      if (usuarioDuplicado) {
        toast.error("Ya existe un usuario con ese nombre de usuario");
        return;
      }

      setUsuarios([...usuarios, newUsuario]);
      setShowNewDialog(false);
      setNewUsuario(null);
      toast.success(`Usuario "${newUsuario.nombreCompleto}" creado exitosamente`);
    }
  };

  const handleCancelNewUsuario = () => {
    setShowNewDialog(false);
    setNewUsuario(null);
  };

  const handleDeleteClick = (id: number) => {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario?.usuario === "admin") {
      toast.error("No se puede eliminar el usuario administrador principal");
      return;
    }
    setDeletingUsuarioId(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deletingUsuarioId) {
      const usuario = usuarios.find(u => u.id === deletingUsuarioId);
      setUsuarios(usuarios.filter(u => u.id !== deletingUsuarioId));
      setShowDeleteDialog(false);
      setDeletingUsuarioId(null);
      toast.success(`Usuario "${usuario?.nombreCompleto}" eliminado exitosamente`);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletingUsuarioId(null);
  };

  const updateEditingUsuario = (field: keyof Usuario, value: any) => {
    if (editingUsuario) {
      setEditingUsuario({ ...editingUsuario, [field]: value });
    }
  };

  const updateNewUsuario = (field: keyof Usuario, value: any) => {
    if (newUsuario) {
      setNewUsuario({ ...newUsuario, [field]: value });
    }
  };

  const totalActivos = usuarios.filter(u => u.estado === "Activo").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Usuarios del Sistema</h1>
          <p className="text-muted-foreground">
            Gestión de usuarios y permisos de acceso
          </p>
        </div>
        <Button onClick={handleNewUsuario}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl">{usuarios.length}</div>
            <p className="text-sm text-muted-foreground">Total Usuarios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-green-600">{totalActivos}</div>
            <p className="text-sm text-muted-foreground">Usuarios Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-purple-600">
              {usuarios.filter(u => u.rol === "Administrador").length}
            </div>
            <p className="text-sm text-muted-foreground">Administradores</p>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados ({filteredUsuarios.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsuarios.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron usuarios</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Contraseña</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {usuario.nombreCompleto}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{usuario.usuario}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {showPasswords[usuario.id] ? usuario.contraseña : "••••••••"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(usuario.id)}
                          className="h-6 w-6 p-0"
                        >
                          {showPasswords[usuario.id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getRolBadge(usuario.rol)}</TableCell>
                    <TableCell>
                      {usuario.estado === "Activo" ? (
                        <Badge variant="default">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {usuario.ultimoAcceso || "Nunca"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(usuario)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {usuario.usuario !== "admin" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(usuario.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Información de Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Permisos por Rol
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-600 text-white">Administrador</Badge>
              </div>
              <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                <li>• Acceso completo al sistema</li>
                <li>• Gestión de usuarios y configuración</li>
                <li>• Visualización de todos los módulos</li>
                <li>• Control total de inventario y ventas</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600 text-white">Empleado</Badge>
              </div>
              <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                <li>• Gestión de ventas y comprobantes</li>
                <li>• Apertura y cierre de caja</li>
                <li>• Generación de notas de salida</li>
                <li>• Sin acceso a configuración del sistema</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Editar Usuario */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario
            </DialogDescription>
          </DialogHeader>
          {editingUsuario && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre Completo *</Label>
                <Input
                  id="edit-nombre"
                  value={editingUsuario.nombreCompleto}
                  onChange={(e) => updateEditingUsuario("nombreCompleto", e.target.value)}
                  placeholder="Juan Pérez García"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-usuario">Usuario *</Label>
                <Input
                  id="edit-usuario"
                  value={editingUsuario.usuario}
                  onChange={(e) => updateEditingUsuario("usuario", e.target.value.toLowerCase())}
                  placeholder="jperez"
                  disabled={editingUsuario.usuario === "admin"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contraseña">Contraseña *</Label>
                <Input
                  id="edit-contraseña"
                  type="text"
                  value={editingUsuario.contraseña}
                  onChange={(e) => updateEditingUsuario("contraseña", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rol">Rol</Label>
                <select
                  id="edit-rol"
                  value={editingUsuario.rol}
                  onChange={(e) => updateEditingUsuario("rol", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                  disabled={editingUsuario.usuario === "admin"}
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Empleado">Empleado</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-estado">Estado</Label>
                <select
                  id="edit-estado"
                  value={editingUsuario.estado}
                  onChange={(e) => updateEditingUsuario("estado", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                  disabled={editingUsuario.usuario === "admin"}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
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

      {/* Dialog para Nuevo Usuario */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Crea un nuevo usuario del sistema
            </DialogDescription>
          </DialogHeader>
          {newUsuario && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-nombre">Nombre Completo *</Label>
                <Input
                  id="new-nombre"
                  value={newUsuario.nombreCompleto}
                  onChange={(e) => updateNewUsuario("nombreCompleto", e.target.value)}
                  placeholder="Juan Pérez García"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-usuario">Usuario *</Label>
                <Input
                  id="new-usuario"
                  value={newUsuario.usuario}
                  onChange={(e) => updateNewUsuario("usuario", e.target.value.toLowerCase())}
                  placeholder="jperez"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-contraseña">Contraseña *</Label>
                <Input
                  id="new-contraseña"
                  type="text"
                  value={newUsuario.contraseña}
                  onChange={(e) => updateNewUsuario("contraseña", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-rol">Rol</Label>
                <select
                  id="new-rol"
                  value={newUsuario.rol}
                  onChange={(e) => updateNewUsuario("rol", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Empleado">Empleado</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelNewUsuario}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveNewUsuario}>
              <Save className="h-4 w-4 mr-2" />
              Crear Usuario
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
              Esta acción eliminará permanentemente al usuario "
              {usuarios.find(u => u.id === deletingUsuarioId)?.nombreCompleto}".
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
