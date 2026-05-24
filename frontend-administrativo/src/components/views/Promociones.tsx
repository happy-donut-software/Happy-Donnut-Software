import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Search, Plus, Eye, Trash2, Tag, ShoppingBag, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { 
  getPromociones, 
  deletePromocion, 
  updatePromocion,
  type Promocion 
} from "../../lib/storage";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

export function Promociones() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [deletingPromocionId, setDeletingPromocionId] = useState<number | null>(null);
  const [viewingPromocion, setViewingPromocion] = useState<Promocion | null>(null);

  useEffect(() => {
    loadPromociones();
  }, []);

  const loadPromociones = () => {
    const data = getPromociones();
    setPromociones(data);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingPromocionId(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deletingPromocionId) {
      const promocion = promociones.find(p => p.id === deletingPromocionId);
      deletePromocion(deletingPromocionId);
      loadPromociones();
      setShowDeleteDialog(false);
      setDeletingPromocionId(null);
      toast.success(`Promoción "${promocion?.nombre}" eliminada exitosamente`);
    }
  };

  const handleToggleActivo = (id: number, currentState: boolean) => {
    const promocion = promociones.find(p => p.id === id);
    if (promocion) {
      const updatedPromocion = { ...promocion, activo: !currentState };
      updatePromocion(id, updatedPromocion);
      loadPromociones();
      toast.success(`Promoción ${!currentState ? 'activada' : 'desactivada'} exitosamente`);
    }
  };

  const handleViewClick = (promocion: Promocion) => {
    setViewingPromocion(promocion);
    setShowViewDialog(true);
  };

  const filteredPromociones = promociones.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.productos.some(prod => prod.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const promocionesActivas = promociones.filter(p => p.activo).length;
  const promocionesInactivas = promociones.filter(p => !p.activo).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary">Promociones</h1>
          <p className="text-muted-foreground">
            Gestiona las promociones de productos
          </p>
        </div>
        <Button onClick={() => window.location.hash = '#nueva-promocion'}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Promoción
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Promociones</CardTitle>
            <Tag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{promociones.length}</div>
            <p className="text-xs text-muted-foreground">
              Promociones registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Activas</CardTitle>
            <ShoppingBag className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{promocionesActivas}</div>
            <p className="text-xs text-muted-foreground">
              Disponibles para venta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Inactivas</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-muted-foreground">{promocionesInactivas}</div>
            <p className="text-xs text-muted-foreground">
              No disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda y Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre de promoción o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Promociones */}
      <Card>
        <CardHeader>
          <CardTitle>
            Listado de Promociones ({filteredPromociones.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPromociones.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No se encontraron promociones" : "No hay promociones registradas"}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => window.location.hash = '#nueva-promocion'} 
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Promoción
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Promoción</TableHead>
                    <TableHead>Productos Incluidos</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado por</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromociones.map((promocion) => (
                    <TableRow key={promocion.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{promocion.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(promocion.fechaCreacion).toLocaleDateString('es-PE')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {promocion.productos.map((prod, idx) => (
                            <div key={idx} className="text-sm">
                              {prod.cantidad}x {prod.nombre}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">S/ {promocion.precioPromocion.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={promocion.activo}
                            onCheckedChange={() => handleToggleActivo(promocion.id, promocion.activo)}
                          />
                          <Badge variant={promocion.activo ? "default" : "secondary"}>
                            {promocion.activo ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{promocion.usuario}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewClick(promocion)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(promocion.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Confirmación de Eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Promoción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La promoción será eliminada permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de Vista Detallada */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Promoción</DialogTitle>
            <DialogDescription>
              Información completa de la promoción
            </DialogDescription>
          </DialogHeader>
          
          {viewingPromocion && (
            <div className="space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nombre</Label>
                  <p className="font-medium">{viewingPromocion.nombre}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Precio</Label>
                  <p className="font-medium">S/ {viewingPromocion.precioPromocion.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <div className="mt-1">
                    <Badge variant={viewingPromocion.activo ? "default" : "secondary"}>
                      {viewingPromocion.activo ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha de Creación</Label>
                  <p className="font-medium">
                    {new Date(viewingPromocion.fechaCreacion).toLocaleDateString('es-PE')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Creado por</Label>
                  <p className="font-medium">{viewingPromocion.usuario}</p>
                </div>
              </div>

              {/* Productos Incluidos */}
              <div>
                <Label className="text-muted-foreground mb-2 block">Productos Incluidos</Label>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingPromocion.productos.map((prod, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{prod.nombre}</TableCell>
                          <TableCell className="text-right">{prod.cantidad}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
