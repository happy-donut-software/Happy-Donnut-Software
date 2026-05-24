/**
 * HappyDonuts - Constantes del Sistema
 */

export const CONSTANTS = {
  // Usuarios por defecto
  DEFAULT_USERS: [
    {
      id: 1,
      usuario: 'admin',
      contraseña: 'admin123',
      rol: 'Administrador' as const,
      activo: true,
      fechaCreacion: new Date().toISOString(),
    },
    {
      id: 2,
      usuario: 'empleado',
      contraseña: 'empleado123',
      rol: 'Empleado' as const,
      activo: true,
      fechaCreacion: new Date().toISOString(),
    },
  ],

  // Categorías iniciales
  INITIAL_CATEGORIES: [
    { 
      id: 1, 
      tipo: 'Producto' as const, 
      nombre: 'Donas', 
      descripcion: 'Donas de diversos sabores y estilos', 
      itemsCount: 0, 
      estado: 'Activa' as const 
    },
    { 
      id: 2, 
      tipo: 'Producto' as const, 
      nombre: 'Bebidas', 
      descripcion: 'Bebidas calientes y frías, frappés y cafés', 
      itemsCount: 0, 
      estado: 'Activa' as const 
    },
    { 
      id: 3, 
      tipo: 'Producto' as const, 
      nombre: 'Otros', 
      descripcion: 'Otros productos y complementos', 
      itemsCount: 0, 
      estado: 'Activa' as const 
    },
    { 
      id: 4, 
      tipo: 'Insumo' as const, 
      nombre: 'Bebidas', 
      descripcion: 'Insumos para bebidas: café, leche, agua, etc.', 
      itemsCount: 0, 
      estado: 'Activa' as const 
    },
    { 
      id: 5, 
      tipo: 'Insumo' as const, 
      nombre: 'Panadería', 
      descripcion: 'Insumos para panadería: harina, azúcar, levadura, etc.', 
      itemsCount: 0, 
      estado: 'Activa' as const 
    },
    { 
      id: 6, 
      tipo: 'Insumo' as const, 
      nombre: 'Lácteos', 
      descripcion: 'Productos lácteos: mantequilla, crema, leche, etc.', 
      itemsCount: 0, 
      estado: 'Activa' as const 
    },
  ],

  // Datos de empresa por defecto
  DEFAULT_EMPRESA: {
    ruc: '10123456789',
    razonSocial: 'HAPPYDONUTS S.A.C.',
    nombreComercial: 'HappyDonuts',
    direccion: 'Av. Principal 123, Lima, Perú',
    telefono: '987654321',
    email: 'contacto@happydonuts.com',
    regimen: 'RUS',
    serieBoletaActual: 'B001',
    serieFacturaActual: 'F001',
  },

  // Unidades de medida comunes
  UNIDADES_MEDIDA: [
    'Unidad',
    'Kilogramo',
    'Gramo',
    'Litro',
    'Mililitro',
    'Caja',
    'Paquete',
    'Bolsa',
  ],

  // Motivos de Notas de Entrada
  MOTIVOS_NOTA_ENTRADA: [
    'Por Compra',
    'Por Producción Interna',
    'Por Devolución de Cliente',
    'Por Ajuste de Inventario',
    'Por Donación/Cortesía',
  ],

  // Motivos de Notas de Salida
  MOTIVOS_NOTA_SALIDA: [
    'Por Venta',
    'Por Uso Interno / Producción',
    'Por Merma / Pérdida',
    'Por Devolución a Proveedor',
    'Por Ajuste de Inventario',
  ],

  // Métodos de pago
  METODOS_PAGO: [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'yape', label: 'Yape' },
    { value: 'plin', label: 'Plin' },
  ],

  // Tipos de documento
  TIPOS_DOCUMENTO: [
    { value: 'DNI', label: 'DNI' },
    { value: 'RUC', label: 'RUC' },
  ],

  // Mensajes del sistema
  MESSAGES: {
    SUCCESS: {
      SAVE: 'Guardado exitosamente',
      UPDATE: 'Actualizado exitosamente',
      DELETE: 'Eliminado exitosamente',
      LOGIN: 'Inicio de sesión exitoso',
      LOGOUT: 'Sesión cerrada exitosamente',
    },
    ERROR: {
      GENERIC: 'Ocurrió un error. Por favor, intenta de nuevo.',
      NOT_FOUND: 'No se encontró el registro',
      INVALID_DATA: 'Datos inválidos',
      UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
      LOGIN_FAILED: 'Usuario o contraseña incorrectos',
    },
    WARNING: {
      UNSAVED_CHANGES: 'Tienes cambios sin guardar',
      CONFIRM_DELETE: '¿Estás seguro de eliminar este registro?',
    },
  },

  // Límites y validaciones
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    MAX_PRODUCTO_NAME_LENGTH: 100,
    MIN_STOCK: 0,
    MIN_PRECIO: 0.01,
    MAX_OBSERVACIONES_LENGTH: 500,
  },
};

export default CONSTANTS;
