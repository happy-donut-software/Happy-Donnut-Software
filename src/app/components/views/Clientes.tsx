import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import {
  Users,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import {
  getClientes,
  addCliente,
  updateCliente,
  deleteCliente,
  getNextId,
  type Cliente
} from "../../lib/storage";

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = () => {
    const todosClientes = getClientes();
    setClientes(todosClientes);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Cliente | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Cliente | null>(null);

  const [formData, setFormData] = useState({
    tipoDocumento: "DNI" as "DNI" | "RUC",
    numeroDocumento: "",
    nombreCompleto: "",
    telefono: "",
    email: "",
    direccion: "",
    observaciones: "",
    estado: "Activo" as "Activo" | "Inactivo",
  });

  // Filtrar clientes
  const clientesFiltrados = clientes.filter((cliente) => {
    const matchSearch =
      cliente.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.numeroDocumento.includes(searchTerm);
    return matchSearch;
  });

  // Estadísticas
  const totalClientes = clientes.length;
  const clientesActivos = clientes.filter((c) => c.estado === "Activo").length;

  const handleNuevo = () => {
    setEditingItem(null);
    setFormData({
      tipoDocumento: "DNI",
      numeroDocumento: "",
      nombreCompleto: "",
      telefono: "",
      email: "",
      direccion: "",
      observaciones: "",
      estado: "Activo",
    });
    setShowDialog(true);
  };

  const handleEdit = (item: Cliente) => {
    setEditingItem(item);
    setFormData({
      tipoDocumento: item.tipoDocumento,
      numeroDocumento: item.numeroDocumento,
      nombreCompleto: item.nombreCompleto,
      telefono: item.telefono,
      email: item.email,
      direccion: item.direccion,
      observaciones: item.observaciones || "",
      estado: item.estado,
    });
    setShowDialog(true);
  };

  const handleDelete = (item: Cliente) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteCliente(itemToDelete.id);
      loadClientes();
      window.dispatchEvent(new Event('clientes-updated'));
      toast.success("Cliente eliminado correctamente");
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const handleSubmit = () => {
    // Validaciones
    if (!formData.numeroDocumento.trim()) {
      toast.error("El número de documento es obligatorio");
      return;
    }

    if (!formData.nombreCompleto.trim()) {
      toast.error("El nombre/razón social es obligatorio");
      return;
    }

    // Validar longitud según tipo de documento
    if (formData.tipoDocumento === "DNI" && formData.numeroDocumento.length !== 8) {
      toast.error("El DNI debe tener 8 dígitos");
      return;
    }

    if (formData.tipoDocumento === "RUC" && formData.numeroDocumento.length !== 11) {
      toast.error("El RUC debe tener 11 dígitos");
      return;
    }

    const now = new Date();
    const fechaRegistro = now.toISOString().split('T')[0];

    if (editingItem) {
      // Editar
      const clienteActualizado: Cliente = {
        id: editingItem.id,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        nombreCompleto: formData.nombreCompleto,
        direccion: formData.direccion,
        telefono: formData.telefono,
        email: formData.email,
        estado: formData.estado,
        fechaRegistro: editingItem.fechaRegistro,
        cantidadCompras: editingItem.cantidadCompras || 0,
        observaciones: formData.observaciones.trim() || undefined
      };
      updateCliente(editingItem.id, clienteActualizado);
      toast.success("Cliente actualizado correctamente");
    } else {
      // Crear nuevo
      const nuevoCliente: Cliente = {
        id: getNextId(getClientes()),
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        nombreCompleto: formData.nombreCompleto,
        direccion: formData.direccion,
        telefono: formData.telefono,
        email: formData.email,
        estado: formData.estado,
        fechaRegistro: fechaRegistro,
        cantidadCompras: 0,
        observaciones: formData.observaciones.trim() || undefined
      };
      addCliente(nuevoCliente);
      toast.success("Cliente registrado correctamente");
    }

    loadClientes();
    window.dispatchEvent(new Event('clientes-updated'));
    setShowDialog(false);
  };

  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl flex items-center gap-2">
            <Users className="h-8 w-8 text-yellow-600" />
            Clientes
          </h1>
          <p className="text-muted-foreground">
            Gestiona la información de tus clientes
          </p>
        </div>
        <Button onClick={handleNuevo} className="bg-yellow-600 hover:bg-yellow-700">
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <div className="text-2xl">{totalClientes}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Clientes Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              <div className="text-2xl">{clientesActivos}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda y tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Todos los clientes registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabla */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Nombre/Razón Social</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Compras</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron clientes
                    </TableCell>
                  </TableRow>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{cliente.tipoDocumento}</span>
                          <span className="text-xs text-muted-foreground">
                            {cliente.numeroDocumento}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{cliente.nombreCompleto}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {cliente.telefono || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {cliente.email || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{cliente.cantidadCompras || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={cliente.estado === "Activo" ? "default" : "secondary"}
                          className={
                            cliente.estado === "Activo"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {cliente.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(cliente)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cliente)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground">
            Mostrando {clientesFiltrados.length} de {totalClientes} clientes
          </div>
        </CardContent>
      </Card>

      {/* Dialog Nuevo/Editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Cliente" : "Nuevo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Modifica la información del cliente"
                : "Registra un nuevo cliente en el sistema"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tipo de Documento */}
            <div className="space-y-2">
              <Label>Tipo de Documento *</Label>
              <Select
                value={formData.tipoDocumento}
                onValueChange={(value: "DNI" | "RUC") => updateFormData("tipoDocumento", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="RUC">RUC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Número de Documento */}
            <div className="space-y-2">
              <Label>Número de {formData.tipoDocumento} *</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.numeroDocumento}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    updateFormData("numeroDocumento", value);
                  }}
                  maxLength={formData.tipoDocumento === "DNI" ? 8 : 11}
                  placeholder={formData.tipoDocumento === "DNI" ? "Ej: 72345678" : "Ej: 20123456789"}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Nombre/Razón Social */}
            <div className="space-y-2">
              <Label>Nombre/Razón Social *</Label>
              <Input
                value={formData.nombreCompleto}
                onChange={(e) => updateFormData("nombreCompleto", e.target.value)}
                placeholder="Ej: Juan Pérez García"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.telefono}
                  onChange={(e) => updateFormData("telefono", e.target.value)}
                  placeholder="Ej: 987654321"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="Ej: correo@ejemplo.com"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label>Dirección</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.direccion}
                  onChange={(e) => updateFormData("direccion", e.target.value)}
                  placeholder="Ej: Av. Principal 123, Lima"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label>Estado *</Label>
              <Select
                value={formData.estado}
                onValueChange={(value: "Activo" | "Inactivo") =>
                  updateFormData("estado", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-yellow-600 hover:bg-yellow-700">
              {editingItem ? "Guardar Cambios" : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar Cliente?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a{" "}
              <strong>{itemToDelete?.nombreCompleto}</strong>? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
