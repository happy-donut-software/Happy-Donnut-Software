# 📋 Análisis Completo de Happy-Donnut-Software

**Fecha de análisis:** Abril 21, 2026  
**Arquitectura:** Microservicios con API Gateway  
**Stack:** Laravel 12 (Backend), React + TypeScript (Frontend), PostgreSQL, RabbitMQ

---

## 📑 Tabla de Contenidos

1. [Estructura General del Proyecto](#estructura-general-del-proyecto)
2. [Servicios Microservicios](#servicios-microservicios)
3. [API Gateway](#api-gateway)
4. [Frontends](#frontends)
5. [Comunicación Entre Servicios](#comunicación-entre-servicios)

---

## Estructura General del Proyecto

### Tecnologías y Puertos

```
┌─────────────────────────────────────────────────────┐
│           Frontend (React + TypeScript)             │
│  - frontend-administrativo (Admin Dashboard)        │
│  - frontend-clientes (Customer Portal)              │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │      API Gateway (8080)     │
         │    (Laravel + Inertia)      │
         └─────────────┬───────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐  ┌──────────┐  ┌─────────────────┐
   │Auth Sv  │  │Product Sv│  │  Order Service  │
   │ (8000)  │  │ (8001)   │  │     (8003)      │
   └────┬────┘  └────┬─────┘  └────────┬────────┘
        │            │                  │
        ▼            ▼                  ▼
    ┌────────┐  ┌──────────┐  ┌──────────────┐
    │ auth_db│  │product_db│  │  order_db    │
    └────────┘  └──────────┘  └──────────────┘

   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │Inventory Sv  │  │ Email Service│  │  RabbitMQ    │
   │   (8002)     │  │   (8004)     │  │ (Port 5672)  │
   └────┬─────────┘  └──────────────┘  └──────────────┘
        │
        ▼
    ┌──────────────┐
    │inventory_db  │
    └──────────────┘

   PostgreSQL 15 (localhost:5440)
   - Credenciales: admin/secret
   - DBs: auth_db, product_db, inventory_db, order_db, email_db
```

---

## Servicios Microservicios

### 1. 🔐 AUTH SERVICE (Puerto 8000)

**Propósito:** Gestión centralizada de autenticación y perfiles de usuarios (Empleados, Administrativos, Usuarios/Clientes)

#### Modelos (Database)

| Modelo | Tabla | Descripción | Campos Principales |
|--------|-------|-------------|-------------------|
| **User** | `usuarios` | Usuario base del sistema | `usuario_id` (PK), `username`, `password`, `role`, `estado` |
| **Empleado** | `empleados` | Empleado de la empresa | `empleado_id` (PK), `nombre`, `apellido`, `dni`, `rol`, `password`, `estado` |
| **Administrativo** | `administrativos` | Administrativo del sistema | `administrativo_id` (PK), `nombre`, `apellido`, `dni`, `telefono`, `rol`, `password`, `estado` |
| **Auth** | - | Modelo de autenticación | - |
| **Comment** | - | Comentarios de usuarios | - |

#### Controladores y Métodos

**AuthController**
- `register(Request $request)` → Registra nuevos usuarios validando username, password; retorna usuario creado con status 201
- `login(Request $request)` → Autentica credenciales verificando username/password contra hash; retorna usuario autenticado

**UsuarioController (CRUD)** - `GET|POST|PUT|DELETE /api/v1/usuarios/{id}`
- `index()` → Retorna lista de todos los usuarios
- `show($id)` → Retorna usuario específico por ID
- `store(Request $request)` → Crea nuevo usuario con hash de password; valida email y DNI únicos
- `update($id, Request $request)` → Actualiza usuario; revalida email y DNI (excepto el propio)

**EmpleadoController (CRUD)** - `GET|POST|PUT|DELETE /api/v1/empleados/{id}`
- `index()` → Retorna lista completa de empleados
- `show($id)` → Retorna empleado específico
- `store(Request $request)` → Crea empleado validando DNI único; password es opcional
- `update($id, Request $request)` → Actualiza empleado; valida DNI únicamente asignado a otro empleado

**AdministrativoController (CRUD)** - `GET|POST|PUT|DELETE /api/v1/administrativos/{id}`
- `index()` → Retorna lista de administrativos
- `show($id)` → Retorna administrativo específico
- `store(Request $request)` → Crea administrativo con datos completos
- `update($id, Request $request)` → Actualiza administrativo

**CommentController** - Anidado bajo usuarios
- `index($usuarioId)` → Obtiene comentarios de un usuario
- `store($usuarioId, Request $request)` → Crea comentario para un usuario

#### Endpoints de API

```
POST   /api/v1/register              Registra nuevo usuario
POST   /api/v1/login                 Autentica usuario

GET    /api/v1/usuarios              Listar usuarios
POST   /api/v1/usuarios              Crear usuario
GET    /api/v1/usuarios/{id}         Obtener usuario
PUT    /api/v1/usuarios/{id}         Actualizar usuario
DELETE /api/v1/usuarios/{id}         Eliminar usuario

GET    /api/v1/empleados             Listar empleados
POST   /api/v1/empleados             Crear empleado
GET    /api/v1/empleados/{id}        Obtener empleado
PUT    /api/v1/empleados/{id}        Actualizar empleado
DELETE /api/v1/empleados/{id}        Eliminar empleado

GET    /api/v1/administrativos       Listar administrativos
POST   /api/v1/administrativos       Crear administrativo
GET    /api/v1/administrativos/{id}  Obtener administrativo
PUT    /api/v1/administrativos/{id}  Actualizar administrativo
DELETE /api/v1/administrativos/{id}  Eliminar administrativo

GET    /api/v1/usuarios/{id}/comments       Listar comentarios del usuario
POST   /api/v1/usuarios/{id}/comments       Agregar comentario al usuario
```

---

### 2. 🏪 PRODUCT SERVICE (Puerto 8001)

**Propósito:** Gestión centralizada de productos, categorías y promociones

#### Modelos (Database)

| Modelo | Tabla | Descripción | Campos Principales |
|--------|-------|-------------|-------------------|
| **Producto** | `productos` | Producto vendible | `producto_id` (PK), `categoria_id` (FK), `nombre_producto`, `descripcion`, `precio_base`, `tipo_producto` (donut/cafe), `activo_web` |
| **Categoria** | `categorias` | Categoría de productos | `categoria_id` (PK), `nombre_categoria` |
| **Promocion** | `promociones` | Promoción/Combo | `promocion_id` (PK), `nombre_promocion`, `descripcion`, `tipo_descuento`, `valor_descuento`, `fecha_inicio`, `fecha_fin`, `activo` |

#### Relaciones
- Producto ↔ Categoria: N:1
- Producto ↔ Promocion: N:N (a través de `promociones_detalles` con pivot `cantidad_producto`)

#### Controladores y Métodos

**ProductController (CRUD + Search)**
- `index(Request $request)` → Lista productos con filtros por categoría, tipo, estado; paginados de 10 en 10
- `store(Request $request)` → Crea producto validando: categoria_id existe, tipo válido (donut/cafe/otro), precio > 0
- `show($id)` → Retorna producto con categoría y promociones asociadas
- `update($id, Request $request)` → Actualiza producto
- `destroy($id)` → Elimina producto
- `updateStatus($id)` → Alterna estado activo_web
- `getAvailable()` → Retorna productos activos y visibles en web
- `search(Request $request)` → Búsqueda por nombre/descripción

**CategoriaController (CRUD)**
- `index()` → Lista todas las categorías ordenadas alfabéticamente
- `store(Request $request)` → Crea categoría validando nombre único
- `show($id)` → Retorna categoría con sus productos asociados
- `update($id, Request $request)` → Actualiza nombre de categoría
- `destroy($id)` → Elimina categoría

**PromocionController (CRUD + Status)**
- `index()` → Lista promociones ordenadas por fecha de creación descendente
- `store(Request $request)` → Crea promoción con validaciones:
  - `tipo_descuento`: porcentaje|fijo
  - `fecha_fin` > `fecha_inicio`
  - Asocia productos mediante array de productos[] con cantidad_producto
- `show($id)` → Retorna promoción con productos asociados
- `update($id, Request $request)` → Actualiza promoción
- `destroy($id)` → Elimina promoción
- `getActive()` → Retorna promociones vigentes (fecha_inicio ≤ hoy ≤ fecha_fin)

#### Endpoints de API

```
# PRODUCTOS (Protegido con auth:sanctum)
GET    /api/v1/products              Listar productos (con filtros)
POST   /api/v1/products              Crear producto
GET    /api/v1/products/{id}         Obtener producto
PUT    /api/v1/products/{id}         Actualizar producto
DELETE /api/v1/products/{id}         Eliminar producto
PUT    /api/v1/products/{id}/status  Cambiar estado activo/inactivo

# CATEGORÍAS (Protegido)
GET    /api/v1/categories            Listar categorías
POST   /api/v1/categories            Crear categoría
GET    /api/v1/categories/{id}       Obtener categoría
PUT    /api/v1/categories/{id}       Actualizar categoría
DELETE /api/v1/categories/{id}       Eliminar categoría

# PROMOCIONES (Protegido)
GET    /api/v1/promotions            Listar promociones
POST   /api/v1/promotions            Crear promoción
GET    /api/v1/promotions/{id}       Obtener promoción
PUT    /api/v1/promotions/{id}       Actualizar promoción
DELETE /api/v1/promotions/{id}       Eliminar promoción

# PÚBLICO (Sin autenticación)
GET    /api/v1/products/available    Productos activos en web
GET    /api/v1/products/search       Buscar productos
GET    /api/v1/categories            Listar categorías
GET    /api/v1/promotions/active     Promociones vigentes
```

---

### 3. 📦 INVENTORY SERVICE (Puerto 8002)

**Propósito:** Gestión de inventario de insumos, productos finales y control de stock

#### Modelos (Database)

| Modelo | Tabla | Descripción | Campos Principales |
|--------|-------|-------------|-------------------|
| **Insumo** | `insumos` | Insumo/Materia prima | `insumo_id` (PK), `nombre_insumo`, `unidad_medida_base`, `stock_minimo_alerta`, `stock_total_calculado` |
| **LoteInsumo** | `lote_insumo` | Lote de insumo | `lote_id` (PK), `insumo_id` (FK), `cantidad`, `fecha_vencimiento` |
| **Producto** | `productos` | Producto (relación con receta) | `producto_id` (PK) |
| **AjusteInventario** | `ajustes_inventario` | Ajustes de stock | `ajuste_id` (PK), `razon`, `cantidad_ajuste` |

#### Relaciones
- Insumo ↔ LoteInsumo: 1:N
- Producto ↔ Insumo: N:N (a través de `recetas` con pivot `cantidad_necesaria`)

#### Controladores y Métodos

**InventoryController**
- `index(Request $request)` → Retorna inventario completo con insumos y sus lotes
- `checkAvailability($productId, $quantity)` → Verifica si hay suficientes insumos para producir cantidad de productos
  - Retorna `{ available: boolean, error?: string }`
- `getAvailableQuantity($productId)` → Calcula cantidad máxima producible basada en insumos disponibles
  - Retorna `{ product_id, available_quantity }`
- `reserve(Request $request)` → Reserva insumos para una orden
  - Valida: producto existe, cantidad disponible suficiente
  - Retorna reserva creada o error 400
- `canProduceQuantity($product, $quantity)` → Helper que verifica si se puede producir cantidad X
- `calculateMaxProducible($product)` → Helper que calcula máximo producible

**InsumoController (CRUD)**
- `index(Request $request)` → Lista insumos con filtro de estado (activo)
- `store(Request $request)` → Crea insumo con validaciones: nombre, unidad_medida, stock_minimo >= 0
- `show($id)` → Retorna insumo con sus lotes asociados
- `update($id, Request $request)` → Actualiza insumo
- `destroy($id)` → Elimina insumo

**ProductoController**
- Métodos CRUD específicos para productos en inventario

#### Endpoints de API

```
GET    /api/v1/inventory                        Obtener inventario completo
GET    /api/v1/inventory/check/{id}/{qty}      Verificar disponibilidad
POST   /api/v1/inventory/reserve                Reservar insumos
GET    /api/v1/inventory/available/{productId}  Cantidad disponible para producir

GET    /api/v1/insumos                         Listar insumos
POST   /api/v1/insumos                         Crear insumo
GET    /api/v1/insumos/{id}                    Obtener insumo
PUT    /api/v1/insumos/{id}                    Actualizar insumo
DELETE /api/v1/insumos/{id}                    Eliminar insumo
```

---

### 4. 📋 ORDER SERVICE (Puerto 8003)

**Propósito:** Gestión de órdenes/ventas y pagos

#### Modelos (Database)

| Modelo | Tabla | Descripción | Campos Principales |
|--------|-------|-------------|-------------------|
| **Venta** | `ventas` | Orden de venta | `venta_id` (PK), `cliente_id` (FK), `empleado_id`, `total_venta`, `estado_pedido`, `fecha_venta` |
| **DetalleVenta** | `detalles_venta` | Línea de detalle de venta | `detalle_id` (PK), `venta_id` (FK), `producto_id`, `nombre_producto`, `precio_unitario_venta`, `cantidad` |
| **Cliente** | `clientes` | Cliente/Comprador | `cliente_id` (PK), `nombre`, `apellido`, `telefono`, `email` |
| **Pago** | `pagos` | Registro de pago | `pago_id` (PK), `venta_id` (FK), `metodo_pago_id` (FK), `monto` |
| **MetodoPago** | `metodos_pago` | Método de pago | `metodo_pago_id` (PK), `nombre` |

#### Relaciones
- Venta ↔ Cliente: N:1
- Venta ↔ DetalleVenta: 1:N
- Venta ↔ Pago: 1:N
- Pago ↔ MetodoPago: N:1

#### Controladores y Métodos

**OrderController**
- `getAvailableProducts()` → Llama a Product Service para obtener productos disponibles
  - HTTP GET `http://product-service:8001/api/v1/products`
- `getCategories()` → Llama a Product Service para obtener categorías
  - HTTP GET `http://product-service:8001/api/v1/categories`
- `checkInventory($productId, $quantity)` → Verifica disponibilidad en inventario
  - HTTP GET `http://inventory-service:8002/api/v1/inventory/check/{productId}/{quantity}`
- `reserveInventory($productId, $quantity)` → Reserva inventario para orden
  - HTTP POST `http://inventory-service:8002/api/v1/inventory/reserve`
- `listOrders()` → Lista órdenes del usuario autenticado

**VentaController (CRUD)**
- Métodos CRUD para gestión de ventas

#### Endpoints de API

```
GET    /api/v1/orders                 Listar órdenes del usuario
POST   /api/v1/orders                 Crear nueva orden
GET    /api/v1/orders/{id}            Obtener orden específica
DELETE /api/v1/orders/{id}            Cancelar orden

GET    /api/v1/products               Obtener productos disponibles (proxy a Product Service)
GET    /api/v1/categories             Obtener categorías (proxy a Product Service)
```

---

### 5. 📧 EMAIL SERVICE (Puerto 8004)

**Propósito:** Gestión centralizada de notificaciones y envío de emails

#### Modelos (Database)

| Modelo | Tabla | Descripción | Campos Principales |
|--------|-------|-------------|-------------------|
| **LogNotificacion** | `log_notificaciones` | Registro de notificación enviada | `log_id` (PK), `destinatario` (email), `asunto`, `tipo_notificacion`, `estado`, `mensaje_error`, `fecha_envio` |

#### Características
- Registra cada intento de notificación
- Sin timestamps automáticos de Laravel (usa solo `fecha_envio`)
- Integración con RabbitMQ para procesamiento asincrónico

#### Endpoints de API

```
POST   /api/v1/send-email             Enviar email (consumidor RabbitMQ)
GET    /api/v1/log-notificaciones     Obtener log de notificaciones
GET    /api/v1/log-notificaciones/{id} Obtener notificación específica
```

---

## API Gateway

### Propósito

**Enrutador centralizado** que actúa como proxy entre frontends y microservicios. Autentica requests y enruta a servicios backend.

### Modelos

| Modelo | Tabla | Descripción | Campos Principales |
|--------|-------|-------------|-------------------|
| **User** | `users` | Usuario sincronizado en gateway | `id` (PK), `name`, `email`, `password`, `email_verified_at` |
| **Note** | `notes` | Notas del usuario | `id` (PK), `user_id` (FK), `title`, `body` |

### Controladores Principales

**GatewayController** - Enrutador proxy principal

- `register(Request $request)` → POST /auth/register
  - Proxy hacia Auth Service
  - Sincroniza usuario en DB local del Gateway
  - Retorna token Sanctum

- `login(Request $request)` → POST /auth/login
  - Proxy hacia Auth Service
  - Busca/sincroniza usuario en BD local
  - Genera token Sanctum
  - Retorna `{ access_token, token_type: 'Bearer', user }`

- `logout(Request $request)` → POST /api/v1/auth/logout
  - Revoca tokens Sanctum del usuario

- **Productos (Proxy)**
  - `getProducts()` → GET /api/v1/products/available → Product Service
  - `getProduct($id)` → GET /api/v1/products/{id} → Product Service
  - `createProduct()` → POST /api/v1/products → Product Service
  - `getAvailableProducts()` → Productos listos
  - `searchProducts()` → Búsqueda de productos
  - `getCategories()` → GET /api/v1/categories → Product Service

- **Órdenes (Proxy)**
  - `getOrders()` → GET /api/v1/orders → Order Service
  - `createOrder()` → POST /api/v1/orders → Order Service
  - `getOrder($id)` → GET /api/v1/orders/{id} → Order Service
  - `cancelOrder($id)` → DELETE /api/v1/orders/{id} → Order Service

- `getProfile()` → GET /api/v1/auth/me
  - Retorna perfil del usuario autenticado

**AuthController** (interno, no expone rutas)

- `registerFromService($userData)` → Sincroniza usuario desde Auth Service
  - Crea/busca usuario local
  - Genera token Sanctum
  - Retorna token

- `loginFromService($userData)` → Autentica desde Auth Service
  - Busca usuario sincronizado
  - Revoca tokens antiguos
  - Genera nuevo token
  - Retorna token

- `logoutUser()` → Revoca tokens del usuario

**Settings Controllers**

- **ProfileController**
  - `edit()` → Mostrar formulario de edición
  - `update(ProfileUpdateRequest)` → Actualizar perfil del usuario
  - `destroy()` → Eliminar cuenta de usuario

- **PasswordController**
  - `edit()` → Mostrar formulario de cambio de contraseña
  - `update()` → Cambiar contraseña con validación de contraseña actual

- **TwoFactorAuthenticationController**
  - `show()` → Mostrar estado de autenticación de dos factores

**NotesController**

- CRUD simple para notas del usuario autenticado

### Middleware Personalizado

- **HandleAppearance** → Maneja preferencias de apariencia (tema oscuro/claro)
- **HandleInertiaRequests** → Configura datos compartidos con frontend Inertia

### Endpoints de API Gateway

```
# AUTENTICACIÓN (Público)
POST   /auth/login                    Login de usuario
POST   /auth/register                 Registro de usuario
POST   /api/v1/auth/logout           Logout (requiere auth:sanctum)
GET    /api/v1/auth/me               Obtener perfil (requiere auth:sanctum)

# PRODUCTOS (requiere auth:sanctum)
GET    /api/v1/products/available    Productos disponibles
GET    /api/v1/products/search       Buscar productos
GET    /api/v1/categories            Obtener categorías
GET    /api/v1/products              Listar productos
GET    /api/v1/products/{id}         Obtener producto
POST   /api/v1/products              Crear producto
PUT    /api/v1/products/{id}         Actualizar producto
DELETE /api/v1/products/{id}         Eliminar producto

# ÓRDENES (requiere auth:sanctum)
GET    /api/v1/orders                Listar órdenes
POST   /api/v1/orders                Crear orden
GET    /api/v1/orders/{id}           Obtener orden
DELETE /api/v1/orders/{id}           Cancelar orden

# PERFIL Y CONFIGURACIÓN (requiere auth:sanctum)
GET    /settings/profile             Editar perfil
PUT    /settings/profile             Actualizar perfil
DELETE /settings/profile             Eliminar cuenta
GET    /settings/password            Cambiar contraseña
PUT    /settings/password            Actualizar contraseña
GET    /settings/2fa                 Autenticación 2FA

# NOTAS (requiere auth:sanctum)
GET    /notes                        Listar notas
POST   /notes                        Crear nota
GET    /notes/{id}                   Obtener nota
PUT    /notes/{id}                   Actualizar nota
DELETE /notes/{id}                   Eliminar nota
```

### Método Genérico de Enrutamiento

```php
protected function makeServiceRequest(Request $request, string $url, string $method = 'get')
```

Parámetros configurables:
- Pasa headers: `Authorization`, `X-User-ID`
- Soporta métodos: GET, POST, PUT, DELETE
- Timeout: 10 segundos
- Retorna respuesta del microservicio

---

## Frontends

### 1. 🖥️ FRONTEND ADMINISTRATIVO

**Propósito:** Panel de administración para gestión operacional  
**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Shadcn/ui  
**Ubicación:** `frontend-administrativo/src`

#### Componentes Principales

| Componente | Ruta | Descripción |
|-----------|------|-------------|
| **AppSidebar** | `components/AppSidebar.tsx` | Barra lateral de navegación con menú de opciones |
| **Login** | `components/views/Login.tsx` | Formulario de autenticación (usuarios hardcodeados: admin/empleado) |
| **Dashboard** | `components/views/Dashboard.tsx` | Panel principal con estadísticas (ventas, productos, cajas) |
| **Productos** | `components/views/Productos.tsx` | CRUD de productos con búsqueda y edición inline |
| **Categorias** | `components/views/Categorias.tsx` | CRUD de categorías |
| **Promociones** | `components/views/Promociones.tsx` | Gestión de promociones y combos |
| **Usuarios** | `components/views/Usuarios.tsx` | Gestión de usuarios y empleados |
| **AperturaCaja** | `components/views/AperturaCaja.tsx` | Apertura de caja con fondo inicial (efectivo, Yape, Plin) |
| **CierreCaja** | `components/views/CierreCaja.tsx` | Cierre de caja con reconciliación de métodos de pago |
| **MovimientosCaja** | `components/views/MovimientosCaja.tsx` | Registro de movimientos de caja |
| **Compras** | `components/views/Compras.tsx` | Gestión de compras a proveedores |
| **Comprobantes** | `components/views/Comprobantes.tsx` | Gestión de comprobantes/facturas |
| **NotasEntrada** | `components/views/NotasEntrada.tsx` | Notas de entrada de inventario |
| **NotasSalida** | `components/views/NotasSalida.tsx` | Notas de salida de inventario |
| **ClientesProveedores** | `components/views/ClientesProveedores.tsx` | Gestión de clientes y proveedores |
| **DatosEmpresa** | `components/views/DatosEmpresa.tsx` | Configuración de datos de la empresa |

#### Funciones Clave por Componente

**AppSidebar**
- Navegación entre vistas
- Manejo de logout
- Indicador de rol del usuario (Administrador/Empleado)
- Menú colapsable para diferentes secciones

**Login**
```javascript
// Usuarios hardcodeados
const USUARIOS = [
  { usuario: "admin", contraseña: "admin123", rol: "Administrador" },
  { usuario: "empleado", contraseña: "emp123", rol: "Empleado" }
];
// Valida credenciales localmente y llama onLogin()
```

**Productos**
```javascript
- Carga productos desde localStorage
- `getProductos()` - obtiene lista
- `addProducto()` - crea producto
- `saveProductos()` - persiste cambios
- Estados: búsqueda, edición inline, eliminar con confirmación
```

**AperturaCaja**
```javascript
- Campos: Fondo Inicial (Efectivo, Yape, Plin)
- Validaciones: montos >= 0
- Guarda en localStorage con fecha/hora
- Estado: caja abierta/cerrada
```

**CierreCaja**
```javascript
- Cuenta montos de efectivo, Yape, Plin
- Reconcilia contra movimientos del día
- Genera reporte con observaciones
- Estados: normal, diferencia, cierre finalizado
```

#### Storage y Servicios

**localStorage.service.ts** - Gestión de datos locales
```javascript
- getProductos() / saveProductos()
- getCajaAbierta() / setCajaAbierta() / cerrarCaja()
- getCompras() / addCompra()
- getMovimientosCaja() / addMovimientoCaja()
- getMovimientosDelDia() / limpiarMovimientosDelDia()
- getNextId() - genera ID incremental
```

**UI Components** - Reutilizables
- Card, Button, Input, Label, Badge, Dialog, AlertDialog
- Table, Tabs, Select, RadioGroup, Checkbox
- Chart (Bar, Line), Calendar, Textarea

---

### 2. 📱 FRONTEND CLIENTES

**Propósito:** Portal de clientes para visualizar productos y realizar pedidos  
**Stack:** React + JavaScript  
**Ubicación:** `frontend-clientes/src`

#### Estructura de Carpetas

```
frontend-clientes/src/
├── components/        # Componentes React
├── pages/            # Páginas/vistas
├── services/         # Servicios API
├── data/             # Datos mockeados
└── utils/            # Funciones utilitarias
```

#### Componentes Principales (Inferidos de la estructura)

- **Catálogo de Productos** - Muestra productos disponibles
- **Detalle de Producto** - Vista completa con descripción
- **Carrito de Compras** - Gestión de items antes de checkout
- **Checkout** - Formulario de orden
- **Mi Cuenta** - Perfil del cliente
- **Mis Pedidos** - Historial de órdenes

---

## Comunicación Entre Servicios

### Llamadas Inter-Servicios

#### Order Service → Product Service
```php
// OrderController.php
Http::get('http://product-service:8001/api/v1/products')
Http::get('http://product-service:8001/api/v1/categories')
```

#### Order Service → Inventory Service
```php
// OrderController.php
Http::get("http://inventory-service:8002/api/v1/inventory/check/{productId}/{quantity}")
Http::post("http://inventory-service:8002/api/v1/inventory/reserve", [
    'product_id' => $productId,
    'quantity' => $quantity
])
```

#### API Gateway → Microservicios
```php
// GatewayController.php
protected const AUTH_URL = 'http://auth-service:8000';
protected const PRODUCT_URL = 'http://product-service:8000';
protected const INVENTORY_URL = 'http://inventory-service:8000';
protected const ORDER_URL = 'http://order-service:8000';
protected const EMAIL_URL = 'http://email-service:8000';

// makeServiceRequest() - método genérico que enruta a servicios
```

### Flujo de Autenticación

```
Frontend
   │
   ├─> POST /auth/register
   │     ├─> API Gateway (/auth/register)
   │     │     └─> Auth Service (/api/v1/register)
   │     │           ├─ Valida y crea usuario
   │     │           └─ Retorna usuario creado
   │     ├─> AuthController::registerFromService()
   │     │     ├─ Sincroniza usuario en BD local Gateway
   │     │     ├─ Genera token Sanctum
   │     │     └─ Retorna token de acceso
   │
   ├─> POST /auth/login
   │     ├─> API Gateway (/auth/login)
   │     │     └─> Auth Service (/api/v1/login)
   │     │           ├─ Verifica credenciales
   │     │           └─ Retorna usuario autenticado
   │     ├─> AuthController::loginFromService()
   │     │     ├─ Busca usuario sincronizado
   │     │     ├─ Revoca tokens antiguos
   │     │     ├─ Genera nuevo token Sanctum
   │     │     └─ Retorna token de acceso
   │
   └─> Requests subsecuentes
         ├─ Header: Authorization: Bearer {token}
         └─> Middleware auth:sanctum valida token
```

### Flujo de Creación de Orden

```
Cliente crea orden
   │
   ├─> POST /api/v1/orders (con token de acceso)
   │     └─> GatewayController::createOrder()
   │           │
   │           ├─> OrderController::checkInventory()
   │           │     └─> Inventory Service: ¿Hay suficiente stock?
   │           │           ├─ Sí: continuar
   │           │           └─ No: error 400
   │           │
   │           ├─> OrderController::reserveInventory()
   │           │     └─> Inventory Service: Reservar insumos
   │           │           └─ Guarda reserva
   │           │
   │           ├─> Email Service (RabbitMQ)
   │           │     └─ Cola de confirmación de orden
   │           │
   │           └─ Retorna orden creada (201)
   │                 └─ ID, total, estado, detalles
   │
   └─> Confirmación al cliente
```

---

## 📊 Diagrama de Dependencias

```
┌─────────────────────────────────────────────────┐
│            PostgreSQL 15 (Shared)              │
│  auth_db | product_db | inventory_db |        │
│  order_db | email_db | apigateway_db          │
└──────────────────┬──────────────────────────────┘
                   ▲
                   │
        ┌──────────┼────────────────────────┐
        │          │                        │
        │          │                        │
┌───────┴─────┐  ┌─┴──────────┐  ┌─────────┴──────┐
│ Auth Service│  │Product Svc │  │Inventory Svc   │
│  (8000)     │  │  (8001)    │  │   (8002)       │
└───────┬─────┘  └──┬─────────┘  └────────┬───────┘
        │          │                      │
        └──────────┼──────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
   ┌────┴────┐ ┌──┴───────┐ ┌┴─────────┐
   │Order Svc│ │Email Svc │ │RabbitMQ  │
   │ (8003)  │ │ (8004)   │ │ (5672)   │
   └────┬────┘ └────┬─────┘ └┬─────────┘
        │           │        │
        └───────────┼────────┘
                    │
           ┌────────┴────────┐
           │  API Gateway    │
           │    (8080)       │
           │  (Nginx proxy)  │
           └────────┬────────┘
                    │
           ┌────────┴────────┐
           │                 │
    ┌──────┴──────┐  ┌───────┴──────┐
    │ Frontend    │  │ Frontend     │
    │Administrador│  │Clientes      │
    └─────────────┘  └──────────────┘
```

---

## 📝 Notas Técnicas

### Autenticación
- **Local**: Auth Service gestiona credenciales
- **Tokens**: Laravel Sanctum con Bearer tokens
- **Sincronización**: API Gateway sincroniza usuarios con su BD local

### Validaciones
- Campos requeridos antes de operaciones CRUD
- Unicidad: email, username, DNI
- Rango válido: precios > 0, fechas lógicas
- Existencia: foreign keys verificados

### Relaciones Base de Datos
- **1:N**: Categoría→Productos, Insumo→Lotes, Venta→Detalles
- **N:N**: Producto↔Promocion, Producto↔Insumo (con pivots y datos extras)

### Storage en Frontend Administrativo
- Datos persisten en **localStorage** del navegador
- Ideal para desarrollo/pruebas
- Requiere migración a APIs cuando se integren servicios reales

### Comunicación Inter-Servicios
- HTTP (Laravel Http Facade)
- Timeouts: 10 segundos
- Headers personalizados: Authorization, X-User-ID
- Tratamiento de errores básico (try/catch)

---

## Conclusión

El proyecto **Happy-Donnut-Software** implementa una arquitectura moderna de **microservicios** con:

✅ **Separación clara de responsabilidades** - Cada servicio tiene una función definida  
✅ **API Gateway centralizado** - Punto único de entrada para clientes  
✅ **Múltiples frontends** - Admin para gestión, clientes para compras  
✅ **Autenticación robusta** - Basada en Auth Service + Sanctum tokens  
✅ **Escalabilidad** - Fácil agregar nuevos servicios  
✅ **Persistencia** - PostgreSQL centralizado  
✅ **Integración asincrónica** - RabbitMQ para notificaciones  

**Próximos pasos recomendados:**
- Implementar APIs reales en frontend administrativo
- Agregar validaciones adicionales en endpoints críticos
- Documentar casos de error específicos
- Implementar logging centralizado
- Agregar pruebas unitarias en servicios
- Configurar CI/CD con Docker
