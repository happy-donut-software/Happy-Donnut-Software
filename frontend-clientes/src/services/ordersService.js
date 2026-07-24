const GATEWAY_BASE_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:30080';

async function enviar(endpoint, body, token) {
  const response = await fetch(`${GATEWAY_BASE_URL}/api${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.message || 'La operacion fue rechazada.');
  return data;
}

async function verificarCajaAbierta() {
  const response = await fetch(
    GATEWAY_BASE_URL + '/api/finanzas/caja/actual',
    { headers: { Accept: 'application/json' } }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || 'No se pudo verificar la caja.');
  if (!data.abierto) throw new Error('Debe aperturar la caja desde Administración antes de comprar.');
}

export async function createOrder(items, paymentMethod) {
  try {
    await verificarCajaAbierta();
    const token = localStorage.getItem('authToken');
    const creada = await enviar('/ventas/ordenes', { items }, token);
    const total = items.reduce((suma, item) => suma + item.precio_unitario * item.cantidad, 0);
    const pagada = await enviar(`/ventas/ordenes/${creada.orden_id}/pagar`, {
      monto_recibido: total,
      metodo_pago: paymentMethod.toUpperCase(),
      tipo_comprobante: 'BOLETA',
    }, token);
    return { success: true, data: { order: { venta_id: pagada.orden_id, ...pagada } } };
  } catch (error) {
    return { success: false, error: { message: error.message || 'No se pudo crear la orden.' } };
  }
}
