const GATEWAY_BASE_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:30080';

async function listar() {
  const response = await fetch(`${GATEWAY_BASE_URL}/api/ventas/productos`, { headers: { Accept: 'application/json' } });
  const data = await response.json();
  return response.ok ? { success: true, data } : { success: false, error: data, status: response.status };
}

export function getAvailableProducts() { return listar(); }

export async function searchProducts(query) {
  const result = await listar();
  if (!result.success) return result;
  const termino = query.trim().toLocaleLowerCase('es');
  return { success: true, data: { productos: (result.data.productos || []).filter((producto) => producto.nombre.toLocaleLowerCase('es').includes(termino)) } };
}

export async function getCategories() {
  return { success: true, data: [{ id: 'donas', nombre: 'Donas' }] };
}
