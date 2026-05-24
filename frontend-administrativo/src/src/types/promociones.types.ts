/**
 * Tipos relacionados con Promociones
 */

export interface ProductoPromocion {
  id: number;
  nombre: string;
  cantidad: number;
}

export interface Promocion {
  id: number;
  nombre: string;
  productos: ProductoPromocion[];
  precioPromocion: number;
  activo: boolean;
  fechaCreacion: string;
  usuario: string;
}
