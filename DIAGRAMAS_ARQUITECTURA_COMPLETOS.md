# 🎯 DIAGRAMAS DE ARQUITECTURA Y FLUJOS

**Fecha:** 6 de junio de 2026  
**Proyecto:** Happy-Donnut-Software  
**Propósito:** Visualizar relaciones complejas entre componentes

---

## 1. DIAGRAMA DE DEPENDENCIAS DE MICROSERVICIOS

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        CAPAS DE LA ARQUITECTURA                            │
└────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          CAPA DE PRESENTACIÓN                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Frontend Administrativo (CI-015)      Frontend Clientes (CI-016) │  │
│  │  React + TypeScript + Radix UI         React + React Router      │  │
│  │  ├─ Dashboard                          ├─ Catálogo público       │  │
│  │  ├─ Gestión de productos              ├─ Carrito                 │  │
│  │  ├─ Gestión de inventario             ├─ Checkout               │  │
│  │  ├─ Gestión de órdenes                ├─ Mis órdenes            │  │
│  │  └─ Gestión de usuarios               └─ Seguimiento            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                          HTTP (JSON)                                     │
│                          Puerto 80/Browser                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      CAPA DE ORQUESTACIÓN                               │
│               ┌─────────────────────────────────┐                       │
│               │    API Gateway (CI-006)         │                       │
│               │ Laravel 12 + Nginx + Inertia   │                       │
│               ├─────────────────────────────────┤                       │
│               │ Proxy/Enrutador Centralizado    │                       │
│               │ - Valida tokens (Sanctum)       │                       │
│               │ - Enruta a servicios            │                       │
│               │ - Sincroniza usuarios           │                       │
│               │ Database: CI-014 (apigateway_db)│                       │
│               └──────┬──┬──┬──┬──┬──────────────┘                       │
│                      │  │  │  │  │                                     │
│    ┌─────────────────┘  │  │  │  └─────────────────┐                   │
│    │                    │  │  │                    │                   │
│    ↓                    ↓  ↓  ↓                    ↓                   │
│ ┌──────┐            ┌────────┐            ┌───────────┐   ┌─────────┐ │
│ │ Nginx│            │Nginx   │            │Nginx      │   │Nginx    │ │
│ │(Prod)│            │(Auth)  │            │(Inv)      │   │(Order)  │ │
│ └──┬───┘            └────┬───┘            └───────┬───┘   └────┬────┘ │
│    │                     │                        │            │      │
└────┼─────────────────────┼────────────────────────┼────────────┼──────┘
     │                     │                        │            │
     ↓                     ↓                        ↓            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    CAPA DE MICROSERVICIOS (Docker)                      │
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐             │
│  │ Auth Service │    │Product Service│   │ Inventory    │             │
│  │  (CI-001)    │    │   (CI-002)    │   │  (CI-003)    │             │
│  │ Puerto 8000  │    │  Puerto 8001  │   │ Internal     │             │
│  └──────┬───────┘    └──────┬────────┘   └──────┬───────┘             │
│         │                    │                   │                     │
│         │  ┌────────────────────────────────────┐                     │
│         │  │                                    │                     │
│         ▼  ▼                                    ▼                     │
│  ┌──────────────────────────────────────────────────────┐             │
│  │            Order Service (CI-004)                    │             │
│  │            Port Internal                             │             │
│  │                                                      │             │
│  │ ├─ Consulta: CI-002 (productos)                     │             │
│  │ ├─ Consulta: CI-003 (disponibilidad)               │             │
│  │ ├─ Publica eventos → CI-019 (RabbitMQ)             │             │
│  │ └─ Database: CI-012 (order_db)                      │             │
│  └──────────────────────────────────────────────────────┘             │
│                                                                         │
│  ┌──────────────────────────────────────────────────────┐             │
│  │      Email Service (CI-005) - Async                 │             │
│  │      Port Internal                                   │             │
│  │                                                      │             │
│  │ ├─ Consume: CI-019 (eventos RabbitMQ)              │             │
│  │ ├─ Eventos: order.created, user.registered, etc.   │             │
│  │ └─ Database: CI-013 (email_db)                      │             │
│  └──────────────────────────────────────────────────────┘             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                    ↓           ↓           ↓           ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                  CAPA DE PERSISTENCIA (PostgreSQL)                      │
│                                                                         │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │DB Auth │ │DB Prod │ │DB Inv  │ │DB Order│ │DB Email│ │DB API  │   │
│ │CI-009  │ │ CI-010 │ │CI-011  │ │CI-012  │ │ CI-013 │ │ CI-014 │   │
│ │5440    │ │ 5441   │ │5442    │ │5443    │ │ 5444   │ │ 5445   │   │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
│     │           │          │          │          │          │        │
│     └─────────────────────────────────────────────────────────┘        │
│                         Network: happydonut-net                       │
│                         Docker Volumes para persistencia              │
└─────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│               SERVICIOS DE INFRAESTRUCTURA (Docker)                     │
│                                                                         │
│  ┌────────────────────────────────┐                                   │
│  │   RabbitMQ (CI-019)             │                                   │
│  │   Event Bus / Message Queue     │                                   │
│  │   Puerto 5672 (AMQP)            │                                   │
│  │   Puerto 15672 (Admin UI)       │                                   │
│  │                                │                                   │
│  │   Exchanges/Queues:            │                                   │
│  │   - order.created              │                                   │
│  │   - order.completed            │                                   │
│  │   - user.registered            │                                   │
│  │   - inventory.low_stock        │                                   │
│  └────────────────────────────────┘                                   │
│                                                                         │
│  ┌────────────────────────────────┐                                   │
│  │   Docker Compose (CI-007)      │                                   │
│  │   Orquestación de contenedores  │                                   │
│  │   - 6 bases de datos            │                                   │
│  │   - 5 microservicios            │                                   │
│  │   - 1 API Gateway               │                                   │
│  │   - 1 RabbitMQ                  │                                   │
│  │   - Red: happydonut-net         │                                   │
│  └────────────────────────────────┘                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. MATRIZ DE COMUNICACIÓN DETALLADA

```
SÍMBOLO EXPLICACIÓN:
═══════════════════════════════════════════════════════════════════════════

→   Llamada HTTP sincrónica (GET, POST, PUT, DELETE)
→→  Llamada HTTP con dependencia crítica (bloquea operación)
⟿   Event RabbitMQ asincrónico (no bloquea)
⇄   Bidireccional (request + response)

┌──────────────────────────────────────────────────────────────────────────┐
│              MATRIZ DE COMUNICACIÓN INTER-SERVICIOS                      │
├──────────┬─────────────────────────────────────────────────────────────┤
│   DE     │                         A                                    │
│          │  CI-001   CI-002    CI-003    CI-004    CI-005  CI-006      │
├──────────┼─────────────────────────────────────────────────────────────┤
│ CI-001   │   -        -         -         -         -      ⇄ Proxy     │
│ (Auth)   │           (login/register)                                  │
├──────────┼─────────────────────────────────────────────────────────────┤
│ CI-002   │   -        -         -         →GET      -      ⇄ Proxy     │
│ (Product)│                           (Consulta              (Productos) │
│          │                            productos)                       │
├──────────┼─────────────────────────────────────────────────────────────┤
│ CI-003   │   -        -         -         →GET      -      ⇄ Proxy     │
│(Inventory│                           (Verifica     (Inventario)       │
│          │                            stock)                           │
├──────────┼─────────────────────────────────────────────────────────────┤
│ CI-004   │   -      →GET       →→GET       -      ⟿ Event  ⇄ Proxy    │
│ (Order)  │       (Productos) (Reserva) order.created (Órdenes)       │
│          │                    insumos                                  │
├──────────┼─────────────────────────────────────────────────────────────┤
│ CI-005   │   -        -         -         -         -      ⇄ Proxy     │
│ (Email)  │          (consume desde RabbitMQ: order.created)            │
├──────────┼─────────────────────────────────────────────────────────────┤
│ CI-006   │ ⇄ Proxy  ⇄ Proxy  ⇄ Proxy  ⇄ Proxy  ⇄ Proxy    -          │
│ (API GW) │ Proxea todos los servicios + maneja autenticación           │
├──────────┼─────────────────────────────────────────────────────────────┤
│ CI-015   │   -        -         -         -         -      → GET/POST  │
│ (Frontend│       (via API Gateway)      (via API Gateway)             │
│ Admin)   │                                                              │
├──────────┼─────────────────────────────────────────────────────────────┤
│ CI-016   │   -        -         -         -         -      → GET/POST  │
│ (Frontend│       (via API Gateway)      (via API Gateway)             │
│ Client)  │                                                              │
└──────────┴─────────────────────────────────────────────────────────────┘
```

---

## 3. FLUJO: CREAR ORDEN (Con Dependencias)

```
TIMELINE DE EJECUCIÓN
══════════════════════════════════════════════════════════════════════════

t=0.0s  ┌─ Cliente (CI-016) inicia POST /api/v1/orders
        │  Body: { producto_id: 123, cantidad: 2, cliente_id: 5 }
        │  Header: Authorization: Bearer <token>
        └─→ [1] VALIDACIÓN DE AUTENTICACIÓN

t=0.1s  ┌─ API Gateway (CI-006)
        │  ├─ [2] Valida token Sanctum en CI-014 (local DB)
        │  │       ✅ Token válido
        │  │
        │  └─→ Enruta a Order Service
        │      HTTP POST http://order-service:8003/api/v1/orders
        └─→ [3] INVOCA ORDER SERVICE

t=0.5s  ┌─ Order Service (CI-004) recibe request
        │  ├─ [4] OrderController::store()
        │  │       Inicia validaciones...
        │  │
        │  └─→ HTTP GET http://product-service-nginx/api/v1/products/123
        └─→ [5] CONSULTA PRODUCTO EN CI-002

t=1.0s  ┌─ Product Service (CI-002) recibe GET /products/123
        │  ├─ [6] ProductController::show(123)
        │  │
        │  └─→ Query en CI-010 (DB Product):
        │      SELECT * FROM productos WHERE producto_id = 123 AND activo_web = true
        └─→ [7] CONSULTA BD PRODUCTO

t=1.2s  ┌─ BD Product (CI-010) retorna:
        │  { producto_id: 123, nombre: 'Donut Chocolate', precio: 5.50, ... }
        │  ✅ Producto encontrado y activo
        └─→ [8] VALIDACIÓN PRODUCTO OK

t=1.3s  ┌─ Product Service (CI-002) retorna 200 OK con datos producto
        │
        └─→ [9] RETORNA A ORDER SERVICE

t=1.5s  ┌─ Order Service (CI-004) recibe respuesta de CI-002
        │  ├─ ✅ Producto validado
        │  │
        │  └─→ HTTP GET http://inventory-service:8002/api/v1/inventory/check/123/2
        └─→ [10] CONSULTA DISPONIBILIDAD EN CI-003

t=2.0s  ┌─ Inventory Service (CI-003) recibe GET /inventory/check/123/2
        │  ├─ [11] InventoryController::checkAvailability(123, 2)
        │  │
        │  ├─→ Query en CI-011 (DB Inventory):
        │  │    SELECT * FROM recetas WHERE producto_id = 123
        │  │    (Para conocer qué insumos necesita 1 donut)
        │  │
        │  └─→ [12] CONSULTA RECETA EN BD INVENTARIO
        │      Resultado: Necesita 100g de harina + 50g de chocolate

t=2.3s  ┌─ BD Inventory (CI-011) retorna receta
        │  └─→ [13] RETORNA RECETA A INVENTORY SERVICE

t=2.4s  ┌─ Inventory Service (CI-003) calcula necesario:
        │  - Necesita 2 donut × (100g harina + 50g chocolate)
        │  - Total: 200g harina, 100g chocolate
        │
        │  └─→ Query en CI-011:
        │      SELECT SUM(cantidad) FROM lote_insumo WHERE insumo_id = {id_harina}
        │      SELECT SUM(cantidad) FROM lote_insumo WHERE insumo_id = {id_choc}
        └─→ [14] CONSULTA STOCK ACTUAL EN BD INVENTARIO

t=2.7s  ┌─ BD Inventory (CI-011) retorna:
        │  - Harina disponible: 500g ✅ (>= 200g necesarios)
        │  - Chocolate disponible: 150g ✅ (>= 100g necesarios)
        └─→ [15] STOCK DISPONIBLE OK

t=2.8s  ┌─ Inventory Service (CI-003) retorna 200 OK
        │  Response: { available: true, available_quantity: 5 }
        │
        └─→ [16] RETORNA A ORDER SERVICE

t=3.0s  ┌─ Order Service (CI-004) recibe respuesta de CI-003
        │  ├─ ✅ Stock validado
        │  │
        │  └─→ Inicia TRANSACCIÓN en CI-012 (DB Order)
        │      ├─ BEGIN TRANSACTION
        │      ├─ INSERT INTO ventas (cliente_id, total_venta, estado_pedido)
        │      │  VALUES (5, 11.00, 'pending')
        │      └─ INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario)
        │         VALUES (999, 123, 2, 5.50)
        └─→ [17] CREA VENTA EN BD ORDER

t=3.2s  ┌─ BD Order (CI-012) retorna:
        │  venta_id: 999
        │  estado_pedido: 'pending'
        │  total_venta: 11.00
        └─→ [18] VENTA CREADA OK

t=3.3s  ┌─ Order Service (CI-004) recibe venta_id=999
        │
        │  └─→ HTTP POST http://inventory-service:8002/api/v1/inventory/reserve
        │      Body: { producto_id: 123, cantidad: 2, venta_id: 999 }
        └─→ [19] INICIA RESERVA DE INSUMOS EN CI-003

t=3.8s  ┌─ Inventory Service (CI-003) recibe POST /inventory/reserve
        │  ├─ [20] InventoryController::reserve()
        │  │
        │  └─→ Inicia TRANSACCIÓN en CI-011 (DB Inventory)
        │      ├─ UPDATE lote_insumo SET cantidad = cantidad - 200 WHERE insumo_id = {id_harina}
        │      │  (Harina: 500 - 200 = 300)
        │      ├─ UPDATE lote_insumo SET cantidad = cantidad - 100 WHERE insumo_id = {id_choc}
        │      │  (Chocolate: 150 - 100 = 50)
        │      ├─ INSERT INTO reservas (venta_id, insumo_id, cantidad_reservada)
        │      │  VALUES (999, id_harina, 200), (999, id_choc, 100)
        │      └─ COMMIT TRANSACTION
        └─→ [21] ACTUALIZA STOCK EN BD INVENTARIO

t=4.0s  ┌─ BD Inventory (CI-011) retorna:
        │  ✅ Reserva exitosa
        └─→ [22] RESERVA CONFIRMADA

t=4.1s  ┌─ Inventory Service (CI-003) retorna 200 OK
        │  Response: { reserved: true, venta_id: 999 }
        │
        └─→ [23] RETORNA A ORDER SERVICE

t=4.2s  ┌─ Order Service (CI-004) recibe confirmación de reserva
        │  ├─ COMMIT TRANSACTION en CI-012 (DB Order)
        │  │
        │  └─→ Publica evento en CI-019 (RabbitMQ)
        │      Exchange: events
        │      Routing Key: order.created
        │      Payload: { venta_id: 999, cliente_id: 5, items: [{...}] }
        └─→ [24] PUBLICA EVENTO EN RABBITMQ

t=4.4s  ┌─ RabbitMQ (CI-019) recibe evento
        │  ├─ [25] Enruta evento a colas suscritas
        │  │
        │  └─→ Email Service (CI-005) consume evento
        │      Queue: order.created.queue
        └─→ [26] EMAIL SERVICE CONSUME EVENTO

t=4.5s  ┌─ Email Service (CI-005) procesa evento
        │  ├─ [27] Event Listener: OrderCreatedListener::handle()
        │  │
        │  ├─→ Query en CI-012 (DB Order):
        │  │    SELECT * FROM ventas WHERE venta_id = 999
        │  │
        │  ├─→ Query en CI-009 (DB Auth):
        │  │    SELECT email FROM usuarios WHERE usuario_id = 5
        │  │
        │  └─→ Genera Email HTML + Envía SMTP
        └─→ [28] GENERA Y ENVÍA EMAIL

t=4.7s  ┌─ Email Service (CI-005) registra envío
        │  └─→ INSERT INTO log_notificaciones (destinatario, asunto, estado, fecha_envio)
        │      VALUES ('cliente@email.com', 'Orden Confirmada #999', 'sent', NOW())
        └─→ [29] REGISTRA EN LOG EMAIL

t=4.8s  ┌─ Email Service (CI-005) completado
        │  └─ Email enviado exitosamente
        └─→ [30] EMAIL ENVIADO OK

t=5.0s  ┌─ Order Service (CI-004) retorna respuesta a API Gateway
        │  Response: 201 Created
        │  Body: {
        │    venta_id: 999,
        │    estado_pedido: 'pending',
        │    total_venta: 11.00,
        │    items: [{ producto_id: 123, cantidad: 2, precio: 5.50 }],
        │    creado_en: '2026-06-06T...'
        │  }
        └─→ [31] RETORNA A API GATEWAY

t=5.1s  ┌─ API Gateway (CI-006) retorna respuesta a Cliente
        │  HTTP 201 Created
        │  Body: { venta_id: 999, ... }
        │
        └─→ [32] RETORNA AL CLIENTE

t=5.2s  ┌─ Cliente (CI-016) recibe respuesta
        │  ├─ ✅ Orden creada exitosamente
        │  ├─ Guarda venta_id en localStorage
        │  ├─ Limpia carrito
        │  └─ Redirige a página de confirmación
        └─ FIN DEL FLUJO (Tiempo total: 5.2 segundos)

════════════════════════════════════════════════════════════════════════════

RESUMEN DE LLAMADAS:
===================
1. Cliente → API Gateway (inicial)
2. API Gateway → Auth Service (validación token)
3. API Gateway → Order Service (proxy)
4. Order Service → Product Service (validar producto)
5. Order Service → Inventory Service (verificar stock)
6. Order Service → Inventory Service (reservar insumos)
7. Order Service → RabbitMQ (publicar evento)
8. Email Service ← RabbitMQ (consume evento)
9. Email Service → Cliente (envía email)

PUNTOS CRÍTICOS:
================
- Si CI-012 falla → Orden no se crea ❌
- Si CI-011 falla → No se reservan insumos ⚠️
- Si CI-010 o CI-009 falla → Validaciones fallan ❌
- Si CI-019 falla → Email no se envía ⚠️ (pero orden se crea)

════════════════════════════════════════════════════════════════════════════
```

---

## 4. DEPENDENCIA DE CONFIGURACIÓN

```
ÁRBOL DE DEPENDENCIAS DE CONFIGURACIÓN
════════════════════════════════════════════════════════════════════════════

.env (CI-017) - ROOT CONFIG
│
├─→ docker-compose.yml (CI-007)
│   │
│   ├─→ db-auth (CI-009)
│   │   ├─ Image: postgres:16-alpine
│   │   ├─ Volume: db-auth-data
│   │   ├─ Env: POSTGRES_USER, POSTGRES_PASSWORD
│   │   └─ Port: 5440:5432
│   │
│   ├─→ db-product (CI-010)
│   │   ├─ Image: postgres:16-alpine
│   │   ├─ Volume: db-product-data
│   │   ├─ Env: POSTGRES_USER, POSTGRES_PASSWORD
│   │   └─ Port: 5441:5432
│   │
│   ├─→ db-inventory (CI-011)
│   │   ├─ Image: postgres:16-alpine
│   │   ├─ Volume: db-inventory-data
│   │   ├─ Env: POSTGRES_USER, POSTGRES_PASSWORD
│   │   └─ Port: 5442:5432
│   │
│   ├─→ db-order (CI-012)
│   │   ├─ Image: postgres:16-alpine
│   │   ├─ Volume: db-order-data
│   │   ├─ Env: POSTGRES_USER, POSTGRES_PASSWORD
│   │   └─ Port: 5443:5432
│   │
│   ├─→ db-email (CI-013)
│   │   ├─ Image: postgres:16-alpine
│   │   ├─ Volume: db-email-data
│   │   ├─ Env: POSTGRES_USER, POSTGRES_PASSWORD
│   │   └─ Port: 5444:5432
│   │
│   ├─→ db-apigateway (CI-014)
│   │   ├─ Image: postgres:16-alpine
│   │   ├─ Volume: db-apigateway-data
│   │   ├─ Env: POSTGRES_USER, POSTGRES_PASSWORD
│   │   └─ Port: 5445:5432
│   │
│   ├─→ rabbitmq (CI-019)
│   │   ├─ Image: rabbitmq:3-management
│   │   ├─ Env: RABBITMQ_USER, RABBITMQ_PASSWORD
│   │   ├─ Port: 5672:5672 (AMQP)
│   │   └─ Port: 15672:15672 (Admin UI)
│   │
│   ├─→ api-gateway (CI-006)
│   │   ├─ Build: apigateway/Dockerfile (CI-025)
│   │   │  ├─ composer.json (CI-037)
│   │   │  └─ package.json (CI-043)
│   │   ├─ Entrypoint: entrypoint.sh (CI-031)
│   │   ├─ Config: routes/api.php (CI-052)
│   │   ├─ Env: DB_HOST=db-apigateway, DB_DATABASE=apigateway_db
│   │   ├─ Port: 80:80 (Nginx), 8000:8000 (Laravel)
│   │   ├─ Depends: db-apigateway, auth-service, product-service, inventory-service, order-service
│   │   └─ Proxy Config: nginx.conf (CI-018)
│   │       ├─ Upstream: auth-service:8000
│   │       ├─ Upstream: product-service-nginx:80
│   │       ├─ Upstream: inventory-service:8002
│   │       ├─ Upstream: order-service:8003
│   │       └─ Upstream: email-service:8000
│   │
│   ├─→ auth-service (CI-001)
│   │   ├─ Build: auth_service/Dockerfile (CI-020)
│   │   │  ├─ composer.json (CI-032)
│   │   │  └─ package.json (CI-038)
│   │   ├─ Entrypoint: entrypoint.sh (CI-026)
│   │   ├─ Config: routes/api.php (CI-047)
│   │   ├─ Env: DB_HOST=db-auth, DB_DATABASE=auth_db
│   │   ├─ Depends: db-auth
│   │   └─ Port: 9001:8000
│   │
│   ├─→ product-service (CI-002)
│   │   ├─ Build: product_service/Dockerfile (CI-021)
│   │   │  ├─ composer.json (CI-033)
│   │   │  └─ package.json (CI-039)
│   │   ├─ Entrypoint: entrypoint.sh (CI-027)
│   │   ├─ Config: routes/api.php (CI-048)
│   │   ├─ Env: DB_HOST=db-product, DB_DATABASE=product_db
│   │   ├─ Depends: db-product
│   │   ├─ Port: 9002:8000 (Laravel)
│   │   └─ Nginx config: product-service-nginx.conf (CI-046)
│   │       └─ Upstream: product-service:8000
│   │
│   ├─→ inventory-service (CI-003)
│   │   ├─ Build: inventory_service/Dockerfile (CI-022)
│   │   │  ├─ composer.json (CI-034)
│   │   │  └─ package.json (CI-040)
│   │   ├─ Entrypoint: entrypoint.sh (CI-028)
│   │   ├─ Config: routes/api.php (CI-049)
│   │   ├─ Env: DB_HOST=db-inventory, DB_DATABASE=inventory_db
│   │   ├─ Depends: db-inventory
│   │   └─ Port: Internal only
│   │
│   ├─→ order-service (CI-004)
│   │   ├─ Build: order_service/Dockerfile (CI-023)
│   │   │  ├─ composer.json (CI-035)
│   │   │  └─ package.json (CI-041)
│   │   ├─ Entrypoint: entrypoint.sh (CI-029)
│   │   ├─ Config: routes/api.php (CI-050)
│   │   ├─ Env: DB_HOST=db-order, DB_DATABASE=order_db, QUEUE_CONNECTION=rabbitmq
│   │   ├─ Depends: db-order, rabbitmq
│   │   └─ Port: Internal only
│   │
│   └─→ email-service (CI-005)
│       ├─ Build: email_service/Dockerfile (CI-024)
│       │  ├─ composer.json (CI-036)
│       │  └─ package.json (CI-042)
│       ├─ Entrypoint: entrypoint.sh (CI-030)
│       ├─ Config: routes/api.php (CI-051)
│       ├─ Env: DB_HOST=db-email, DB_DATABASE=email_db, QUEUE_CONNECTION=rabbitmq
│       ├─ Depends: db-email, rabbitmq
│       └─ Port: Internal only
│
├─→ Frontend Administrativo (CI-015)
│   ├─ package.json (CI-044)
│   │  ├─ @radix-ui/react-*
│   │  ├─ recharts
│   │  ├─ lucide-react
│   │  └─ tailwindcss
│   ├─ vite.config.ts
│   ├─ tsconfig.json
│   └─ Consume: API Gateway (CI-006)
│
└─→ Frontend Clientes (CI-016)
    ├─ package.json (CI-045)
    │  ├─ react
    │  ├─ react-router-dom
    │  ├─ lucide-react
    │  └─ tailwindcss
    ├─ Webpack config
    └─ Consume: API Gateway (CI-006)

════════════════════════════════════════════════════════════════════════════
```

---

## 5. MATRIZ DE IMPACTO VISUAL

```
IMPACTO DE FALLO EN CASCADE
════════════════════════════════════════════════════════════════════════════

1. SI FALLA docker-compose.yml (CI-007)
   ├─ TODOS los contenedores fallan ❌❌❌❌❌
   ├─ Bases de datos inaccesibles
   ├─ API Gateway offline
   ├─ Microservicios offline
   ├─ Frontends sin backend
   └─ Impacto CRÍTICO: 100% del sistema inoperable

2. SI FALLA .env (CI-017)
   ├─ Variables no cargadas
   ├─ Credenciales no configuradas
   ├─ Servicios sin conectividad a BD
   ├─ TODOS los servicios fallan al iniciar
   └─ Impacto CRÍTICO: Imposible levantar infraestructura

3. SI FALLA db-auth (CI-009)
   ├─ Auth Service offline ❌
   ├─ No se pueden crear/validar sesiones
   ├─ Frontends no pueden autenticar usuarios
   ├─ API Gateway sin tokens válidos
   └─ Impacto CRÍTICO: Sin autenticación = sin acceso

4. SI FALLA db-product (CI-010)
   ├─ Product Service offline ❌
   ├─ Catálogo no disponible
   ├─ Order Service no puede consultar productos
   ├─ Frontend Clientes ve catálogo vacío
   └─ Impacto CRÍTICO: Sin catálogo = sin compras

5. SI FALLA db-inventory (CI-011)
   ├─ Inventory Service offline ❌
   ├─ Order Service no puede verificar stock
   ├─ Órdenes fallan en creación
   ├─ Frontend Admin no ve inventario
   ├─ IMPACTO: No se pueden crear órdenes ⚠️
   └─ Alternativa: Se permite crear órdenes sin validar stock (peligroso)

6. SI FALLA db-order (CI-012)
   ├─ Order Service offline ❌
   ├─ No se pueden crear/consultar órdenes
   ├─ Frontend Clientes no puede hacer checkout
   ├─ Frontend Admin no ve ventas
   └─ Impacto CRÍTICO: Sin gestión de órdenes

7. SI FALLA RabbitMQ (CI-019)
   ├─ Email Service no consume eventos ⚠️
   ├─ Órdenes SÍ se crean (CI-004 no depende de RabbitMQ para crear)
   ├─ Emails NO se envían
   ├─ Clientes no reciben confirmaciones
   ├─ IMPACTO: Degradado (operacional pero sin notificaciones)
   └─ Severidad: MODERADA (no bloquea operación)

8. SI FALLA API Gateway (CI-006)
   ├─ Nginx no enruta peticiones ❌
   ├─ Frontends no pueden comunicarse con backend
   ├─ Microservicios funcionan pero no son accesibles
   ├─ Impacto: CRÍTICO (frontends inutilizables)
   └─ Alternativa: Conectar frontends directamente a microservicios

9. SI FALLA nginx.conf (CI-018)
   ├─ API Gateway sin configuración de proxy ❌
   ├─ Rutas no se enrutan a servicios correctos
   ├─ 502 Bad Gateway en Nginx
   └─ Impacto: CRÍTICO (mismo que #8)

10. SI FALLA Order Service (CI-004)
    ├─ Órdenes no se pueden crear ❌
    ├─ Frontend Clientes falla en checkout
    ├─ Frontend Admin falla en crear ventas
    ├─ Product y Inventory Services siguen funcionando
    └─ Impacto: CRÍTICO (para flujo de órdenes)

════════════════════════════════════════════════════════════════════════════
```

---

## 6. TABLA RESUMEN: CRITICIDAD Y REDUNDANCIA

| CI | Criticidad | Redundancia Actual | Recomendación | Tiempo de Recuperación |
|---|---|---|---|---|
| CI-007 (Docker Compose) | 🔴 CRÍTICA | ❌ Ninguna | Cluster Docker Swarm o Kubernetes | Manual (restart) |
| CI-017 (.env) | 🔴 CRÍTICA | ❌ Ninguna | Secrets Manager (HashiCorp Vault) | Manual (reconfig) |
| CI-018 (Nginx Config) | 🔴 CRÍTICA | ❌ Ninguna | Hot-reload + Backup | ~1 minuto |
| CI-001-005 (Servicios) | 🔴 CRÍTICA | ❌ Ninguna | Replicas en Docker Swarm/K8s | ~30 segundos |
| CI-009-014 (Bases de Datos) | 🔴 CRÍTICA | ❌ Ninguna | PostgreSQL Replication + PITR | ~5 minutos |
| CI-006 (API Gateway) | 🔴 CRÍTICA | ❌ Ninguna | Load Balancer + Replicas | ~1 minuto |
| CI-015 (Frontend Admin) | 🟡 ALTA | ❌ Ninguna | CDN + S3 + CloudFront | ~5 minutos |
| CI-016 (Frontend Clientes) | 🟡 ALTA | ❌ Ninguna | CDN + S3 + CloudFront | ~5 minutos |
| CI-019 (RabbitMQ) | 🟡 ALTA | ❌ Ninguna | RabbitMQ Cluster (3 nodos) | ~2 minutos |

