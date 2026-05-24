/**
 * Tipos relacionados con Inventario (Productos, Insumos, Notas de Entrada/Salida)
 */

export type EstadoDisponibilidad = 'Disponible' | 'No Disponible';
export type TipoProducto = 'Preparado' | 'No Preparado';
export type TipoCategoria = 'Insumo' | 'Producto';
export type EstadoCategoria = 'Activa' | 'Inactiva';

// Productos
export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  categoria_id?: number;
  tipo_producto: TipoProducto;
  precio: number;
  stock: number;
  estado: EstadoDisponibilidad;
}

// Insumos
export interface Insumo {
  id: number;
  categoria: string;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  estado: EstadoDisponibilidad;
}

// Categorías
export interface Categoria {
  id: number;
  tipo: TipoCategoria;
  nombre: string;
  descripcion: string;
  itemsCount: number;
  estado: EstadoCategoria;
}

// Notas de Entrada
export type MotivoNotaEntrada = 
  | 'Por Compra'
  | 'Por Producción Interna'
  | 'Por Devolución de Cliente'
  | 'Por Ajuste de Inventario'
  | 'Por Donación/Cortesía';

export interface ProductoNE {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
}

export interface NotaEntrada {
  id: number;
  numero: string;
  fecha: string;
  hora: string;
  motivo: MotivoNotaEntrada;
  docReferencia?: string;
  productos: ProductoNE[];
  observaciones?: string;
  usuario: string;
}

// Notas de Salida
export type MotivoNotaSalida = 
  | 'Por Venta'
  | 'Por Uso Interno / Producción'
  | 'Por Merma / Pérdida'
  | 'Por Devolución a Proveedor'
  | 'Por Ajuste de Inventario';

export interface ProductoNS {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
}

export interface NotaSalida {
  id: number;
  numero: string;
  fecha: string;
  hora: string;
  motivo: MotivoNotaSalida;
  docReferencia?: string;
  productos: ProductoNS[];
  observaciones?: string;
  usuario: string;
}
