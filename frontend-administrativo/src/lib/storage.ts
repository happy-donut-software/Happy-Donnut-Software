// Sistema de almacenamiento centralizado usando localStorage

export interface DetalleInsumo {
  id: string;
  categoria: string;
  nombre: string;
  unidadMedida: string;
  cantidadInsumo: number;
  importeTotal: number;
}

export interface DetalleProducto {
  id: string;
  categoria: string;
  nombre: string;
  cantidad: number;
  importeTotal: number;
}

export interface Compra {
  id: number;
  numeroOrden: string;
  proveedor: string;
  fechaCompra: string;
  fechaEntrega: string;
  estado: "Pendiente" | "Recibido";
  detallesInsumos: DetalleInsumo[];
  detallesProductos: DetalleProducto[];
  totalInsumos: number;
  totalProductos: number;
  total: number;
  observaciones: string;
  creadoPor: string;
  fechaCreacion: string;
}

export interface Insumo {
  id: number;
  categoria: string;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  estado: "Disponible" | "No Disponible";
}

export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  tipo_producto: "Preparado" | "No Preparado";
  precio: number;
  stock: number;
  estado: "Disponible" | "No Disponible";
}

export interface ClienteProveedor {
  id: number;
  tipo: "Cliente" | "Proveedor" | "Ambos";
  tipoDocumento: "RUC" | "DNI";
  numeroDocumento: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  email: string;
  estado: "Activo" | "Inactivo";
  fechaRegistro: string;
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
  motivo: "Por Compra" | "Por Producción Interna" | "Por Devolución de Cliente" | "Por Ajuste de Inventario" | "Por Donación/Cortesía";
  docReferencia?: string;
  productos: ProductoNE[];
  observaciones?: string;
  usuario: string;
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
  motivo: "Por Venta" | "Por Uso Interno / Producción" | "Por Merma / Pérdida" | "Por Devolución a Proveedor" | "Por Ajuste de Inventario";
  docReferencia?: string;
  productos: ProductoNS[];
  observaciones?: string;
  usuario: string;
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

// Funciones de almacenamiento de Compras
export const getCompras = (): Compra[] => {
  const data = localStorage.getItem('compras');
  return data ? JSON.parse(data) : [];
};

export const saveCompras = (compras: Compra[]) => {
  localStorage.setItem('compras', JSON.stringify(compras));
};

export const addCompra = (compra: Compra) => {
  const compras = getCompras();
  compras.push(compra);
  saveCompras(compras);
};

// Funciones de almacenamiento de Insumos
export const getInsumos = (): Insumo[] => {
  const data = localStorage.getItem('insumos');
  return data ? JSON.parse(data) : [];
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
      motivo: "Por Ajuste de Inventario",
      productos: [{
        id: insumo.id,
        nombre: `${insumo.categoria} - ${insumo.nombre}`,
        cantidad: insumo.cantidad,
        unidad: insumo.unidadMedida
      }],
      observaciones: `Ingreso inicial del insumo: ${insumo.nombre}`,
      usuario: currentUser
    };
    
    addNotaEntrada(notaEntrada);
  }
};

// Función para agregar insumo SIN generar nota de entrada (para usar en compras)
export const addInsumoSinNota = (insumo: Insumo) => {
  const insumos = getInsumos();
  insumos.push(insumo);
  saveInsumos(insumos);
};

export const updateInsumo = (id: number, cantidad: number) => {
  const insumos = getInsumos();
  const index = insumos.findIndex(i => i.id === id);
  if (index !== -1) {
    insumos[index].cantidad += cantidad;
    saveInsumos(insumos);
  }
};

export const findInsumoByNombre = (nombre: string, categoria: string): Insumo | undefined => {
  const insumos = getInsumos();
  return insumos.find(i => i.nombre === nombre && i.categoria === categoria);
};

// Funciones de almacenamiento de Productos
export const getProductos = (): Producto[] => {
  const data = localStorage.getItem('productos');
  return data ? JSON.parse(data) : [];
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
      { id: 2, tipo: "Producto", nombre: "Bebidas", descripcion: "Bebidas calientes y frías, frappés y cafés", itemsCount: 0, estado: "Activa" },
      { id: 3, tipo: "Producto", nombre: "Otros", descripcion: "Otros productos y complementos", itemsCount: 0, estado: "Activa" },
      { id: 4, tipo: "Insumo", nombre: "Bebidas", descripcion: "Insumos para bebidas: café, leche, agua, etc.", itemsCount: 0, estado: "Activa" },
      { id: 5, tipo: "Insumo", nombre: "Panadería", descripcion: "Insumos para panadería: harina, azúcar, levadura, etc.", itemsCount: 0, estado: "Activa" },
      { id: 6, tipo: "Insumo", nombre: "Lácteos", descripcion: "Productos lácteos: mantequilla, crema, leche, etc.", itemsCount: 0, estado: "Activa" },
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
    'compras',
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

// Funciones de almacenamiento de Clientes y Proveedores
export const getClientesProveedores = (): ClienteProveedor[] => {
  const data = localStorage.getItem('clientesProveedores');
  return data ? JSON.parse(data) : [];
};

export const saveClientesProveedores = (clientesProveedores: ClienteProveedor[]) => {
  localStorage.setItem('clientesProveedores', JSON.stringify(clientesProveedores));
};

export const addClienteProveedor = (clienteProveedor: ClienteProveedor) => {
  const clientesProveedores = getClientesProveedores();
  clientesProveedores.push(clienteProveedor);
  saveClientesProveedores(clientesProveedores);
};

export const updateClienteProveedor = (id: number, clienteProveedor: ClienteProveedor) => {
  const clientesProveedores = getClientesProveedores();
  const index = clientesProveedores.findIndex(cp => cp.id === id);
  if (index !== -1) {
    clientesProveedores[index] = clienteProveedor;
    saveClientesProveedores(clientesProveedores);
  }
};

export const deleteClienteProveedor = (id: number) => {
  const clientesProveedores = getClientesProveedores();
  const filtered = clientesProveedores.filter(cp => cp.id !== id);
  saveClientesProveedores(filtered);
};

export const getProveedores = (): ClienteProveedor[] => {
  const clientesProveedores = getClientesProveedores();
  return clientesProveedores.filter(cp => 
    (cp.tipo === "Proveedor" || cp.tipo === "Ambos") && cp.estado === "Activo"
  );
};

export const getClientes = (): ClienteProveedor[] => {
  const clientesProveedores = getClientesProveedores();
  return clientesProveedores.filter(cp => 
    (cp.tipo === "Cliente" || cp.tipo === "Ambos") && cp.estado === "Activo"
  );
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