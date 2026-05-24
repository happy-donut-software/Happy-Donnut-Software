// Sistema de almacenamiento centralizado usando localStorage

export interface Insumo {
  id: number;
  categoria: string;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  estado: "Disponible" | "No Disponible";
}

export interface RecetaItem {
  insumoId: number;
  insumoNombre: string;
  cantidad: number;
}

export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  tipo_producto: "Preparado" | "No Preparado";
  precio: number;
  stock: number;
  estado: "Disponible" | "No Disponible";
  receta?: RecetaItem[];
}

export interface Cliente {
  id: number;
  tipoDocumento: "RUC" | "DNI";
  numeroDocumento: string;
  nombreCompleto: string;
  direccion: string;
  telefono: string;
  email: string;
  estado: "Activo" | "Inactivo";
  fechaRegistro: string;
  cantidadCompras: number;
  observaciones?: string;
}

export interface ProductoNE {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
}

export interface NotaEntrada {
  id: number;
  numero: string;
  fecha: string;
  hora: string;
  productos: ProductoNE[];
  observaciones?: string;
}

export interface ProductoNS {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
}

export interface NotaSalida {
  id: number;
  numero: string;
  fecha: string;
  hora: string;
  productos: ProductoNS[];
  observaciones?: string;
}

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
  tipoComprobante: "boleta" | "factura";
  fecha: string;
  hora: string;
  cliente?: string;
  metodoPago: "efectivo" | "tarjeta" | "yape" | "plin";
  items: ItemComprobante[];
  subtotal: number;
  total: number;
  usuario: string;
  estado: "Emitido" | "Anulado";
}

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

// Funciones de almacenamiento de Promociones
export const getPromociones = (): Promocion[] => {
  const data = localStorage.getItem('promociones');
  return data ? JSON.parse(data) : [];
};

export const savePromociones = (promociones: Promocion[]) => {
  localStorage.setItem('promociones', JSON.stringify(promociones));
};

export const addPromocion = (promocion: Promocion) => {
  const promociones = getPromociones();
  promociones.push(promocion);
  savePromociones(promociones);
};

export const updatePromocion = (id: number, promocion: Promocion) => {
  const promociones = getPromociones();
  const index = promociones.findIndex(p => p.id === id);
  if (index !== -1) {
    promociones[index] = promocion;
    savePromociones(promociones);
  }
};

export const deletePromocion = (id: number) => {
  const promociones = getPromociones();
  const filtered = promociones.filter(p => p.id !== id);
  savePromociones(filtered);
};

export const getPromocionesActivas = (): Promocion[] => {
  const promociones = getPromociones();
  return promociones.filter(p => p.activo);
};


// Funciones de almacenamiento de Insumos
export const getInsumos = (): Insumo[] => {
  const data = localStorage.getItem('insumos');
  if (!data) {
    // Datos iniciales de insumos
    const insumosIniciales: Insumo[] = [
      // Categoría: Vasos
      { id: 1, categoria: "Vasos", nombre: "Frappe 16oz", unidadMedida: "und", cantidad: 150, estado: "Disponible" },
      { id: 2, categoria: "Vasos", nombre: "Frappe 10oz", unidadMedida: "und", cantidad: 200, estado: "Disponible" },
      // Categoría: Bebidas
      { id: 3, categoria: "Bebidas", nombre: "Cafe", unidadMedida: "gr", cantidad: 5000, estado: "Disponible" },
      { id: 4, categoria: "Bebidas", nombre: "Te", unidadMedida: "und", cantidad: 50, estado: "Disponible" },
      { id: 5, categoria: "Bebidas", nombre: "Manzanilla", unidadMedida: "und", cantidad: 40, estado: "Disponible" },
      { id: 6, categoria: "Bebidas", nombre: "Anis", unidadMedida: "und", cantidad: 35, estado: "Disponible" },
      { id: 7, categoria: "Bebidas", nombre: "Agua", unidadMedida: "ml", cantidad: 30000, estado: "Disponible" },
      { id: 8, categoria: "Bebidas", nombre: "Gaseosa", unidadMedida: "ml", cantidad: 25000, estado: "Disponible" },
    ];
    saveInsumos(insumosIniciales);
    return insumosIniciales;
  }
  return JSON.parse(data);
};

export const saveInsumos = (insumos: Insumo[]) => {
  localStorage.setItem('insumos', JSON.stringify(insumos));
};

export const addInsumo = (insumo: Insumo) => {
  const insumos = getInsumos();
  insumos.push(insumo);
  saveInsumos(insumos);
  
  // Si el insumo tiene cantidad inicial > 0, crear una Nota de Entrada automáticamente
  if (insumo.cantidad > 0) {
    const currentUser = localStorage.getItem('currentUser') || 'Sistema';
    const now = new Date();
    const fecha = now.toISOString().split('T')[0];
    const hora = now.toTimeString().split(' ')[0].substring(0, 5);
    
    const notaEntrada: NotaEntrada = {
      id: getNextId(getNotasEntrada()),
      numero: generateNotaEntradaNumero(),
      fecha: fecha,
      hora: hora,
      productos: [{
        id: insumo.id,
        nombre: `${insumo.categoria} - ${insumo.nombre}`,
        cantidad: insumo.cantidad,
        unidad: insumo.unidadMedida
      }],
      observaciones: `Ingreso inicial del insumo: ${insumo.nombre}`
    };
    
    addNotaEntrada(notaEntrada);
  }
};

export const updateInsumo = (id: number, cantidad: number) => {
  const insumos = getInsumos();
  const index = insumos.findIndex(i => i.id === id);
  if (index !== -1) {
    insumos[index].cantidad += cantidad;
    if (insumos[index].cantidad < 0) insumos[index].cantidad = 0;
    saveInsumos(insumos);
  }
};

export const updateInsumoFull = (id: number, updates: Partial<Insumo>) => {
  const insumos = getInsumos();
  const index = insumos.findIndex(i => i.id === id);
  if (index !== -1) {
    insumos[index] = { ...insumos[index], ...updates };
    saveInsumos(insumos);
  }
};

export const deleteInsumo = (id: number) => {
  const insumos = getInsumos();
  saveInsumos(insumos.filter(i => i.id !== id));
};

export const findInsumoByNombre = (nombre: string, categoria: string): Insumo | undefined => {
  const insumos = getInsumos();
  return insumos.find(i => i.nombre === nombre && i.categoria === categoria);
};

// ============================================
// MOVIMIENTOS DE INSUMOS DEL DÍA
// ============================================

export interface InsumoMovimiento {
  insumoId: number;
  insumoNombre: string;
  cantidadConsumida: number;
  comprobanteRef: string;
  fecha: string;
}

export const getInsumosMovimientosDelDia = (): InsumoMovimiento[] => {
  const data = localStorage.getItem('insumosMovimientosDia');
  if (!data) return [];
  const today = new Date().toISOString().split('T')[0];
  const all: InsumoMovimiento[] = JSON.parse(data);
  return all.filter(m => m.fecha === today);
};

export const addInsumoMovimiento = (mov: InsumoMovimiento) => {
  const data = localStorage.getItem('insumosMovimientosDia');
  const all: InsumoMovimiento[] = data ? JSON.parse(data) : [];
  all.push(mov);
  localStorage.setItem('insumosMovimientosDia', JSON.stringify(all));
};

export const limpiarInsumosMovimientosDelDia = () => {
  localStorage.removeItem('insumosMovimientosDia');
};

export const deductInsumosFromSale = (
  items: { productoId: number; cantidad: number }[],
  comprobanteRef: string
) => {
  const productos = getProductos();
  const today = new Date().toISOString().split('T')[0];

  items.forEach(item => {
    const producto = productos.find(p => p.id === item.productoId);
    if (!producto?.receta?.length) return;

    producto.receta.forEach(recetaItem => {
      const totalConsumido = recetaItem.cantidad * item.cantidad;
      updateInsumo(recetaItem.insumoId, -totalConsumido);
      addInsumoMovimiento({
        insumoId: recetaItem.insumoId,
        insumoNombre: recetaItem.insumoNombre,
        cantidadConsumida: totalConsumido,
        comprobanteRef,
        fecha: today,
      });
    });
  });
};

// Funciones de almacenamiento de Productos
export const getProductos = (): Producto[] => {
  const data = localStorage.getItem('productos');
  if (!data) {
    // Datos iniciales de productos
    const productosIniciales: Producto[] = [
      // Categoría: Donas (No Preparado - Con Stock)
      {
        id: 1,
        nombre: "Dona Glaseada",
        categoria: "Donas",
        tipo_producto: "No Preparado",
        precio: 3.50,
        stock: 50,
        estado: "Disponible"
      },
      {
        id: 2,
        nombre: "Dona de Chocolate",
        categoria: "Donas",
        tipo_producto: "No Preparado",
        precio: 4.00,
        stock: 45,
        estado: "Disponible"
      },
      {
        id: 3,
        nombre: "Dona Rellena de Manjar",
        categoria: "Donas",
        tipo_producto: "No Preparado",
        precio: 4.50,
        stock: 30,
        estado: "Disponible"
      },
      {
        id: 4,
        nombre: "Dona con Sprinkles",
        categoria: "Donas",
        tipo_producto: "No Preparado",
        precio: 3.50,
        stock: 40,
        estado: "Disponible"
      },

      // Categoría: Frapes (Preparado - Al Momento, con recetas)
      {
        id: 5,
        nombre: "Frappe de Cafe Grande",
        categoria: "Frapes",
        tipo_producto: "Preparado",
        precio: 8.00,
        stock: 0,
        estado: "Disponible",
        receta: [
          { insumoId: 1, insumoNombre: "Frappe 16oz", cantidad: 1 },
          { insumoId: 3, insumoNombre: "Cafe", cantidad: 50 },
          { insumoId: 7, insumoNombre: "Agua", cantidad: 300 }
        ]
      },
      {
        id: 6,
        nombre: "Frappe de Cafe Pequeño",
        categoria: "Frapes",
        tipo_producto: "Preparado",
        precio: 6.00,
        stock: 0,
        estado: "Disponible",
        receta: [
          { insumoId: 2, insumoNombre: "Frappe 10oz", cantidad: 1 },
          { insumoId: 3, insumoNombre: "Cafe", cantidad: 30 },
          { insumoId: 7, insumoNombre: "Agua", cantidad: 200 }
        ]
      },
      {
        id: 7,
        nombre: "Te Helado Grande",
        categoria: "Frapes",
        tipo_producto: "Preparado",
        precio: 7.00,
        stock: 0,
        estado: "Disponible",
        receta: [
          { insumoId: 1, insumoNombre: "Frappe 16oz", cantidad: 1 },
          { insumoId: 4, insumoNombre: "Te", cantidad: 2 },
          { insumoId: 7, insumoNombre: "Agua", cantidad: 400 }
        ]
      },
      {
        id: 8,
        nombre: "Manzanilla Helada",
        categoria: "Frapes",
        tipo_producto: "Preparado",
        precio: 6.50,
        stock: 0,
        estado: "Disponible",
        receta: [
          { insumoId: 2, insumoNombre: "Frappe 10oz", cantidad: 1 },
          { insumoId: 5, insumoNombre: "Manzanilla", cantidad: 2 },
          { insumoId: 7, insumoNombre: "Agua", cantidad: 250 }
        ]
      },
      {
        id: 9,
        nombre: "Anis Frio",
        categoria: "Frapes",
        tipo_producto: "Preparado",
        precio: 6.50,
        stock: 0,
        estado: "Disponible",
        receta: [
          { insumoId: 2, insumoNombre: "Frappe 10oz", cantidad: 1 },
          { insumoId: 6, insumoNombre: "Anis", cantidad: 2 },
          { insumoId: 7, insumoNombre: "Agua", cantidad: 250 }
        ]
      },
      {
        id: 10,
        nombre: "Gaseosa Personal",
        categoria: "Frapes",
        tipo_producto: "Preparado",
        precio: 4.00,
        stock: 0,
        estado: "Disponible",
        receta: [
          { insumoId: 2, insumoNombre: "Frappe 10oz", cantidad: 1 },
          { insumoId: 8, insumoNombre: "Gaseosa", cantidad: 300 }
        ]
      },
    ];
    saveProductos(productosIniciales);
    return productosIniciales;
  }
  return JSON.parse(data);
};

export const saveProductos = (productos: Producto[]) => {
  localStorage.setItem('productos', JSON.stringify(productos));
};

export const addProducto = (producto: Producto) => {
  const productos = getProductos();
  productos.push(producto);
  saveProductos(productos);
};

export const updateProducto = (id: number, stock: number) => {
  const productos = getProductos();
  const index = productos.findIndex(p => p.id === id);
  if (index !== -1) {
    productos[index].stock += stock;
    saveProductos(productos);
  }
};

export const findProductoByNombre = (nombre: string): Producto | undefined => {
  const productos = getProductos();
  return productos.find(p => p.nombre === nombre);
};

// Funciones de almacenamiento de Notas de Entrada
export const getNotasEntrada = (): NotaEntrada[] => {
  const data = localStorage.getItem('notasEntrada');
  return data ? JSON.parse(data) : [];
};

export const saveNotasEntrada = (notas: NotaEntrada[]) => {
  localStorage.setItem('notasEntrada', JSON.stringify(notas));
};

export const addNotaEntrada = (nota: NotaEntrada) => {
  const notas = getNotasEntrada();
  notas.push(nota);
  saveNotasEntrada(notas);
};

// Función para generar número de nota de entrada
export const generateNotaEntradaNumero = (): string => {
  const notas = getNotasEntrada();
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  // Filtrar notas del mes actual
  const notasDelMes = notas.filter(n => n.numero.startsWith(`NE-${year}${month}`));
  const nextNum = notasDelMes.length + 1;
  
  return `NE-${year}${month}-${String(nextNum).padStart(4, '0')}`;
};

// Función para obtener el siguiente ID
export const getNextId = (items: any[]): number => {
  if (items.length === 0) return 1;
  return Math.max(...items.map(item => item.id)) + 1;
};

// Interfaces y Funciones para Categorías
export interface Categoria {
  id: number;
  tipo: "Insumo" | "Producto";
  nombre: string;
  descripcion: string;
  itemsCount: number;
  estado: "Activa" | "Inactiva";
}

// Funciones de almacenamiento de Categorías
export const getCategorias = (): Categoria[] => {
  const data = localStorage.getItem('categorias');
  if (!data) {
    // Datos iniciales
    const categoriasIniciales: Categoria[] = [
      { id: 1, tipo: "Producto", nombre: "Donas", descripcion: "Donas de diversos sabores y estilos", itemsCount: 0, estado: "Activa" },
      { id: 2, tipo: "Producto", nombre: "Frapes", descripcion: "Frapes, bebidas frías y batidos", itemsCount: 0, estado: "Activa" },
      { id: 3, tipo: "Insumo", nombre: "Vasos", descripcion: "Vasos y envases para bebidas", itemsCount: 0, estado: "Activa" },
      { id: 4, tipo: "Insumo", nombre: "Bebidas", descripcion: "Insumos para bebidas: café, leche, agua, etc.", itemsCount: 0, estado: "Activa" },
    ];
    saveCategorias(categoriasIniciales);
    return categoriasIniciales;
  }
  return JSON.parse(data);
};

export const saveCategorias = (categorias: Categoria[]) => {
  localStorage.setItem('categorias', JSON.stringify(categorias));
};

export const addCategoria = (categoria: Categoria) => {
  const categorias = getCategorias();
  categorias.push(categoria);
  saveCategorias(categorias);
};

export const updateCategoria = (id: number, categoria: Partial<Categoria>) => {
  const categorias = getCategorias();
  const index = categorias.findIndex(c => c.id === id);
  if (index !== -1) {
    categorias[index] = { ...categorias[index], ...categoria };
    saveCategorias(categorias);
  }
};

export const deleteCategoria = (id: number) => {
  const categorias = getCategorias();
  const filtered = categorias.filter(c => c.id !== id);
  saveCategorias(filtered);
};

export const getCategoriasByTipo = (tipo: "Insumo" | "Producto"): Categoria[] => {
  return getCategorias().filter(c => c.tipo === tipo);
};

// Función para limpiar todos los datos excepto categorías
export const limpiarDatosExceptoCategorias = () => {
  // Guardar categorías antes de limpiar
  const categoriasGuardadas = getCategorias();
  
  // Lista de todas las claves de localStorage usadas en el sistema
  const clavesALimpiar = [
    'insumos',
    'productos',
    'notasEntrada',
    'notasSalida',
    'comprobantes',
    'cajaAbierta',
    'historialCierres',
    'currentUser',
    'clientesProveedores'
  ];
  
  // Eliminar cada clave
  clavesALimpiar.forEach(clave => {
    localStorage.removeItem(clave);
  });
  
  // Restaurar categorías
  saveCategorias(categoriasGuardadas);
  
  return true;
};

// Funciones de almacenamiento de Clientes
export const getClientes = (): Cliente[] => {
  const data = localStorage.getItem('clientes');
  return data ? JSON.parse(data) : [];
};

export const saveClientes = (clientes: Cliente[]) => {
  localStorage.setItem('clientes', JSON.stringify(clientes));
};

export const addCliente = (cliente: Cliente) => {
  const clientes = getClientes();
  clientes.push(cliente);
  saveClientes(clientes);
};

export const updateCliente = (id: number, cliente: Cliente) => {
  const clientes = getClientes();
  const index = clientes.findIndex(c => c.id === id);
  if (index !== -1) {
    clientes[index] = cliente;
    saveClientes(clientes);
  }
};

export const deleteCliente = (id: number) => {
  const clientes = getClientes();
  const filtered = clientes.filter(c => c.id !== id);
  saveClientes(filtered);
};

export const getClientesActivos = (): Cliente[] => {
  const clientes = getClientes();
  return clientes.filter(c => c.estado === "Activo");
};

// Funciones de almacenamiento de Comprobantes
export const getComprobantes = (): Comprobante[] => {
  const data = localStorage.getItem('comprobantes');
  return data ? JSON.parse(data) : [];
};

export const saveComprobantes = (comprobantes: Comprobante[]) => {
  localStorage.setItem('comprobantes', JSON.stringify(comprobantes));
};

export const addComprobante = (comprobante: Comprobante) => {
  const comprobantes = getComprobantes();
  comprobantes.push(comprobante);
  saveComprobantes(comprobantes);
};

// Función para generar número de comprobante
export const generateComprobanteNumero = (tipo: "boleta" | "factura"): { serie: string; numero: string; correlativo: string } => {
  const comprobantes = getComprobantes();
  const serie = tipo === "boleta" ? "B001" : "F001";
  
  const comprobantesDelTipo = comprobantes.filter(c => c.serie === serie);
  const nextNum = comprobantesDelTipo.length + 1;
  const numero = String(nextNum).padStart(6, '0');
  
  return {
    serie,
    numero,
    correlativo: `${serie}-${numero}`
  };
};

// Funciones de almacenamiento de Notas de Salida
export const getNotasSalida = (): NotaSalida[] => {
  const data = localStorage.getItem('notasSalida');
  return data ? JSON.parse(data) : [];
};

export const saveNotasSalida = (notas: NotaSalida[]) => {
  localStorage.setItem('notasSalida', JSON.stringify(notas));
};

export const addNotaSalida = (nota: NotaSalida) => {
  const notas = getNotasSalida();
  notas.push(nota);
  saveNotasSalida(notas);
};

// Función para generar número de nota de salida
export const generateNotaSalidaNumero = (): string => {
  const notas = getNotasSalida();
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  // Filtrar notas del mes actual
  const notasDelMes = notas.filter(n => n.numero.startsWith(`NS-${year}${month}`));
  const nextNum = notasDelMes.length + 1;
  
  return `NS-${year}${month}-${String(nextNum).padStart(4, '0')}`;
};

// ============================================
// SISTEMA DE CAJA
// ============================================

export interface CajaAbierta {
  fecha: string;
  hora: string;
  fondoInicial: number;
  fondoInicialYape: number;
  fondoInicialPlin: number;
  usuario: string;
}

export interface MovimientoCaja {
  id: number;
  fecha: string;
  hora: string;
  tipo: "Ingreso" | "Egreso";
  concepto: string;
  metodoPago: "efectivo" | "tarjeta" | "yape" | "plin" | "N/A";
  monto: number;
  referencia?: string;
  usuario: string;
}

// Funciones de Caja Abierta
export const getCajaAbierta = (): CajaAbierta | null => {
  const data = localStorage.getItem('cajaAbierta');
  return data ? JSON.parse(data) : null;
};

export const setCajaAbierta = (caja: CajaAbierta) => {
  localStorage.setItem('cajaAbierta', JSON.stringify(caja));
};

export const cerrarCaja = () => {
  localStorage.removeItem('cajaAbierta');
};

export const isCajaAbierta = (): boolean => {
  return getCajaAbierta() !== null;
};

// Funciones de Movimientos de Caja
export const getMovimientosCaja = (): MovimientoCaja[] => {
  const data = localStorage.getItem('movimientosCaja');
  return data ? JSON.parse(data) : [];
};

export const saveMovimientosCaja = (movimientos: MovimientoCaja[]) => {
  localStorage.setItem('movimientosCaja', JSON.stringify(movimientos));
};

export const addMovimientoCaja = (movimiento: MovimientoCaja) => {
  const movimientos = getMovimientosCaja();
  movimientos.push(movimiento);
  saveMovimientosCaja(movimientos);
};

export const getMovimientosDelDia = (): MovimientoCaja[] => {
  const movimientos = getMovimientosCaja();
  const today = new Date().toISOString().split('T')[0];
  return movimientos.filter(m => m.fecha === today);
};

export const limpiarMovimientosDelDia = () => {
  const movimientos = getMovimientosCaja();
  const today = new Date().toISOString().split('T')[0];
  const movimientosAnteriores = movimientos.filter(m => m.fecha !== today);
  saveMovimientosCaja(movimientosAnteriores);
};