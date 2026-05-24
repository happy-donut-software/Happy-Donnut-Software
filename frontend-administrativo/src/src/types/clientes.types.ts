/**
 * Tipos relacionados con Clientes y Proveedores
 */

export type TipoClienteProveedor = 'Cliente' | 'Proveedor' | 'Ambos';
export type TipoDocumento = 'RUC' | 'DNI';
export type EstadoClienteProveedor = 'Activo' | 'Inactivo';

export interface ClienteProveedor {
  id: number;
  tipo: TipoClienteProveedor;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  email: string;
  estado: EstadoClienteProveedor;
  fechaRegistro: string;
  observaciones?: string;
}
