import { useState } from "react";
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
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface ClienteProveedor {
  id: string;
  tipo: "Cliente" | "Proveedor";
  numeroDocumento: string;
  nombreRazonSocial: string;
  telefono: string;
  email: string;
  direccion: string;
  estado: "Activo" | "Inactivo";
}

export function ClientesProveedores() {
  const [registros, setRegistros] = useState<ClienteProveedor[]>([
    {
      id: "1",
      tipo: "Cliente",
      numeroDocumento: "72345678",
      nombreRazonSocial: "Juan Pérez García",
      telefono: "987654321",
      email: "juan.perez@email.com",
      direccion: "Av. Principal 123, Lima",
      estado: "Activo",
    },
    {
      id: "2",
      tipo: "Proveedor",
      numeroDocumento: "20123456789",
      nombreRazonSocial: "Distribuidora Don Miguel S.A.C.",
      telefono: "014567890",
      email: "ventas@donmiguel.com",
      direccion: "Jr. Los Proveedores 456, Lima",
      estado: "Activo",
    },
    {
      id: "3",
      tipo: "Cliente",
      numeroDocumento: "45678901",
      nombreRazonSocial: "María López Sánchez",
      telefono: "965432187",
      email: "maria.lopez@email.com",
      direccion: "Calle Las Flores 789, Lima",
      estado: "Activo",
    },
  ]);

  const [filtroTipo, setFiltroTipo] = useState<"Todos" | "Cliente" | "Proveedor">("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ClienteProveedor | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ClienteProveedor | null>(null);

  const [formData, setFormData] = useState<Omit<ClienteProveedor, "id">>({
    tipo: "Cliente",
    numeroDocumento: "",
    nombreRazonSocial: "",
    telefono: "",
    email: "",
    direccion: "",
    estado: "Activo",
  });

  // Filtrar registros
  const registrosFiltrados = registros.filter((registro) => {
    const matchTipo = filtroTipo === "Todos" || registro.tipo === filtroTipo;
    const matchSearch =
      registro.nombreRazonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.numeroDocumento.includes(searchTerm);
    return matchTipo && matchSearch;
  });

  // Estadísticas
  const totalClientes = registros.filter((r) => r.tipo === "Cliente").length;
  const totalProveedores = registros.filter((r) => r.tipo === "Proveedor").length;

  const handleNuevo = () => {
    setEditingItem(null);
    setFormData({
      tipo: "Cliente",
      numeroDocumento: "",
      nombreRazonSocial: "",
      telefono: "",
      email: "",
      direccion: "",
      estado: "Activo",
    });
    setShowDialog(true);
  };

  const handleEdit = (item: ClienteProveedor) => {
    setEditingItem(item);
    setFormData({
      tipo: item.tipo,
      numeroDocumento: item.numeroDocumento,
      nombreRazonSocial: item.nombreRazonSocial,
      telefono: item.telefono,
      email: item.email,
      direccion: item.direccion,
      estado: item.estado,
    });
    setShowDialog(true);
  };

  const handleDelete = (item: ClienteProveedor) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setRegistros(registros.filter((r) => r.id !== itemToDelete.id));
      toast.success(`${itemToDelete.tipo} eliminado correctamente`);
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

    if (!formData.nombreRazonSocial.trim()) {
      toast.error("El nombre/razón social es obligatorio");
      return;
    }

    // Validar longitud del documento
    if (formData.tipo === "Cliente" && formData.numeroDocumento.length !== 8) {
      toast.error("El DNI debe tener 8 dígitos");
      return;
    }

    if (formData.tipo === "Proveedor" && formData.numeroDocumento.length !== 11) {
      toast.error("El RUC debe tener 11 dígitos");
      return;
    }

    if (editingItem) {
      // Editar
      setRegistros(
        registros.map((r) =>
          r.id === editingItem.id ? { ...formData, id: editingItem.id } : r
        )
      );
      toast.success(`${formData.tipo} actualizado correctamente`);
    } else {
      // Crear nuevo
      const nuevoRegistro: ClienteProveedor = {
        ...formData,
        id: Date.now().toString(),
      };
      setRegistros([...registros, nuevoRegistro]);
      toast.success(`${formData.tipo} registrado correctamente`);
    }

    setShowDialog(false);
  };

  const updateFormData = (field: keyof typeof formData, value: any) => {
    const updatedData = { ...formData, [field]: value };

    // Si cambia el tipo, limpiar el número de documento
    if (field === "tipo") {
      updatedData.numeroDocumento = "";
    }

    setFormData(updatedData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl flex items-center gap-2">
            <Users className="h-8 w-8 text-yellow-600" />
            Clientes y Proveedores
          </h1>
          <p className="text-muted-foreground">
            Gestiona la información de tus clientes y proveedores
          </p>
        </div>
        <Button onClick={handleNuevo} className="bg-yellow-600 hover:bg-yellow-700">
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Registro
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{registros.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Clientes</CardTitle>
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
            <CardTitle className="text-sm">Proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-600" />
              <div className="text-2xl">{totalProveedores}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Mostrar Todos</CardTitle>
          <CardDescription>Lista completa de clientes y proveedores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroTipo} onValueChange={(value: any) => setFiltroTipo(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Cliente">Solo Clientes</SelectItem>
                <SelectItem value="Proveedor">Solo Proveedores</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Nombre / Razón Social</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron registros
                    </TableCell>
                  </TableRow>
                ) : (
                  registrosFiltrados.map((registro) => (
                    <TableRow key={registro.id}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            registro.tipo === "Cliente"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                          }
                        >
                          {registro.tipo === "Cliente" ? (
                            <User className="h-3 w-3 mr-1" />
                          ) : (
                            <Building2 className="h-3 w-3 mr-1" />
                          )}
                          {registro.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {registro.tipo === "Cliente" ? "DNI" : "RUC"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {registro.numeroDocumento}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{registro.nombreRazonSocial}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {registro.telefono || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {registro.email || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={registro.estado === "Activo" ? "default" : "secondary"}
                          className={
                            registro.estado === "Activo"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {registro.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(registro)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(registro)}
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
            Mostrando {registrosFiltrados.length} de {registros.length} registros
          </div>
        </CardContent>
      </Card>

      {/* Dialog Nuevo/Editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Registro" : "Nuevo Registro"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Modifica la información del registro"
                : "Registra un nuevo cliente o proveedor"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tipo de Registro */}
            <div className="space-y-2">
              <Label>Tipo de Registro *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: "Cliente" | "Proveedor") =>
                  updateFormData("tipo", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cliente">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Cliente
                    </div>
                  </SelectItem>
                  <SelectItem value="Proveedor">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Proveedor
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.tipo === "Cliente"
                  ? "📄 Los clientes se registran con DNI (8 dígitos)"
                  : "🏢 Los proveedores se registran con RUC (11 dígitos)"}
              </p>
            </div>

            {/* Número de Documento */}
            <div className="space-y-2">
              <Label>
                Número de {formData.tipo === "Cliente" ? "DNI" : "RUC"} *
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.numeroDocumento}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    updateFormData("numeroDocumento", value);
                  }}
                  maxLength={formData.tipo === "Cliente" ? 8 : 11}
                  placeholder={
                    formData.tipo === "Cliente" ? "Ej: 72345678" : "Ej: 20123456789"
                  }
                  className="pl-10"
                />
              </div>
            </div>

            {/* Nombre/Razón Social */}
            <div className="space-y-2">
              <Label>
                {formData.tipo === "Cliente" ? "Nombre Completo" : "Razón Social"} *
              </Label>
              <Input
                value={formData.nombreRazonSocial}
                onChange={(e) => updateFormData("nombreRazonSocial", e.target.value)}
                placeholder={
                  formData.tipo === "Cliente"
                    ? "Ej: Juan Pérez García"
                    : "Ej: Distribuidora Don Miguel S.A.C."
                }
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
            <DialogTitle>¿Eliminar {itemToDelete?.tipo}?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a{" "}
              <strong>{itemToDelete?.nombreRazonSocial}</strong>? Esta acción no se puede
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
