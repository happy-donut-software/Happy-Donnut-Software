const GATEWAY_BASE_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:30080';

function isValidEmail(email) { return /^\S+@\S+\.\S+$/.test(email); }

async function post(endpoint, body) {
  try {
    const response = await fetch(`${GATEWAY_BASE_URL}/api/usuarios${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return response.ok ? { success: true, data } : { success: false, error: { message: data.error || data.message || 'Solicitud rechazada.' }, status: response.status };
  } catch {
    return { success: false, error: { message: 'No se pudo conectar con el servicio de usuarios.' } };
  }
}

export async function loginUser(email, password) {
  if (!isValidEmail(email)) return { success: false, error: { message: 'El correo electronico no es valido.', field: 'email' } };
  return post('/login', { email, password });
}

export async function registerUser(name, email, password, confirmPassword) {
  if (!name.trim()) return { success: false, error: { message: 'Ingresa tu nombre.', field: 'name' } };
  if (!isValidEmail(email)) return { success: false, error: { message: 'El correo electronico no es valido.', field: 'email' } };
  if (password !== confirmPassword) return { success: false, error: { message: 'Las contrasenas no coinciden.', field: 'confirmPassword' } };
  const registro = await post('/registrar', { nombre: name, email, password, rol: 'cliente' });
  return registro.success ? loginUser(email, password) : registro;
}
