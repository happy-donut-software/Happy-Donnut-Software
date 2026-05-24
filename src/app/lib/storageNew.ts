/**
 * CAPA DE ABSTRACCIÓN DE ALMACENAMIENTO
 *
 * Este archivo decide automáticamente si usar localStorage o el backend API
 * según la configuración en api.config.ts
 *
 * INSTRUCCIONES PARA EL EQUIPO:
 * - Para usar localStorage: Configurar USE_BACKEND = false en api.config.ts
 * - Para usar Backend API: Configurar USE_BACKEND = true en api.config.ts
 *
 * Los componentes NO necesitan cambiar, solo llaman a las funciones de este archivo.
 */

import { API_CONFIG } from '../config/api.config';
import * as API from '../services/api';
import * as LocalStorage from '../services/localStorage';

/**
 * Re-exportar todas las interfaces de API
 * (así los componentes pueden importarlas desde aquí)
 */
export type {
  Producto,
  Insumo,
  Cliente,
  Promocion,
  Comprobante,
  NotaEntrada,
  NotaSalida,
  Categoria,
  Usuario,
} from '../services/api';

/**
 * Interfaces adicionales que solo existen en el frontend
 */
export interface ProductoNE {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
}

export interface ProductoNS {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
}

export interface RecetaItem {
  insumoId: number;
  insumoNombre: string;
  cantidad: number;
}

/**
 * Helper para manejar llamadas asíncronas y convertirlas a promesas
 */
function wrapSync<T>(fn: () => T): Promise<T> {
  return Promise.resolve(fn());
}

/**
 * ============================================
 * PRODUCTOS
 * ============================================
 */

export const ProductosService = {
  getAll: () => {
    if (API_CONFIG.USE_BACKEND) {
      return API.ProductosAPI.getAll();
    }
    return wrapSync(() => LocalStorage.LocalStorageProductos.getAll());
  },

  getById: (id: number) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.ProductosAPI.getById(id);
    }
    return wrapSync(() => LocalStorage.LocalStorageProductos.getById(id));
  },

  create: (producto: Omit<API.Producto, 'id'>) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.ProductosAPI.create(producto);
    }
    return wrapSync(() => LocalStorage.LocalStorageProductos.create(producto));
  },

  update: (id: number, producto: API.Producto) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.ProductosAPI.update(id, producto);
    }
    return wrapSync(() => LocalStorage.LocalStorageProductos.update(id, producto));
  },

  delete: (id: number) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.ProductosAPI.delete(id);
    }
    return wrapSync(() => LocalStorage.LocalStorageProductos.delete(id));
  },
};

/**
 * ============================================
 * INSUMOS
 * ============================================
 */

export const InsumosService = {
  getAll: () => {
    if (API_CONFIG.USE_BACKEND) {
      return API.InsumosAPI.getAll();
    }
    return wrapSync(() => LocalStorage.LocalStorageInsumos.getAll());
  },

  getById: (id: number) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.InsumosAPI.getById(id);
    }
    return wrapSync(() => LocalStorage.LocalStorageInsumos.getById(id));
  },

  create: (insumo: Omit<API.Insumo, 'id'>) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.InsumosAPI.create(insumo);
    }
    return wrapSync(() => LocalStorage.LocalStorageInsumos.create(insumo));
  },

  update: (id: number, insumo: API.Insumo) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.InsumosAPI.update(id, insumo);
    }
    return wrapSync(() => LocalStorage.LocalStorageInsumos.update(id, insumo));
  },

  delete: (id: number) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.InsumosAPI.delete(id);
    }
    return wrapSync(() => LocalStorage.LocalStorageInsumos.delete(id));
  },
};

/**
 * ============================================
 * CLIENTES
 * ============================================
 */

export const ClientesService = {
  getAll: () => {
    if (API_CONFIG.USE_BACKEND) {
      return API.ClientesAPI.getAll();
    }
    return wrapSync(() => LocalStorage.LocalStorageClientes.getAll());
  },

  getById: (id: number) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.ClientesAPI.getById(id);
    }
    return wrapSync(() => LocalStorage.LocalStorageClientes.getById(id));
  },

  search: (query: string) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.ClientesAPI.search(query);
    }
    return wrapSync(() => LocalStorage.LocalStorageClientes.search(query));
  },

  create: (cliente: Omit<API.Cliente, 'id' | 'cantidadCompras'>) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.ClientesAPI.create(cliente);
    }
    return wrapSync(() => LocalStorage.LocalStorageClientes.create(cliente));
  },

  update: (id: number, cliente: API.Cliente) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.ClientesAPI.update(id, cliente);
    }
    return wrapSync(() => LocalStorage.LocalStorageClientes.update(id, cliente));
  },

  delete: (id: number) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.ClientesAPI.delete(id);
    }
    return wrapSync(() => LocalStorage.LocalStorageClientes.delete(id));
  },
};

/**
 * ============================================
 * PROMOCIONES
 * ============================================
 */

export const PromocionesService = {
  getAll: () => {
    if (API_CONFIG.USE_BACKEND) {
      return API.PromocionesAPI.getAll();
    }
    return wrapSync(() => LocalStorage.LocalStoragePromociones.getAll());
  },

  getById: (id: number) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.PromocionesAPI.getById(id);
    }
    return wrapSync(() => LocalStorage.LocalStoragePromociones.getById(id));
  },

  create: (promocion: Omit<API.Promocion, 'id' | 'fechaCreacion'>) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.PromocionesAPI.create(promocion);
    }
    return wrapSync(() => LocalStorage.LocalStoragePromociones.create(promocion));
  },

  update: (id: number, promocion: API.Promocion) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.PromocionesAPI.update(id, promocion);
    }
    return wrapSync(() => LocalStorage.LocalStoragePromociones.update(id, promocion));
  },

  delete: (id: number) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.PromocionesAPI.delete(id);
    }
    return wrapSync(() => LocalStorage.LocalStoragePromociones.delete(id));
  },
};

/**
 * ============================================
 * COMPROBANTES
 * ============================================
 */

export const ComprobantesService = {
  getAll: () => {
    if (API_CONFIG.USE_BACKEND) {
      return API.ComprobantesAPI.getAll();
    }
    return wrapSync(() => LocalStorage.LocalStorageComprobantes.getAll());
  },

  getById: (id: number) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.ComprobantesAPI.getById(id);
    }
    return wrapSync(() => LocalStorage.LocalStorageComprobantes.getById(id));
  },

  create: (comprobante: Omit<API.Comprobante, 'id'>) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.ComprobantesAPI.create(comprobante);
    }
    return wrapSync(() => LocalStorage.LocalStorageComprobantes.create(comprobante));
  },
};

/**
 * ============================================
 * NOTAS DE ENTRADA
 * ============================================
 */

export const NotasEntradaService = {
  getAll: () => {
    if (API_CONFIG.USE_BACKEND) {
      return API.NotasEntradaAPI.getAll();
    }
    return wrapSync(() => LocalStorage.LocalStorageNotasEntrada.getAll());
  },

  getById: (id: number) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.NotasEntradaAPI.getById(id);
    }
    return wrapSync(() => LocalStorage.LocalStorageNotasEntrada.getById(id));
  },

  create: (nota: Omit<API.NotaEntrada, 'id'>) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.NotasEntradaAPI.create(nota);
    }
    return wrapSync(() => LocalStorage.LocalStorageNotasEntrada.create(nota));
  },

  delete: (id: number) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.NotasEntradaAPI.delete(id);
    }
    return wrapSync(() => LocalStorage.LocalStorageNotasEntrada.delete(id));
  },
};

/**
 * ============================================
 * NOTAS DE SALIDA
 * ============================================
 */

export const NotasSalidaService = {
  getAll: () => {
    if (API_CONFIG.USE_BACKEND) {
      return API.NotasSalidaAPI.getAll();
    }
    return wrapSync(() => LocalStorage.LocalStorageNotasSalida.getAll());
  },

  getById: (id: number) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.NotasSalidaAPI.getById(id);
    }
    return wrapSync(() => LocalStorage.LocalStorageNotasSalida.getById(id));
  },

  create: (nota: Omit<API.NotaSalida, 'id'>) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.NotasSalidaAPI.create(nota);
    }
    return wrapSync(() => LocalStorage.LocalStorageNotasSalida.create(nota));
  },

  delete: (id: number) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.NotasSalidaAPI.delete(id);
    }
    return wrapSync(() => LocalStorage.LocalStorageNotasSalida.delete(id));
  },
};

/**
 * ============================================
 * CATEGORÍAS
 * ============================================
 */

export const CategoriasService = {
  getAll: () => {
    if (API_CONFIG.USE_BACKEND) {
      return API.CategoriasAPI.getAll();
    }
    return wrapSync(() => LocalStorage.LocalStorageCategorias.getAll());
  },

  create: (categoria: Omit<API.Categoria, 'id'>) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.CategoriasAPI.create(categoria);
    }
    return wrapSync(() => LocalStorage.LocalStorageCategorias.create(categoria));
  },

  update: (id: number, categoria: API.Categoria) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.CategoriasAPI.update(id, categoria);
    }
    return wrapSync(() => LocalStorage.LocalStorageCategorias.update(id, categoria));
  },

  delete: (id: number) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.CategoriasAPI.delete(id);
    }
    return wrapSync(() => LocalStorage.LocalStorageCategorias.delete(id));
  },
};

/**
 * ============================================
 * USUARIOS
 * ============================================
 */

export const UsuariosService = {
  getAll: () => {
    if (API_CONFIG.USE_BACKEND) {
      return API.UsuariosAPI.getAll();
    }
    return wrapSync(() => LocalStorage.LocalStorageUsuarios.getAll());
  },

  create: (usuario: Omit<API.Usuario, 'id'> & { password: string }) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.UsuariosAPI.create(usuario);
    }
    return wrapSync(() => LocalStorage.LocalStorageUsuarios.create(usuario));
  },

  update: (id: number, usuario: Partial<API.Usuario>) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.UsuariosAPI.update(id, usuario);
    }
    return wrapSync(() => LocalStorage.LocalStorageUsuarios.update(id, usuario));
  },

  delete: (id: number) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.UsuariosAPI.delete(id);
    }
    return wrapSync(() => LocalStorage.LocalStorageUsuarios.delete(id));
  },
};

/**
 * ============================================
 * CAJA
 * ============================================
 */

export const CajaService = {
  apertura: {
    get: () => {
      if (API_CONFIG.USE_BACKEND) {
        return API.CajaAPI.apertura.get();
      }
      return wrapSync(() => LocalStorage.LocalStorageCaja.apertura.get());
    },
    create: (data: Omit<API.AperturaCaja, 'id'>) => {
      if (API_CONFIG.USE_BACKEND) {
        return API.CajaAPI.apertura.create(data);
      }
      return wrapSync(() => LocalStorage.LocalStorageCaja.apertura.create(data));
    },
  },

  movimientos: {
    getAll: () => {
      if (API_CONFIG.USE_BACKEND) {
        return API.CajaAPI.movimientos.getAll();
      }
      return wrapSync(() => LocalStorage.LocalStorageCaja.movimientos.getAll());
    },
  },

  egresos: {
    create: (egreso: any) => {
      if (API_CONFIG.USE_BACKEND) {
        return API.CajaAPI.egresos.create(egreso);
      }
      return wrapSync(() => LocalStorage.LocalStorageCaja.egresos.create(egreso));
    },
  },

  cierre: {
    create: (data: Omit<API.CierreCaja, 'id'>) => {
      if (API_CONFIG.USE_BACKEND) {
        return API.CajaAPI.cierre.create(data);
      }
      return wrapSync(() => LocalStorage.LocalStorageCaja.cierre.create(data));
    },
    getHistorial: () => {
      if (API_CONFIG.USE_BACKEND) {
        return API.CajaAPI.cierre.getHistorial();
      }
      return wrapSync(() => LocalStorage.LocalStorageCaja.cierre.getHistorial());
    },
  },
};

/**
 * ============================================
 * AUTENTICACIÓN
 * ============================================
 */

export const AuthService = {
  login: (usuario: string, password: string) => {
    if (API_CONFIG.USE_BACKEND) {
      return API.AuthAPI.login({ usuario, password });
    }
    // Simular login con localStorage
    return wrapSync(() => ({
      token: 'local-token',
      usuario,
      rol: 'Administrador' as const,
    }));
  },

  logout: () => {
    if (API_CONFIG.USE_BACKEND) {
      return API.AuthAPI.logout();
    }
    return wrapSync(() => undefined);
  },

  validateToken: () => {
    if (API_CONFIG.USE_BACKEND) {
      return API.AuthAPI.validateToken();
    }
    return wrapSync(() => ({ valid: true }));
  },
};

/**
 * ============================================
 * DASHBOARD
 * ============================================
 */

export const DashboardService = {
  getStats: () => {
    if (API_CONFIG.USE_BACKEND) {
      return API.DashboardAPI.getStats();
    }
    // Calcular stats desde localStorage
    return wrapSync(() => {
      const comprobantes = LocalStorage.LocalStorageComprobantes.getAll();
      const productos = LocalStorage.LocalStorageProductos.getAll();
      const insumos = LocalStorage.LocalStorageInsumos.getAll();

      const hoy = new Date().toISOString().split('T')[0];
      const ventasHoy = comprobantes.filter(c => c.fecha === hoy);

      return {
        ventasHoy: {
          total: ventasHoy.reduce((sum, c) => sum + c.total, 0),
          cantidad: ventasHoy.length,
        },
        productosVendidos: ventasHoy.reduce(
          (sum, c) => sum + c.items.reduce((s, i) => s + i.cantidad, 0),
          0
        ),
        productosStockBajo: productos.filter(p => p.stock <= p.stockMinimo).length,
        insumosStockBajo: insumos.filter(i => i.stock <= i.stockMinimo).length,
      };
    });
  },
};
