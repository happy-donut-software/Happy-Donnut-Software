import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Search, Edit, Trash2, Plus, Save, X } from "lucide-react";
import { productosAPI } from "../../src/services/api";
import type { Producto as ProductoType } from "../../src/types/inventario.types";
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
import { toast } from "sonner";

interface ProductosProps {
  userRole?: "Administrador" | "Empleado";
}

export function Productos({ userRole = "Administrador" }: ProductosProps) {
  const [productos, setProductos] = useState<ProductoType[]>([]);
  const [categoriasProductos, setCategoriasProductos] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductoType | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newProduct, setNewProduct] = useState<ProductoType | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Cargar productos y categorías al montar el componente
  useEffect(() => {
    loadProductos();
    loadCategorias();
  }, []);

  const loadProductos = async () => {
    try {
      const response = await productosAPI.getProductos();
      setProductos(response.data);
    } catch (error) {
      console.error('Error cargando productos:', error);
      toast.error('Error al cargar productos');
    }
  };

  const loadCategorias = async () => {
    try {
      const response = await productosAPI.getCategorias();
      const categoriasData = response.data;
      const nombresActivos = categoriasData
        .filter((c: any) => c.estado === "Activa")
        .map((c: any) => c.nombre);
      setCategoriasProductos(nombresActivos);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      toast.error('Error al cargar categorías');
    }
  };

  const filteredProductos = productos.filter(prod =>
    prod.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (producto: ProductoType) => {
    setEditingProduct({ ...producto });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (editingProduct) {
      try {
        await productosAPI.updateProducto(editingProduct.id, editingProduct);
        await loadProductos();
        setShowEditDialog(false);
        setEditingProduct(null);
        toast.success("Producto actualizado exitosamente");
      } catch (error) {
        console.error('Error actualizando producto:', error);
        toast.error('Error al actualizar producto');
      }
    }
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingProduct(null);
  };

  const handleNewProduct = () => {
    const emptyProduct: ProductoType = {
      id: 0, // Se asignará en el backend
      nombre: "",
      categoria: categoriasProductos.length > 0 ? categoriasProductos[0] : "",
      tipo_producto: "No Preparado",
      precio: 0,
      stock: 0,
      estado: "Disponible"
    };
    setNewProduct(emptyProduct);
    setShowNewDialog(true);
  };

  const handleSaveNewProduct = async () => {
    if (newProduct) {
      if (!newProduct.nombre.trim()) {
        toast.error("El nombre del producto es obligatorio");
        return;
      }
      try {
        await productosAPI.createProducto(newProduct);
        await loadProductos();
        setShowNewDialog(false);
        setNewProduct(null);
        toast.success("Producto creado exitosamente");
      } catch ( error ) {
        console.error('Error creando producto:', error);
        toast.error('Error al crear producto');
      }
    }
  };

  const handleCancelNewProduct = () => {
    setShowNewDialog(false);
    setNewProduct(null);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingProductId(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingProductId) {
      try {
        const producto = productos.find(p => p.id === deletingProductId);
        await productosAPI.deleteProducto(deletingProductId);
        await loadProductos();
        setShowDeleteDialog(false);
        setDeletingProductId(null);
        toast.success(`Producto "${producto?.nombre}" eliminado exitosamente`);
      } catch (error) {
        console.error('Error eliminando producto:', error);
        toast.error('Error al eliminar producto');
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletingProductId(null);
  };

  const updateEditingProduct = (field: keyof ProductoType, value: any) => {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [field]: value });
    }
  };

  const updateNewProduct = (field: keyof ProductoType, value: any) => {
    if (newProduct) {
      setNewProduct({ ...newProduct, [field]: value });
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return "Agotado";
    if (stock < 20) return "Bajo Stock";
    return null;
  };

  const totalProductos = productos.length;
  const categorias = new Set(productos.map(p => p.categoria)).size;
  const stockTotal = productos.reduce((sum, p) => sum + p.stock, 0);
  const bajoStock = productos.filter(p => p.stock < 20 && p.stock > 0).length;

  const isReadOnly = userRole === "Empleado";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>{isReadOnly ? "Consultar Productos" : "Productos"}</h1>
          <p className="text-muted-foreground">
            {isReadOnly ? "Consulta de productos del negocio (solo lectura)" : "Gestión de productos del negocio"}
          </p>
        </div>
        {!isReadOnly && (
          <Button onClick={handleNewProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        )}
      </div>

      {/* Alerta informativa para empleados */}
      {isReadOnly && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Modo Solo Lectura</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Estás visualizando los productos en modo solo lectura. No puedes crear, editar o eliminar productos. Para gestionar el inventario, contacta a un administrador.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl">{totalProductos}</div>
            <p className="text-sm text-muted-foreground">Total Productos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-primary">{categorias}</div>
            <p className="text-sm text-muted-foreground">Categorías</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-secondary">{stockTotal}</div>
            <p className="text-sm text-muted-foreground">Stock Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-destructive">{bajoStock}</div>
            <p className="text-sm text-muted-foreground">Bajo Stock</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Estado</TableHead>
                {!isReadOnly && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductos.map((prod) => {
                const stockStatus = getStockStatus(prod.stock);
                return (
                  <TableRow key={prod.id}>
                    <TableCell>{prod.nombre}</TableCell>
                    <TableCell>{prod.categoria}</TableCell>
                    <TableCell className="text-right">S/. {prod.precio.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{prod.stock}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={prod.estado === "Disponible" ? "default" : "outline"}
                          className={prod.estado === "No Disponible" ? "bg-red-600 text-white border-red-600 hover:bg-red-700" : ""}
                        >
                          {prod.estado}
                        </Badge>
                        {stockStatus && (
                          <Badge 
                            className={stockStatus === "Agotado" ? "bg-red-600 text-white hover:bg-red-700" : "bg-orange-600 text-white hover:bg-orange-700"}
                          >
                            {stockStatus}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(prod)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteClick(prod.id)}
                          >
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

      {/* Diálogo de Edición */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Modifica la información del producto
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Producto</Label>
                <Input
                  id="nombre"
                  value={editingProduct.nombre}
                  onChange={(e) => updateEditingProduct('nombre', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select
                  value={editingProduct.categoria}
                  onValueChange={(value) => updateEditingProduct('categoria', value)}
                >
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasProductos.length > 0 ? (
                      categoriasProductos.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_empty" disabled>
                        No hay categorías disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio">Precio (S/.)</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  value={editingProduct.precio}
                  onChange={(e) => updateEditingProduct('precio', parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  💡 El stock se gestiona automáticamente con las Notas de Entrada y Salida
                </p>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <RadioGroup
                  value={editingProduct.estado}
                  onValueChange={(value) => updateEditingProduct('estado', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Disponible" id="disponible" />
                    <Label htmlFor="disponible" className="cursor-pointer">Disponible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No Disponible" id="no-disponible" />
                    <Label htmlFor="no-disponible" className="cursor-pointer">No Disponible</Label>
                  </div>
                  {editingProduct.stock === 0 && (
                    <Badge className="ml-2 bg-red-600 text-white hover:bg-red-700">Agotado</Badge>
                  )}
                  {editingProduct.stock > 0 && editingProduct.stock < 20 && (
                    <Badge className="ml-2 bg-orange-600 text-white hover:bg-orange-700">Bajo Stock</Badge>
                  )}
                </RadioGroup>
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

      {/* Diálogo de Nuevo Producto */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nuevo Producto</DialogTitle>
            <DialogDescription>
              Agrega un nuevo producto al inventario
            </DialogDescription>
          </DialogHeader>
          {newProduct && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-nombre">Nombre del Producto</Label>
                <Input
                  id="new-nombre"
                  value={newProduct.nombre}
                  onChange={(e) => updateNewProduct('nombre', e.target.value)}
                  placeholder="Ej: Dona de Vainilla"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-categoria">Categoría</Label>
                <Select
                  value={newProduct.categoria}
                  onValueChange={(value) => updateNewProduct('categoria', value)}
                >
                  <SelectTrigger id="new-categoria">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasProductos.length > 0 ? (
                      categoriasProductos.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_empty" disabled>
                        No hay categorías disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-precio">Precio (S/.)</Label>
                <Input
                  id="new-precio"
                  type="number"
                  step="0.01"
                  value={newProduct.precio}
                  onChange={(e) => updateNewProduct('precio', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  💡 El stock inicial será 0 y se gestionará con las Notas de Entrada
                </p>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <RadioGroup
                  value={newProduct.estado}
                  onValueChange={(value) => updateNewProduct('estado', value)}
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
                  {newProduct.stock === 0 && (
                    <Badge className="ml-2 bg-red-600 text-white hover:bg-red-700">Agotado</Badge>
                  )}
                  {newProduct.stock > 0 && newProduct.stock < 20 && (
                    <Badge className="ml-2 bg-orange-600 text-white hover:bg-orange-700">Bajo Stock</Badge>
                  )}
                </RadioGroup>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelNewProduct}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleSaveNewProduct}>
              <Save className="mr-2 h-4 w-4" />
              Crear Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente del sistema.
              {deletingProductId && (
                <span className="block mt-2">
                  <strong>Producto: </strong>
                  {productos.find(p => p.id === deletingProductId)?.nombre}
                </span>
              )}
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
