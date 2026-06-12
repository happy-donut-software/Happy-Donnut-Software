# 🔗 ANÁLISIS DETALLADO DE DEPENDENCIAS - Happy-Donnut-Software

**Fecha:** 6 de junio de 2026  
**Propósito:** Mapear todas las relaciones entre microservicios, componentes backend/frontend e infraestructura

---

## 📋 TABLA DE CONTENIDOS

1. [Dependencias entre Microservicios](#1-dependencias-entre-microservicios)
2. [Relaciones entre Componentes Backend](#2-relaciones-entre-componentes-backend)
3. [Relaciones Frontend-Backend](#3-relaciones-frontend-backend)
4. [Dependencias de Configuración](#4-dependencias-de-configuración)
5. [Relaciones de Infraestructura](#5-relaciones-de-infraestructura)
6. [Matriz de Comunicación](#6-matriz-de-comunicación)
7. [Items de Configuración (CIs)](#7-items-de-configuración-cis)

---

## 1. DEPENDENCIAS ENTRE MICROSERVICIOS

### 1.1 Estructura General

```
┌─────────────────────────────────────────────────────────────────┐
│                          API GATEWAY                             │
│                       (Puerto 8000)                              │
│                  ├─ Auth: 9001 → 8000                            │
│                  ├─ Product: 9002 → 80 (nginx)                   │
│                  ├─ Inventory: (internal 8002)                   │
│                  ├─ Order: (internal 8003)                       │
│                  ├─ Email: (internal 8000)                       │
│                  └─ Finance: (internal 8005)                     │
└────────┬─────────────────────┬──────────────────────────┬────────┘
         │                     │                          │
         ▼                     ▼                          ▼
   ┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐
   │ AUTH SERVICE │    │ PRODUCT SERVICE │    │ INVENTORY SERVICE│
   │  (P: 9001)   │    │    (P: 9002)    │    │   (P: internal)  │
   │  DB: auth_db │    │ DB: product_db  │    │ DB: inventory_db │
   └──────────────┘    └────────┬────────┘    └────────┬─────────┘
                                │                       │
                                ▼                       ▼
                        ┌─────────────────┐    ┌──────────────────┐
                        │  ORDER SERVICE  │    │ EMAIL SERVICE    │
                        │   (P: 9003)     │    │  (RabbitMQ)      │
                        │  DB: order_db   │    │ DB: email_db     │
                        └────────┬────────┘    └──────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ FINANCE SERVICE │
                        │   (P: 9006)     │
                        │ DB: finance_db  │
                        └─────────────────┘
```

### 1.2 AUTH SERVICE (Puerto 8000/9001)

**Responsabilidades:**
- Autenticación y autorización centralizada
- Gestión de usuarios (Empleados, Administrativos, Clientes)
- Generación de tokens de sesión

**Dependencias:**
- ❌ No depende de otros microservicios
- ✅ Base de datos: `auth_db` (PostgreSQL)
- ✅ API Gateway usa sus endpoints para login/register

**Modelos Principales:**
- `Usuario` - Usuarios base del sistema
- `Empleado` - Personal de la empresa
- `Administrativo` - Administradores del sistema
- `Comment` - Comentarios de usuarios

**Endpoints Expuestos:**
```
POST   /api/v1/register              Registra nuevo usuario
POST   /api/v1/login                 Autentica usuario
GET    /api/v1/usuarios              Listar usuarios
GET    /api/v1/empleados             Listar empleados
GET    /api/v1/administrativos       Listar administrativos
GET    /api/v1/usuarios/{id}/comments Listar comentarios
```

**Consumidores Directos:**
- API Gateway (proxy de autenticación)
- Frontend-Administrativo (login)
- Frontend-Clientes (registro/login)

---

### 1.3 PRODUCT SERVICE (Puerto 8001/9002)

**Responsabilidades:**
- Gestión de catálogo de productos
- Gestión de categorías
- Gestión de promociones y combos
- Cálculo de precios

**Dependencias:**
- ❌ No depende de otros microservicios
- ✅ Base de datos: `product_db` (PostgreSQL)
- ✅ API Gateway lo consume
- ✅ Order Service lo consulta

**Modelos Principales:**
- `Producto` - Productos vendibles (donuts, cafés)
- `Categoria` - Categorización de productos
- `Promocion` - Ofertas y combos (N:N con Productos)

**Endpoints Expuestos:**
```
# CRUD de Productos
GET    /api/v1/products              Listar productos
POST   /api/v1/products              Crear producto
GET    /api/v1/products/{id}         Obtener producto
PUT    /api/v1/products/{id}         Actualizar producto
DELETE /api/v1/products/{id}         Eliminar producto
PUT    /api/v1/products/{id}/status  Cambiar estado

# CRUD de Categorías
GET    /api/v1/categories            Listar categorías
POST   /api/v1/categories            Crear categoría
GET    /api/v1/categories/{id}       Obtener categoría
PUT    /api/v1/categories/{id}       Actualizar categoría
DELETE /api/v1/categories/{id}       Eliminar categoría

# CRUD de Promociones
GET    /api/v1/promotions            Listar promociones
POST   /api/v1/promotions            Crear promoción
GET    /api/v1/promotions/{id}       Obtener promoción
PUT    /api/v1/promotions/{id}       Actualizar promoción
DELETE /api/v1/promotions/{id}       Eliminar promoción

# Búsquedas públicas
GET    /api/v1/products/available    Productos activos
GET    /api/v1/products/search       Búsqueda de productos
GET    /api/v1/promotions/active     Promociones vigentes
```

**Consumidores Directos:**
- API Gateway (proxy de productos y categorías)
- Order Service (consulta de productos disponibles)
- Frontend-Clientes (catálogo público)
- Frontend-Administrativo (gestión de catálogo)

---

### 1.4 INVENTORY SERVICE (Puerto 8002)

**Responsabilidades:**
- Control de inventario de insumos y materias primas
- Gestión de lotes con vencimiento
- Verificación de disponibilidad para producción
- Reserva de insumos para órdenes

**Dependencias:**
- ❌ No depende de otros microservicios
- ✅ Base de datos: `inventory_db` (PostgreSQL)
- ✅ Order Service lo consulta para verificar disponibilidad
- ✅ API Gateway lo consume

**Modelos Principales:**
- `Insumo` - Materias primas y ingredientes
- `LoteInsumo` - Lotes con control de vencimiento
- `Receta` - Asociación N:N entre Productos e Insumos
- `AjusteInventario` - Cambios de stock

**Endpoints Expuestos:**
```
# Gestión de Inventario (Protegido)
GET    /api/v1/inventory                     Obtener inventario completo
POST   /api/v1/inventory/reserve             Reservar insumos
POST   /api/v1/inventory/release             Liberar reserva
GET    /api/v1/inventory/check/{id}/{qty}    Verificar disponibilidad
PUT    /api/v1/inventory/adjust              Ajustar stock

# CRUD de Insumos
GET    /api/v1/insumos                       Listar insumos
POST   /api/v1/insumos                       Crear insumo
GET    /api/v1/insumos/{id}                  Obtener insumo
PUT    /api/v1/insumos/{id}                  Actualizar insumo
DELETE /api/v1/insumos/{id}                  Eliminar insumo

# CRUD de Lotes
GET    /api/v1/lotes                         Listar lotes
POST   /api/v1/lotes                         Crear lote
PUT    /api/v1/lotes/{id}                    Actualizar lote

# CRUD de Recetas
GET    /api/v1/recetas                       Listar recetas
POST   /api/v1/recetas                       Crear receta
GET    /api/v1/recetas/{id}                  Obtener receta
PUT    /api/v1/recetas/{id}                  Actualizar receta
DELETE /api/v1/recetas/{id}                  Eliminar receta

# Público
GET    /api/v1/inventory/available/{id}      Cantidad disponible para producir
```

**Consumidores Directos:**
- Order Service (verifica disponibilidad antes de crear orden)
- API Gateway (proxy de inventario)
- Frontend-Administrativo (gestión de insumos)

---

### 1.5 ORDER SERVICE (Puerto 8003)

**Responsabilidades:**
- Gestión de órdenes/ventas
- Procesamiento de pagos
- Gestión de clientes
- Integración con Inventory Service para verificar disponibilidad

**Dependencias:**
- ✅ Depende de PRODUCT SERVICE (consulta productos disponibles)
- ✅ Depende de INVENTORY SERVICE (verifica disponibilidad)
- ✅ Base de datos: `order_db` (PostgreSQL)
- ✅ API Gateway lo consume

**Modelos Principales:**
- `Venta` - Órdenes de venta
- `DetalleVenta` - Líneas de cada venta
- `Cliente` - Información de clientes
- `Pago` - Registros de pagos
- `MetodoPago` - Métodos de pago disponibles

**Llamadas HTTP a Otros Servicios:**
```
# Hacia PRODUCT SERVICE
GET http://product-service-nginx/api/v1/products/available
  → Obtiene productos disponibles

GET http://product-service-nginx/api/v1/categories
  → Obtiene categorías de productos

# Hacia INVENTORY SERVICE
GET http://inventory-service:8002/api/v1/inventory/check/{productId}/{quantity}
  → Verifica si hay insumos disponibles para producir

POST http://inventory-service:8002/api/v1/inventory/reserve
  → Reserva insumos para la orden
  → Payload: { productId, quantity }

POST http://inventory-service:8002/api/v1/inventory/release
  → Libera reserva si se cancela orden
```

**Endpoints Expuestos:**
```
# CRUD de Órdenes (Protegido)
GET    /api/v1/orders                        Listar órdenes
POST   /api/v1/orders                        Crear orden
GET    /api/v1/orders/{id}                   Obtener orden
PUT    /api/v1/orders/{id}                   Actualizar orden
DELETE /api/v1/orders/{id}                   Cancelar orden

# CRUD de Ventas
GET    /api/v1/ventas                        Listar ventas
POST   /api/v1/ventas                        Crear venta
GET    /api/v1/ventas/{id}                   Obtener venta
PUT    /api/v1/ventas/{id}/status            Cambiar estado venta

# Detalles
GET    /api/v1/ventas/{id}/detalles          Obtener detalles de venta

# Público
GET    /api/v1/products/available            Productos disponibles
GET    /api/v1/categories                    Categorías
```

**Consumidores Directos:**
- API Gateway (proxy de órdenes)
- Frontend-Clientes (crear órdenes)
- Frontend-Administrativo (gestión de ventas)

**Orden de Ejecución en Crear Orden:**
1. Cliente envía datos de orden al API Gateway
2. API Gateway proxea a Order Service
3. Order Service verifica producto en Product Service
4. Order Service verifica disponibilidad en Inventory Service
5. Si disponible: Crea orden + Reserva insumos
6. Si no disponible: Retorna error 400

---

### 1.6 EMAIL SERVICE (Puerto 8004)

**Responsabilidades:**
- Gestión centralizada de notificaciones por email
- Procesamiento asincrónico via RabbitMQ
- Logging de notificaciones enviadas

**Dependencias:**
- ✅ Depende de RabbitMQ (consumidor de eventos)
- ✅ Base de datos: `email_db` (PostgreSQL)
- ❌ No depende de otros microservicios (recibe eventos)

**Modelos Principales:**
- `LogNotificacion` - Registro de emails enviados

**Eventos que Consume (via RabbitMQ):**
```
order.created           → Email de confirmación de orden
order.completed         → Email de orden completada
order.cancelled         → Email de cancelación
```

**Endpoints Expuestos:**
```
# Gestión de Logs (Protegido)
GET    /api/v1/notificaciones              Listar notificaciones enviadas
GET    /api/v1/notificaciones/{id}         Obtener detalle de notificación
```

**Consumidores Directos:**
- Order Service (publica eventos)
- API Gateway (proxy de notificaciones)
- RabbitMQ (consumidor de eventos)

---

### 1.7 FINANCE SERVICE (Puerto 8005)

**Responsabilidades:**
- Gestión centralizada de finanzas y facturación
- Registro de transacciones financieras
- Generación de reportes financieros
- Control de saldos y flujo de efectivo

**Dependencias:**
- ✅ Depende de Order Service (consulta órdenes/ventas)
- ✅ Depende de RabbitMQ (consumidor de eventos de pagos)
- ✅ Base de datos: `finance_db` (PostgreSQL)

**Modelos Principales:**
- `Transaccion` - Registro de transacciones financieras
- `Factura` - Facturas generadas
- `Reporte` - Reportes financieros periódicos
- `MetodoPago` - Métodos de pago disponibles

**Llamadas HTTP a Otros Servicios:**
```
# Hacia ORDER SERVICE
GET http://order-service:8003/api/v1/ventas
  → Obtiene todas las ventas registradas

GET http://order-service:8003/api/v1/ventas/{id}
  → Obtiene detalle de venta específica

GET http://order-service:8003/api/v1/ventas/{id}/detalles
  → Obtiene detalles/líneas de la venta
```

**Eventos que Consume (via RabbitMQ):**
```
order.created           → Registra transacción inicial
payment.received        → Registra entrada de efectivo
payment.failed          → Registra transacción fallida
order.refunded          → Registra devolución/reembolso
```

**Endpoints Expuestos:**
```
# CRUD de Transacciones (Protegido)
GET    /api/v1/transacciones              Listar transacciones
POST   /api/v1/transacciones              Registrar transacción
GET    /api/v1/transacciones/{id}         Obtener detalle
PUT    /api/v1/transacciones/{id}         Actualizar transacción

# CRUD de Facturas
GET    /api/v1/facturas                   Listar facturas
POST   /api/v1/facturas                   Generar factura
GET    /api/v1/facturas/{id}              Obtener factura
DELETE /api/v1/facturas/{id}              Anular factura

# Reportes Financieros
GET    /api/v1/reportes/balance           Balance general
GET    /api/v1/reportes/ingresos          Reporte de ingresos
GET    /api/v1/reportes/egresos           Reporte de egresos
GET    /api/v1/reportes/flujo-caja        Reporte de flujo de caja (período)
GET    /api/v1/reportes/resumen           Resumen financiero (año/mes)

# Métodos de Pago
GET    /api/v1/metodos-pago               Listar métodos de pago
POST   /api/v1/metodos-pago               Crear método de pago
```

**Consumidores Directos:**
- Order Service (publica eventos de pago)
- API Gateway (proxy de finanzas)
- Frontend-Administrativo (consulta reportes y saldos)
- RabbitMQ (consumidor de eventos financieros)

---

## 2. RELACIONES ENTRE COMPONENTES BACKEND

### 2.1 Controladores y Sus Dependencias

#### AUTH SERVICE

```
AuthController
├─ Método: register()
│  └─ Depende de: Usuario Model, Hash (Laravel)
│
├─ Método: login()
│  └─ Depende de: Usuario Model, Hash (Laravel), Sanctum
│
└─ Métodos: store(), update(), destroy()
   └─ Depende de: Usuario Model

UsuarioController (CRUD)
├─ Depende de: Usuario Model
├─ Valida: email único, DNI único
└─ Retorna: Usuario con password hasheado

EmpleadoController (CRUD)
├─ Depende de: Empleado Model
├─ Valida: DNI único
└─ Retorna: Datos de empleado

AdministrativoController (CRUD)
├─ Depende de: Administrativo Model
└─ Retorna: Datos de administrativo

CommentController (Anidado)
├─ Depende de: Comment Model, Usuario Model
├─ Parámetro: usuario_id
└─ Retorna: Comentarios del usuario
```

#### PRODUCT SERVICE

```
ProductController
├─ Método: index()
│  ├─ Depende de: Producto Model, Categoria Model
│  ├─ Filtros: categoria_id, tipo, estado
│  └─ Retorna: Listado paginado (10 items)
│
├─ Método: store()
│  ├─ Depende de: Producto Model, Categoria Model
│  ├─ Valida: categoria_id existe, tipo válido, precio > 0
│  └─ Retorna: Producto creado
│
├─ Método: show()
│  ├─ Depende de: Producto Model
│  ├─ Retorna: Producto con categoría y promociones
│  └─ Relación: producto → categoría (FK)
│
├─ Método: updateStatus()
│  ├─ Depende de: Producto Model
│  └─ Alterna: activo_web (boolean)
│
└─ Método: search()
   ├─ Depende de: Producto Model
   ├─ Busca: nombre, descripción
   └─ Retorna: Productos coincidentes

CategoriaController
├─ Depende de: Categoria Model
├─ Valida: nombre único
└─ Relación: categoría → productos (1:N)

PromocionController
├─ Depende de: Promocion Model, Producto Model
├─ Valida: fecha_fin > fecha_inicio, valor_descuento > 0
└─ Relación: promoción → productos (N:N via pivot)
```

#### INVENTORY SERVICE

```
InventoryController
├─ Método: index()
│  ├─ Depende de: Insumo Model, LoteInsumo Model
│  └─ Retorna: Inventario completo con lotes
│
├─ Método: checkAvailability()
│  ├─ Depende de: Insumo Model, Receta Model (relación)
│  ├─ Consulta: receta de producto → insumos requeridos
│  ├─ Calcula: stock disponible ÷ cantidad requerida
│  └─ Retorna: { available: boolean, error?: string }
│
├─ Método: reserve()
│  ├─ Depende de: Insumo Model, LoteInsumo Model
│  ├─ Valida: producto existe, cantidad disponible
│  ├─ Acción: Crea entrada en tabla de reservas
│  └─ Retorna: Reserva creada o error 400
│
└─ Método: getAvailableQuantity()
   ├─ Depende de: Insumo Model, Receta Model
   ├─ Consulta: máximo producible basado en insumos
   └─ Retorna: { product_id, available_quantity }

InsumoController
├─ Depende de: Insumo Model
├─ Valida: nombre único, unidad_medida válida
└─ Relación: insumo → lotes (1:N)

LoteInsumoController
├─ Depende de: LoteInsumo Model, Insumo Model
├─ Tracking: fecha_vencimiento
└─ Impacta: Disponibilidad de stock
```

#### ORDER SERVICE

```
OrderController
├─ Método: store()
│  ├─ Llamada HTTP: GET {PRODUCT_URL}/api/v1/products/{id}
│  │  → Valida que producto exista
│  ├─ Llamada HTTP: GET {INVENTORY_URL}/api/v1/inventory/check/{id}/{qty}
│  │  → Valida que hay stock disponible
│  ├─ Dependencia: Venta Model, DetalleVenta Model
│  ├─ Transacción: Crea venta + Reserva insumos (atomicidad)
│  └─ Retorna: Venta creada o error (400/404)
│
├─ Método: getAvailableProducts()
│  ├─ Llamada HTTP: GET {PRODUCT_URL}/api/v1/products/available
│  └─ Proxy hacia Product Service
│
└─ Método: getCategories()
   ├─ Llamada HTTP: GET {PRODUCT_URL}/api/v1/categories
   └─ Proxy hacia Product Service

VentaController
├─ Depende de: Venta Model, DetalleVenta Model, Cliente Model, Pago Model
├─ Relaciones:
│  ├─ venta → cliente (N:1)
│  ├─ venta → detalles_venta (1:N)
│  ├─ venta → pagos (1:N)
│  └─ pago → metodo_pago (N:1)
└─ Métodos CRUD estándar

ClienteController
├─ Depende de: Cliente Model
└─ Valida: email único, teléfono formato válido

PagoController
├─ Depende de: Pago Model, Venta Model, MetodoPago Model
└─ Registra: monto, método, fecha del pago
```

---

### 2.2 Flujos de Comunicación Inter-Controladores

```
[Crear Orden - Flujo Completo]

1. Frontend → API Gateway
   POST /api/v1/orders
   Body: { producto_id, cantidad, cliente_id }

2. API Gateway → Order Service
   POST /api/v1/orders
   Headers: { Authorization: Bearer token }

3. Order Service OrderController.store()
   └─ HTTP GET: {PRODUCT_URL}/api/v1/products/{producto_id}
      └─ Product Service ProductController.show()
         ├─ Valida que producto existe
         └─ Retorna: { producto_id, nombre, precio, categoria }
   
   └─ HTTP GET: {INVENTORY_URL}/api/v1/inventory/check/{producto_id}/{cantidad}
      └─ Inventory Service InventoryController.checkAvailability()
         ├─ Consulta receta de producto
         ├─ Consulta lotes disponibles
         ├─ Calcula disponibilidad
         └─ Retorna: { available: true/false }
   
   ├─ Si NO disponible → Retorna error 400
   
   ├─ Si SÍ disponible:
   │  ├─ Transacción DB:
   │  │  ├─ VentaController.store() → Crea Venta
   │  │  ├─ DetalleVentaController.store() → Crea DetalleVenta
   │  │  └─ Retorna: venta_id
   │  │
   │  └─ HTTP POST: {INVENTORY_URL}/api/v1/inventory/reserve
   │     Body: { product_id, quantity, venta_id }
   │     └─ Inventory Service InventoryController.reserve()
   │        ├─ Crea entrada de reserva
   │        └─ Retorna: { reserved: true }
   
   └─ Publica evento en RabbitMQ: order.created
      └─ Email Service consume evento
         └─ Envía email de confirmación al cliente

4. Retorna a API Gateway: { venta_id, estado, total }

5. API Gateway retorna a Frontend: Respuesta 201 Created
```

---

## 3. RELACIONES FRONTEND-BACKEND

### 3.1 Frontend-Administrativo

**Tecnología:** React + TypeScript + Tailwind CSS + Radix UI  
**Puerto:** Definido en Dockerfile/vite.config.ts  
**Build:** Vite + React 19

**Dependencias de Componentes:**

```
App.tsx (Principal)
├─ Dashboard
│  ├─ Consumes: /api/v1/orders (vías API Gateway)
│  ├─ Consumes: /api/v1/products
│  └─ Consumes: /api/v1/insumos
│
├─ ProductManagement
│  ├─ CRUD: /api/v1/products
│  ├─ CRUD: /api/v1/categories
│  ├─ READ: /api/v1/promotions
│  └─ Depende de: Product Service
│
├─ InventoryManagement
│  ├─ CRUD: /api/v1/insumos
│  ├─ CRUD: /api/v1/lotes
│  ├─ READ: /api/v1/inventory
│  └─ Depende de: Inventory Service
│
├─ SalesManagement
│  ├─ CRUD: /api/v1/ventas
│  ├─ READ: /api/v1/orders
│  ├─ READ: /api/v1/clientes
│  └─ Depende de: Order Service
│
├─ UserManagement (Empleados/Administrativos)
│  ├─ CRUD: /api/v1/empleados
│  ├─ CRUD: /api/v1/administrativos
│  └─ Depende de: Auth Service
│
├─ CashRegister (Apertura de Caja)
│  ├─ POST: /api/v1/caja/abrir
│  ├─ GET: /api/v1/caja/estado-actual
│  └─ GET: /api/v1/caja/verificar-estado
│
└─ Authentication
   ├─ POST: /auth/login (via API Gateway)
   ├─ POST: /auth/register (via API Gateway)
   └─ Depende de: Auth Service

Estructura de Carpetas:
/src
├─ /components
│  ├─ ProductForm.tsx → Controla formularios de productos
│  ├─ OrderList.tsx → Listado de órdenes
│  ├─ InventoryChart.tsx → Gráficos de inventario
│  └─ ...
├─ /pages
│  ├─ Dashboard.tsx → Dashboard principal
│  ├─ Products.tsx → Gestión de productos
│  ├─ Inventory.tsx → Gestión de inventario
│  ├─ Orders.tsx → Gestión de órdenes
│  └─ ...
├─ /services
│  ├─ apiGateway.ts → Cliente HTTP centralizado
│  ├─ productService.ts → Wrapper de endpoints de producto
│  ├─ orderService.ts → Wrapper de endpoints de orden
│  └─ ...
└─ /lib
   ├─ axios.config.ts → Configuración HTTP
   └─ auth.ts → Manejo de autenticación
```

**Flujo de Comunicación:**

```
Frontend-Administrativo
         │
         │ HTTP Request (con Bearer token)
         │ GET/POST/PUT/DELETE /api/v1/*
         ▼
    API Gateway (Puerto 80 - Nginx)
         │
         │ Valida token Sanctum
         │ Enruta a servicio correspondiete
         │
         ├─────→ Auth Service (login/register)
         ├─────→ Product Service (productos/categorías)
         ├─────→ Inventory Service (insumos/lotes)
         ├─────→ Order Service (ventas/órdenes)
         │
         │ HTTP Response (JSON)
         ▼
Frontend-Administrativo
```

**Endpoints Consumidos:**
- `POST /auth/login` - Autenticación
- `GET /api/v1/products` - Listar productos
- `POST /api/v1/products` - Crear producto
- `PUT /api/v1/products/{id}` - Actualizar producto
- `DELETE /api/v1/products/{id}` - Eliminar producto
- `GET /api/v1/categories` - Listar categorías
- `POST /api/v1/categories` - Crear categoría
- `GET /api/v1/insumos` - Listar insumos
- `POST /api/v1/insumos` - Crear insumo
- `GET /api/v1/inventory` - Ver inventario
- `POST /api/v1/inventory/reserve` - Reservar insumos
- `GET /api/v1/orders` - Listar órdenes
- `GET /api/v1/ventas` - Listar ventas
- `POST /api/v1/ventas` - Crear venta
- `GET /api/v1/empleados` - Listar empleados
- `POST /api/v1/empleados` - Crear empleado
- `GET /api/v1/administrativos` - Listar administrativos

---

### 3.2 Frontend-Clientes

**Tecnología:** React + React Router + Tailwind CSS  
**Puerto:** Definido en package.json (react-scripts start)  
**Build:** Create React App

**Dependencias de Componentes:**

```
App.js (Principal)
├─ Home Page
│  ├─ Consumes: GET /api/v1/products/available
│  ├─ Consumes: GET /api/v1/categories
│  ├─ Consumes: GET /api/v1/promotions/active
│  └─ Depende de: Product Service (PUBLIC)
│
├─ Product Catalog
│  ├─ READ: /api/v1/products/available
│  ├─ READ: /api/v1/products/search
│  ├─ READ: /api/v1/categories
│  └─ Filter by category, price, etc.
│
├─ Product Detail
│  ├─ READ: /api/v1/products/{id}
│  ├─ READ: /api/v1/promotions/active
│  └─ Show ingredients, allergens, nutrition
│
├─ Shopping Cart
│  ├─ State management: React Local State/Context
│  ├─ NO persiste en servidor (solo frontend)
│  └─ Agregación de productos
│
├─ Checkout
│  ├─ Consulta: /api/v1/products/available (precio final)
│  ├─ CREATE: POST /api/v1/orders
│  │  Body: { items: [{product_id, quantity}], cliente_info }
│  └─ Depende de: Order Service
│
├─ My Orders
│  ├─ AUTH requerida
│  ├─ READ: GET /api/v1/orders (usuario autenticado)
│  ├─ READ: GET /api/v1/orders/{id}
│  └─ Depende de: Order Service
│
├─ Order Tracking
│  ├─ POLLING: GET /api/v1/orders/{id} cada 5s
│  ├─ Monitorea: estado_pedido
│  └─ Depende de: Order Service
│
└─ Authentication
   ├─ POST: /auth/register (nuevo cliente)
   ├─ POST: /auth/login (cliente existente)
   └─ Depende de: Auth Service

Estructura de Carpetas:
/src
├─ /pages
│  ├─ HomePage.js → Catálogo de productos
│  ├─ ProductDetail.js → Detalle de producto
│  ├─ ShoppingCart.js → Carrito
│  ├─ Checkout.js → Finalización de compra
│  ├─ MyOrders.js → Mis órdenes
│  ├─ OrderTracking.js → Seguimiento
│  └─ ...
├─ /components
│  ├─ ProductCard.js → Tarjeta de producto
│  ├─ CategoryFilter.js → Filtro por categoría
│  ├─ OrderStatus.js → Estado de orden
│  └─ ...
├─ /services
│  ├─ productService.js → Wrapper de endpoints producto
│  ├─ orderService.js → Wrapper de endpoints orden
│  └─ authService.js → Wrapper de endpoints auth
└─ /context
   ├─ CartContext.js → Estado global de carrito
   ├─ AuthContext.js → Estado global de autenticación
   └─ ...
```

**Flujo de Comunicación:**

```
Frontend-Clientes
         │
         │ 1. HTTP GET (público, sin token)
         │    /api/v1/products/available
         │    /api/v1/categories
         │    /api/v1/promotions/active
         ▼
    API Gateway (Puerto 80 - Nginx)
         │
         │ Enruta a Product Service
         │
         └─────→ Product Service
                 └─ Retorna: Productos públicos/activos
         │
         │ Retorna JSON
         ▼
Frontend-Clientes (renderiza catálogo)
         │
         │ 2. Usuario selecciona productos y hace checkout
         │    HTTP POST (con Bearer token si cliente autenticado)
         │    /api/v1/orders
         │    Body: { items, cliente_info, metodo_pago }
         ▼
    API Gateway
         │
         │ Valida token (si está autenticado)
         │ Enruta a Order Service
         │
         └─────→ Order Service
                 ├─ Verifica productos en Product Service
                 ├─ Verifica stock en Inventory Service
                 └─ Crea orden + Reserva insumos
         │
         │ 3. Publica evento RabbitMQ: order.created
         │    ▼
         │    Email Service consume evento
         │    └─ Envía email de confirmación
         │
         │ Retorna: { orden_id, estado, tracking_url }
         ▼
Frontend-Clientes (muestra confirmación)
         │
         │ 4. Usuario consulta estado (POLLING cada 5s)
         │    GET /api/v1/orders/{id}
         ▼
    API Gateway → Order Service
         │
         │ Retorna: { orden_id, estado, items, ETA }
         ▼
Frontend-Clientes (actualiza estado)
```

**Endpoints Consumidos:**
- `GET /api/v1/products/available` - Productos activos (público)
- `GET /api/v1/products/search` - Búsqueda (público)
- `GET /api/v1/categories` - Categorías (público)
- `GET /api/v1/products/{id}` - Detalle de producto (público)
- `GET /api/v1/promotions/active` - Promociones vigentes (público)
- `POST /auth/register` - Registro de cliente
- `POST /auth/login` - Login de cliente
- `POST /api/v1/orders` - Crear orden (autenticado)
- `GET /api/v1/orders` - Mis órdenes (autenticado)
- `GET /api/v1/orders/{id}` - Detalle de orden (autenticado)

---

## 4. DEPENDENCIAS DE CONFIGURACIÓN

### 4.1 Variables de Entorno (.env)

```
# Base de Datos
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret
POSTGRES_PORT=5432

# RabbitMQ
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_PORT=5672

# Laravel Global
APP_ENV=local
APP_DEBUG=true
APP_KEY=...

# Cada servicio hereda estas variables en docker-compose.yml
```

**Propagación de Variables:**

```
.env (raíz)
  │
  ├─ Leído por: docker-compose.yml
  │  │
  │  ├─ Define: POSTGRES_USER, POSTGRES_PASSWORD
  │  │  │
  │  │  ├─ Usado por: db-auth, db-product, db-inventory, db-order, db-email
  │  │  │  └─ PostgreSQL containers
  │  │  │
  │  │  └─ Usado por: Todos los servicios (env_file: ./.env)
  │  │     └─ AUTH_SERVICE, PRODUCT_SERVICE, INVENTORY_SERVICE, ORDER_SERVICE, EMAIL_SERVICE, API_GATEWAY
  │  │
  │  └─ Define: RABBITMQ_USER, RABBITMQ_PASSWORD
  │     │
  │     └─ Usado por: rabbitmq container + Email Service
  │
  └─ Propiedades clave:
     ├─ APP_ENV=local → DEBUG activado
     ├─ DB_HOST=<servicio> → Comunicación interna (docker-compose network)
     ├─ DB_PORT=5432 → Puerto interno (no mapeado)
     ├─ DB_DATABASE=<servicioname>_db → BD separada por servicio
     ├─ CACHE_DRIVER=file → Cache en archivos (desarrollo)
     ├─ QUEUE_CONNECTION=rabbitmq → RabbitMQ habilitado
     └─ RABBITMQ_HOST=rabbitmq → Nombre servicio RabbitMQ
```

### 4.2 Docker Compose (docker-compose.yml)

```
Servicios Dependientes:

1. Bases de Datos (6 instancias PostgreSQL)
   ├─ db-auth (5440:5432)
   ├─ db-product (5441:5432)
   ├─ db-inventory (5442:5432)
   ├─ db-order (5443:5432)
   ├─ db-email (5444:5432)
   └─ db-apigateway (5445:5432)

   Configuración común:
   - Image: postgres:16-alpine
   - Healthcheck: pg_isready
   - Volumen: db-{service}-data (persistencia)
   - Network: happydonut-net (red interna)

2. RabbitMQ
   ├─ Image: rabbitmq:3-management
   ├─ Port: 5672 (AMQP) + 15672 (Management UI)
   ├─ Credentials: RABBITMQ_USER/RABBITMQ_PASSWORD
   └─ Used by: Email Service, Order Service

3. API Gateway (Nginx + Laravel)
   ├─ Puertos: 80:80 (Nginx), 8000:8000 (Laravel)
   ├─ Depends on: db-apigateway, auth-service, product-service, inventory-service, order-service
   ├─ Healthcheck: curl -f http://localhost:8000/up
   ├─ Volumes: apigateway:/var/www
   ├─ Environment:
   │  ├─ DB_HOST=db-apigateway
   │  ├─ DB_DATABASE=apigateway_db
   │  └─ QUEUE_CONNECTION=rabbitmq
   └─ Nginx config: nginx.conf

4. Auth Service
   ├─ Port: 9001:8000 (externo:interno)
   ├─ Depends on: db-auth
   ├─ Healthcheck: curl -f http://localhost:8000/up
   ├─ Volumes: auth_service:/var/www
   ├─ Environment:
   │  ├─ DB_HOST=db-auth
   │  ├─ DB_DATABASE=auth_db
   │  └─ (hereda variables de .env)
   └─ Build: auth_service/Dockerfile

5. Product Service (Nginx + Laravel)
   ├─ Port: 9002:8000 (Laravel externo)
   ├─ Nginx: 9002:80 (via product-service-nginx)
   ├─ Depends on: db-product
   ├─ Healthcheck: curl -f http://localhost:8000/up
   ├─ Volumes: product_service:/var/www
   ├─ Environment:
   │  ├─ DB_HOST=db-product
   │  ├─ DB_DATABASE=product_db
   │  └─ (hereda variables de .env)
   └─ Build: product_service/Dockerfile

6. Inventory Service
   ├─ Port: (interno, sin exposición directa)
   ├─ Depends on: db-inventory
   ├─ Healthcheck: curl -f http://localhost:8000/up
   ├─ Volumes: inventory_service:/var/www
   ├─ Environment:
   │  ├─ DB_HOST=db-inventory
   │  ├─ DB_DATABASE=inventory_db
   │  └─ (hereda variables de .env)
   └─ Build: inventory_service/Dockerfile

7. Order Service
   ├─ Port: (interno, sin exposición directa)
   ├─ Depends on: db-order, rabbitmq
   ├─ Healthcheck: curl -f http://localhost:8000/up
   ├─ Volumes: order_service:/var/www
   ├─ Environment:
   │  ├─ DB_HOST=db-order
   │  ├─ DB_DATABASE=order_db
   │  ├─ QUEUE_CONNECTION=rabbitmq
   │  ├─ RABBITMQ_HOST=rabbitmq
   │  └─ (hereda variables de .env)
   └─ Build: order_service/Dockerfile

8. Email Service
   ├─ Port: (interno, sin exposición directa)
   ├─ Depends on: db-email, rabbitmq
   ├─ Healthcheck: curl -f http://localhost:8000/up
   ├─ Volumes: email_service:/var/www
   ├─ Environment:
   │  ├─ DB_HOST=db-email
   │  ├─ DB_DATABASE=email_db
   │  ├─ QUEUE_CONNECTION=rabbitmq
   │  ├─ RABBITMQ_HOST=rabbitmq
   │  ├─ MAIL_MAILER=... (configuración de envío)
   │  └─ (hereda variables de .env)
   └─ Build: email_service/Dockerfile

Volumes (persistencia):
├─ db-auth-data:/var/lib/postgresql/data
├─ db-product-data:/var/lib/postgresql/data
├─ db-inventory-data:/var/lib/postgresql/data
├─ db-order-data:/var/lib/postgresql/data
├─ db-email-data:/var/lib/postgresql/data
└─ db-apigateway-data:/var/lib/postgresql/data

Network:
└─ happydonut-net (red interna para comunicación entre servicios)
```

### 4.3 Nginx Configuration

```
nginx.conf (API Gateway)
├─ Upstream: auth-service (9001:8000)
├─ Upstream: product-service-nginx (9002:80)
├─ Upstream: inventory-service (8002)
├─ Upstream: order-service (8003)
├─ Upstream: email-service (8000)
└─ Proxy pass rules:
   ├─ /auth/* → auth-service
   ├─ /api/v1/products* → product-service
   ├─ /api/v1/categories* → product-service
   ├─ /api/v1/inventory* → inventory-service
   ├─ /api/v1/orders* → order-service
   └─ /api/v1/emails* → email-service

product-service-nginx.conf
├─ Upstream: product-service (8001)
└─ Proxy pass rules:
   └─ /* → product-service
```

### 4.4 Dockerfile y Build

```
Cada servicio tiene:

Dockerfile
├─ Base image: php:8.2-fpm-alpine (para Laravel)
├─ Workdir: /var/www
├─ Copia: . /var/www
├─ Run: composer install (dependencias PHP)
├─ Run: npm install (dependencias Node.js)
├─ Run: php artisan migrate (migraciones)
├─ Expose: 8000 (puerto interno)
├─ Entrypoint: entrypoint.sh
└─ Health check: curl -f http://localhost:8000/up

entrypoint.sh (startup script)
├─ chmod vendor/ (permisos)
├─ chmod storage/ (permisos)
├─ php artisan config:cache
├─ php artisan route:cache
├─ php artisan key:generate (si no existe)
└─ php artisan serve --host 0.0.0.0 --port 8000
```

---

## 5. RELACIONES DE INFRAESTRUCTURA

### 5.1 Topología de Red

```
┌─────────────────────────────────────────────────────────────────┐
│                      HOST MACHINE                               │
│                                                                  │
│  Puerto 80 ──┐     Puerto 5440 ──┐                            │
│              │                    │                            │
│              ▼                    ▼                            │
│         ┌─────────────────┐  ┌──────────────────┐             │
│         │  Nginx Gateway  │  │ PostgreSQL       │             │
│         │  (80 → 8000)    │  │ (5440 ← 5432)    │             │
│         └────────┬────────┘  └──────────────────┘             │
│                  │                                             │
│                  └───────────────────────────────────┐         │
│                                                      │         │
└──────────────────────────────────────────────────────┼─────────┘
                                                       │
                    ┌──────────────────────────────────┘
                    │
                    ▼
         ┌─ happydonut-net ─┐  (Docker Network)
         │                   │
         │  ┌─────────────┐  │
         │  │ API Gateway │  │  (8000:8000)
         │  │ + Nginx     │  │
         │  └────┬────┬───┘  │
         │       │    │      │
         │   ┌───┴────┴───┬──┴──────────────┐
         │   │            │                 │
         │   ▼            ▼                 ▼
         │ ┌──────────┐ ┌─────────────┐ ┌─────────────┐
         │ │Auth Svc  │ │Product Svc  │ │Inventory Sv │
         │ │(9001)    │ │(9002)       │ │             │
         │ └────┬─────┘ └──────┬──────┘ └─────┬───────┘
         │      │              │              │
         │      ▼              ▼              ▼
         │ ┌──────────┐ ┌─────────────┐ ┌──────────────┐
         │ │db-auth   │ │db-product   │ │db-inventory  │
         │ │(5440)    │ │(5441)       │ │(5442)        │
         │ └──────────┘ └─────────────┘ └──────────────┘
         │
         │ ┌──────────────┐  ┌───────────────┐  ┌──────────────┐
         │ │Order Svc     │  │Email Svc      │  │RabbitMQ      │
         │ │(9003)        │  │               │  │(5672)        │
         │ └────┬─────────┘  └───────┬───────┘  └──────────────┘
         │      │                    │
         │      ▼                    ▼
         │ ┌──────────┐         ┌─────────────┐
         │ │db-order  │         │db-email     │
         │ │(5443)    │         │(5444)       │
         │ └──────────┘         └─────────────┘
         │
         └─────────────────────────────────────┘
```

### 5.2 Flujos de Datos

```
Lectura de Producto (Público)
════════════════════════════════════
Usuario Browser
    │
    └─HTTP GET localhost/api/v1/products/available
         │
         ▼
    Nginx (Host:80)
         │
         └─Forward to container (API Gateway:8000)
              │
              ▼
         API Gateway
              │
              └─HTTP GET http://product-service-nginx/api/v1/products/available
                   │
                   ▼
              Product Nginx (Port 80)
                   │
                   └─Forward to Product Service (8000)
                        │
                        ▼
                   Product Service (Laravel)
                        │
                        ├─Query: SELECT * FROM productos WHERE activo_web=true
                        │
                        ▼
                   DB (db-product:5432)
                        │
                        └─Return productos[]
                   │
                   ▼
              Response JSON → Browser

Creación de Orden (Autenticado)
═════════════════════════════════════
Usuario (Autenticado)
    │
    └─HTTP POST localhost/api/v1/orders (Bearer token)
    │
    │ Body: { producto_id, cantidad, cliente_id }
    │
    ▼
Nginx (Host:80)
    │
    └─Forward to API Gateway (8000)
         │
         ▼
    API Gateway GatewayController::createOrder()
         │
         ├─1. HTTP GET http://product-service-nginx/api/v1/products/{id}
         │   └─Valida que producto existe
         │
         ├─2. HTTP GET http://inventory-service:8002/api/v1/inventory/check/{id}/{qty}
         │   └─Valida disponibilidad
         │
         ├─3. Forward to Order Service (8003)
         │    │
         │    ▼
         │ Order Service OrderController::store()
         │    │
         │    ├─Transacción en db-order:
         │    │  ├─INSERT INTO ventas (...)
         │    │  ├─INSERT INTO detalles_venta (...)
         │    │  └─RETURN venta_id
         │    │
         │    ├─HTTP POST http://inventory-service:8002/api/v1/inventory/reserve
         │    │  │
         │    │  ▼
         │    │ Inventory Service
         │    │  │
         │    │  └─Transacción en db-inventory:
         │    │     ├─INSERT INTO reservas (...)
         │    │     ├─UPDATE lote_insumo SET cantidad=cantidad-{qty}
         │    │     └─RETURN { reserved: true }
         │    │
         │    └─Publica evento en RabbitMQ
         │       │
         │       └─Event: order.created
         │          │
         │          ▼
         │       Email Service (escucha rabbitmq)
         │          │
         │          ├─Consume: order.created
         │          ├─Query cliente email en Order DB
         │          ├─Genera: Email template
         │          └─Guarda: Registre en db-email
         │
         │
         └─Response: { venta_id, estado, total }
              │
              ▼
         Browser: Muestra confirmación

Transacción Fallida
═════════════════════════════════════
Si verificación falla:
    ├─Producto no existe → Order Service retorna 404
    ├─Stock insuficiente → Inventory Service retorna 400
    └─API Gateway retorna error al navegador
    │
    └─No se crea orden, no se reservan insumos, transacción rollback
```

---

## 6. MATRIZ DE COMUNICACIÓN

```
┌──────────────┬────────┬──────────┬────────────┬──────────┬──────────┐
│   DE / A     │  Auth  │ Product  │ Inventory  │  Order   │  Email   │
├──────────────┼────────┼──────────┼────────────┼──────────┼──────────┤
│   API GW     │  ✅    │   ✅     │    ✅      │   ✅     │   ✅     │
│              │Proxy   │  Proxy   │   Proxy    │  Proxy   │  Proxy   │
├──────────────┼────────┼──────────┼────────────┼──────────┼──────────┤
│   Auth       │   -    │    -     │     -      │    -     │    -     │
├──────────────┼────────┼──────────┼────────────┼──────────┼──────────┤
│   Product    │   -    │   -      │     -      │    -     │    -     │
├──────────────┼────────┼──────────┼────────────┼──────────┼──────────┤
│  Inventory   │   -    │   -      │     -      │    -     │    -     │
├──────────────┼────────┼──────────┼────────────┼──────────┼──────────┤
│   Order      │   -    │  ✅ GET  │   ✅ GET   │   -      │ ✅ (Evt) │
│              │        │  Products│  Available │          │ RabbitMQ │
├──────────────┼────────┼──────────┼────────────┼──────────┼──────────┤
│   Email      │   -    │   -      │     -      │    -     │   -      │
│              │        │          │            │          │          │
└──────────────┴────────┴──────────┴────────────┴──────────┴──────────┘

Leyenda:
✅ = Comunicación existente
- = No existe comunicación
GET = Request HTTP GET
POST = Request HTTP POST
Evt = Event vía RabbitMQ
```

---

## 7. ITEMS DE CONFIGURACIÓN (CIs)

### 7.1 Clasificación de CIs

```
TIPO 1: SERVICIOS BACKEND
════════════════════════════════════

CI-001: Auth Service
├─ Versión: Laravel 12 (Backend)
├─ Puerto: 9001 (expose) / 8000 (internal)
├─ Database: auth_db (PostgreSQL)
├─ Dependencias:
│  ├─ DB: db-auth (healthcheck)
│  ├─ Env: .env (credenciales BD)
│  └─ Build: auth_service/Dockerfile
├─ Responsable: Controlador de autenticación
├─ Estado: Production
└─ Relacionados: CI-008 (API Gateway), CI-016 (Frontend Admin), CI-017 (Frontend Clientes)

CI-002: Product Service
├─ Versión: Laravel 12 (Backend)
├─ Puerto: 9002 (expose) / 80 (nginx)
├─ Database: product_db (PostgreSQL)
├─ Dependencias:
│  ├─ DB: db-product (healthcheck)
│  ├─ Env: .env
│  └─ Build: product_service/Dockerfile + Nginx config
├─ Responsable: Gestión de catálogo
├─ Estado: Production
├─ Relacionados: CI-008 (API Gateway), CI-004 (Order Service), CI-017 (Frontend Clientes)
└─ Interfaces:
   ├─ /api/v1/products (CRUD)
   ├─ /api/v1/categories (CRUD)
   └─ /api/v1/promotions (CRUD)

CI-003: Inventory Service
├─ Versión: Laravel 12 (Backend)
├─ Puerto: (internal only)
├─ Database: inventory_db (PostgreSQL)
├─ Dependencias:
│  ├─ DB: db-inventory (healthcheck)
│  ├─ Env: .env
│  └─ Build: inventory_service/Dockerfile
├─ Responsable: Control de stock e insumos
├─ Estado: Production
├─ Relacionados: CI-008 (API Gateway), CI-004 (Order Service), CI-016 (Frontend Admin)
└─ Interfaces:
   ├─ /api/v1/inventory (status checks)
   ├─ /api/v1/insumos (CRUD)
   └─ /api/v1/lotes (CRUD)

CI-004: Order Service
├─ Versión: Laravel 12 (Backend)
├─ Puerto: (internal only)
├─ Database: order_db (PostgreSQL)
├─ Dependencias:
│  ├─ DB: db-order (healthcheck)
│  ├─ Env: .env
│  ├─ Build: order_service/Dockerfile
│  ├─ RabbitMQ: rabbitmq (queue connection)
│  ├─ Service: CI-002 (Product Service) - consulta productos
│  └─ Service: CI-003 (Inventory Service) - verifica stock
├─ Responsable: Procesamiento de órdenes
├─ Estado: Production
├─ Relacionados: CI-008 (API Gateway), CI-002, CI-003, CI-006, CI-016, CI-017
└─ Interfaces:
   ├─ /api/v1/orders (CRUD)
   ├─ /api/v1/ventas (CRUD)
   └─ Publica eventos: order.created, order.completed

CI-005: Email Service
├─ Versión: Laravel 12 (Backend)
├─ Puerto: (internal only)
├─ Database: email_db (PostgreSQL)
├─ Dependencias:
│  ├─ DB: db-email (healthcheck)
│  ├─ Env: .env
│  ├─ Build: email_service/Dockerfile
│  └─ RabbitMQ: rabbitmq (consumer)
├─ Responsable: Notificaciones por email
├─ Estado: Production
├─ Relacionados: CI-008 (API Gateway), CI-004 (Order Service), CI-007 (RabbitMQ)
└─ Interfaces:
   └─ /api/v1/send-email (RabbitMQ consumer)

CI-006: API Gateway
├─ Versión: Laravel 12 + Inertia + Nginx
├─ Puerto: 80 (Nginx expose) / 8000 (Laravel expose)
├─ Database: apigateway_db (PostgreSQL)
├─ Dependencias:
│  ├─ DB: db-apigateway (healthcheck)
│  ├─ Env: .env
│  ├─ Build: apigateway/Dockerfile
│  ├─ Nginx: nginx.conf + Upstream definitions
│  ├─ Service: CI-001 (Auth Service)
│  ├─ Service: CI-002 (Product Service)
│  ├─ Service: CI-003 (Inventory Service)
│  ├─ Service: CI-004 (Order Service)
│  └─ Service: CI-005 (Email Service)
├─ Responsable: Enrutador y proxy centralizado
├─ Estado: Production
├─ Relacionados: CI-001-005, CI-016, CI-017, CI-007 (Docker Compose)
└─ Interfaces:
   ├─ /auth/login
   ├─ /auth/register
   ├─ Proxy: /api/v1/*

TIPO 2: INFRAESTRUCTURA
════════════════════════════════════

CI-007: Docker Compose & Networking
├─ Archivo: docker-compose.yml
├─ Servicios: 6 BD + 5 microservicios + API Gateway + RabbitMQ
├─ Red: happydonut-net (bridge network)
├─ Volúmenes: 6 volúmenes de datos (persistencia BD)
├─ Env: .env (variables globales)
├─ Dependencias:
│  ├─ Docker Engine
│  ├─ Docker Compose v2.0+
│  ├─ Archivos .env
│  └─ Dockerfiles (cada servicio)
├─ Responsable: Orquestación de contenedores
├─ Estado: Production
├─ Relacionados: CI-001-006, CI-009-015 (Bases de datos), CI-019 (RabbitMQ)
└─ Healthchecks:
   ├─ Cada servicio: curl -f http://localhost:8000/up
   ├─ Cada BD: pg_isready
   └─ RabbitMQ: tcp health check

CI-008: PostgreSQL Database Cluster
├─ Versión: PostgreSQL 16 (Alpine)
├─ Instancias: 6 independientes (1 por servicio + 1 Gateway)
├─ Puertos: 5440-5445 (mapeados a host)
├─ Credentials: admin/secret (desde .env)
├─ Dependencias:
│  ├─ Docker volume: db-{service}-data
│  ├─ healthcheck: pg_isready
│  ├─ Network: happydonut-net
│  └─ .env (variables de usuario/contraseña)
├─ Responsable: Persistencia de datos
├─ Estado: Production
├─ Relacionados: CI-001-006 (todos los servicios)
├─ Instancias:
│  ├─ CI-009: db-auth (auth_db)
│  ├─ CI-010: db-product (product_db)
│  ├─ CI-011: db-inventory (inventory_db)
│  ├─ CI-012: db-order (order_db)
│  ├─ CI-013: db-email (email_db)
│  └─ CI-014: db-apigateway (apigateway_db)
└─ Configuración:
   ├─ Auto-init: db-{service} database
   ├─ User: admin (desde POSTGRES_USER)
   ├─ Pass: secret (desde POSTGRES_PASSWORD)
   └─ Port: 5432 (interno) / 5440+ (externo)

CI-019: RabbitMQ
├─ Versión: RabbitMQ 3-management
├─ Puerto: 5672 (AMQP) / 15672 (Management UI)
├─ Credentials: guest/guest (default)
├─ Dependencias:
│  ├─ Docker Container
│  ├─ healthcheck: tcp port check
│  └─ Network: happydonut-net
├─ Responsable: Message Queue & Event Bus
├─ Estado: Production
├─ Relacionados: CI-004 (Order Service), CI-005 (Email Service)
├─ Eventos:
│  ├─ order.created
│  ├─ order.completed
│  ├─ order.cancelled
│  ├─ user.registered
│  ├─ payment.received
│  └─ inventory.low_stock
└─ Exchanges/Queues: Definidos en servicios (lazy-init)

TIPO 3: FRONTENDS
════════════════════════════════════

CI-015: Frontend Administrativo
├─ Framework: React 19 + TypeScript + Tailwind + Radix UI
├─ Build: Vite
├─ Versión: 0.1.0
├─ Puerto: Definido en Dockerfile/vite.config.ts
├─ Dependencias:
│  ├─ npm packages (radix-ui, recharts, lucide-react, etc.)
│  ├─ Env: .env (API_GATEWAY_URL)
│  ├─ Build: frontend-administrativo/Dockerfile
│  └─ API: CI-006 (API Gateway)
├─ Responsable: Dashboard administrativo
├─ Estado: Development
├─ Relacionados: CI-006, CI-001-005 (vía Gateway)
├─ Funcionalidades:
│  ├─ Dashboard (estadísticas)
│  ├─ Gestión de productos
│  ├─ Gestión de inventario
│  ├─ Gestión de órdenes/ventas
│  ├─ Gestión de usuarios
│  └─ Apertura de caja
└─ Endpoints consumidos:
   ├─ /auth/login
   ├─ /api/v1/products (CRUD)
   ├─ /api/v1/categories (CRUD)
   ├─ /api/v1/insumos (CRUD)
   ├─ /api/v1/inventory (GET)
   ├─ /api/v1/orders (GET)
   ├─ /api/v1/ventas (CRUD)
   └─ /api/v1/empleados (CRUD)

CI-016: Frontend Clientes
├─ Framework: React 19 + React Router + Tailwind
├─ Build: React Scripts (Create React App)
├─ Versión: 0.1.0
├─ Puerto: Definido en package.json (react-scripts start)
├─ Dependencias:
│  ├─ npm packages (react-router-dom, lucide-react, etc.)
│  ├─ Env: .env (API_GATEWAY_URL)
│  ├─ Build: frontend-clientes/Dockerfile
│  └─ API: CI-006 (API Gateway)
├─ Responsable: Portal de compra del cliente
├─ Estado: Development
├─ Relacionados: CI-006, CI-001-005 (vía Gateway)
├─ Funcionalidades:
│  ├─ Catálogo público
│  ├─ Búsqueda de productos
│  ├─ Carrito de compras
│  ├─ Checkout
│  ├─ Mis órdenes
│  ├─ Seguimiento de órdenes
│  └─ Autenticación
└─ Endpoints consumidos:
   ├─ /auth/register
   ├─ /auth/login
   ├─ /api/v1/products/available (GET)
   ├─ /api/v1/products/search (GET)
   ├─ /api/v1/categories (GET)
   ├─ /api/v1/promotions/active (GET)
   ├─ /api/v1/orders (CRUD)
   └─ /api/v1/orders/{id} (polling)

TIPO 4: CONFIGURACIÓN
════════════════════════════════════

CI-017: Environment Configuration (.env)
├─ Ubicación: Raíz del proyecto
├─ Propiedades:
│  ├─ POSTGRES_USER=admin
│  ├─ POSTGRES_PASSWORD=secret
│  ├─ POSTGRES_PORT=5432
│  ├─ RABBITMQ_USER=guest
│  ├─ RABBITMQ_PASSWORD=guest
│  ├─ RABBITMQ_PORT=5672
│  ├─ APP_ENV=local
│  └─ APP_DEBUG=true
├─ Dependencias:
│  ├─ docker-compose.yml (lee variables)
│  ├─ Todos los microservicios (heredan)
│  └─ Bases de datos (credenciales)
├─ Responsable: Configuración global
├─ Estado: Production
└─ Relacionados: CI-007 (Docker Compose)

CI-018: Nginx Configuration
├─ Archivo: nginx.conf (API Gateway)
├─ Funcionalidad: Enrutamiento HTTP/proxy
├─ Upstreams:
│  ├─ auth-service:8000
│  ├─ product-service-nginx:80
│  ├─ inventory-service:8002
│  ├─ order-service:8003
│  └─ email-service:8000
├─ Reglas de proxy:
│  ├─ /auth/* → auth-service
│  ├─ /api/v1/products* → product-service
│  ├─ /api/v1/categories* → product-service
│  ├─ /api/v1/inventory* → inventory-service
│  ├─ /api/v1/orders* → order-service
│  └─ /api/v1/emails* → email-service
├─ Responsable: Enrutamiento HTTP
├─ Estado: Production
└─ Relacionados: CI-006 (API Gateway), CI-001-005 (Servicios)
```

### 7.2 Matriz de Relaciones entre CIs

```
┌────────┬────────────────────────────────────────────────────────────┐
│   CI   │                   DEPENDE DE                               │
├────────┼────────────────────────────────────────────────────────────┤
│ 001    │ CI-009 (db-auth), CI-017 (.env), CI-007 (Docker Compose) │
│ Auth   │                                                            │
├────────┼────────────────────────────────────────────────────────────┤
│ 002    │ CI-010 (db-product), CI-017 (.env), CI-007, CI-018 (Nginx)│
│ Product│                                                            │
├────────┼────────────────────────────────────────────────────────────┤
│ 003    │ CI-011 (db-inventory), CI-017 (.env), CI-007             │
│Inventory                                                           │
├────────┼────────────────────────────────────────────────────────────┤
│ 004    │ CI-012 (db-order), CI-017 (.env), CI-007, CI-019 (RabbitMQ) │
│ Order  │ CI-002 (Product Service), CI-003 (Inventory Service)     │
├────────┼────────────────────────────────────────────────────────────┤
│ 005    │ CI-013 (db-email), CI-017 (.env), CI-007, CI-019 (RabbitMQ)│
│ Email  │                                                            │
├────────┼────────────────────────────────────────────────────────────┤
│ 006    │ CI-014 (db-apigateway), CI-017 (.env), CI-007, CI-018     │
│ API GW │ CI-001 (Auth), CI-002 (Product), CI-003 (Inventory)      │
│        │ CI-004 (Order), CI-005 (Email), CI-019 (RabbitMQ)        │
├────────┼────────────────────────────────────────────────────────────┤
│ 007    │ CI-017 (.env), Docker Engine, docker-compose.yml         │
│ Compose│                                                            │
├────────┼────────────────────────────────────────────────────────────┤
│ 008    │ CI-007 (Docker Compose), CI-017 (.env)                   │
│ PgSQL  │                                                            │
├────────┼────────────────────────────────────────────────────────────┤
│ 015    │ CI-006 (API Gateway), CI-001-005 (via Gateway)           │
│ Frontend│ npm packages (node_modules)                              │
│Admin   │                                                            │
├────────┼────────────────────────────────────────────────────────────┤
│ 016    │ CI-006 (API Gateway), CI-001-005 (via Gateway)           │
│ Frontend│ npm packages (node_modules)                              │
│Client  │                                                            │
├────────┼────────────────────────────────────────────────────────────┤
│ 017    │ (ninguno, es base de configuración)                       │
│ .env   │                                                            │
├────────┼────────────────────────────────────────────────────────────┤
│ 018    │ CI-001-005 (Servicios), CI-006 (API Gateway)             │
│ Nginx  │                                                            │
├────────┼────────────────────────────────────────────────────────────┤
│ 019    │ CI-007 (Docker Compose), CI-017 (.env)                   │
│ RabbitMQ                                                           │
└────────┴────────────────────────────────────────────────────────────┘
```

---

## RESUMEN EJECUTIVO

### Dependencias Críticas:

1. **Base de Datos:** Cada servicio tiene BD independiente pero comparten infraestructura PostgreSQL
2. **API Gateway:** Punto de entrada centralizado, depende de todos los servicios
3. **RabbitMQ:** Acoplamiento asincrónico entre Order Service y Email Service
4. **Network Docker:** Comunicación HTTP entre servicios vía red interna `happydonut-net`
5. **Variables de Entorno:** Todas las credenciales centralizadas en `.env`

### Flujos Clave:

- **Autenticación:** Frontend → API Gateway → Auth Service (login/register)
- **Consulta Catálogo:** Frontend → API Gateway → Product Service (públicas)
- **Creación de Orden:** Frontend → API Gateway → Order Service → (consulta Product + Inventory)
- **Notificaciones:** Order Service → RabbitMQ → Email Service (asincrónico)

### Puntos de Fallo:

- PostgreSQL: Si cae, todos los servicios pierden persistencia
- RabbitMQ: Si cae, no se envían notificaciones pero órdenes se crean igualmente
- API Gateway: Si cae, frontends pierden acceso a todos los servicios
- Nginx (upstreams): Si un servicio cae, proxy falla para ese endpoint

