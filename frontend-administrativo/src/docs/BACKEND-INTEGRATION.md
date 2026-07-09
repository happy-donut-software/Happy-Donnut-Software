# 🔌 Guía de Integración con Backend - HappyDonuts

Esta guía te ayudará a conectar el sistema HappyDonuts con un backend API REST.

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura Actual vs Backend](#arquitectura-actual-vs-backend)
3. [Configuración](#configuración)
4. [Endpoints Requeridos](#endpoints-requeridos)
5. [Migración de Datos](#migración-de-datos)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

El sistema HappyDonuts está **preparado para conectarse a un backend** sin necesidad de modificar los componentes React.

### Estado Actual
- ✅ **Almacenamiento**: localStorage del navegador
- ✅ **Persistencia**: Solo en el navegador del usuario
- ✅ **Sincronización**: No aplica (todo es local)

### Con Backend
- 🔌 **Almacenamiento**: Base de datos (PostgreSQL, MySQL, etc.)
- 🔌 **Persistencia**: Centralizada en el servidor
- 🔌 **Sincronización**: Múltiples usuarios pueden acceder
- 🔌 **Seguridad**: Autenticación JWT, CORS, etc.

---

## 🏗️ Arquitectura Actual vs Backend

### Flujo Actual (localStorage)

```
[Componente React]
    ↓
[productosAPI.getAll()]
    ↓
[localStorage.service.ts]
    ↓
[localStorage del Navegador]
```

### Flujo con Backend

```
[Componente React]
    ↓
[productosAPI.getAll()]
    ↓
[HTTP Request]
    ↓
[Backend API]
    ↓
[Base de Datos]
```

**Nota**: El componente React NO cambia. Solo cambias la configuración.

---

## ⚙️ Configuración

### Paso 1: Variables de Entorno

Edita el archivo `.env` (copia de `.env.example`):

```bash
# .env
VITE_API_URL=http://localhost:3000/api
VITE_MODE=production
```

### Paso 2: Cambiar Modo en api.config.ts

Edita `src/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  // 🔄 Cambiar de true a false
  useLocalStorage: false,  // ✅ Ahora usa API
  
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  // ...resto de la configuración
};
```

### Paso 3: Reiniciar el Servidor

```bash
# Detén el servidor (Ctrl+C)
# Reinicia
npm run dev
```

**¡Listo!** Ahora el sistema intentará conectarse al backend.

---

## 📡 Endpoints Requeridos

Tu backend debe implementar los siguientes endpoints:

### Estructura de Respuestas

**Respuesta Exitosa:**
```json
{
  "success": true,
  "data": { /* tus datos */ },
  "message": "Operación exitosa"
}
```

**Respuesta de Error:**
```json
{
  "success": false,
  "error": "Código de error",
  "message": "Descripción del error"
}
```

---

### 1. **Autenticación**

#### POST `/api/auth/login`
```typescript
// Request
{
  "usuario": "admin",
  "contraseña": "admin123"
}

// Response
{
  "success": true,
  "data": {
    "token": "jwt_token_aqui",
    "user": {
      "id": 1,
      "usuario": "admin",
      "rol": "Administrador"
    }
  }
}
```

#### GET `/api/auth/me`
```typescript
// Headers
Authorization: Bearer {token}

// Response
{
  "success": true,
  "data": {
    "id": 1,
    "usuario": "admin",
    "rol": "Administrador"
  }
}
```

---

### 2. **Inventario - Productos**

#### GET `/api/inventario/productos`
```typescript
// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Dona Clásica",
      "categoria": "Donas",
      "tipo_producto": "Preparado",
      "precio": 3.50,
      "stock": 50,
      "estado": "Disponible"
    }
  ]
}
```

#### GET `/api/inventario/productos/:id`
```typescript
// Response
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Dona Clásica",
    // ...
  }
}
```

#### POST `/api/inventario/productos`
```typescript
// Request
{
  "nombre": "Dona Chocolate",
  "categoria": "Donas",
  "tipo_producto": "Preparado",
  "precio": 4.00,
  "stock": 30,
  "estado": "Disponible"
}

// Response
{
  "success": true,
  "data": {
    "id": 2,
    "nombre": "Dona Chocolate",
    // ...
  },
  "message": "Producto creado exitosamente"
}
```

#### PUT `/api/inventario/productos/:id`
```typescript
// Request
{
  "nombre": "Dona Chocolate Premium",
  "precio": 4.50,
  // ...resto de campos
}

// Response
{
  "success": true,
  "data": { /* producto actualizado */ },
  "message": "Producto actualizado"
}
```

#### PATCH `/api/inventario/productos/:id/stock`
```typescript
// Request
{
  "cantidad": 10  // Puede ser positivo o negativo
}

// Response
{
  "success": true,
  "data": {
    "id": 1,
    "stock": 60  // Stock actualizado
  }
}
```

#### DELETE `/api/inventario/productos/:id`
```typescript
// Response
{
  "success": true,
  "message": "Producto eliminado"
}
```

---

### 3. **Inventario - Insumos**

Similar a Productos:
- `GET /api/inventario/insumos`
- `GET /api/inventario/insumos/:id`
- `POST /api/inventario/insumos`
- `PUT /api/inventario/insumos/:id`
- `DELETE /api/inventario/insumos/:id`

---

### 4. **Inventario - Categorías**

- `GET /api/inventario/categorias`
- `GET /api/inventario/categorias/:id`
- `POST /api/inventario/categorias`
- `PUT /api/inventario/categorias/:id`
- `DELETE /api/inventario/categorias/:id`

---

### 5. **Inventario - Notas de Entrada**

- `GET /api/inventario/notas-entrada`
- `GET /api/inventario/notas-entrada/:id`
- `POST /api/inventario/notas-entrada`

---

### 6. **Inventario - Notas de Salida**

- `GET /api/inventario/notas-salida`
- `GET /api/inventario/notas-salida/:id`
- `POST /api/inventario/notas-salida`

---

### 7. **Ventas - Comprobantes**

#### GET `/api/ventas/comprobantes`
```typescript
// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "numero": "000001",
      "serie": "B001",
      "tipoComprobante": "boleta",
      "fecha": "2024-01-15",
      "hora": "10:30",
      "metodoPago": "efectivo",
      "total": 15.00,
      "estado": "Emitido"
    }
  ]
}
```

#### POST `/api/ventas/comprobantes`
```typescript
// Request
{
  "tipoComprobante": "boleta",
  "metodoPago": "efectivo",
  "items": [
    {
      "productoId": 1,
      "producto": "Dona Clásica",
      "cantidad": 2,
      "precio": 3.50
    }
  ],
  "subtotal": 7.00,
  "total": 7.00,
  "cliente": "Cliente Anónimo"
}

// Response
{
  "success": true,
  "data": {
    "id": 1,
    "numero": "000001",
    "serie": "B001",
    // ...resto de datos
  },
  "message": "Comprobante generado"
}
```

#### GET `/api/ventas/comprobantes/generar-numero`
```typescript
// Query params: ?tipo=boleta

// Response
{
  "success": true,
  "data": {
    "serie": "B001",
    "numero": "000123",
    "correlativo": "B001-000123"
  }
}
```

---

### 8. **Compras**

- `GET /api/compras`
- `GET /api/compras/:id`
- `POST /api/compras`
- `PATCH /api/compras/:id/recibir` - Marcar como recibido

---

### 9. **Clientes y Proveedores**

- `GET /api/clientes-proveedores`
- `GET /api/clientes-proveedores/:id`
- `GET /api/clientes-proveedores/clientes` - Solo clientes activos
- `GET /api/clientes-proveedores/proveedores` - Solo proveedores activos
- `POST /api/clientes-proveedores`
- `PUT /api/clientes-proveedores/:id`
- `DELETE /api/clientes-proveedores/:id`

---

### 10. **Promociones**

- `GET /api/promociones`
- `GET /api/promociones/:id`
- `GET /api/promociones/activas` - Solo promociones activas
- `POST /api/promociones`
- `PUT /api/promociones/:id`
- `DELETE /api/promociones/:id`

---

### 11. **Caja**

#### POST `/api/caja/apertura`
```typescript
// Request
{
  "fondoInicial": 100.00,
  "fondoInicialYape": 0.00,
  "fondoInicialPlin": 0.00
}

// Response
{
  "success": true,
  "data": {
    "fecha": "2024-01-15",
    "hora": "08:00",
    "fondoInicial": 100.00,
    "usuario": "admin"
  }
}
```

#### GET `/api/caja/estado`
```typescript
// Response
{
  "success": true,
  "data": {
    "abierta": true,
    "fecha": "2024-01-15",
    "hora": "08:00",
    "fondoInicial": 100.00,
    "usuario": "admin"
  }
}
```

#### POST `/api/caja/cierre`
```typescript
// Request
{
  "efectivoContado": 250.00,
  "yapeContado": 120.00,
  "plinContado": 80.00,
  "observaciones": ""
}

// Response
{
  "success": true,
  "data": { /* detalles del cierre */ },
  "message": "Caja cerrada exitosamente"
}
```

#### GET `/api/caja/movimientos`
```typescript
// Query params: ?fecha=2024-01-15

// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fecha": "2024-01-15",
      "hora": "10:30",
      "tipo": "Ingreso",
      "concepto": "Venta",
      "metodoPago": "efectivo",
      "monto": 15.00
    }
  ]
}
```

#### GET `/api/caja/historial`
```typescript
// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fecha": "2024-01-14",
      "horaApertura": "08:00",
      "horaCierre": "20:00",
      "totalVentas": 450.00,
      // ...más campos
    }
  ]
}
```

---

### 12. **Configuración**

#### GET/PUT `/api/configuracion/datos-empresa`
#### GET/POST/PUT/DELETE `/api/configuracion/usuarios`
#### GET/POST/PUT/DELETE `/api/configuracion/locales`

---

## 🔐 Autenticación y Seguridad

### JWT (JSON Web Tokens)

Tu backend debe:
1. Generar un JWT al hacer login
2. Requerir el token en los headers de las peticiones

**En el frontend, deberás actualizar los servicios para incluir el token:**

```typescript
// Ejemplo en productos.service.ts
const token = localStorage.getItem('authToken');

const response = await fetch(`${API_CONFIG.baseURL}/inventario/productos`, {
  method: 'GET',
  headers: {
    ...API_CONFIG.defaultHeaders,
    'Authorization': `Bearer ${token}`
  },
});
```

### CORS

Tu backend debe permitir peticiones desde el frontend:

```javascript
// Express.js ejemplo
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## 💾 Migración de Datos

### Exportar Datos de localStorage

Crea un script para exportar los datos actuales:

```typescript
// scripts/exportLocalStorage.ts
const exportData = () => {
  const data = {
    productos: localStorage.getItem('productos'),
    categorias: localStorage.getItem('categorias'),
    comprobantes: localStorage.getItem('comprobantes'),
    // ... etc
  };};
```

### Importar a Base de Datos

Usa los datos exportados para poblar tu base de datos inicial.

---

## 🧪 Testing

### 1. Probar con Postman/Insomnia

Antes de conectar el frontend, prueba tus endpoints:

```bash
# Ejemplo con curl
curl -X GET http://localhost:3000/api/inventario/productos \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Probar Conexión Frontend-Backend

1. Configura `VITE_API_URL` en `.env`
2. Cambia `useLocalStorage: false` en `api.config.ts`
3. Abre la consola del navegador (F12)
4. Intenta cargar productos
5. Verifica que las peticiones HTTP se hacen correctamente

---

## 🐛 Troubleshooting

### Error: "Failed to fetch"

**Causa**: CORS no configurado o backend no ejecutándose

**Solución**:
1. Verifica que el backend esté corriendo
2. Configura CORS en el backend
3. Verifica la URL en `.env`

---

### Error: "401 Unauthorized"

**Causa**: Token no válido o no enviado

**Solución**:
1. Verifica que el token se guarda después del login
2. Verifica que se envía en el header `Authorization`

---

### Error: "Network Error"

**Causa**: URL incorrecta o backend no disponible

**Solución**:
1. Verifica `VITE_API_URL` en `.env`
2. Verifica que el backend responde en esa URL

---

## 📚 Recursos Recomendados

### Backend Frameworks

- **Node.js + Express**: Fácil y rápido
- **NestJS**: Estructura profesional, TypeScript nativo
- **Laravel (PHP)**: Robusto y completo
- **Django (Python)**: Rápido desarrollo

### Bases de Datos

- **PostgreSQL**: Recomendado para producción
- **MySQL**: Alternativa popular
- **MongoDB**: NoSQL (menos recomendado para este caso)

### Ejemplo de Stack Recomendado

```
Frontend: React + TypeScript + Vite (actual)
Backend: NestJS + TypeScript
Database: PostgreSQL
Auth: JWT
Deployment: Docker + nginx
```

---

## ✅ Checklist de Integración

- [ ] Backend API funcionando
- [ ] Todos los endpoints implementados
- [ ] CORS configurado
- [ ] JWT implementado
- [ ] Base de datos creada y migrada
- [ ] Datos de localStorage exportados e importados
- [ ] `.env` configurado con `VITE_API_URL`
- [ ] `api.config.ts` con `useLocalStorage: false`
- [ ] Probado login y obtención de token
- [ ] Probado al menos un módulo completo (ej: productos)
- [ ] Manejo de errores implementado
- [ ] Testing completo de todos los módulos

---

## 🚀 Próximos Pasos

1. Desarrolla tu backend siguiendo la especificación de endpoints
2. Prueba cada endpoint con Postman
3. Configura el frontend como se indica aquí
4. Prueba la integración módulo por módulo
5. Implementa manejo de errores robusto
6. Considera deployment (Docker, AWS, etc.)

---

¿Preguntas? Consulta **[API-REFERENCE.md](API-REFERENCE.md)** para más detalles sobre los servicios.
