// src/services/ordersService.js
const GATEWAY_BASE_URL = process.env.REACT_APP_GATEWAY_URL;

// ----------------------------------------------------------------------
// Función Auxiliar para llamadas autenticadas al API Gateway
// ----------------------------------------------------------------------
async function apiCallAuthenticated(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        throw new Error('No hay token de autenticación. Inicia sesión.');
    }

    const url = `${GATEWAY_BASE_URL}/api/v1${endpoint}`;
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
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
// 1. Crear orden
// ----------------------------------------------------------------------
export async function createOrder(items, paymentMethod) {
    return apiCallAuthenticated('/orders', 'POST', {
        items,
        payment_method: paymentMethod
    });
}

// ----------------------------------------------------------------------
// 2. Obtener mis órdenes
// ----------------------------------------------------------------------
export async function getMyOrders() {
    return apiCallAuthenticated('/orders', 'GET');
}

// ----------------------------------------------------------------------
// 3. Obtener orden específica
// ----------------------------------------------------------------------
export async function getOrder(orderId) {
    return apiCallAuthenticated(`/orders/${orderId}`, 'GET');
}

// ----------------------------------------------------------------------
// 4. Cancelar orden
// ----------------------------------------------------------------------
export async function cancelOrder(orderId) {
    return apiCallAuthenticated(`/orders/${orderId}`, 'DELETE');
}
