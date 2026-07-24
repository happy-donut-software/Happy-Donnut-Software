/**
 * HappyDonuts - Configuración de API y Backend
 * Separación de Entornos: Desarrollo (Docker Local) vs Producción (Dominio)
 */

// Vite detecta automáticamente el entorno (true si es npm run dev, false si es build)
const isDev = import.meta.env.DEV; 

// En producción usaremos la URL de tu .env (o el dominio por defecto)
const PROD_DOMAIN = import.meta.env.VITE_API_URL || 'https://happydonut.online';

export const API_CONFIG = {
  /**
   * 🔄 Modo de almacenamiento: false = Usa API Backend
   */
  useLocalStorage: false,

  /**
   * 🔌 URLs Base por Microservicio
   * En desarrollo: Apunta a los puertos locales de Docker (9002, 9003, etc.)
   * En producción: Apunta al dominio principal donde estará configurado tu API Gateway o Nginx
   */
  services: {
    usuarios:   isDev ? 'http://localhost:9002/api' : `${PROD_DOMAIN}/api`,
    ventas:     isDev ? 'http://localhost:9000/api' : `${PROD_DOMAIN}/api`,
    inventario: isDev ? 'http://localhost:9001/api' : `${PROD_DOMAIN}/api`,
    finanzas:   isDev ? 'http://localhost:9003/api' : `${PROD_DOMAIN}/api`,
    tienda:     isDev ? 'http://localhost:9004/api' : `${PROD_DOMAIN}/api`,
  },

  /**
   * ⏱️ Timeout de peticiones (ms)
   */
  timeout: 30000,

  /**
   * 📍 Endpoints del API
   */
  endpoints: {
    // Autenticación y Usuarios (Microservicio Usuarios)
    auth: {
      login: '/usuarios/login', 
      registrar: '/usuarios/registrar',
      logout: '/usuarios/logout',
      me: '/usuarios/me',
    },

    // Ventas (Microservicio Ventas)
    ventas: {
      productos: '/ventas/productos',
      ordenes: '/ventas/ordenes',
      pagar: '/ventas/ordenes/:id/pagar',
      comprobantes: '/ventas/comprobantes',
      comprobante: '/ventas/comprobantes/:id',
      generarNumero: '/ventas/comprobantes/generar-numero',
    },

    clientes: {
      frecuentes: '/usuarios/clientes-frecuentes',
    },

    // Inventario (Microservicio Inventario)
    inventario: {
      productos: '/inventario/productos',
      producto: '/inventario/productos/:id',
      insumos: '/inventario/insumos',
      insumo: '/inventario/insumos/:id',
      categorias: '/inventario/categorias',
      categoria: '/inventario/categorias/:id',
      notasEntrada: '/inventario/notas-entrada',
      notaEntrada: '/inventario/notas-entrada/:id',
      notasSalida: '/inventario/notas-salida',
      notaSalida: '/inventario/notas-salida/:id',
    },

    // Caja y Finanzas (Microservicio Finanzas)
    caja: {
      apertura: '/finanzas/caja/abrir',
      cierre: '/finanzas/caja/cerrar',
      rus: '/finanzas/rus/:periodo',
      movimientos: '/finanzas/caja/movimiento',
    },
    
    // (Puedes agregar aquí los demás endpoints que tenías: promociones, configuración, etc.)
  },

  /**
   * 🔐 Headers por defecto
   */
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

/**
 * 🛠️ Helper para construir URLs con parámetros
 * Ahora requiere que le pases el servicio (ej. API_CONFIG.services.usuarios) y el endpoint
 */
export const buildURL = (serviceBaseUrl: string, endpoint: string, params?: Record<string, string | number>): string => {
  let url = serviceBaseUrl + endpoint;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  
  return url;
};

export const isAPIMode = (): boolean => {
  return !API_CONFIG.useLocalStorage;
};

export default API_CONFIG;