/**
 * Tipos relacionados con Compras
 */

export type EstadoCompra = 'Pendiente' | 'Recibido';

export interface DetalleInsumo {
  id: string;
  categoria: string;
  nombre: string;
  unidadMedida: string;
  cantidadInsumo: number;
  importeTotal: number;
}

export interface DetalleProducto {
  id: string;
  categoria: string;
  nombre: string;
  cantidad: number;
  importeTotal: number;
}

export interface Compra {
  id: number;
  numeroOrden: string;
  proveedor: string;
  fechaCompra: string;
  fechaEntrega: string;
  estado: EstadoCompra;
  detallesInsumos: DetalleInsumo[];
  detallesProductos: DetalleProducto[];
  totalInsumos: number;
  totalProductos: number;
  total: number;
  observaciones: string;
  creadoPor: string;
  fechaCreacion: string;
}
