# 📕 Documentación de Endpoints Backend - Sistema HappyDonuts

## 🎯 Para el Equipo de Backend

Este documento especifica **todos los endpoints** que el frontend necesita para funcionar correctamente. Cada endpoint incluye:

- Método HTTP
- Ruta
- Parámetros
- Body de la petición
- Respuesta esperada
- Códigos de estado

---

## 🔐 Autenticación

### **Base URL**
```
http://localhost:3000/api
```

### **Autenticación JWT**
Todos los endpoints (excepto `/auth/login`) requieren un token JWT en el header:

```http
Authorization: Bearer <token>
```

---

## 📋 Índice de Endpoints

1. [Autenticación](#autenticación)
2. [Productos](#productos)
3. [Insumos](#insumos)
4. [Clientes y Proveedores](#clientes-y-proveedores)
5. [Promociones](#promociones)
6. [Comprobantes (Ventas)](#comprobantes-ventas)
7. [Notas de Entrada](#notas-de-entrada)
8. [Notas de Salida](#notas-de-salida)
9. [Categorías](#categorías)
10. [Usuarios](#usuarios)
11. [Caja](#caja)
12. [Dashboard](#dashboard)

---

## 🔐 1. Autenticación

### **POST** `/auth/login`
Iniciar sesión en el sistema.

**Request:**
```json
{
  "usuario": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzdWFyaW8iOiJhZG1pbiIsInJvbCI6IkFkbWluaXN0cmFkb3IiLCJpYXQiOjE2MzIwMDAwMDAsImV4cCI6MTYzMjA4NjQwMH0.abc123",
  "usuario": "admin",
  "rol": "Administrador"
}
```

**Response (401):**
```json
{
  "message": "Credenciales incorrectas"
}
```

---

### **POST** `/auth/logout`
Cerrar sesión (invalidar token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

---

### **GET** `/auth/validate`
Validar si un token es válido.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "valid": true
}
```

**Response (401):**
```json
{
  "valid": false,
  "message": "Token inválido o expirado"
}
```

---

## 📦 2. Productos

### **GET** `/productos`
Obtener todos los productos.

**Response (200):**
```json
[
  {
    "id": 1,
    "nombre": "Dona Glaseada",
    "categoria": "Donas",
    "precio": 3.50,
    "stock": 45,
    "stockMinimo": 10,
    "tipo": "Preparado",
    "activo": true
  },
  {
    "id": 2,
    "nombre": "Dona de Chocolate",
    "categoria": "Donas",
    "precio": 4.00,
    "stock": 30,
    "stockMinimo": 10,
    "tipo": "Preparado",
    "activo": true
  }
]
```

---

### **GET** `/productos/:id`
Obtener un producto por ID.

**Response (200):**
```json
{
  "id": 1,
  "nombre": "Dona Glaseada",
  "categoria": "Donas",
  "precio": 3.50,
  "stock": 45,
  "stockMinimo": 10,
  "tipo": "Preparado",
  "activo": true
}
```

**Response (404):**
```json
{
  "message": "Producto no encontrado"
}
```

---

### **POST** `/productos`
Crear un nuevo producto.

**Request:**
```json
{
  "nombre": "Dona Rellena",
  "categoria": "Donas",
  "precio": 4.50,
  "stock": 20,
  "stockMinimo": 10,
  "tipo": "Preparado",
  "activo": true
}
```

**Response (201):**
```json
{
  "id": 3,
  "nombre": "Dona Rellena",
  "categoria": "Donas",
  "precio": 4.50,
  "stock": 20,
  "stockMinimo": 10,
  "tipo": "Preparado",
  "activo": true
}
```

---

### **PUT** `/productos/:id`
Actualizar un producto existente.

**Request:**
```json
{
  "id": 1,
  "nombre": "Dona Glaseada Premium",
  "categoria": "Donas",
  "precio": 5.00,
  "stock": 45,
  "stockMinimo": 10,
  "tipo": "Preparado",
  "activo": true
}
```

**Response (200):**
```json
{
  "id": 1,
  "nombre": "Dona Glaseada Premium",
  "categoria": "Donas",
  "precio": 5.00,
  "stock": 45,
  "stockMinimo": 10,
  "tipo": "Preparado",
  "activo": true
}
```

---

### **DELETE** `/productos/:id`
Eliminar un producto.

**Response (204):**
Sin contenido (éxito)

**Response (404):**
```json
{
  "message": "Producto no encontrado"
}
```

---

## 🧃 3. Insumos

### **GET** `/insumos`
Obtener todos los insumos.

**Response (200):**
```json
[
  {
    "id": 1,
    "nombre": "Harina",
    "categoria": "Ingredientes",
    "unidadMedida": "kg",
    "stock": 50.5,
    "stockMinimo": 20,
    "precioUnitario": 2.50
  }
]
```

---

### **GET** `/insumos/:id`
Obtener un insumo por ID.

---

### **POST** `/insumos`
Crear un nuevo insumo.

**Request:**
```json
{
  "nombre": "Azúcar",
  "categoria": "Ingredientes",
  "unidadMedida": "kg",
  "stock": 100,
  "stockMinimo": 30,
  "precioUnitario": 1.80
}
```

**Response (201):**
```json
{
  "id": 2,
  "nombre": "Azúcar",
  "categoria": "Ingredientes",
  "unidadMedida": "kg",
  "stock": 100,
  "stockMinimo": 30,
  "precioUnitario": 1.80
}
```

---

### **PUT** `/insumos/:id`
Actualizar un insumo.

---

### **DELETE** `/insumos/:id`
Eliminar un insumo.

---

## 👥 4. Clientes

### **GET** `/clientes`
Obtener todos los clientes.

**Response (200):**
```json
[
  {
    "id": 1,
    "tipoDocumento": "DNI",
    "numeroDocumento": "12345678",
    "nombreCompleto": "Juan Pérez",
    "telefono": "987654321",
    "email": "juan@example.com",
    "direccion": "Av. Principal 123",
    "cantidadCompras": 15
  }
]
```

---

### **GET** `/clientes/:id`
Obtener un cliente por ID.

---

### **GET** `/clientes/search?q=juan`
Buscar clientes por nombre o documento.

**Response (200):**
```json
[
  {
    "id": 1,
    "tipoDocumento": "DNI",
    "numeroDocumento": "12345678",
    "nombreCompleto": "Juan Pérez",
    "telefono": "987654321",
    "email": "juan@example.com",
    "direccion": "Av. Principal 123",
    "cantidadCompras": 15
  }
]
```

---

### **POST** `/clientes`
Crear un nuevo cliente.

**Request:**
```json
{
  "tipoDocumento": "DNI",
  "numeroDocumento": "87654321",
  "nombreCompleto": "María García",
  "telefono": "912345678",
  "email": "maria@example.com",
  "direccion": "Jr. Los Olivos 456"
}
```

**Response (201):**
```json
{
  "id": 2,
  "tipoDocumento": "DNI",
  "numeroDocumento": "87654321",
  "nombreCompleto": "María García",
  "telefono": "912345678",
  "email": "maria@example.com",
  "direccion": "Jr. Los Olivos 456",
  "cantidadCompras": 0
}
```

**⚠️ IMPORTANTE:** Al crear un nuevo cliente, el campo `cantidadCompras` debe inicializarse en 0.

---

### **PUT** `/clientes/:id`
Actualizar un cliente.

---

### **DELETE** `/clientes/:id`
Eliminar un cliente.

---

## 🏷️ 5. Promociones

### **GET** `/promociones`
Obtener todas las promociones.

**Response (200):**
```json
[
  {
    "id": 1,
    "nombre": "Combo Familiar",
    "productos": [
      { "id": 1, "nombre": "Dona Glaseada", "cantidad": 6 },
      { "id": 2, "nombre": "Dona de Chocolate", "cantidad": 6 }
    ],
    "precioPromocion": 35.00,
    "activo": true,
    "fechaCreacion": "2026-05-01T10:00:00.000Z"
  }
]
```

---

### **GET** `/promociones/:id`
Obtener una promoción por ID.

---

### **POST** `/promociones`
Crear una nueva promoción.

**Request:**
```json
{
  "nombre": "Combo Desayuno",
  "productos": [
    { "id": 1, "nombre": "Dona Glaseada", "cantidad": 3 },
    { "id": 5, "nombre": "Café Americano", "cantidad": 1 }
  ],
  "precioPromocion": 18.00,
  "activo": true
}
```

**Response (201):**
```json
{
  "id": 2,
  "nombre": "Combo Desayuno",
  "productos": [
    { "id": 1, "nombre": "Dona Glaseada", "cantidad": 3 },
    { "id": 5, "nombre": "Café Americano", "cantidad": 1 }
  ],
  "precioPromocion": 18.00,
  "activo": true,
  "fechaCreacion": "2026-05-17T15:30:00.000Z"
}
```

---

### **PUT** `/promociones/:id`
Actualizar una promoción.

---

### **DELETE** `/promociones/:id`
Eliminar una promoción.

---

## 🧾 6. Comprobantes (Ventas)

### **GET** `/comprobantes`
Obtener todos los comprobantes.

**Response (200):**
```json
[
  {
    "id": 1,
    "tipo": "Boleta",
    "serie": "B001",
    "numero": "00000123",
    "fecha": "2026-05-17",
    "hora": "14:30:00",
    "cliente": {
      "tipoDocumento": "DNI",
      "numeroDocumento": "12345678",
      "nombreCompleto": "Juan Pérez"
    },
    "items": [
      {
        "id": 1,
        "productoId": 1,
        "producto": "Dona Glaseada",
        "cantidad": 6,
        "precio": 3.50
      }
    ],
    "subtotal": 21.00,
    "igv": 3.78,
    "total": 24.78,
    "metodoPago": "Efectivo"
  }
]
```

---

### **GET** `/comprobantes/:id`
Obtener un comprobante por ID.

---

### **POST** `/comprobantes`
Crear un nuevo comprobante (registrar venta).

**Request:**
```json
{
  "tipo": "Boleta",
  "serie": "B001",
  "numero": "00000124",
  "fecha": "2026-05-17",
  "hora": "15:00:00",
  "cliente": {
    "tipoDocumento": "DNI",
    "numeroDocumento": "87654321",
    "nombreCompleto": "María García"
  },
  "items": [
    {
      "id": 1,
      "productoId": 1,
      "producto": "Dona Glaseada",
      "cantidad": 3,
      "precio": 3.50
    },
    {
      "id": 2,
      "productoId": 2,
      "producto": "Dona de Chocolate",
      "cantidad": 3,
      "precio": 4.00
    }
  ],
  "subtotal": 22.50,
  "igv": 4.05,
  "total": 26.55,
  "metodoPago": "Tarjeta"
}
```

**Response (201):**
```json
{
  "id": 2,
  "tipo": "Boleta",
  "serie": "B001",
  "numero": "00000124",
  "fecha": "2026-05-17",
  "hora": "15:00:00",
  "cliente": {
    "tipoDocumento": "DNI",
    "numeroDocumento": "87654321",
    "nombreCompleto": "María García"
  },
  "items": [...],
  "subtotal": 22.50,
  "igv": 4.05,
  "total": 26.55,
  "metodoPago": "Tarjeta"
}
```

**⚠️ IMPORTANTE:** Al crear un comprobante, el backend debe:
1. Reducir el stock de los productos vendidos
2. Si un producto tiene receta (tipo "Preparado"), reducir los insumos según la receta
3. Registrar el ingreso en la caja
4. Si el comprobante tiene un cliente asociado, incrementar en 1 el campo `cantidadCompras` de ese cliente

---

## 📥 7. Notas de Entrada

### **GET** `/notas-entrada`
Obtener todas las notas de entrada.

**Response (200):**
```json
[
  {
    "id": 1,
    "numero": "NE-2026-001",
    "fecha": "2026-05-17",
    "hora": "09:00:00",
    "productos": [
      { "id": 1, "nombre": "Harina", "cantidad": 50, "unidad": "kg" },
      { "id": 2, "nombre": "Azúcar", "cantidad": 30, "unidad": "kg" }
    ],
    "observaciones": "Compra a Proveedor XYZ"
  }
]
```

---

### **GET** `/notas-entrada/:id`
Obtener una nota de entrada por ID.

---

### **POST** `/notas-entrada`
Crear una nueva nota de entrada.

**Request:**
```json
{
  "numero": "NE-2026-002",
  "fecha": "2026-05-17",
  "hora": "10:30:00",
  "productos": [
    { "id": 1, "nombre": "Harina", "cantidad": 25, "unidad": "kg" }
  ],
  "observaciones": "Entrada de emergencia"
}
```

**Response (201):**
```json
{
  "id": 2,
  "numero": "NE-2026-002",
  "fecha": "2026-05-17",
  "hora": "10:30:00",
  "productos": [
    { "id": 1, "nombre": "Harina", "cantidad": 25, "unidad": "kg" }
  ],
  "observaciones": "Entrada de emergencia"
}
```

**⚠️ IMPORTANTE:** Al crear una nota de entrada, el backend debe **incrementar** el stock de los insumos listados.

---

### **DELETE** `/notas-entrada/:id`
Eliminar una nota de entrada.

---

## 📤 8. Notas de Salida

### **GET** `/notas-salida`
Obtener todas las notas de salida.

**Response (200):**
```json
[
  {
    "id": 1,
    "numero": "NS-2026-001",
    "fecha": "2026-05-17",
    "hora": "16:00:00",
    "productos": [
      { "id": 3, "nombre": "Dona Glaseada", "cantidad": 10, "unidad": "unidad" }
    ],
    "observaciones": "Merma por vencimiento"
  }
]
```

---

### **GET** `/notas-salida/:id`
Obtener una nota de salida por ID.

---

### **POST** `/notas-salida`
Crear una nueva nota de salida.

**Request:**
```json
{
  "numero": "NS-2026-002",
  "fecha": "2026-05-17",
  "hora": "17:00:00",
  "productos": [
    { "id": 1, "nombre": "Harina", "cantidad": 5, "unidad": "kg" }
  ],
  "observaciones": "Harina en mal estado"
}
```

**Response (201):**
```json
{
  "id": 2,
  "numero": "NS-2026-002",
  "fecha": "2026-05-17",
  "hora": "17:00:00",
  "productos": [
    { "id": 1, "nombre": "Harina", "cantidad": 5, "unidad": "kg" }
  ],
  "observaciones": "Harina en mal estado"
}
```

**⚠️ IMPORTANTE:** Al crear una nota de salida, el backend debe **reducir** el stock de los productos/insumos listados.

---

### **DELETE** `/notas-salida/:id`
Eliminar una nota de salida.

---

## 🏷️ 9. Categorías

### **GET** `/categorias`
Obtener todas las categorías.

**Response (200):**
```json
[
  { "id": 1, "nombre": "Donas", "descripcion": "Donas de todos los tipos" },
  { "id": 2, "nombre": "Bebidas", "descripcion": "Bebidas calientes y frías" }
]
```

---

### **POST** `/categorias`
Crear una nueva categoría.

**Request:**
```json
{
  "nombre": "Pasteles",
  "descripcion": "Pasteles y tortas"
}
```

**Response (201):**
```json
{
  "id": 3,
  "nombre": "Pasteles",
  "descripcion": "Pasteles y tortas"
}
```

---

### **PUT** `/categorias/:id`
Actualizar una categoría.

---

### **DELETE** `/categorias/:id`
Eliminar una categoría.

---

## 👤 10. Usuarios

### **GET** `/usuarios`
Obtener todos los usuarios del sistema.

**Response (200):**
```json
[
  {
    "id": 1,
    "usuario": "admin",
    "nombre": "Administrador",
    "rol": "Administrador",
    "activo": true
  },
  {
    "id": 2,
    "usuario": "empleado1",
    "nombre": "Carlos López",
    "rol": "Empleado",
    "activo": true
  }
]
```

---

### **POST** `/usuarios`
Crear un nuevo usuario.

**Request:**
```json
{
  "usuario": "empleado2",
  "password": "password123",
  "nombre": "Ana Martínez",
  "rol": "Empleado",
  "activo": true
}
```

**Response (201):**
```json
{
  "id": 3,
  "usuario": "empleado2",
  "nombre": "Ana Martínez",
  "rol": "Empleado",
  "activo": true
}
```

**⚠️ IMPORTANTE:** La contraseña debe ser hasheada antes de guardarla en la base de datos (usar bcrypt o similar).

---

### **PUT** `/usuarios/:id`
Actualizar un usuario.

**Request:**
```json
{
  "nombre": "Ana Martínez Pérez",
  "activo": true
}
```

**Response (200):**
```json
{
  "id": 3,
  "usuario": "empleado2",
  "nombre": "Ana Martínez Pérez",
  "rol": "Empleado",
  "activo": true
}
```

---

### **DELETE** `/usuarios/:id`
Eliminar un usuario.

---

## 💰 11. Caja

### **GET** `/caja/apertura/actual`
Obtener la apertura de caja del día actual (si existe).

**Response (200):**
```json
{
  "id": 1,
  "fecha": "2026-05-17",
  "hora": "08:00:00",
  "usuario": "admin",
  "montoInicial": 100.00
}
```

**Response (404):**
```json
{
  "message": "No hay apertura de caja para hoy"
}
```

---

### **POST** `/caja/apertura`
Registrar apertura de caja.

**Request:**
```json
{
  "fecha": "2026-05-17",
  "hora": "08:00:00",
  "usuario": "admin",
  "montoInicial": 100.00
}
```

**Response (201):**
```json
{
  "id": 1,
  "fecha": "2026-05-17",
  "hora": "08:00:00",
  "usuario": "admin",
  "montoInicial": 100.00
}
```

---

### **GET** `/caja/movimientos`
Obtener movimientos del día (ventas + egresos).

**Response (200):**
```json
[
  {
    "id": 1,
    "tipo": "Ingreso",
    "descripcion": "Venta - Boleta B001-00000123",
    "monto": 24.78,
    "fecha": "2026-05-17",
    "hora": "14:30:00"
  },
  {
    "id": 2,
    "tipo": "Egreso",
    "descripcion": "Compra de insumos",
    "monto": 50.00,
    "fecha": "2026-05-17",
    "hora": "11:00:00"
  }
]
```

---

### **POST** `/caja/egresos`
Registrar un egreso (gasto).

**Request:**
```json
{
  "descripcion": "Pago de servicios",
  "monto": 30.00,
  "fecha": "2026-05-17",
  "hora": "16:00:00",
  "usuario": "admin"
}
```

**Response (201):**
```json
{
  "id": 3,
  "tipo": "Egreso",
  "descripcion": "Pago de servicios",
  "monto": 30.00,
  "fecha": "2026-05-17",
  "hora": "16:00:00",
  "usuario": "admin"
}
```

---

### **POST** `/caja/cierre`
Registrar cierre de caja.

**Request:**
```json
{
  "fecha": "2026-05-17",
  "hora": "20:00:00",
  "usuario": "admin",
  "montoInicial": 100.00,
  "totalVentas": 450.00,
  "totalEgresos": 80.00,
  "montoEsperado": 470.00,
  "montoReal": 470.00,
  "diferencia": 0.00
}
```

**Response (201):**
```json
{
  "id": 1,
  "fecha": "2026-05-17",
  "hora": "20:00:00",
  "usuario": "admin",
  "montoInicial": 100.00,
  "totalVentas": 450.00,
  "totalEgresos": 80.00,
  "montoEsperado": 470.00,
  "montoReal": 470.00,
  "diferencia": 0.00
}
```

**⚠️ IMPORTANTE:** Al cerrar caja, el backend debe marcar la apertura del día como cerrada.

---

### **GET** `/caja/cierre/historial`
Obtener historial de cierres de caja.

**Response (200):**
```json
[
  {
    "id": 1,
    "fecha": "2026-05-17",
    "hora": "20:00:00",
    "usuario": "admin",
    "montoInicial": 100.00,
    "totalVentas": 450.00,
    "totalEgresos": 80.00,
    "montoEsperado": 470.00,
    "montoReal": 470.00,
    "diferencia": 0.00
  },
  {
    "id": 2,
    "fecha": "2026-05-16",
    "hora": "20:00:00",
    "usuario": "admin",
    "montoInicial": 100.00,
    "totalVentas": 380.00,
    "totalEgresos": 60.00,
    "montoEsperado": 420.00,
    "montoReal": 415.00,
    "diferencia": -5.00
  }
]
```

---

## 📊 12. Dashboard

### **GET** `/dashboard/stats`
Obtener estadísticas para el dashboard.

**Response (200):**
```json
{
  "ventasHoy": {
    "total": 450.00,
    "cantidad": 15
  },
  "productosVendidos": 78,
  "productosStockBajo": 3,
  "insumosStockBajo": 2
}
```

---

## 🔒 Códigos de Estado HTTP

| Código | Significado | Cuándo usar |
|--------|-------------|-------------|
| 200 | OK | Petición exitosa (GET, PUT) |
| 201 | Created | Recurso creado exitosamente (POST) |
| 204 | No Content | Eliminación exitosa (DELETE) |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | Token inválido o no proporcionado |
| 403 | Forbidden | Sin permisos suficientes |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: DNI duplicado) |
| 500 | Internal Server Error | Error del servidor |

---

## 🛡️ Validaciones Importantes

### **Al crear un comprobante:**
1. Verificar que hay suficiente stock de cada producto
2. Si el producto es "Preparado", verificar stock de insumos en la receta
3. Generar número de comprobante secuencial
4. Reducir stock de productos
5. Reducir stock de insumos (si el producto tiene receta)
6. Registrar ingreso en caja

### **Al crear nota de entrada:**
1. Incrementar stock de insumos

### **Al crear nota de salida:**
1. Verificar que hay suficiente stock antes de reducir
2. Reducir stock de productos/insumos

### **Al crear usuario:**
1. Verificar que el nombre de usuario no esté duplicado
2. Hashear la contraseña antes de guardarla

### **Al cerrar caja:**
1. Verificar que existe una apertura para ese día
2. Marcar la apertura como cerrada

---

## 🧪 Datos de Prueba

Para facilitar las pruebas, se recomienda crear datos iniciales:

### **Usuarios:**
```
admin / admin123 (Administrador)
empleado1 / password123 (Empleado)
```

### **Categorías:**
```
Donas, Bebidas, Pasteles
```

### **Productos:**
```
Dona Glaseada - S/ 3.50 - Stock: 50
Dona de Chocolate - S/ 4.00 - Stock: 40
Café Americano - S/ 5.00 - Stock: 30
```

### **Insumos:**
```
Harina - 100 kg
Azúcar - 80 kg
Chocolate - 50 kg
```

---

## 📝 Notas para el Desarrollo

1. **CORS:** Habilitar CORS para `http://localhost:5173`
2. **JWT:** Tiempo de expiración recomendado: 24 horas
3. **Logs:** Registrar todas las operaciones críticas (ventas, cierres de caja, etc.)
4. **Transacciones:** Usar transacciones de base de datos para operaciones que afectan múltiples tablas (ej: crear comprobante)
5. **Backup:** Implementar respaldo automático diario de la base de datos

---

**Última actualización:** Mayo 2026  
**Versión del documento:** 1.0  
**Total de endpoints:** 50+
