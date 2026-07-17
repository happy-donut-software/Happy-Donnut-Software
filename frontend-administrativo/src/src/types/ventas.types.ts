/**
 * Tipos relacionados con Ventas y Comprobantes
 */

export type MetodoPago = 'efectivo' | 'yape' | 'plin';
export type TipoComprobante = 'boleta' | 'factura';
export type EstadoComprobante = 'Emitido' | 'Anulado';

export interface ItemComprobante {
  id: number;
  productoId: number;
  producto: string;
  cantidad: number;
  precio: number;
}

export interface Comprobante {
  id: number;
  numero: string;
  serie: string;
  tipoComprobante: TipoComprobante;
  fecha: string;
  hora: string;
  cliente?: string;
  metodoPago: MetodoPago;
  items: ItemComprobante[];
  subtotal: number;
  total: number;
  usuario: string;
  estado: EstadoComprobante;
}

export interface GenerarComprobanteResult {
  serie: string;
  numero: string;
  correlativo: string;
}

export interface ProductoVenta {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
}

export interface CrearOrdenPayload {
  cliente_id: string | null;
  codigo_promocion: string | null;
  items: {
    producto_id: string;
    cantidad: number;
  }[];
}

export interface PagarOrdenPayload {
  monto_recibido: number;
  tipo_comprobante: 'BOLETA' | 'NOTA_PEDIDO';
}