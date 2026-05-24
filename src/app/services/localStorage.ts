/**
 * Servicio de LocalStorage
 *
 * Este archivo contiene toda la lógica de almacenamiento en el navegador.
 * Se usa como fallback cuando el backend no está disponible.
 */

import type {
  Producto,
  Insumo,
  Cliente,
  Promocion,
  Comprobante,
  NotaEntrada,
  NotaSalida,
  Categoria,
  Usuario,
} from './api';

/**
 * Helpers para leer/escribir en localStorage
 */
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Disparar evento personalizado para que los componentes se actualicen
    window.dispatchEvent(new CustomEvent(`${key}-updated`));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
}

/**
 * Generar siguiente ID para una colección
 */
function getNextId<T extends { id: number }>(items: T[]): number {
  return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
}

/**
 * ============================================
 * PRODUCTOS
 * ============================================
 */

const PRODUCTOS_KEY = 'productos';

export const LocalStorageProductos = {
  getAll: (): Producto[] => {
    return getFromStorage<Producto[]>(PRODUCTOS_KEY, []);
  },

  getById: (id: number): Producto | undefined => {
    const productos = LocalStorageProductos.getAll();
    return productos.find(p => p.id === id);
  },

  create: (producto: Omit<Producto, 'id'>): Producto => {
    const productos = LocalStorageProductos.getAll();
    const nuevoProducto = {
      ...producto,
      id: getNextId(productos),
    };
    saveToStorage(PRODUCTOS_KEY, [...productos, nuevoProducto]);
    return nuevoProducto;
  },

  update: (id: number, producto: Producto): Producto => {
    const productos = LocalStorageProductos.getAll();
    const index = productos.findIndex(p => p.id === id);
    if (index !== -1) {
      productos[index] = producto;
      saveToStorage(PRODUCTOS_KEY, productos);
    }
    return producto;
  },

  delete: (id: number): void => {
    const productos = LocalStorageProductos.getAll();
    saveToStorage(PRODUCTOS_KEY, productos.filter(p => p.id !== id));
  },
};

/**
 * ============================================
 * INSUMOS
 * ============================================
 */

const INSUMOS_KEY = 'insumos';

export const LocalStorageInsumos = {
  getAll: (): Insumo[] => {
    return getFromStorage<Insumo[]>(INSUMOS_KEY, []);
  },

  getById: (id: number): Insumo | undefined => {
    const insumos = LocalStorageInsumos.getAll();
    return insumos.find(i => i.id === id);
  },

  create: (insumo: Omit<Insumo, 'id'>): Insumo => {
    const insumos = LocalStorageInsumos.getAll();
    const nuevoInsumo = {
      ...insumo,
      id: getNextId(insumos),
    };
    saveToStorage(INSUMOS_KEY, [...insumos, nuevoInsumo]);
    return nuevoInsumo;
  },

  update: (id: number, insumo: Insumo): Insumo => {
    const insumos = LocalStorageInsumos.getAll();
    const index = insumos.findIndex(i => i.id === id);
    if (index !== -1) {
      insumos[index] = insumo;
      saveToStorage(INSUMOS_KEY, insumos);
    }
    return insumo;
  },

  delete: (id: number): void => {
    const insumos = LocalStorageInsumos.getAll();
    saveToStorage(INSUMOS_KEY, insumos.filter(i => i.id !== id));
  },
};

/**
 * ============================================
 * CLIENTES
 * ============================================
 */

const CLIENTES_KEY = 'clientes';

export const LocalStorageClientes = {
  getAll: (): Cliente[] => {
    return getFromStorage<Cliente[]>(CLIENTES_KEY, []);
  },

  getById: (id: number): Cliente | undefined => {
    const clientes = LocalStorageClientes.getAll();
    return clientes.find(c => c.id === id);
  },

  search: (query: string): Cliente[] => {
    const clientes = LocalStorageClientes.getAll();
    const lowerQuery = query.toLowerCase();
    return clientes.filter(
      c =>
        c.nombreCompleto.toLowerCase().includes(lowerQuery) ||
        c.numeroDocumento.includes(lowerQuery)
    );
  },

  create: (cliente: Omit<Cliente, 'id' | 'cantidadCompras'>): Cliente => {
    const clientes = LocalStorageClientes.getAll();
    const nuevoCliente = {
      ...cliente,
      id: getNextId(clientes),
      cantidadCompras: 0,
    };
    saveToStorage(CLIENTES_KEY, [...clientes, nuevoCliente]);
    window.dispatchEvent(new CustomEvent('clientes-updated'));
    return nuevoCliente;
  },

  update: (id: number, cliente: Cliente): Cliente => {
    const clientes = LocalStorageClientes.getAll();
    const index = clientes.findIndex(c => c.id === id);
    if (index !== -1) {
      clientes[index] = cliente;
      saveToStorage(CLIENTES_KEY, clientes);
      window.dispatchEvent(new CustomEvent('clientes-updated'));
    }
    return cliente;
  },

  delete: (id: number): void => {
    const clientes = LocalStorageClientes.getAll();
    saveToStorage(CLIENTES_KEY, clientes.filter(c => c.id !== id));
    window.dispatchEvent(new CustomEvent('clientes-updated'));
  },
};

/**
 * ============================================
 * PROMOCIONES
 * ============================================
 */

const PROMOCIONES_KEY = 'promociones';

export const LocalStoragePromociones = {
  getAll: (): Promocion[] => {
    return getFromStorage<Promocion[]>(PROMOCIONES_KEY, []);
  },

  getById: (id: number): Promocion | undefined => {
    const promociones = LocalStoragePromociones.getAll();
    return promociones.find(p => p.id === id);
  },

  create: (promocion: Omit<Promocion, 'id' | 'fechaCreacion'>): Promocion => {
    const promociones = LocalStoragePromociones.getAll();
    const nuevaPromocion = {
      ...promocion,
      id: getNextId(promociones),
      fechaCreacion: new Date().toISOString(),
    };
    saveToStorage(PROMOCIONES_KEY, [...promociones, nuevaPromocion]);
    return nuevaPromocion;
  },

  update: (id: number, promocion: Promocion): Promocion => {
    const promociones = LocalStoragePromociones.getAll();
    const index = promociones.findIndex(p => p.id === id);
    if (index !== -1) {
      promociones[index] = promocion;
      saveToStorage(PROMOCIONES_KEY, promociones);
    }
    return promocion;
  },

  delete: (id: number): void => {
    const promociones = LocalStoragePromociones.getAll();
    saveToStorage(PROMOCIONES_KEY, promociones.filter(p => p.id !== id));
  },
};

/**
 * ============================================
 * COMPROBANTES
 * ============================================
 */

const COMPROBANTES_KEY = 'comprobantes';

export const LocalStorageComprobantes = {
  getAll: (): Comprobante[] => {
    return getFromStorage<Comprobante[]>(COMPROBANTES_KEY, []);
  },

  getById: (id: number): Comprobante | undefined => {
    const comprobantes = LocalStorageComprobantes.getAll();
    return comprobantes.find(c => c.id === id);
  },

  create: (comprobante: Omit<Comprobante, 'id'>): Comprobante => {
    const comprobantes = LocalStorageComprobantes.getAll();
    const nuevoComprobante = {
      ...comprobante,
      id: getNextId(comprobantes),
    };
    saveToStorage(COMPROBANTES_KEY, [...comprobantes, nuevoComprobante]);
    window.dispatchEvent(new CustomEvent('comprobantes-updated'));
    return nuevoComprobante;
  },
};

/**
 * ============================================
 * NOTAS DE ENTRADA
 * ============================================
 */

const NOTAS_ENTRADA_KEY = 'notas_entrada';

export const LocalStorageNotasEntrada = {
  getAll: (): NotaEntrada[] => {
    return getFromStorage<NotaEntrada[]>(NOTAS_ENTRADA_KEY, []);
  },

  getById: (id: number): NotaEntrada | undefined => {
    const notas = LocalStorageNotasEntrada.getAll();
    return notas.find(n => n.id === id);
  },

  create: (nota: Omit<NotaEntrada, 'id'>): NotaEntrada => {
    const notas = LocalStorageNotasEntrada.getAll();
    const nuevaNota = {
      ...nota,
      id: getNextId(notas),
    };
    saveToStorage(NOTAS_ENTRADA_KEY, [...notas, nuevaNota]);
    return nuevaNota;
  },

  delete: (id: number): void => {
    const notas = LocalStorageNotasEntrada.getAll();
    saveToStorage(NOTAS_ENTRADA_KEY, notas.filter(n => n.id !== id));
  },
};

/**
 * ============================================
 * NOTAS DE SALIDA
 * ============================================
 */

const NOTAS_SALIDA_KEY = 'notas_salida';

export const LocalStorageNotasSalida = {
  getAll: (): NotaSalida[] => {
    return getFromStorage<NotaSalida[]>(NOTAS_SALIDA_KEY, []);
  },

  getById: (id: number): NotaSalida | undefined => {
    const notas = LocalStorageNotasSalida.getAll();
    return notas.find(n => n.id === id);
  },

  create: (nota: Omit<NotaSalida, 'id'>): NotaSalida => {
    const notas = LocalStorageNotasSalida.getAll();
    const nuevaNota = {
      ...nota,
      id: getNextId(notas),
    };
    saveToStorage(NOTAS_SALIDA_KEY, [...notas, nuevaNota]);
    return nuevaNota;
  },

  delete: (id: number): void => {
    const notas = LocalStorageNotasSalida.getAll();
    saveToStorage(NOTAS_SALIDA_KEY, notas.filter(n => n.id !== id));
  },
};

/**
 * ============================================
 * CATEGORÍAS
 * ============================================
 */

const CATEGORIAS_KEY = 'categorias';

export const LocalStorageCategorias = {
  getAll: (): Categoria[] => {
    return getFromStorage<Categoria[]>(CATEGORIAS_KEY, []);
  },

  create: (categoria: Omit<Categoria, 'id'>): Categoria => {
    const categorias = LocalStorageCategorias.getAll();
    const nuevaCategoria = {
      ...categoria,
      id: getNextId(categorias),
    };
    saveToStorage(CATEGORIAS_KEY, [...categorias, nuevaCategoria]);
    return nuevaCategoria;
  },

  update: (id: number, categoria: Categoria): Categoria => {
    const categorias = LocalStorageCategorias.getAll();
    const index = categorias.findIndex(c => c.id === id);
    if (index !== -1) {
      categorias[index] = categoria;
      saveToStorage(CATEGORIAS_KEY, categorias);
    }
    return categoria;
  },

  delete: (id: number): void => {
    const categorias = LocalStorageCategorias.getAll();
    saveToStorage(CATEGORIAS_KEY, categorias.filter(c => c.id !== id));
  },
};

/**
 * ============================================
 * USUARIOS
 * ============================================
 */

const USUARIOS_KEY = 'usuarios';

export const LocalStorageUsuarios = {
  getAll: (): Usuario[] => {
    return getFromStorage<Usuario[]>(USUARIOS_KEY, []);
  },

  create: (usuario: Omit<Usuario, 'id'>): Usuario => {
    const usuarios = LocalStorageUsuarios.getAll();
    const nuevoUsuario = {
      ...usuario,
      id: getNextId(usuarios),
    };
    saveToStorage(USUARIOS_KEY, [...usuarios, nuevoUsuario]);
    return nuevoUsuario;
  },

  update: (id: number, usuarioData: Partial<Usuario>): Usuario => {
    const usuarios = LocalStorageUsuarios.getAll();
    const index = usuarios.findIndex(u => u.id === id);
    if (index !== -1) {
      usuarios[index] = { ...usuarios[index], ...usuarioData };
      saveToStorage(USUARIOS_KEY, usuarios);
      return usuarios[index];
    }
    throw new Error('Usuario no encontrado');
  },

  delete: (id: number): void => {
    const usuarios = LocalStorageUsuarios.getAll();
    saveToStorage(USUARIOS_KEY, usuarios.filter(u => u.id !== id));
  },
};

/**
 * ============================================
 * CAJA
 * ============================================
 */

const APERTURA_CAJA_KEY = 'apertura_caja';
const MOVIMIENTOS_CAJA_KEY = 'movimientos_caja';
const CIERRES_CAJA_KEY = 'cierres_caja';

export const LocalStorageCaja = {
  apertura: {
    get: () => {
      return getFromStorage<any>(APERTURA_CAJA_KEY, null);
    },
    create: (data: any) => {
      saveToStorage(APERTURA_CAJA_KEY, data);
      return data;
    },
  },

  movimientos: {
    getAll: () => {
      return getFromStorage<any[]>(MOVIMIENTOS_CAJA_KEY, []);
    },
  },

  egresos: {
    create: (egreso: any) => {
      const movimientos = LocalStorageCaja.movimientos.getAll();
      saveToStorage(MOVIMIENTOS_CAJA_KEY, [...movimientos, egreso]);
      return egreso;
    },
  },

  cierre: {
    create: (data: any) => {
      const cierres = getFromStorage<any[]>(CIERRES_CAJA_KEY, []);
      const nuevoCierre = {
        ...data,
        id: getNextId(cierres),
      };
      saveToStorage(CIERRES_CAJA_KEY, [...cierres, nuevoCierre]);
      saveToStorage(APERTURA_CAJA_KEY, null);
      saveToStorage(MOVIMIENTOS_CAJA_KEY, []);
      return nuevoCierre;
    },
    getHistorial: () => {
      return getFromStorage<any[]>(CIERRES_CAJA_KEY, []);
    },
  },
};
