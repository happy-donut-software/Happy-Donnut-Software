/**
 * HappyDonuts - Configuración General de la Aplicación
 */

export const APP_CONFIG = {
  // Información de la aplicación
  name: 'HappyDonuts',
  fullName: 'HappyDonuts - Sistema Administrativo',
  version: '1.0.0',
  description: 'Sistema de gestión empresarial para ventas de donas y frapes',

  // Colores del tema (amarillo y naranja)
  theme: {
    primary: '#FFA500', // Naranja
    secondary: '#FFD700', // Amarillo
  },

  // Configuración de negocio
  business: {
    regimen: 'RUS',
    comprobantes: {
      tipos: ['boleta'] as const, // Solo boletas en RUS
      serieBoletaDefault: 'B001',
      serieFacturaDefault: 'F001',
    },
    metodosPago: ['efectivo', 'yape', 'plin'] as const,
    tieneIGV: false, // RUS no maneja IGV
  },

  // Configuración de roles y permisos
  roles: {
    administrador: {
      name: 'Administrador',
      permissions: ['all'],
    },
    empleado: {
      name: 'Empleado',
      permissions: [
        'caja',
        'ventas',
        'notas-salida',
        'productos-lectura',
      ],
    },
  },

  // Formato de fechas y hora
  dateFormat: {
    display: 'DD/MM/YYYY',
    storage: 'YYYY-MM-DD',
    time: 'HH:mm',
  },

  // Configuración de localStorage keys
  storageKeys: {
    currentUser: 'currentUser',
    userRole: 'userRole',
    categorias: 'categorias',
    productos: 'productos',
    insumos: 'insumos',
    compras: 'compras',
    comprobantes: 'comprobantes',
    promociones: 'promociones',
    clientesProveedores: 'clientesProveedores',
    notasEntrada: 'notasEntrada',
    notasSalida: 'notasSalida',
    cajaAbierta: 'cajaAbierta',
    movimientosCaja: 'movimientosCaja',
    historialCierres: 'historialCierres',
    usuarios: 'usuarios',
    datosEmpresa: 'datosEmpresa',
    locales: 'locales',
  },
};

export default APP_CONFIG;
