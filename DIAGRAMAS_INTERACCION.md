# 🎯 Diagramas de Interacción - Happy Donnut Software

## 1. Arquitectura General del Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN                            │
│                                                                     │
│  ┌───────────────────────┐         ┌──────────────────────────┐   │
│  │  Frontend             │         │  Frontend                │   │
│  │  Administrativo       │         │  Clientes               │   │
│  │  (React + Tailwind)   │         │  (React)                │   │
│  └───────────────┬───────┘         └──────────────┬───────────┘   │
│                  │                                │                │
│                  └────────────────┬───────────────┘                │
│                                   │                               │
└───────────────────────────────────┼───────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS
                                    │ Bearer Token (Sanctum)
                                    │
┌───────────────────────────────────▼───────────────────────────────┐
│                    CAPA DE ENRUTAMIENTO                           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              API GATEWAY (Puerto 8080)                   │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │  Nginx (Reverse Proxy)                             │ │   │
│  │  │  ├─ /api/v1/* → GatewayController                  │ │   │
│  │  │  ├─ /settings/* → SettingsControllers              │ │   │
│  │  │  ├─ /notes/* → NotesController                     │ │   │
│  │  │  └─ /auth/* → AuthController                       │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  Responsabilidades:                                    │   │
│  │  ✓ Validar tokens Sanctum                             │   │
│  │  ✓ Enrutar a microservicios                           │   │
│  │  ✓ Sincronizar usuarios                              │   │
│  │  ✓ Generar/revocar tokens                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────┬───────────────┬────────────────────┬────────────────┬──────┘
        │               │                    │                │
        │               │                    │                │
┌───────▼─┐   ┌────────▼──┐  ┌─────────────▼──┐  ┌──────────▼────┐
│  Auth   │   │ Product   │  │  Inventory     │  │  Order        │
│ Service │   │ Service   │  │  Service       │  │  Service      │
│ P8000   │   │  P8001    │  │   P8002        │  │  P8003        │
└───────┬─┘   └────────┬──┘  └─────────────┬──┘  └──────────┬────┘
        │              │                   │                 │
        │              │                   │                 │
        └──────────────┼───────────────────┼─────────────────┘
                       │                   │
          ┌────────────┴───────────────────┘
          │
     ┌────▼─────────────────────────────────┐    ┌─────────────┐
     │  PostgreSQL 15 (Centralizado)        │    │  Email Svc  │
     │  ┌──────────────────────────────────┐│    │   P8004     │
     │  │ auth_db                          ││    │             │
     │  │ product_db                       ││    └──────┬───────┘
     │  │ inventory_db                     ││           │
     │  │ order_db                         ││    ┌──────▼───────┐
     │  │ email_db                         ││    │  RabbitMQ    │
     │  │ apigateway_db                    ││    │  P5672       │
     │  └──────────────────────────────────┘│    │  (Message Q) │
     │  Credenciales: admin/secret          │    └──────────────┘
     └─────────────────────────────────────┘
```

---

## 2. Flujo de Autenticación Detallado

```
┌─────────────────────────────────────┐
│   Usuario en Frontend                │
│   POST /auth/register                │
│   { username, password }             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  API Gateway AuthController          │
│  receives POST /auth/register        │
└──────────────┬──────────────────────┘
               │
               ├─► HTTP GET/POST a Auth Service
               │   http://auth-service:8000/api/v1/register
               │
               ▼
┌─────────────────────────────────────┐
│  Auth Service                         │
│  - Valida username, password          │
│  - Hash password con bcrypt          │
│  - Crea en tabla 'usuarios'          │
│  - Retorna user creado               │
└──────────────┬──────────────────────┘
               │ { usuario_id, username, role, estado }
               │
               ▼
┌─────────────────────────────────────┐
│  API Gateway - AuthController        │
│  registerFromService($userData)      │
│  ├─ Busca/crea usuario local         │
│  ├─ Genera Hash dummy para password  │
│  ├─ Inserta en users tabla (local)   │
│  └─ Genera token Sanctum             │
└──────────────┬──────────────────────┘
               │ { access_token, token_type: 'Bearer', user }
               │
               ▼
┌─────────────────────────────────────┐
│  Frontend                             │
│  ├─ Recibe token                      │
│  ├─ localStorage.setItem('token')     │
│  ├─ Headers futuros: Bearer {token}   │
│  └─ Redirige a Dashboard              │
└─────────────────────────────────────┘


LOGIN SUBSECUENTE:
┌─────────────────────────────────────┐
│  Frontend                             │
│  POST /api/v1/orders                 │
│  Headers: Authorization: Bearer ...   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Middleware auth:sanctum             │
│  ├─ Valida token en BD local         │
│  ├─ Si válido: continúa             │
│  └─ Si inválido: 401 Unauthorized    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Controlador solicitado              │
│  (con $request->user() disponible)   │
└─────────────────────────────────────┘
```

---

## 3. Flujo de Creación de Orden (Completo)

```
┌──────────────────────────────┐
│  Cliente selecciona productos │
│  en carrito frontend          │
│  Click: "Confirmar Orden"     │
└────────────┬─────────────────┘
             │
             │ POST /api/v1/orders
             │ { items: [{producto_id, cantidad}, ...] }
             │ Headers: Authorization: Bearer {token}
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│  API Gateway - GatewayController::createOrder()             │
│  ├─ Middleware auth:sanctum valida token ✓                  │
│  └─ makeServiceRequest() hacia Order Service                │
└────────────┬─────────────────────────────────────────────────┘
             │
             │ HTTP POST /api/v1/orders
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│  Order Service - OrderController::createOrder()             │
│                                                              │
│  1. VALIDACIONES INICIALES                                  │
│     ├─ cliente_id existe                                    │
│     ├─ cada producto_id existe                              │
│     ├─ cantidades > 0                                       │
│     └─ calcular total preliminar                            │
│                                                              │
│  2. VERIFICAR DISPONIBILIDAD EN INVENTARIO                  │
│     └─ para cada item:                                      │
│         ├─ HTTP GET a Inventory Service                    │
│         │  /inventory/check/{producto_id}/{cantidad}       │
│         │                                                   │
│         │  ┌─ Si NO disponible: ABORT + Error 400         │
│         │  ├─ HTTP Response: { available: false }          │
│         │  └─ Return 400: 'Inventario insuficiente'        │
│         │                                                   │
│         └─ Si SÍ disponible: continuar                     │
│                                                              │
│  3. RESERVAR INSUMOS                                        │
│     └─ para cada item:                                      │
│         └─ HTTP POST a Inventory Service                   │
│            /inventory/reserve                              │
│            { product_id, quantity }                         │
│            ┌─ Response: reserva creada con ID              │
│            └─ Insumos marcados como "reservados"           │
│                                                              │
│  4. CREAR VENTA EN BD                                       │
│     ├─ INSERT ventas:                                       │
│     │  { cliente_id, empleado_id, total_venta,             │
│     │    estado_pedido: 'pendiente', fecha_venta }         │
│     │                                                       │
│     └─ Obtener venta_id generado                           │
│                                                              │
│  5. CREAR DETALLES DE VENTA                                 │
│     └─ para cada item:                                      │
│         └─ INSERT detalles_venta:                          │
│            { venta_id, producto_id, cantidad,              │
│              precio_unitario_venta, nombre_producto }      │
│                                                              │
│  6. CREAR REGISTRO DE PAGO                                  │
│     ├─ INSERT pagos:                                        │
│     │  { venta_id, metodo_pago_id, monto }                 │
│     │                                                       │
│     └─ Actualizar estado_pedido a 'confirmada'             │
│                                                              │
│  7. PUBLICAR EVENTO A RABBITMQ                              │
│     ├─ Topic: 'ordenes.creadas'                            │
│     ├─ Payload: { venta_id, cliente_email, ...}            │
│     └─ Email Service consume y envía confirmación          │
│                                                              │
│  8. RETORNAR RESPUESTA                                      │
│     └─ { venta_id, total_venta, estado_pedido,             │
│         detalles, link_seguimiento }                        │
│                                                              │
└────────────┬─────────────────────────────────────────────────┘
             │ HTTP 201 Created
             │ { venta_id: 123, total: 45.50, ... }
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│  API Gateway - Retorna al cliente                           │
└────────────┬─────────────────────────────────────────────────┘
             │ JSON Response
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│  Frontend - Cliente recibe confirmación                     │
│  ├─ toast.success("Orden confirmada")                       │
│  ├─ Guarda venta_id en estado local                        │
│  ├─ Redirige a página de seguimiento                       │
│  └─ Muestra comprobante con detalles                       │
└──────────────────────────────────────────────────────────────┘

SIMULTÁNEAMENTE:
┌──────────────────────────────────────────────────────────────┐
│  RabbitMQ - Email Service Consumer                          │
│  ├─ Recibe evento: ordenes.creadas                         │
│  ├─ Renderiza template de email                            │
│  ├─ Envía email a cliente_email                            │
│  └─ Registra en log_notificaciones:                        │
│     { destinatario, asunto, tipo: 'confirmacion_orden',    │
│       estado: 'enviado', fecha_envio }                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Flujo de Apertura y Cierre de Caja

### Apertura de Caja
```
┌────────────────────────────────────┐
│  Empleado accede AperturaCaja.tsx   │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Formulario con 3 campos:           │
│  ├─ Fondo Inicial (Efectivo)       │
│  ├─ Fondo Inicial (Yape)           │
│  └─ Fondo Inicial (Plin)           │
│                                    │
│  Validaciones:                      │
│  ├─ Montos >= 0                    │
│  ├─ Al menos uno > 0               │
│  └─ Formatos numéricos             │
└────────────┬───────────────────────┘
             │
             │ onClick="guardarApertura"
             │
             ▼
┌────────────────────────────────────┐
│  setCajaAbierta() function:         │
│  ├─ Calcula total_inicial          │
│  ├─ Registro:                      │
│  │  { id, fecha, hora, usuario,    │
│  │    efectivo, yape, plin,        │
│  │    total_inicial }              │
│  │                                 │
│  └─ localStorage.setItem(           │
│       'cajaAbierta',                │
│       JSON.stringify(registro)      │
│     )                              │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Estado Global Actualizado:         │
│  cajaAbierta = true                │
│  ├─ Desbloquea vistas de ventas    │
│  ├─ Permite registrar movimientos  │
│  └─ Dashboard muestra caja abierta │
└────────────────────────────────────┘


### Durante el Día - Cada Transacción
┌────────────────────────────────────┐
│  Venta realizada                    │
│  (desde panel POS/ventas)           │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  addMovimientoCaja() function:      │
│  {                                 │
│    id: nextId++,                   │
│    fecha_hora: now(),              │
│    tipo: 'venta',                  │
│    concepto: 'Venta #123',         │
│    metodo_pago: 'efectivo',        │
│    monto: 45.50,                   │
│    usuario: 'empleado'             │
│  }                                 │
│                                    │
│  localStorage.setItem(              │
│    'movimientos_caja',              │
│    [...movimientos, nuevo]          │
│  )                                 │
└────────────────────────────────────┘

[Repetir para cada transacción del día]


### Cierre de Caja
┌────────────────────────────────────┐
│  Empleado accede CierreCaja.tsx     │
│  (generalmente al final del día)    │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  1. CARGAR DATOS DEL DÍA            │
│  ├─ getMovimientosDelDia()         │
│  ├─ Filtrar movimientos de hoy     │
│  └─ Agrupar por método de pago     │
│                                    │
│  2. CALCULAR TOTALES POR MÉTODO    │
│  ├─ Total Efectivo = SUM(monto     │
│  │   WHERE tipo='efectivo')        │
│  ├─ Total Yape = ...               │
│  └─ Total Plin = ...               │
│                                    │
│  3. MOSTRAR EN FORMULARIO          │
│  ├─ "Dinero en caja teórico"      │
│  │  = inicial + transacciones     │
│  │                                │
│  └─ Campos para "contar físico":   │
│     ├─ ¿Cuánto efectivo físico?    │
│     ├─ ¿Cuánto Yape?               │
│     └─ ¿Cuánto Plin?               │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  4. VALIDACIONES AL CIERRE         │
│  ├─ Montos >= 0                    │
│  ├─ Suma total > 0                 │
│  └─ Campos observaciones rellenos  │
│     si hay diferencia              │
└────────────┬───────────────────────┘
             │
             │ onClick="finalizarCierre"
             │
             ▼
┌────────────────────────────────────┐
│  5. GENERAR REPORTE                │
│  ├─ Comparar teórico vs físico    │
│  ├─ Calcular diferencias:         │
│  │  Diferencia = (Físico - Teórico)│
│  ├─ Si diferencia != 0: ALERT     │
│  └─ Registrar observaciones       │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  6. CERRAR CAJA                    │
│  ├─ cerrarCaja() function:         │
│  │  └─ localStorage.removeItem(    │
│  │      'cajaAbierta'              │
│  │     )                           │
│  │                                 │
│  ├─ limpiarMovimientosDelDia()    │
│  │  └─ localStorage.removeItem(    │
│  │      'movimientos_hoy'          │
│  │     )                           │
│  │                                 │
│  └─ Estado: cajaAbierta = false    │
│                                    │
│  7. GUARDAR CIERRE                 │
│     ├─ getHistorialCierres() (?)   │
│     ├─ Append registro de cierre   │
│     └─ Persist en localStorage     │
└────────────────────────────────────┘

[Caja cerrada correctamente]
```

---

## 5. Mapa de Comunicación Inter-Servicios

```
            Order Service                 Product Service
                  │                             │
                  │                             │
    ┌─────────────┤                             ├─────────────┐
    │ HTTP GET    │                             │             │
    │ /products   ◄─────────────────────────────┤             │
    │             │                             │             │
    │             │                    HTTP GET │             │
    │             │                   /products │             │
    │ HTTP GET    │       Inventory ◄─────────────────────────┤
    │ /check/{id} │       Service │             │             │
    │             │             │               │             │
    │             │             │      HTTP GET │             │
    │             │             │      /categories           │
    │ HTTP POST   │             │               │             │
    │ /reserve    ├────────────►│               │             │
    │             │             │               │             │
    └─────────────┘             │               │             │
                                │               │             │
          Auth Service ◄─────────┼───────────────┼─────────────┘
               │                 │               │
               │      ┌──────────┤               │
               │      │          │               │
               │   POST/login    │    Auth       │
               └─────►│          │    verified   │
                      │          │    for all    │
                      │          │    requests   │
                      └──────────┼───────────────┘

            Email Service
                │
                │ Consumes from RabbitMQ
                │ Event: ordenes.creadas
                │
                ├─ Renderiza email template
                ├─ Envía via SMTP
                └─ Registra en log_notificaciones

            API Gateway
                │
         ┌──────┼──────┬──────┬──────┐
         │      │      │      │      │
     Auth   Product Inventory Order  Email
```

---

## 6. Flujo de Datos en Carrito y Checkout

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND CLIENTE - CARRITO                             │
└─────────────┬───────────────────────────────────────────┘
              │
              ├─► GET /api/v1/categories (con cache)
              │   Retorna: [{ id, nombre }, ...]
              │
              ├─► GET /api/v1/products/available
              │   Retorna: [{ id, nombre, precio, ...}, ...]
              │
              └─► GET /api/v1/products/search?q=donuts
                  Retorna: [productos filtrados]


┌─────────────────────────────────────────────────────────┐
│  ESTADO LOCAL DEL CARRITO (React State)                 │
│  carrito = [                                            │
│    {                                                    │
│      producto_id: 1,                                    │
│      nombre: 'Donut Chocolate',                         │
│      precio_unitario: 2.50,                             │
│      cantidad: 3,                                       │
│      subtotal: 7.50                                     │
│    },                                                   │
│    {                                                    │
│      producto_id: 5,                                    │
│      nombre: 'Café Espresso',                           │
│      precio_unitario: 3.00,                             │
│      cantidad: 2,                                       │
│      subtotal: 6.00                                     │
│    }                                                    │
│  ]                                                      │
│  TOTAL: 13.50                                           │
└─────────────┬───────────────────────────────────────────┘
              │
              │ Cliente hace click: "Ir a Checkout"
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│  FORMULARIO DE CHECKOUT                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Datos del Cliente:                               │  │
│  │ ├─ Email: cliente@email.com                      │  │
│  │ ├─ Teléfono: 987654321                           │  │
│  │ ├─ Nombre: Juan Perez                            │  │
│  │ └─ Dirección: Calle X #123                       │  │
│  │                                                   │  │
│  │ Método de Pago:                                  │  │
│  │ ├─ ○ Efectivo                                    │  │
│  │ ├─ ○ Tarjeta (proximamente)                      │  │
│  │ ├─ ○ Yape                                        │  │
│  │ └─ ○ Plin                                        │  │
│  │                                                   │  │
│  │ Observaciones: _______________________           │  │
│  │                                                   │  │
│  │ Total a Pagar: S/. 13.50                         │  │
│  │                                                   │  │
│  │ [Cancelar] [Confirmar Orden]                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────────────────────────┘
              │
              │ onClick="Confirmar Orden"
              │ Validaciones:
              │ ├─ Email válido
              │ ├─ Teléfono no vacío
              │ ├─ Método pago seleccionado
              │ └─ Carrito no vacío
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│  POST /api/v1/orders                                    │
│  Body:                                                  │
│  {                                                      │
│    "cliente": {                                         │
│      "email": "cliente@email.com",                      │
│      "nombre": "Juan Perez",                            │
│      "telefono": "987654321",                           │
│      "direccion": "Calle X #123"                        │
│    },                                                   │
│    "items": [                                           │
│      { "producto_id": 1, "cantidad": 3 },              │
│      { "producto_id": 5, "cantidad": 2 }               │
│    ],                                                   │
│    "metodo_pago": "efectivo",                           │
│    "observaciones": "..."                               │
│  }                                                      │
└─────────────┬───────────────────────────────────────────┘
              │ (Ver Flujo 3: Creación de Orden)
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│  RESPUESTA 201 CREATED                                  │
│  {                                                      │
│    "venta_id": 567,                                     │
│    "estado": "confirmada",                              │
│    "total": 13.50,                                      │
│    "fecha": "2024-01-15",                               │
│    "detalles": [...],                                   │
│    "url_seguimiento": "/orders/567"                     │
│  }                                                      │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│  FRONTEND - Confirmar y Limpiar                         │
│  ├─ toast.success("¡Orden confirmada!")                │
│  ├─ Guardar venta_id en sessionStorage                 │
│  ├─ Limpiar carrito (carrito = [])                     │
│  ├─ Mostrar comprobante con:                           │
│  │  ├─ ID de orden                                     │
│  │  ├─ Resumen de items                               │
│  │  ├─ Total pagado                                    │
│  │  ├─ Código QR para seguimiento                      │
│  │  └─ Email de confirmación enviado a...              │
│  │                                                     │
│  └─ Botón: "Volver al catálogo" o "Mis Órdenes"       │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Diagrama de Estados - Venta/Orden

```
                    ┌─────────────────────────────────────────┐
                    │  NUEVA ORDEN RECIBIDA                   │
                    │  estado_pedido: 'pendiente'             │
                    └─────────────┬───────────────────────────┘
                                  │
                                  ├─► Verificar disponibilidad
                                  │   en Inventory Service
                                  │
                    ┌─────────────▼───────────────────────────┐
                    │  INVENTARIO NO DISPONIBLE               │
                    │  ❌ Orden CANCELADA                    │
                    │  estado_pedido: 'cancelada'             │
                    │  razón: 'stock_insuficiente'            │
                    └─────────────────────────────────────────┘
                                  │
                                  │ (Si hay stock)
                                  │
                    ┌─────────────▼───────────────────────────┐
                    │  RESERVAR INSUMOS                       │
                    │  estado_pedido: 'confirmada'            │
                    │  Generar factura/recibo                 │
                    └─────────────┬───────────────────────────┘
                                  │
                                  ├─► Email Service:
                                  │   Enviar confirmación
                                  │   al cliente
                                  │
                    ┌─────────────▼───────────────────────────┐
                    │  ESPERANDO PAGO                         │
                    │  estado_pedido: 'en_preparacion'        │
                    └─────────────┬───────────────────────────┘
                                  │
                    ┌─────────────┴───────────────────────────┐
                    │                                         │
                    │                                         │
        ┌───────────▼──────────┐               ┌──────────────▼────────┐
        │ PAGO RECIBIDO        │               │ PAGO NO RECIBIDO      │
        │ estado: 'pagada'     │               │ estado: 'vencida'     │
        │ Registrar en Pagos   │               │ Esperar X horas       │
        │ Actualizar Inventario│               │ Luego: CANCELAR       │
        └───────────┬──────────┘               └─────────────────────┘
                    │
                    ├─► Actualizar LoteInsumo
                    │   (restar cantidad)
                    │
                    ├─► Email Service:
                    │   Enviar recibo/factura
                    │
        ┌───────────▼──────────┐
        │ PREPARACIÓN COMPLETA │
        │ estado: 'lista'      │
        │ ✓ Cliente notificado │
        │ ✓ Factura enviada    │
        │ ✓ Stock actualizado  │
        └──────────────────────┘
```

---

## 8. Flujo de Datos en Tabla de Productos

```
VISTA: Productos (frontend administrativo)

┌─────────────────────────────────────────────────┐
│  Tabla con Productos                            │
│  ┌──────────────┬──────────┬─────────┬──────────┐│
│  │ Nombre       │ Precio   │ Tipo    │ Acciones ││
│  ├──────────────┼──────────┼─────────┼──────────┤│
│  │ Donut Choco  │ S/.2.50  │ Donut   │ ✏️ 🗑️  ││
│  │ Café Latte   │ S/.3.50  │ Café    │ ✏️ 🗑️  ││
│  │ ...          │ ...      │ ...     │ ...     ││
│  └──────────────┴──────────┴─────────┴──────────┘│
│                                                 │
│  [🔍 Buscar] [+ Nuevo Producto]                 │
└─────────────┬───────────────────────────────────┘
              │
              │ Al montar componente:
              │ getProductos() → localStorage
              │
              ├─ Si no hay datos:
              │  └─ Mostrar tabla vacía
              │
              └─ Si hay datos:
                 └─ Renderizar filas


CRUD COMPLETO:

1. CREAR
   └─ Click [+ Nuevo Producto]
      ├─ Abrir Dialog
      ├─ Formulario: nombre, precio, categoría, tipo
      ├─ Validaciones in-line
      ├─ Click [Guardar]
      │  └─ addProducto({ nombre, precio, ... })
      │     ├─ getNextId() → id incremental
      │     ├─ addProducto(...) → localStorage
      │     └─ setProductos([...prev, nuevo])
      ├─ UI actualizado
      └─ toast.success("Producto creado")


2. LEER (Display)
   └─ getProductos()
      ├─ localStorage.getItem('productos')
      ├─ JSON.parse()
      └─ Mostrar en tabla


3. ACTUALIZAR
   └─ Click ✏️ (icono editar)
      ├─ Abrir Dialog con datos precargados
      ├─ Editar campos
      ├─ Click [Guardar]
      │  └─ actualizar en array
      │     ├─ productos[index] = {...editado}
      │     └─ saveProductos(productos)
      └─ localStorage actualizado


4. ELIMINAR
   └─ Click 🗑️ (icono eliminar)
      ├─ Mostrar AlertDialog (confirmación)
      ├─ ¿Estás seguro?
      ├─ Click [Eliminar]
      │  └─ productos = productos.filter(p => p.id !== id)
      │     └─ saveProductos(productos)
      └─ Toast.success("Producto eliminado")


BÚSQUEDA:
   └─ En input: searchTerm = "choco"
      └─ productos.filter(p =>
           p.nombre.toLowerCase().includes(searchTerm)
         )
      └─ Re-render solo coincidencias
```

---

## 9. Estado Global de la Aplicación (Frontend Admin)

```
Context/Redux equivalent (localStorage):

┌─────────────────────────────────────┐
│  APP STATE (localStorage keys)      │
├─────────────────────────────────────┤
│ productos: Producto[]               │
│ categorias: Categoria[]             │
│ promociones: Promocion[]            │
│ usuarios: Usuario[]                 │
│ compras: Compra[]                   │
│ movimientos_caja: Movimiento[]      │
│ cajaAbierta: CajaAbierta | null     │
│ token: string (si conectar a API)  │
│ currentUser: Usuario | null         │
└─────────────────────────────────────┘

Actions que modifican estado:

1. setProductos(productos) → localStorage
2. addProducto(producto) → append
3. setCajaAbierta(caja) → abierta = true
4. cerrarCaja() → abierta = null
5. addMovimientoCaja(mov) → append a array
6. getMovimientosDelDia() → filter por fecha hoy
7. setCurrentUser(user) → estado autenticado
8. logout() → limpia todo
```

---

Este conjunto de diagramas permite visualizar:
- ✅ Cómo interactúan los servicios
- ✅ Flujos completos de datos
- ✅ Estados de transiciones
- ✅ Comunicación HTTP y almacenamiento
- ✅ Responsabilidades de cada componente
