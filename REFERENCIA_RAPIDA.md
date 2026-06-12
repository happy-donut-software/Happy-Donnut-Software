# 📚 Guía Rápida de Referencia - Happy Donnut Software

## 🎯 Resumen Ejecutivo

**Proyecto:** Sistema de gestión para microempresa panadería "Happy Donnut"  
**Tipo:** Arquitectura de Microservicios (7 servicios independientes)  
**Lenguajes:** PHP 8.2 (Backend), TypeScript/React (Frontend)  
**Base de datos:** PostgreSQL 15 (centralizado)  
**Message Queue:** RabbitMQ 3.12  
**Puertos:** 8000-8005 (servicios), 8080 (gateway), 5440 (DB), 5672 (RabbitMQ)

---

## 🔍 Tabla Rápida de Servicios

| Servicio | Puerto | Propósito | Base de Datos | Métodos Clave |
|----------|--------|----------|---------------|---------------|
| **auth_service** | 8000 | Autenticación centralizada | auth_db | register, login |
| **product_service** | 8001 | Productos, categorías, promociones | product_db | index, store, show, update |
| **inventory_service** | 8002 | Stock, insumos, lotes | inventory_db | checkAvailability, reserve, getAvailable |
| **order_service** | 8003 | Órdenes, ventas, pagos | order_db | getAvailableProducts, createOrder, getOrder |
| **email_service** | 8004 | Notificaciones y emails | email_db | send-email, log-notificaciones |
| **finance_service** | 8005 | Gestión de finanzas y facturación | finance_db | getBalance, recordTransaction, generateReport |
| **api_gateway** | 8080 | Proxy centralizado, Inertia | apigateway_db | register, login, getProducts, createOrder |

---

## 📋 Tabla de Modelos por Servicio

### AUTH_SERVICE
```
Tabla: usuarios
├─ usuario_id (PK)
├─ username (UNIQUE)
├─ password (HASH)
├─ role
├─ estado

Tabla: empleados
├─ empleado_id (PK)
├─ nombre, apellido, dni
├─ telefono, rol, password
├─ estado

Tabla: administrativos
├─ administrativo_id (PK)
├─ nombre, apellido, dni
├─ telefono, rol, password
├─ estado
```

### PRODUCT_SERVICE
```
Tabla: productos
├─ producto_id (PK)
├─ categoria_id (FK → categorias)
├─ nombre_producto
├─ descripcion, precio_base
├─ tipo_producto (donut/cafe)
├─ activo_web

Tabla: categorias
├─ categoria_id (PK)
└─ nombre_categoria

Tabla: promociones
├─ promocion_id (PK)
├─ nombre_promocion, descripcion
├─ tipo_descuento, valor_descuento
├─ fecha_inicio, fecha_fin
├─ activo

Tabla: promociones_detalles (Pivot)
├─ promocion_id (FK)
├─ producto_id (FK)
└─ cantidad_producto
```

### INVENTORY_SERVICE
```
Tabla: insumos
├─ insumo_id (PK)
├─ nombre_insumo
├─ unidad_medida_base
├─ stock_minimo_alerta
├─ stock_total_calculado

Tabla: lote_insumo
├─ lote_id (PK)
├─ insumo_id (FK → insumos)
├─ cantidad
└─ fecha_vencimiento

Tabla: recetas (Pivot: Producto ↔ Insumo)
├─ producto_id (FK)
├─ insumo_id (FK)
└─ cantidad_necesaria

Tabla: ajustes_inventario
├─ ajuste_id (PK)
├─ razon
└─ cantidad_ajuste
```

### ORDER_SERVICE
```
Tabla: clientes
├─ cliente_id (PK)
├─ nombre, apellido
├─ telefono, email

Tabla: ventas
├─ venta_id (PK)
├─ cliente_id (FK → clientes)
├─ empleado_id
├─ total_venta
├─ estado_pedido
└─ fecha_venta

Tabla: detalles_venta
├─ detalle_id (PK)
├─ venta_id (FK → ventas)
├─ producto_id
├─ nombre_producto
├─ precio_unitario_venta
└─ cantidad

Tabla: pagos
├─ pago_id (PK)
├─ venta_id (FK → ventas)
├─ metodo_pago_id (FK → metodos_pago)
└─ monto

Tabla: metodos_pago
├─ metodo_pago_id (PK)
└─ nombre
```

### EMAIL_SERVICE
```
Tabla: log_notificaciones
├─ log_id (PK)
├─ destinatario (email)
├─ asunto
├─ tipo_notificacion
├─ estado
├─ mensaje_error
└─ fecha_envio
```

### API_GATEWAY
```
Tabla: users
├─ id (PK)
├─ name
├─ email (UNIQUE)
├─ password (HASH)
└─ email_verified_at

Tabla: notes
├─ id (PK)
├─ user_id (FK → users)
├─ title
└─ body
```

---

## 🔐 Endpoints Resumidos por Servicio

### AUTH SERVICE
```
POST   /api/v1/register                 → Registrar usuario
POST   /api/v1/login                    → Autentica usuario

GET    /api/v1/usuarios                 → CRUD usuarios
POST   /api/v1/empleados                → CRUD empleados
GET    /api/v1/administrativos          → CRUD administrativos
GET    /api/v1/usuarios/{id}/comments   → Comentarios de usuario
```

### PRODUCT SERVICE
```
GET    /api/v1/products                 → Listar (con filtros)
POST   /api/v1/products                 → Crear
GET    /api/v1/products/{id}            → Obtener
PUT    /api/v1/products/{id}            → Actualizar
DELETE /api/v1/products/{id}            → Eliminar

GET    /api/v1/categories               → Listar categorías (CRUD)
GET    /api/v1/promotions               → Listar promociones (CRUD)

GET    /api/v1/products/available       → Públicos: Productos activos
GET    /api/v1/products/search          → Búsqueda
GET    /api/v1/promotions/active        → Promociones vigentes
```

### INVENTORY SERVICE
```
GET    /api/v1/inventory                → Todo el inventario
GET    /api/v1/inventory/check/{id}/{qty} → Verificar disponibilidad
POST   /api/v1/inventory/reserve        → Reservar insumos
GET    /api/v1/inventory/available/{id} → Cantidad máxima producible

GET    /api/v1/insumos                  → CRUD insumos
```

### ORDER SERVICE
```
GET    /api/v1/orders                   → Listar órdenes
POST   /api/v1/orders                   → Crear orden
GET    /api/v1/orders/{id}              → Obtener orden
DELETE /api/v1/orders/{id}              → Cancelar orden

GET    /api/v1/products                 → Proxy a Product Service
GET    /api/v1/categories               → Proxy a Product Service
```

### API GATEWAY (Público + Auth:Sanctum)
```
# Autenticación
POST   /auth/register                   → Registrar (proxy + sync local)
POST   /auth/login                      → Login (proxy + sync local + token)
POST   /api/v1/auth/logout              → Logout (revoca tokens)
GET    /api/v1/auth/me                  → Perfil del usuario

# Productos (proxy a Product Service)
GET    /api/v1/products/available       → Productos listos
GET    /api/v1/products/search          → Buscar
GET    /api/v1/categories               → Categorías

# Órdenes (proxy a Order Service)
GET    /api/v1/orders                   → Mis órdenes
POST   /api/v1/orders                   → Crear orden
GET    /api/v1/orders/{id}              → Detalle orden
DELETE /api/v1/orders/{id}              → Cancelar

# Configuración
PUT    /settings/profile                → Editar perfil
PUT    /settings/password               → Cambiar contraseña
GET    /settings/2fa                    → 2FA config

# Notas (CRUD)
GET    /notes                           → Listar notas
POST   /notes                           → Crear nota
```

---

## 🎨 Frontend Administrativo - Vistas

| Vista | Archivo | Funcionalidad |
|-------|---------|---------------|
| Login | `Login.tsx` | Formulario de autenticación |
| Dashboard | `Dashboard.tsx` | Resumen de ventas y KPIs |
| **Gestión de Productos** | `Productos.tsx` | CRUD completo |
| Categorías | `Categorias.tsx` | Manejo de categorías |
| Promociones | `Promociones.tsx` | Crear combos y descuentos |
| **Gestión de Caja** | `AperturaCaja.tsx` | Abrir caja con fondos iniciales |
| | `CierreCaja.tsx` | Cierre con reconciliación |
| | `MovimientosCaja.tsx` | Registro de transacciones |
| **Compras** | `Compras.tsx` | Compras a proveedores |
| | `NuevaCompra.tsx` | Formulario de nueva compra |
| Usuarios | `Usuarios.tsx` | CRUD de empleados/usuarios |
| Comprobantes | `Comprobantes.tsx` | Facturas y comprobantes |
| Notas | `NotasEntrada.tsx` | Entrada de inventario |
| | `NotasSalida.tsx` | Salida de inventario |
| Clientes | `ClientesProveedores.tsx` | Base de clientes/proveedores |
| Empresa | `DatosEmpresa.tsx` | Configuración general |
| Soporte | `Soporte.tsx` | Ayuda/contacto |

---

## 💾 Funciones de Storage del Frontend Administrativo

```typescript
// Productos
getProductos(): Producto[]
saveProductos(productos: Producto[]): void
addProducto(producto: ProductoNuevo): void
getNextId(): number

// Caja
getCajaAbierta(): CajaAbierta | null
setCajaAbierta(caja: CajaAbierta): void
cerrarCaja(): void
getMovimientosCaja(): MovimientoCaja[]
addMovimientoCaja(movimiento: MovimientoCaja): void
getMovimientosDelDia(): MovimientoCaja[]
limpiarMovimientosDelDia(): void

// Compras
getCompras(): Compra[]
addCompra(compra: Compra): void

// Categorías
getCategoriasByTipo(tipo: 'producto' | 'servicio'): string[]
```

---

## 🔄 Flujos Principales

### Flujo 1: Registro de Usuario
```
1. Usuario llena formulario en Login.tsx
2. Envía POST /auth/register a API Gateway
3. GatewayController::register() proxy a Auth Service
4. Auth Service crea usuario en auth_db
5. GatewayController sincroniza en apigateway_db
6. Genera token Sanctum y retorna al cliente
7. Cliente almacena token en localStorage
```

### Flujo 2: Crear Orden
```
1. Cliente selecciona productos en carrito
2. POST /api/v1/orders con Authorization header
3. OrderController::createOrder()
   a. Consulta Inventory Service: ¿Stock disponible?
   b. Si no: error 400
   c. Si sí: ReserveInventory()
4. Crea DetalleVenta para cada producto
5. Calcula total_venta
6. Registra Pago
7. Publica evento a RabbitMQ (email_service)
8. Retorna orden con ID y estado
```

### Flujo 3: Apertura/Cierre de Caja
```
APERTURA:
1. Empleado abre AperturaCaja.tsx
2. Ingresa fondos iniciales (Efectivo, Yape, Plin)
3. onClick="guardarApertura"
4. setCajaAbierta(cajaAbierta) → localStorage
5. Estado global: cajaAbierta = true

DURANTE EL DÍA:
6. Cada transacción se registra en MovimientosCaja
7. addMovimientoCaja() → localStorage

CIERRE:
8. Empleado abre CierreCaja.tsx
9. Valida montos de dinero contado
10. Reconcilia vs movimientos del día
11. Si hay diferencia: mostrar alerta
12. onClick="finalizarCierre"
13. cerrarCaja() → limpia localStorage
14. Estado global: cajaAbierta = false
```

---

## 🐳 Docker Compose - Servicios

```yaml
# Contenedores principales
db (PostgreSQL 15-alpine)
  - Puerto: 5440
  - Credenciales: admin/secret
  - Volumen: db-data

rabbitmq (3.12-management-alpine)
  - Puerto: 5672 (AMQP)
  - Puerto: 15672 (Management UI)
  - Credenciales: admin/secret
  - Volumen: rabbitmq-data

apigateway (PHP-FPM + Nginx)
  - Puerto: 8080
  - Multi-stage build (Node + PHP)
  - Dependencias: db, rabbitmq

auth_service / product_service / inventory_service / order_service / email_service / finance_service
  - Puertos: 8000-8005
  - Dependencias: db (o db + rabbitmq)
  - PHP 8.2 con extensiones Laravel
```

---

## 🚀 Comandos Útiles

```bash
# Iniciar servicios
docker-compose up --build          # Construir e iniciar
docker-compose up -d --build       # En background

# Detener servicios
docker-compose down                # Detener y eliminar containers
docker-compose down -v             # + eliminar volúmenes

# Logs
docker-compose logs -f             # Todos los servicios
docker-compose logs -f auth_service # Servicio específico

# Ejecutar comandos en container
docker-compose exec auth_service php artisan migrate
docker-compose exec product_service php artisan seed

# Acceder a bash
docker-compose exec auth_service bash

# Database (desde máquina host)
Host: localhost
Port: 5440
User: admin
Pass: secret

Database names:
- auth_db
- product_db
- inventory_db
- order_db
- email_db
- apigateway_db
```

---

## 📋 Validaciones Comunes

```php
// Por servicio:

AUTH_SERVICE:
- username: required, unique, max:255
- password: required, min:8
- email: required, email, unique
- dni: nullable, unique

PRODUCT_SERVICE:
- nombre_producto: required, string, max:255
- precio_base: required, numeric, > 0
- tipo_producto: in:donut,cafe,otro
- categoria_id: exists:categorias
- fecha_fin > fecha_inicio (promociones)

INVENTORY_SERVICE:
- cantidad: required, integer, > 0
- unidad_medida: required, max:50
- stock_minimo: integer, >= 0

ORDER_SERVICE:
- producto_id: exists:productos
- cantidad: required, integer, >= 1
- precio_unitario: numeric, > 0

EMAIL_SERVICE:
- destinatario: required, email
- asunto: required, string
- tipo_notificacion: required, string
```

---

## 🔗 Relaciones y Cascadas

| Relación | Tipo | Comportamiento |
|----------|------|-----------------|
| Categoria ← Productos | 1:N | Soft-delete Categoria no afecta Productos |
| Producto ↔ Promocion | N:N (Pivot) | Eliminar Promocion detacha Productos |
| Insumo ← LoteInsumo | 1:N | Eliminar Insumo elimina Lotes |
| Venta ← DetalleVenta | 1:N | Eliminar Venta elimina Detalles |
| Venta ← Pago | 1:N | Eliminar Venta elimina Pagos |
| Cliente ← Venta | 1:N | Eliminar Cliente puede mantener Ventas |

---

## 🛡️ Seguridad

- **Autenticación:** Sanctum tokens (Bearer tokens en Authorization header)
- **Contraseñas:** Hash con bcrypt
- **CORS:** Configurado en apigateway
- **Rate Limiting:** Implementado en auth endpoints
- **2FA:** Disponible en settings (no completamente implementado)
- **HTTPS:** En producción usar HTTPS (desarrollo: HTTP)

---

## 📊 Estadísticas del Proyecto

| Métrica | Cantidad |
|---------|----------|
| **Servicios** | 6 |
| **Controladores** | ~25 |
| **Modelos** | ~15 |
| **Frontends** | 2 |
| **Componentes React** | ~40+ |
| **Tablas de BD** | ~20+ |
| **Endpoints API** | ~80+ |

---

## 🔧 Próximos Pasos de Desarrollo

**Crítico:**
- [ ] Conectar frontend administrativo con APIs reales
- [ ] Validar integridad de transacciones en órdenes
- [ ] Implementar logging centralizado
- [ ] Tests unitarios en servicios críticos

**Importante:**
- [ ] Migrar frontend de localStorage a APIs
- [ ] Completar frontend clientes
- [ ] Agregar búsqueda/filtros avanzados
- [ ] Reportes y analytics
- [ ] Exportar a PDF (facturas, reportes)

**Nice to have:**
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Integración de pago (Stripe, PayPal)
- [ ] Auditoría de cambios
- [ ] Backup automático de BD
- [ ] Monitoring y alertas

---

## 📞 Contacto y Soporte

Para preguntas sobre la arquitectura o desarrollo, revisar:
- Documentación: `DOCKER_SETUP_SUMMARY.md`
- Análisis completo: `ANALISIS_ARQUITECTURA.md`
- README: `README.md`
