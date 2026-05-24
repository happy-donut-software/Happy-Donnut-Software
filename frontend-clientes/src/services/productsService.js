// src/services/productsService.js
// URL base del API Gateway. Si no viene por variable de entorno,
// usamos por defecto http://localhost:8080 (entorno de desarrollo).
const GATEWAY_BASE_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080';

// ----------------------------------------------------------------------
// Función Auxiliar para llamadas públicas al API Gateway (sin token)
// ----------------------------------------------------------------------
async function apiCallPublic(endpoint, method = 'GET', body = null) {
    const url = `${GATEWAY_BASE_URL}/api/v1${endpoint}`;
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
        return { success: true, data };
    } else {
        return { success: false, error: data, status: response.status };
    }
}

// ----------------------------------------------------------------------
// 1. Obtener productos disponibles (público)
// ----------------------------------------------------------------------
export async function getAvailableProducts() {
    return apiCallPublic('/products/available', 'GET');
}

// ----------------------------------------------------------------------
// 2. Buscar productos
// ----------------------------------------------------------------------
export async function searchProducts(query) {
    return apiCallPublic(`/products/search?q=${encodeURIComponent(query)}`, 'GET');
}

// ----------------------------------------------------------------------
// 3. Obtener categorías
// ----------------------------------------------------------------------
export async function getCategories() {
    return apiCallPublic('/categories', 'GET');
}
