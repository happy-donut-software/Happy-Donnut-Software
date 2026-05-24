/**
 * Tipos relacionados con Configuración
 */

export interface Usuario {
  id: number;
  usuario: string;
  contraseña: string;
  rol: 'Administrador' | 'Empleado';
  activo: boolean;
  fechaCreacion: string;
}

export interface DatosEmpresa {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  telefono: string;
  email: string;
  regimen: string;
  serieBoletaActual: string;
  serieFacturaActual: string;
}

export interface Local {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  esMatriz: boolean;
  estado: 'Activo' | 'Inactivo';
  fechaRegistro: string;
}
