import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Search, Edit, Trash2, Plus, Save, X, Tags, Package } from "lucide-react";
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
import { toast } from "sonner";

interface Categoria {
  categoria_id: number;
  nombre_categoria: string;
  descripcion?: string;
  created_at?: string;
  updated_at?: string;
  itemsCount?: number;
}

export function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newCategoria, setNewCategoria] = useState<Categoria | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [deletingCategoriaId, setDeletingCategoriaId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const response = await fetch('/api/ventas/categorias', {
        headers: { Accept: 'application/json' }
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || data?.error || `Error ${response.status}`);
      }

      const categoriasApi = Array.isArray(data.categorias) ? data.categorias : [];
      setCategorias(categoriasApi.map((categoria: any) => ({
        categoria_id: categoria.id,
        nombre_categoria: categoria.nombre,
        descripcion: categoria.descripcion || '',
        itemsCount: Number(categoria.productos_count || 0)
      })));
    } catch (error) {
      console.error('Error cargando categorías:', error);
      toast.error(error instanceof Error ? error.message : 'No se pudieron cargar las categorías');
    }
  };

  const filteredCategorias = categorias.filter(cat => 
    cat.nombre_categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.descripcion && cat.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria({ ...categoria });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (editingCategoria) {
      if (!editingCategoria.nombre_categoria.trim()) {
        toast.error("El nombre de la categoría es obligatorio");
        return;
      }
      
      try {
        const response = await fetch(`/api/ventas/categorias/${editingCategoria.categoria_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: editingCategoria.nombre_categoria,
            descripcion: editingCategoria.descripcion || ''
          }),
        });

        if (response.ok) {
          await loadCategorias();
          setShowEditDialog(false);
          setEditingCategoria(null);
          toast.success("Categoría actualizada exitosamente");
        } else {
          let errorMessage = `Error ${response.status}`;
          try {
            const errorData = await response.json();
            if (errorData?.message) errorMessage = errorData.message;
          } catch {}
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error('Error actualizando categoría:', error);
        toast.error('Error de conexión actualizando categoría');
      }
    }
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingCategoria(null);
  };

  const handleNewCategoria = () => {
    const emptyCategoria: Categoria = {
      categoria_id: 0,
      nombre_categoria: "",
      descripcion: "",
      itemsCount: 0
    };
    setNewCategoria(emptyCategoria);
    setShowNewDialog(true);
  };

  const handleSaveNewCategoria = async () => {
    if (newCategoria) {
      if (!newCategoria.nombre_categoria.trim()) {
        toast.error("El nombre de la categoría es obligatorio");
        return;
      }
      
      try {
        const response = await fetch('/api/ventas/categorias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: newCategoria.nombre_categoria,
            descripcion: newCategoria.descripcion || ''
          }),
        });

        if (response.ok) {
          await loadCategorias();
          setShowNewDialog(false);
          setNewCategoria(null);
          toast.success(`Categoría "${newCategoria.nombre_categoria}" creada exitosamente`);
        } else {
          let errorMessage = `Error ${response.status}`;
          try {
            const errorData = await response.json();
            if (errorData?.message) errorMessage = errorData.message;
          } catch {}
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error('Error creando categoría:', error);
        toast.error('Error de conexión creando categoría');
      }
    }
  };

  const handleCancelNewCategoria = () => {
    setShowNewDialog(false);
    setNewCategoria(null);
  };

  const handleDeleteClick = (id: number) => {
    console.log('handleDeleteClick llamado con id:', id);
    console.log('Categorías disponibles:', categorias);
    
    const categoria = categorias.find(c => c.categoria_id === id);
    if (categoria && categoria.itemsCount > 0) {
      toast.error(`No se puede eliminar una categoría que tiene productos asociados`);
      return;
    }
    setDeletingCategoriaId(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    console.log('handleConfirmDelete llamado, deletingCategoriaId:', deletingCategoriaId);
    
    if (deletingCategoriaId) {
      const categoria = categorias.find(c => c.categoria_id === deletingCategoriaId);
      
      try {
        const url = `/api/ventas/categorias/${deletingCategoriaId}`;
        console.log('URL de DELETE:', url);
        
        const response = await fetch(url, {
          method: 'DELETE',
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        const responseData = await response.json().catch(() => ({}));
        console.log('Response data:', responseData);

        if (response.ok) {
          await loadCategorias();
          setShowDeleteDialog(false);
          setDeletingCategoriaId(null);
          toast.success(`Categoría "${categoria?.nombre_categoria}" eliminada exitosamente`);
        } else {
          let errorMessage = `Error ${response.status}`;
          if (responseData?.message) errorMessage = responseData.message;
          if (responseData?.error) errorMessage = responseData.error;
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error('Error eliminando categoría:', error);
        toast.error('Error de conexión eliminando categoría');
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletingCategoriaId(null);
  };

  const updateEditingCategoria = (field: keyof Categoria, value: any) => {
    if (editingCategoria) {
      setEditingCategoria({ ...editingCategoria, [field]: value });
    }
  };

  const updateNewCategoria = (field: keyof Categoria, value: any) => {
    if (newCategoria) {
      setNewCategoria({ ...newCategoria, [field]: value });
    }
  };

  const totalCategorias = categorias.length;
  const categoriasActivas = categorias.length; // Todas están activas por ahora
  const totalProductos = categorias.reduce((sum, c) => sum + (c.itemsCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Categorías de Productos</h1>
          <p className="text-muted-foreground">Gestión de categorías para productos</p>
        </div>
        <Button onClick={handleNewCategoria}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Tags className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl">{totalCategorias}</div>
                <p className="text-sm text-muted-foreground">Total Categorías</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl text-green-600">{totalProductos}</div>
                <p className="text-sm text-muted-foreground">Total Productos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary">✓</span>
              </div>
              <div>
                <div className="text-2xl text-primary">{categoriasActivas}</div>
                <p className="text-sm text-muted-foreground">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categorías..."
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
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">N° Productos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategorias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No se encontraron categorías
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategorias.map((cat) => (
                  <TableRow key={cat.categoria_id}>
                    <TableCell>{cat.nombre_categoria}</TableCell>
                    <TableCell className="text-muted-foreground">{cat.descripcion || 'Sin descripción'}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{cat.itemsCount || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">
                        Activa
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(cat)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(cat.categoria_id)}
                          disabled={(cat.itemsCount || 0) > 0}
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

      {/* Diálogo de Edición */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>
              Modifica la información de la categoría
            </DialogDescription>
          </DialogHeader>
          {editingCategoria && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre de la Categoría</Label>
                <Input
                  id="edit-nombre"
                  value={editingCategoria.nombre_categoria}
                  onChange={(e) => updateEditingCategoria('nombre_categoria', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <Textarea
                  id="edit-descripcion"
                  value={editingCategoria.descripcion || ''}
                  onChange={(e) => updateEditingCategoria('descripcion', e.target.value)}
                  rows={3}
                  placeholder="Describe brevemente esta categoría..."
                />
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Productos asociados:</strong> {editingCategoria.itemsCount || 0}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Nueva Categoría */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nueva Categoría</DialogTitle>
            <DialogDescription>
              Agrega una nueva categoría de productos
            </DialogDescription>
          </DialogHeader>
          {newCategoria && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-nombre">Nombre de la Categoría</Label>
                <Input
                  id="new-nombre"
                  value={newCategoria.nombre_categoria}
                  onChange={(e) => updateNewCategoria('nombre_categoria', e.target.value)}
                  placeholder="Ej: Donas, Frapes, Bebidas, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-descripcion">Descripción</Label>
                <Textarea
                  id="new-descripcion"
                  value={newCategoria.descripcion}
                  onChange={(e) => updateNewCategoria('descripcion', e.target.value)}
                  rows={3}
                  placeholder="Describe brevemente esta categoría..."
                />
              </div>

              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 Las categorías te ayudan a organizar mejor tu inventario de productos
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelNewCategoria}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleSaveNewCategoria}>
              <Save className="mr-2 h-4 w-4" />
              Crear Categoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La categoría será eliminada permanentemente del sistema.
              {deletingCategoriaId && (() => {
                const cat = categorias.find(c => c.categoria_id === deletingCategoriaId);
                return (
                  <span className="block mt-2">
                    <strong>Categoría: </strong>
                    {cat?.nombre_categoria}
                  </span>
                );
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
