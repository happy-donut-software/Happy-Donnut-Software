/**
 * Configuración de la API del Backend
 *
 * Instrucciones:
 * 1. Para desarrollo local, cambia USE_BACKEND a true cuando tu backend esté listo
 * 2. Actualiza API_BASE_URL con la URL de tu servidor backend
 * 3. El sistema automáticamente usará localStorage si USE_BACKEND = false
 */

export const API_CONFIG = {
  // Cambiar a true cuando el backend esté disponible
  USE_BACKEND: false,

  // URL del servidor backend (actualizar según tu entorno)
  API_BASE_URL: process.env.VITE_API_URL || 'http://localhost:3000/api',

  // Timeout para las peticiones (en milisegundos)
  TIMEOUT: 30000,

  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

/**
 * Configuración por ambiente
 * El equipo de backend puede agregar más ambientes aquí
 */
export const ENVIRONMENTS = {
  development: {
    API_BASE_URL: 'http://localhost:3000/api',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.happydonuts.com/api',
  },
  production: {
    API_BASE_URL: 'https://api.happydonuts.com/api',
  },
};

/**
 * Obtener la configuración del ambiente actual
 */
export function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';
  return ENVIRONMENTS[env as keyof typeof ENVIRONMENTS] || ENVIRONMENTS.development;
}
