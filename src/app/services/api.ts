/**
 * Servicio de API para comunicación con el Backend
 *
 * Este archivo maneja todas las peticiones HTTP al servidor backend.
 * El equipo de backend debe implementar los endpoints listados aquí.
 */

import { API_CONFIG } from '../config/api.config';

/**
 * Clase de error personalizada para errores de API
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Cliente HTTP base para hacer peticiones al backend
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    });

    // Si la respuesta no es OK, lanzar error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || `Error ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Si es DELETE y no hay contenido, retornar null
    if (response.status === 204 || options.method === 'DELETE') {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Error de conexión con el servidor'
    );
  }
}

/**
 * ============================================
 * AUTENTICACIÓN
 * ============================================
 */

export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: string;
  rol: 'Administrador' | 'Empleado';
}

export const AuthAPI = {
  login: (data: LoginRequest) =>
    fetchAPI<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    fetchAPI<void>('/auth/logout', {
      method: 'POST',
    }),

  validateToken: () =>
    fetchAPI<{ valid: boolean }>('/auth/validate', {
      method: 'GET',
    }),
};

/**
 * ============================================
 * PRODUCTOS
 * ============================================
 */

export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  tipo: 'Preparado' | 'No Preparado';
  activo: boolean;
}

export const ProductosAPI = {
  getAll: () => fetchAPI<Producto[]>('/productos'),
  getById: (id: number) => fetchAPI<Producto>(`/productos/${id}`),
  create: (producto: Omit<Producto, 'id'>) =>
    fetchAPI<Producto>('/productos', {
      method: 'POST',
      body: JSON.stringify(producto),
    }),
  update: (id: number, producto: Producto) =>
    fetchAPI<Producto>(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(producto),
    }),
  delete: (id: number) =>
    fetchAPI<void>(`/productos/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * ============================================
 * INSUMOS
 * ============================================
 */

export interface Insumo {
  id: number;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  stock: number;
  stockMinimo: number;
  precioUnitario: number;
}

export const InsumosAPI = {
  getAll: () => fetchAPI<Insumo[]>('/insumos'),
  getById: (id: number) => fetchAPI<Insumo>(`/insumos/${id}`),
  create: (insumo: Omit<Insumo, 'id'>) =>
    fetchAPI<Insumo>('/insumos', {
      method: 'POST',
      body: JSON.stringify(insumo),
    }),
  update: (id: number, insumo: Insumo) =>
    fetchAPI<Insumo>(`/insumos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(insumo),
    }),
  delete: (id: number) =>
    fetchAPI<void>(`/insumos/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * ============================================
 * CLIENTES
 * ============================================
 */

export interface Cliente {
  id: number;
  tipoDocumento: 'DNI' | 'RUC';
  numeroDocumento: string;
  nombreCompleto: string;
  telefono: string;
  email: string;
  direccion: string;
  cantidadCompras: number;
}

export const ClientesAPI = {
  getAll: () => fetchAPI<Cliente[]>('/clientes'),
  getById: (id: number) => fetchAPI<Cliente>(`/clientes/${id}`),
  search: (query: string) => fetchAPI<Cliente[]>(`/clientes/search?q=${query}`),
  create: (cliente: Omit<Cliente, 'id' | 'cantidadCompras'>) =>
    fetchAPI<Cliente>('/clientes', {
      method: 'POST',
      body: JSON.stringify(cliente),
    }),
  update: (id: number, cliente: Cliente) =>
    fetchAPI<Cliente>(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cliente),
    }),
  delete: (id: number) =>
    fetchAPI<void>(`/clientes/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * ============================================
 * PROMOCIONES
 * ============================================
 */

export interface Promocion {
  id: number;
  nombre: string;
  productos: { id: number; nombre: string; cantidad: number }[];
  precioPromocion: number;
  activo: boolean;
  fechaCreacion: string;
}

export const PromocionesAPI = {
  getAll: () => fetchAPI<Promocion[]>('/promociones'),
  getById: (id: number) => fetchAPI<Promocion>(`/promociones/${id}`),
  create: (promocion: Omit<Promocion, 'id' | 'fechaCreacion'>) =>
    fetchAPI<Promocion>('/promociones', {
      method: 'POST',
      body: JSON.stringify(promocion),
    }),
  update: (id: number, promocion: Promocion) =>
    fetchAPI<Promocion>(`/promociones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(promocion),
    }),
  delete: (id: number) =>
    fetchAPI<void>(`/promociones/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * ============================================
 * COMPROBANTES (VENTAS)
 * ============================================
 */

export interface Comprobante {
  id: number;
  tipo: 'Boleta' | 'Factura';
  serie: string;
  numero: string;
  fecha: string;
  hora: string;
  cliente: {
    tipoDocumento: string;
    numeroDocumento: string;
    nombreCompleto: string;
  };
  items: any[];
  subtotal: number;
  igv: number;
  total: number;
  metodoPago: string;
}

export const ComprobantesAPI = {
  getAll: () => fetchAPI<Comprobante[]>('/comprobantes'),
  getById: (id: number) => fetchAPI<Comprobante>(`/comprobantes/${id}`),
  create: (comprobante: Omit<Comprobante, 'id'>) =>
    fetchAPI<Comprobante>('/comprobantes', {
      method: 'POST',
      body: JSON.stringify(comprobante),
    }),
};

/**
 * ============================================
 * NOTAS DE ENTRADA
 * ============================================
 */

export interface NotaEntrada {
  id: number;
  numero: string;
  fecha: string;
  hora: string;
  productos: any[];
  observaciones?: string;
}

export const NotasEntradaAPI = {
  getAll: () => fetchAPI<NotaEntrada[]>('/notas-entrada'),
  getById: (id: number) => fetchAPI<NotaEntrada>(`/notas-entrada/${id}`),
  create: (nota: Omit<NotaEntrada, 'id'>) =>
    fetchAPI<NotaEntrada>('/notas-entrada', {
      method: 'POST',
      body: JSON.stringify(nota),
    }),
  delete: (id: number) =>
    fetchAPI<void>(`/notas-entrada/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * ============================================
 * NOTAS DE SALIDA
 * ============================================
 */

export interface NotaSalida {
  id: number;
  numero: string;
  fecha: string;
  hora: string;
  productos: any[];
  observaciones?: string;
}

export const NotasSalidaAPI = {
  getAll: () => fetchAPI<NotaSalida[]>('/notas-salida'),
  getById: (id: number) => fetchAPI<NotaSalida>(`/notas-salida/${id}`),
  create: (nota: Omit<NotaSalida, 'id'>) =>
    fetchAPI<NotaSalida>('/notas-salida', {
      method: 'POST',
      body: JSON.stringify(nota),
    }),
  delete: (id: number) =>
    fetchAPI<void>(`/notas-salida/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * ============================================
 * CAJA
 * ============================================
 */

export interface AperturaCaja {
  id: number;
  fecha: string;
  hora: string;
  usuario: string;
  montoInicial: number;
}

export interface CierreCaja {
  id: number;
  fecha: string;
  hora: string;
  usuario: string;
  montoInicial: number;
  totalVentas: number;
  totalEgresos: number;
  montoEsperado: number;
  montoReal: number;
  diferencia: number;
}

export const CajaAPI = {
  apertura: {
    get: () => fetchAPI<AperturaCaja | null>('/caja/apertura/actual'),
    create: (data: Omit<AperturaCaja, 'id'>) =>
      fetchAPI<AperturaCaja>('/caja/apertura', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  movimientos: {
    getAll: () => fetchAPI<any[]>('/caja/movimientos'),
  },
  egresos: {
    create: (egreso: any) =>
      fetchAPI<any>('/caja/egresos', {
        method: 'POST',
        body: JSON.stringify(egreso),
      }),
  },
  cierre: {
    create: (data: Omit<CierreCaja, 'id'>) =>
      fetchAPI<CierreCaja>('/caja/cierre', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getHistorial: () => fetchAPI<CierreCaja[]>('/caja/cierre/historial'),
  },
};

/**
 * ============================================
 * CATEGORÍAS
 * ============================================
 */

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

export const CategoriasAPI = {
  getAll: () => fetchAPI<Categoria[]>('/categorias'),
  create: (categoria: Omit<Categoria, 'id'>) =>
    fetchAPI<Categoria>('/categorias', {
      method: 'POST',
      body: JSON.stringify(categoria),
    }),
  update: (id: number, categoria: Categoria) =>
    fetchAPI<Categoria>(`/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoria),
    }),
  delete: (id: number) =>
    fetchAPI<void>(`/categorias/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * ============================================
 * USUARIOS
 * ============================================
 */

export interface Usuario {
  id: number;
  usuario: string;
  nombre: string;
  rol: 'Administrador' | 'Empleado';
  activo: boolean;
}

export const UsuariosAPI = {
  getAll: () => fetchAPI<Usuario[]>('/usuarios'),
  create: (usuario: Omit<Usuario, 'id'> & { password: string }) =>
    fetchAPI<Usuario>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(usuario),
    }),
  update: (id: number, usuario: Partial<Usuario>) =>
    fetchAPI<Usuario>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(usuario),
    }),
  delete: (id: number) =>
    fetchAPI<void>(`/usuarios/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * ============================================
 * DASHBOARD / ESTADÍSTICAS
 * ============================================
 */

export interface DashboardStats {
  ventasHoy: {
    total: number;
    cantidad: number;
  };
  productosVendidos: number;
  productosStockBajo: number;
  insumosStockBajo: number;
}

export const DashboardAPI = {
  getStats: () => fetchAPI<DashboardStats>('/dashboard/stats'),
};
