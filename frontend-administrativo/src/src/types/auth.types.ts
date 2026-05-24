/**
 * Tipos relacionados con Autenticación
 */

export type UserRole = 'Administrador' | 'Empleado';

export interface User {
  usuario: string;
  rol: UserRole;
  activo: boolean;
}

export interface LoginCredentials {
  usuario: string;
  contraseña: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  currentUser: string;
  userRole: UserRole;
}
