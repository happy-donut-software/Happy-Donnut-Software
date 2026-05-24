import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Search, Edit, Trash2, Plus, Save, X } from "lucide-react";
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

export function ProductosSimple({ userRole = "Administrador" }: ProductosProps) {
  const [productos, setProductos] = useState<ProductoType[]>([]);
  const [categoriasProductos, setCategoriasProductos] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<{categoria_id: number, nombre_categoria: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductoType | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newProduct, setNewProduct] = useState<ProductoType | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Cargar productos y categorías al montar el componente
  useEffect(() => {
    loadProductos();
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/categories', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      } else {
        console.error('Error cargando categorías');
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const response = await fetch('http://localhost:8080/api/v1/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_categoria: newCategory.trim(),
          descripcion: `Categoría ${newCategory.trim()}`
        }),
      });

      if (response.ok) {
        toast.success('Categoría creada exitosamente');
        setShowCategoryDialog(false);
        setNewCategory("");
        await loadCategorias();
      } else {
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {}
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error guardando categoría:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al crear categoría: ${errorMessage}`);
    }
  };

  const loadProductos = async () => {
    try {
      // Solo usar API real - sin localStorage
      const response = await fetch('http://localhost:8080/api/v1/products', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Mapear datos de la API al tipo del frontend
        const productosMapeados = (data.data || []).map((p: any) => ({
          id: p.producto_id,
          nombre: p.nombre_producto,
          categoria: p.categoria?.nombre_categoria || 'Sin categoría',
          tipo_producto: p.tipo_producto === 'donut' ? 'Preparado' : 'No Preparado',
          precio: parseFloat(p.precio_base),
          stock: p.stock || 0,
          estado: p.activo_web ? 'Disponible' : 'No Disponible'
        }));
        
        setProductos(productosMapeados);
        
        // Extraer categorías únicas
        const categorias = [...new Set(productosMapeados.map((p: any) => String(p.categoria)))] as string[];
        setCategoriasProductos(categorias);
        
        toast.success("Productos cargados desde base de datos");
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      setProductos([]);
      setCategoriasProductos(['Dulce', 'Salado', 'Bebida']);
      toast.error("Error al cargar productos de la base de datos");
    }
  };

  const handleAddProduct = () => {
    setNewProduct({
      id: 0,
      nombre: "",
      categoria: "",
      tipo_producto: "Preparado",
      precio: 0,
      stock: 0,
      estado: "Disponible",
    });
    setShowNewDialog(true);
  };

  const handleSaveNewProduct = async () => {
    console.log('handleSaveNewProduct llamado, newProduct:', newProduct);
    
    if (!newProduct) {
        console.log('newProduct es null o undefined, saliendo');
        return;
    }

    try {
      // Debug: mostrar qué se está enviando
      const payload = {
        nombre_producto: newProduct.nombre,
        categoria_id: newProduct.categoria_id || (categorias.length > 0 ? categorias[0].categoria_id : 1),
        descripcion: newProduct.nombre,
        precio_base: newProduct.precio,
        tipo_producto: newProduct.tipo_producto === 'Preparado' ? 'donut' : 'cafe',
        activo_web: true,
      };
      
      console.log('Enviando producto:', payload);
      console.log('newProduct completo:', newProduct);
      console.log('Categorías disponibles:', categorias);

      // Enviar datos reales al API Gateway
      console.log('Iniciando fetch a http://localhost:8080/api/v1/products');
      
      const response = await fetch('http://localhost:8080/api/v1/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('Response recibida:', response.status, response.statusText);

      if (response.ok) {
        toast.success('Producto creado exitosamente en la base de datos');
        setShowNewDialog(false);
        setNewProduct(null);
        await loadProductos(); // Recargar desde la BD
      } else {
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {}
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error guardando producto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al crear producto: ${errorMessage}`);
    }
  };

  const handleEditProduct = (product: ProductoType) => {
    setEditingProduct({ ...product });
    setShowEditDialog(true);
  };

  const handleSaveEditProduct = async () => {
    if (!editingProduct) return;

    try {
      // Buscar la categoría seleccionada
      const selectedCategory = categorias.find(c => c.nombre_categoria === editingProduct.categoria);
      
      const payload = {
        nombre_producto: editingProduct.nombre,
        categoria_id: selectedCategory?.categoria_id || 1,
        descripcion: editingProduct.nombre,
        precio_base: editingProduct.precio,
        tipo_producto: editingProduct.tipo_producto === 'Preparado' ? 'donut' : 'cafe',
        activo_web: editingProduct.estado === 'Disponible',
      };

      const response = await fetch(`http://localhost:8080/api/v1/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await loadProductos();
        setShowEditDialog(false);
        setEditingProduct(null);
        toast.success('Producto actualizado exitosamente');
      } else {
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {}
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error actualizando producto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al actualizar producto: ${errorMessage}`);
    }
  };

  const handleDeleteProduct = (id: number) => {
    setDeletingProductId(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProductId) return;

    try {
      const response = await fetch(`http://localhost:8080/api/v1/products/${deletingProductId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadProductos();
        toast.success("Producto eliminado exitosamente");
        setShowDeleteDialog(false);
        setDeletingProductId(null);
      } else {
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {}
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error eliminando producto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al eliminar producto: ${errorMessage}`);
    }
  };

  // Filtrar productos según término de búsqueda
  const filteredProductos = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = userRole === "Administrador";

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              Productos ({filteredProductos.length})
            </CardTitle>
            {isAdmin && (
              <Button onClick={handleAddProduct} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Producto
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  {isAdmin && <TableHead>Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProductos.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell className="font-medium">{producto.id}</TableCell>
                    <TableCell>{producto.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{producto.categoria}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={producto.tipo_producto === "Preparado" ? "default" : "secondary"}>
                        {producto.tipo_producto}
                      </Badge>
                    </TableCell>
                    <TableCell>${producto.precio.toFixed(2)}</TableCell>
                    <TableCell>{producto.stock}</TableCell>
                    <TableCell>
                      <Badge variant={producto.estado === "Disponible" ? "default" : "destructive"}>
                        {producto.estado}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(producto)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(producto.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProductos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No se encontraron productos que coincidan con la búsqueda" : "No hay productos para mostrar"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para nuevo producto */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Producto</DialogTitle>
            <DialogDescription>
              Complete los datos del nuevo producto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">
                Nombre
              </Label>
              <Input
                id="nombre"
                value={newProduct?.nombre || ""}
                onChange={(e) => setNewProduct(newProduct ? { ...newProduct, nombre: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoria" className="text-right">
                Categoría
              </Label>
              <Select
                value={newProduct?.categoria_id?.toString() || (categorias.length > 0 ? categorias[0].categoria_id.toString() : "1")}
                onValueChange={(value: string) => setNewProduct(newProduct ? { ...newProduct, categoria_id: parseInt(value) } : null)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.categoria_id} value={cat.categoria_id.toString()}>
                      {cat.nombre_categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="precio" className="text-right">
                Precio
              </Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={newProduct?.precio || ""}
                onChange={(e) => setNewProduct(newProduct ? { ...newProduct, precio: parseFloat(e.target.value) } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                value={newProduct?.stock || ""}
                onChange={(e) => setNewProduct(newProduct ? { ...newProduct, stock: parseInt(e.target.value) } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Tipo Producto</Label>
              <div className="col-span-3">
                <RadioGroup
                  value={newProduct?.tipo_producto || "Preparado"}
                  onValueChange={(value: "Preparado" | "No Preparado") => setNewProduct(newProduct ? { ...newProduct, tipo_producto: value } : null)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Preparado" id="preparado" />
                    <Label htmlFor="preparado">Preparado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No Preparado" id="no-preparado" />
                    <Label htmlFor="no-preparado">No Preparado</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNewProduct}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar producto */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Modifique los datos del producto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-nombre" className="text-right">
                Nombre
              </Label>
              <Input
                id="edit-nombre"
                value={editingProduct?.nombre || ""}
                onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, nombre: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-categoria" className="text-right">
                Categoría
              </Label>
              <Select
                value={editingProduct?.categoria || ""}
                onValueChange={(value: string) => setEditingProduct(editingProduct ? { ...editingProduct, categoria: value } : null)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.categoria_id} value={cat.nombre_categoria}>
                      {cat.nombre_categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-precio" className="text-right">
                Precio
              </Label>
              <Input
                id="edit-precio"
                type="number"
                step="0.01"
                value={editingProduct?.precio || ""}
                onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, precio: parseFloat(e.target.value) } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-stock" className="text-right">
                Stock
              </Label>
              <Input
                id="edit-stock"
                type="number"
                value={editingProduct?.stock || ""}
                onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, stock: parseInt(e.target.value) } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Estado</Label>
              <div className="col-span-3">
                <RadioGroup
                  value={editingProduct?.estado || "Disponible"}
                  onValueChange={(value: "Disponible" | "No Disponible") => setEditingProduct(editingProduct ? { ...editingProduct, estado: value } : null)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Disponible" id="disponible" />
                    <Label htmlFor="disponible">Disponible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No Disponible" id="no-disponible" />
                    <Label htmlFor="no-disponible">No Disponible</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditProduct}>
              <Save className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para agregar categoría */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nueva Categoría</DialogTitle>
            <DialogDescription>
              Crea una nueva categoría para organizar tus productos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="category-name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="col-span-3"
                placeholder="Ej: Bebidas, Postres, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Categoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
