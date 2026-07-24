const GATEWAY_BASE_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:30080';

async function solicitar(path) {
  try {
    const response = await fetch(GATEWAY_BASE_URL + path, { headers: { Accept: 'application/json' } });
    const data = await response.json();
    return response.ok ? { success: true, data } : { success: false, error: data, status: response.status };
  } catch (error) {
    return { success: false, error: { message: error.message } };
  }
}

export function getAvailableProducts() {
  return solicitar('/api/ventas/productos');
}

export async function searchProducts(query) {
  const result = await getAvailableProducts();
  if (!result.success) return result;
  const termino = query.trim().toLocaleLowerCase('es');
  return {
    success: true,
    data: {
      productos: (result.data.productos || []).filter((producto) =>
        producto.nombre.toLocaleLowerCase('es').includes(termino) ||
        (producto.categoria?.nombre || '').toLocaleLowerCase('es').includes(termino)),
    },
  };
}

export function getCategories() {
  return solicitar('/api/ventas/categorias');
}
