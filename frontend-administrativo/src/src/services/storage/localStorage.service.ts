/**
 * HappyDonuts - Servicio de LocalStorage
 * 
 * Este archivo contiene toda la lógica de almacenamiento local.
 * Migrado desde /lib/storage.ts con la misma funcionalidad.
 */

import type {
  Producto,
  Insumo,
  Categoria,
  Compra,
  ClienteProveedor,
  Comprobante,
  Promocion,
  NotaEntrada,
  NotaSalida,
  CajaAbierta,
  MovimientoCaja,
  CierreCaja,
  ProductoNE,
  GenerarComprobanteResult,
} from '../../types';
import { APP_CONFIG } from '../../config/app.config';
import { CONSTANTS } from '../../config/constants';

// ============================================
// UTILIDADES GENERALES
// ============================================

/**
 * Obtiene el siguiente ID disponible en un array
 */
export const getNextId = (items: any[]): number => {
  if (items.length === 0) return 1;
  return Math.max(...items.map(item => item.id)) + 1;
};

// ============================================
// PROMOCIONES
// ============================================

export const promocionesService = {
  getAll: (): Promocion[] => {
    const data = localStorage.getItem(APP_CONFIG.storageKeys.promociones);
    return data ? JSON.parse(data) : [];
  },

  save: (promociones: Promocion[]) => {
    localStorage.setItem(APP_CONFIG.storageKeys.promociones, JSON.stringify(promociones));
  },

  add: (promocion: Promocion) => {
    const promociones = promocionesService.getAll();
    promociones.push(promocion);
    promocionesService.save(promociones);
  },

  update: (id: number, promocion: Promocion) => {
    const promociones = promocionesService.getAll();
    const index = promociones.findIndex(p => p.id === id);
    if (index !== -1) {
      promociones[index] = promocion;
      promocionesService.save(promociones);
    }
  },

  delete: (id: number) => {
    const promociones = promocionesService.getAll();
    const filtered = promociones.filter(p => p.id !== id);
    promocionesService.save(filtered);
  },

  getActivas: (): Promocion[] => {
    const promociones = promocionesService.getAll();
    return promociones.filter(p => p.activo);
  },
};

// ============================================
// COMPRAS
// ============================================

export const comprasService = {
  getAll: (): Compra[] => {
    const data = localStorage.getItem(APP_CONFIG.storageKeys.compras);
    return data ? JSON.parse(data) : [];
  },

  save: (compras: Compra[]) => {
    localStorage.setItem(APP_CONFIG.storageKeys.compras, JSON.stringify(compras));
  },

  add: (compra: Compra) => {
    const compras = comprasService.getAll();
    compras.push(compra);
    comprasService.save(compras);
  },
};

// ============================================
// INSUMOS
// ============================================

export const insumosService = {
  getAll: (): Insumo[] => {
    const data = localStorage.getItem(APP_CONFIG.storageKeys.insumos);
    return data ? JSON.parse(data) : [];
  },

  save: (insumos: Insumo[]) => {
    localStorage.setItem(APP_CONFIG.storageKeys.insumos, JSON.stringify(insumos));
  },

  add: (insumo: Insumo) => {
    const insumos = insumosService.getAll();
    insumos.push(insumo);
    insumosService.save(insumos);
    
    // Si el insumo tiene cantidad inicial > 0, crear una Nota de Entrada automáticamente
    if (insumo.cantidad > 0) {
      const currentUser = localStorage.getItem('currentUser') || 'Sistema';
      const now = new Date();
      const fecha = now.toISOString().split('T')[0];
      const hora = now.toTimeString().split(' ')[0].substring(0, 5);
      
      const notaEntrada: NotaEntrada = {
        id: getNextId(notasEntradaService.getAll()),
        numero: notasEntradaService.generateNumero(),
        fecha: fecha,
        hora: hora,
        motivo: 'Por Ajuste de Inventario',
        productos: [{
          id: insumo.id,
          nombre: `${insumo.categoria} - ${insumo.nombre}`,
          cantidad: insumo.cantidad,
          unidad: insumo.unidadMedida
        }],
        observaciones: `Ingreso inicial del insumo: ${insumo.nombre}`,
        usuario: currentUser
      };
      
      notasEntradaService.add(notaEntrada);
    }
  },

  // Agregar insumo SIN generar nota de entrada (para usar en compras)
  addSinNota: (insumo: Insumo) => {
    const insumos = insumosService.getAll();
    insumos.push(insumo);
    insumosService.save(insumos);
  },

  update: (id: number, cantidad: number) => {
    const insumos = insumosService.getAll();
    const index = insumos.findIndex(i => i.id === id);
    if (index !== -1) {
      insumos[index].cantidad += cantidad;
      insumosService.save(insumos);
    }
  },

  findByNombre: (nombre: string, categoria: string): Insumo | undefined => {
    const insumos = insumosService.getAll();
    return insumos.find(i => i.nombre === nombre && i.categoria === categoria);
  },
};

// ============================================
// PRODUCTOS
// ============================================

export const productosService = {
  getAll: (): Producto[] => {
    const data = localStorage.getItem(APP_CONFIG.storageKeys.productos);
    return data ? JSON.parse(data) : [];
  },

  save: (productos: Producto[]) => {
    localStorage.setItem(APP_CONFIG.storageKeys.productos, JSON.stringify(productos));
  },

  add: (producto: Producto) => {
    const productos = productosService.getAll();
    productos.push(producto);
    productosService.save(productos);
  },

  update: (id: number, stock: number) => {
    const productos = productosService.getAll();
    const index = productos.findIndex(p => p.id === id);
    if (index !== -1) {
      productos[index].stock += stock;
      productosService.save(productos);
    }
  },

  findByNombre: (nombre: string): Producto | undefined => {
    const productos = productosService.getAll();
    return productos.find(p => p.nombre === nombre);
  },
};

// ============================================
// CATEGORÍAS
// ============================================

export const categoriasService = {
  getAll: (): Categoria[] => {
    const data = localStorage.getItem(APP_CONFIG.storageKeys.categorias);
    if (!data) {
      categoriasService.save(CONSTANTS.INITIAL_CATEGORIES);
      return CONSTANTS.INITIAL_CATEGORIES;
    }
    return JSON.parse(data);
  },

  save: (categorias: Categoria[]) => {
    localStorage.setItem(APP_CONFIG.storageKeys.categorias, JSON.stringify(categorias));
  },

  add: (categoria: Categoria) => {
    const categorias = categoriasService.getAll();
    categorias.push(categoria);
    categoriasService.save(categorias);
  },

  update: (id: number, categoria: Partial<Categoria>) => {
    const categorias = categoriasService.getAll();
    const index = categorias.findIndex(c => c.id === id);
    if (index !== -1) {
      categorias[index] = { ...categorias[index], ...categoria };
      categoriasService.save(categorias);
    }
  },

  delete: (id: number) => {
    const categorias = categoriasService.getAll();
    const filtered = categorias.filter(c => c.id !== id);
    categoriasService.save(filtered);
  },

  getByTipo: (tipo: 'Insumo' | 'Producto'): Categoria[] => {
    return categoriasService.getAll().filter(c => c.tipo === tipo);
  },
};

// ============================================
// NOTAS DE ENTRADA
// ============================================

export const notasEntradaService = {
  getAll: (): NotaEntrada[] => {
    const data = localStorage.getItem(APP_CONFIG.storageKeys.notasEntrada);
    return data ? JSON.parse(data) : [];
  },

  save: (notas: NotaEntrada[]) => {
    localStorage.setItem(APP_CONFIG.storageKeys.notasEntrada, JSON.stringify(notas));
  },

  add: (nota: NotaEntrada) => {
    const notas = notasEntradaService.getAll();
    notas.push(nota);
    notasEntradaService.save(notas);
  },

  generateNumero: (): string => {
    const notas = notasEntradaService.getAll();
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const notasDelMes = notas.filter(n => n.numero.startsWith(`NE-${year}${month}`));
    const nextNum = notasDelMes.length + 1;
    
    return `NE-${year}${month}-${String(nextNum).padStart(4, '0')}`;
  },
};

// ============================================
// NOTAS DE SALIDA
// ============================================

export const notasSalidaService = {
  getAll: (): NotaSalida[] => {
    const data = localStorage.getItem(APP_CONFIG.storageKeys.notasSalida);
    return data ? JSON.parse(data) : [];
  },

  save: (notas: NotaSalida[]) => {
    localStorage.setItem(APP_CONFIG.storageKeys.notasSalida, JSON.stringify(notas));
  },

  add: (nota: NotaSalida) => {
    const notas = notasSalidaService.getAll();
    notas.push(nota);
    notasSalidaService.save(notas);
  },

  generateNumero: (): string => {
    const notas = notasSalidaService.getAll();
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const notasDelMes = notas.filter(n => n.numero.startsWith(`NS-${year}${month}`));
    const nextNum = notasDelMes.length + 1;
    
    return `NS-${year}${month}-${String(nextNum).padStart(4, '0')}`;
  },
};

// ============================================
// CLIENTES Y PROVEEDORES
// ============================================

export const clientesProveedoresService = {
  getAll: (): ClienteProveedor[] => {
    const data = localStorage.getItem(APP_CONFIG.storageKeys.clientesProveedores);
    return data ? JSON.parse(data) : [];
  },

  save: (clientesProveedores: ClienteProveedor[]) => {
    localStorage.setItem(APP_CONFIG.storageKeys.clientesProveedores, JSON.stringify(clientesProveedores));
  },

  add: (clienteProveedor: ClienteProveedor) => {
    const clientesProveedores = clientesProveedoresService.getAll();
    clientesProveedores.push(clienteProveedor);
    clientesProveedoresService.save(clientesProveedores);
  },

  update: (id: number, clienteProveedor: ClienteProveedor) => {
    const clientesProveedores = clientesProveedoresService.getAll();
    const index = clientesProveedores.findIndex(cp => cp.id === id);
    if (index !== -1) {
      clientesProveedores[index] = clienteProveedor;
      clientesProveedoresService.save(clientesProveedores);
    }
  },

  delete: (id: number) => {
    const clientesProveedores = clientesProveedoresService.getAll();
    const filtered = clientesProveedores.filter(cp => cp.id !== id);
    clientesProveedoresService.save(filtered);
  },

  getProveedores: (): ClienteProveedor[] => {
    const clientesProveedores = clientesProveedoresService.getAll();
    return clientesProveedores.filter(cp => 
      (cp.tipo === 'Proveedor' || cp.tipo === 'Ambos') && cp.estado === 'Activo'
    );
  },

  getClientes: (): ClienteProveedor[] => {
    const clientesProveedores = clientesProveedoresService.getAll();
    return clientesProveedores.filter(cp => 
      (cp.tipo === 'Cliente' || cp.tipo === 'Ambos') && cp.estado === 'Activo'
    );
  },
};

// ============================================
// COMPROBANTES
// ============================================

export const comprobantesService = {
  getAll: (): Comprobante[] => {
    const data = localStorage.getItem(APP_CONFIG.storageKeys.comprobantes);
    return data ? JSON.parse(data) : [];
  },

  save: (comprobantes: Comprobante[]) => {
    localStorage.setItem(APP_CONFIG.storageKeys.comprobantes, JSON.stringify(comprobantes));
  },

  add: (comprobante: Comprobante) => {
    const comprobantes = comprobantesService.getAll();
    comprobantes.push(comprobante);
    comprobantesService.save(comprobantes);
  },

  generateNumero: (tipo: 'boleta' | 'factura'): GenerarComprobanteResult => {
    const comprobantes = comprobantesService.getAll();
    const serie = tipo === 'boleta' ? 'B001' : 'F001';
    
    const comprobantesDelTipo = comprobantes.filter(c => c.serie === serie);
    const nextNum = comprobantesDelTipo.length + 1;
    const numero = String(nextNum).padStart(6, '0');
    
    return {
      serie,
      numero,
      correlativo: `${serie}-${numero}`
    };
  },
};

// ============================================
// CAJA
// ============================================

export const cajaService = {
  getAbierta: (): CajaAbierta | null => {
    const data = localStorage.getItem(APP_CONFIG.storageKeys.cajaAbierta);
    return data ? JSON.parse(data) : null;
  },

  setAbierta: (caja: CajaAbierta) => {
    localStorage.setItem(APP_CONFIG.storageKeys.cajaAbierta, JSON.stringify(caja));
  },

  cerrar: () => {
    localStorage.removeItem(APP_CONFIG.storageKeys.cajaAbierta);
  },

  isAbierta: (): boolean => {
    return cajaService.getAbierta() !== null;
  },

  // Movimientos de Caja
  getMovimientos: (): MovimientoCaja[] => {
    const data = localStorage.getItem(APP_CONFIG.storageKeys.movimientosCaja);
    return data ? JSON.parse(data) : [];
  },

  saveMovimientos: (movimientos: MovimientoCaja[]) => {
    localStorage.setItem(APP_CONFIG.storageKeys.movimientosCaja, JSON.stringify(movimientos));
  },

  addMovimiento: (movimiento: MovimientoCaja) => {
    const movimientos = cajaService.getMovimientos();
    movimientos.push(movimiento);
    cajaService.saveMovimientos(movimientos);
  },

  getMovimientosDelDia: (): MovimientoCaja[] => {
    const movimientos = cajaService.getMovimientos();
    const today = new Date().toISOString().split('T')[0];
    return movimientos.filter(m => m.fecha === today);
  },

  limpiarMovimientosDelDia: () => {
    const movimientos = cajaService.getMovimientos();
    const today = new Date().toISOString().split('T')[0];
    const movimientosAnteriores = movimientos.filter(m => m.fecha !== today);
    cajaService.saveMovimientos(movimientosAnteriores);
  },

  // Historial de Cierres
  getHistorialCierres: (): CierreCaja[] => {
    const data = localStorage.getItem(APP_CONFIG.storageKeys.historialCierres);
    return data ? JSON.parse(data) : [];
  },

  saveHistorialCierres: (cierres: CierreCaja[]) => {
    localStorage.setItem(APP_CONFIG.storageKeys.historialCierres, JSON.stringify(cierres));
  },

  addCierre: (cierre: CierreCaja) => {
    const cierres = cajaService.getHistorialCierres();
    cierres.push(cierre);
    cajaService.saveHistorialCierres(cierres);
  },
};

// ============================================
// UTILIDADES DE SISTEMA
// ============================================

export const systemService = {
  /**
   * Limpia todos los datos excepto categorías
   */
  limpiarDatosExceptoCategorias: () => {
    const categoriasGuardadas = categoriasService.getAll();
    
    const clavesALimpiar = [
      APP_CONFIG.storageKeys.compras,
      APP_CONFIG.storageKeys.insumos,
      APP_CONFIG.storageKeys.productos,
      APP_CONFIG.storageKeys.notasEntrada,
      APP_CONFIG.storageKeys.notasSalida,
      APP_CONFIG.storageKeys.comprobantes,
      APP_CONFIG.storageKeys.cajaAbierta,
      APP_CONFIG.storageKeys.historialCierres,
      APP_CONFIG.storageKeys.currentUser,
      APP_CONFIG.storageKeys.clientesProveedores,
    ];
    
    clavesALimpiar.forEach(clave => {
      localStorage.removeItem(clave);
    });
    
    categoriasService.save(categoriasGuardadas);
    
    return true;
  },
};

// ============================================
// EXPORTS COMPATIBLES CON CÓDIGO ANTERIOR
// ============================================

// Exportaciones para mantener compatibilidad con el código existente
export const getPromociones = promocionesService.getAll;
export const savePromociones = promocionesService.save;
export const addPromocion = promocionesService.add;
export const updatePromocion = promocionesService.update;
export const deletePromocion = promocionesService.delete;
export const getPromocionesActivas = promocionesService.getActivas;

export const getCompras = comprasService.getAll;
export const saveCompras = comprasService.save;
export const addCompra = comprasService.add;

export const getInsumos = insumosService.getAll;
export const saveInsumos = insumosService.save;
export const addInsumo = insumosService.add;
export const addInsumoSinNota = insumosService.addSinNota;
export const updateInsumo = insumosService.update;
export const findInsumoByNombre = insumosService.findByNombre;

export const getProductos = productosService.getAll;
export const saveProductos = productosService.save;
export const addProducto = productosService.add;
export const updateProducto = productosService.update;
export const findProductoByNombre = productosService.findByNombre;

export const getCategorias = categoriasService.getAll;
export const saveCategorias = categoriasService.save;
export const addCategoria = categoriasService.add;
export const updateCategoria = categoriasService.update;
export const deleteCategoria = categoriasService.delete;
export const getCategoriasByTipo = categoriasService.getByTipo;

export const getNotasEntrada = notasEntradaService.getAll;
export const saveNotasEntrada = notasEntradaService.save;
export const addNotaEntrada = notasEntradaService.add;
export const generateNotaEntradaNumero = notasEntradaService.generateNumero;

export const getNotasSalida = notasSalidaService.getAll;
export const saveNotasSalida = notasSalidaService.save;
export const addNotaSalida = notasSalidaService.add;
export const generateNotaSalidaNumero = notasSalidaService.generateNumero;

export const getClientesProveedores = clientesProveedoresService.getAll;
export const saveClientesProveedores = clientesProveedoresService.save;
export const addClienteProveedor = clientesProveedoresService.add;
export const updateClienteProveedor = clientesProveedoresService.update;
export const deleteClienteProveedor = clientesProveedoresService.delete;
export const getProveedores = clientesProveedoresService.getProveedores;
export const getClientes = clientesProveedoresService.getClientes;

export const getComprobantes = comprobantesService.getAll;
export const saveComprobantes = comprobantesService.save;
export const addComprobante = comprobantesService.add;
export const generateComprobanteNumero = comprobantesService.generateNumero;

export const getCajaAbierta = cajaService.getAbierta;
export const setCajaAbierta = cajaService.setAbierta;
export const cerrarCaja = cajaService.cerrar;
export const isCajaAbierta = cajaService.isAbierta;
export const getMovimientosCaja = cajaService.getMovimientos;
export const saveMovimientosCaja = cajaService.saveMovimientos;
export const addMovimientoCaja = cajaService.addMovimiento;
export const getMovimientosDelDia = cajaService.getMovimientosDelDia;
export const limpiarMovimientosDelDia = cajaService.limpiarMovimientosDelDia;

export const limpiarDatosExceptoCategorias = systemService.limpiarDatosExceptoCategorias;
