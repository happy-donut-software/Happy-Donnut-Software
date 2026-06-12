# 📊 TABLA DE ITEMS DE CONFIGURACIÓN (CIs) CON RELACIONES

**Fecha de Elaboración:** 6 de junio de 2026  
**Proyecto:** Happy-Donnut-Software  
**Propósito:** Mapear todos los CIs y sus relaciones bidireccionales

---

## TABLA MAESTRA DE CIs

| ID | Nombre CI | Tipo | Componente | Versión | Puerto | Estado | Propietario | Descripción |
|----|----|----|----|----|----|----|----|---|
| CI-001 | Auth Service | Microservicio Backend | auth_service/ | Laravel 12 | 9001:8000 | Production | Backend Team | Autenticación centralizada, gestión de usuarios (empleados, administrativos, clientes) |
| CI-002 | Product Service | Microservicio Backend | product_service/ | Laravel 12 | 9002:80 | Production | Backend Team | Gestión de catálogo de productos, categorías, promociones |
| CI-003 | Inventory Service | Microservicio Backend | inventory_service/ | Laravel 12 | Internal | Production | Backend Team | Control de inventario, insumos, lotes, recetas |
| CI-004 | Order Service | Microservicio Backend | order_service/ | Laravel 12 | Internal | Production | Backend Team | Gestión de órdenes, ventas, pagos, clientes |
| CI-005 | Email Service | Microservicio Backend | email_service/ | Laravel 12 | Internal | Production | Backend Team | Notificaciones por email, logging de eventos |
| CI-006 | API Gateway | Proxy + Backend | apigateway/ | Laravel 12 + Nginx | 80:80, 8000:8000 | Production | DevOps | Enrutador centralizado, proxy para todos los microservicios |
| CI-007 | Docker Compose | Orquestación | docker-compose.yml | v3.8 | N/A | Production | DevOps | Composición de contenedores, definición de servicios |
| CI-008 | PostgreSQL Cluster | Base de Datos | DB Containers | 16-Alpine | 5440-5445 | Production | DBA | Cluster de 6 instancias PostgreSQL (1 por servicio) |
| CI-009 | DB Auth | Base de Datos | db-auth/ | PostgreSQL 16 | 5440:5432 | Production | DBA | Base de datos de autenticación y usuarios |
| CI-010 | DB Product | Base de Datos | db-product/ | PostgreSQL 16 | 5441:5432 | Production | DBA | Base de datos de productos, categorías, promociones |
| CI-011 | DB Inventory | Base de Datos | db-inventory/ | PostgreSQL 16 | 5442:5432 | Production | DBA | Base de datos de insumos, lotes, recetas, ajustes |
| CI-012 | DB Order | Base de Datos | db-order/ | PostgreSQL 16 | 5443:5432 | Production | DBA | Base de datos de ventas, órdenes, clientes, pagos |
| CI-013 | DB Email | Base de Datos | db-email/ | PostgreSQL 16 | 5444:5432 | Production | DBA | Base de datos de logs de notificaciones |
| CI-014 | DB API Gateway | Base de Datos | db-apigateway/ | PostgreSQL 16 | 5445:5432 | Production | DBA | Base de datos del API Gateway (usuarios sincronizados, notas) |
| CI-015 | Frontend Administrativo | Frontend | frontend-administrativo/ | React 19 + TypeScript | Browser | Development | Frontend Team | Dashboard administrativo, gestión de productos/inventario/órdenes |
| CI-016 | Frontend Clientes | Frontend | frontend-clientes/ | React 19 + React Router | Browser | Development | Frontend Team | Portal de compra de clientes, catálogo, carrito, mis órdenes |
| CI-017 | Environment Config | Configuración | .env | - | N/A | Production | DevOps | Variables de entorno globales (credenciales, puertos, etc.) |
| CI-018 | Nginx Config | Configuración | nginx.conf | 1.25-Alpine | 80 | Production | DevOps | Configuración de proxy Nginx para API Gateway |
| CI-019 | RabbitMQ | Message Broker | rabbitmq/ | 3-management | 5672, 15672 | Production | DevOps | Queue manager, event bus para comunicación asincrónica |
| CI-020 | Dockerfile Auth | Configuración | auth_service/Dockerfile | - | - | Production | DevOps | Imagen Docker para Auth Service |
| CI-021 | Dockerfile Product | Configuración | product_service/Dockerfile | - | - | Production | DevOps | Imagen Docker para Product Service |
| CI-022 | Dockerfile Inventory | Configuración | inventory_service/Dockerfile | - | - | Production | DevOps | Imagen Docker para Inventory Service |
| CI-023 | Dockerfile Order | Configuración | order_service/Dockerfile | - | - | Production | DevOps | Imagen Docker para Order Service |
| CI-024 | Dockerfile Email | Configuración | email_service/Dockerfile | - | - | Production | DevOps | Imagen Docker para Email Service |
| CI-025 | Dockerfile API Gateway | Configuración | apigateway/Dockerfile | - | - | Production | DevOps | Imagen Docker para API Gateway |
| CI-026 | Entrypoint Script Auth | Script | auth_service/entrypoint.sh | Bash | - | Production | DevOps | Script de inicio para Auth Service |
| CI-027 | Entrypoint Script Product | Script | product_service/entrypoint.sh | Bash | - | Production | DevOps | Script de inicio para Product Service |
| CI-028 | Entrypoint Script Inventory | Script | inventory_service/entrypoint.sh | Bash | - | Production | DevOps | Script de inicio para Inventory Service |
| CI-029 | Entrypoint Script Order | Script | order_service/entrypoint.sh | Bash | - | Production | DevOps | Script de inicio para Order Service |
| CI-030 | Entrypoint Script Email | Script | email_service/entrypoint.sh | Bash | - | Production | DevOps | Script de inicio para Email Service |
| CI-031 | Entrypoint Script API Gateway | Script | apigateway/entrypoint.sh | Bash | - | Production | DevOps | Script de inicio para API Gateway |
| CI-032 | Composer.json Auth | Dependencias | auth_service/composer.json | - | - | Production | Backend Team | Dependencias PHP para Auth Service |
| CI-033 | Composer.json Product | Dependencias | product_service/composer.json | - | - | Production | Backend Team | Dependencias PHP para Product Service |
| CI-034 | Composer.json Inventory | Dependencias | inventory_service/composer.json | - | - | Production | Backend Team | Dependencias PHP para Inventory Service |
| CI-035 | Composer.json Order | Dependencias | order_service/composer.json | - | - | Production | Backend Team | Dependencias PHP para Order Service |
| CI-036 | Composer.json Email | Dependencias | email_service/composer.json | - | - | Production | Backend Team | Dependencias PHP para Email Service |
| CI-037 | Composer.json API Gateway | Dependencias | apigateway/composer.json | - | - | Production | Backend Team | Dependencias PHP para API Gateway |
| CI-038 | Package.json Auth | Dependencias | auth_service/package.json | - | - | Production | Frontend/Node Team | Dependencias Node.js para Auth Service |
| CI-039 | Package.json Product | Dependencias | product_service/package.json | - | - | Production | Frontend/Node Team | Dependencias Node.js para Product Service |
| CI-040 | Package.json Inventory | Dependencias | inventory_service/package.json | - | - | Production | Frontend/Node Team | Dependencias Node.js para Inventory Service |
| CI-041 | Package.json Order | Dependencias | order_service/package.json | - | - | Production | Frontend/Node Team | Dependencias Node.js para Order Service |
| CI-042 | Package.json Email | Dependencias | email_service/package.json | - | - | Production | Frontend/Node Team | Dependencias Node.js para Email Service |
| CI-043 | Package.json API Gateway | Dependencias | apigateway/package.json | - | - | Production | Frontend/Node Team | Dependencias Node.js para API Gateway |
| CI-044 | Package.json Frontend Admin | Dependencias | frontend-administrativo/package.json | - | - | Development | Frontend Team | Dependencias Node.js para Frontend Administrativo (React, Radix UI, Recharts, etc.) |
| CI-045 | Package.json Frontend Clientes | Dependencias | frontend-clientes/package.json | - | - | Development | Frontend Team | Dependencias Node.js para Frontend Clientes (React, React Router, etc.) |
| CI-046 | Nginx Config Product Service | Configuración | product-service-nginx.conf | - | - | Production | DevOps | Configuración de proxy Nginx para Product Service |
| CI-047 | Routes Auth | Configuración | auth_service/routes/api.php | Laravel 12 | - | Production | Backend Team | Definición de rutas API para Auth Service |
| CI-048 | Routes Product | Configuración | product_service/routes/api.php | Laravel 12 | - | Production | Backend Team | Definición de rutas API para Product Service |
| CI-049 | Routes Inventory | Configuración | inventory_service/routes/api.php | Laravel 12 | - | Production | Backend Team | Definición de rutas API para Inventory Service |
| CI-050 | Routes Order | Configuración | order_service/routes/api.php | Laravel 12 | - | Production | Backend Team | Definición de rutas API para Order Service |
| CI-051 | Routes Email | Configuración | email_service/routes/api.php | Laravel 12 | - | Production | Backend Team | Definición de rutas API para Email Service |
| CI-052 | Routes API Gateway | Configuración | apigateway/routes/api.php | Laravel 12 | - | Production | Backend Team | Definición de rutas API para API Gateway |

---

## MATRIZ DE DEPENDENCIAS (DEPENDE DE)

| CI | Depende De | Tipo de Dep. | Relación | Crítica | Notas |
|---|---|---|---|---|---|
| CI-001 (Auth) | CI-009 | BD | 1:1 | ✅ | Auth Service requiere DB Auth para funcionar |
| CI-001 (Auth) | CI-017 | Config | N:1 | ✅ | Hereda credenciales de .env |
| CI-001 (Auth) | CI-007 | Orquestación | N:1 | ✅ | Docker Compose define el contenedor |
| CI-001 (Auth) | CI-020 | Build | 1:1 | ✅ | Dockerfile define la imagen |
| CI-001 (Auth) | CI-026 | Script | 1:1 | ✅ | Entrypoint ejecuta el servicio |
| CI-001 (Auth) | CI-032 | Dependencias | 1:1 | ✅ | Composer instala librerías PHP |
| CI-001 (Auth) | CI-038 | Dependencias | 1:1 | ✅ | NPM instala herramientas frontend |
| CI-001 (Auth) | CI-047 | Config | 1:1 | ✅ | Rutas define los endpoints |
| **CI-002 (Product)** | CI-010 | BD | 1:1 | ✅ | Product Service requiere DB Product |
| CI-002 (Product) | CI-017 | Config | N:1 | ✅ | Hereda credenciales de .env |
| CI-002 (Product) | CI-007 | Orquestación | N:1 | ✅ | Docker Compose define el contenedor |
| CI-002 (Product) | CI-021 | Build | 1:1 | ✅ | Dockerfile define la imagen |
| CI-002 (Product) | CI-027 | Script | 1:1 | ✅ | Entrypoint ejecuta el servicio |
| CI-002 (Product) | CI-033 | Dependencias | 1:1 | ✅ | Composer instala librerías PHP |
| CI-002 (Product) | CI-039 | Dependencias | 1:1 | ✅ | NPM instala herramientas frontend |
| CI-002 (Product) | CI-048 | Config | 1:1 | ✅ | Rutas define los endpoints |
| CI-002 (Product) | CI-018 | Proxy | N:1 | ⚠️ | Nginx enruta peticiones hacia Product Service |
| CI-002 (Product) | CI-046 | Proxy Config | 1:1 | ⚠️ | Nginx Config Product define upstream |
| **CI-003 (Inventory)** | CI-011 | BD | 1:1 | ✅ | Inventory Service requiere DB Inventory |
| CI-003 (Inventory) | CI-017 | Config | N:1 | ✅ | Hereda credenciales de .env |
| CI-003 (Inventory) | CI-007 | Orquestación | N:1 | ✅ | Docker Compose define el contenedor |
| CI-003 (Inventory) | CI-022 | Build | 1:1 | ✅ | Dockerfile define la imagen |
| CI-003 (Inventory) | CI-028 | Script | 1:1 | ✅ | Entrypoint ejecuta el servicio |
| CI-003 (Inventory) | CI-034 | Dependencias | 1:1 | ✅ | Composer instala librerías PHP |
| CI-003 (Inventory) | CI-040 | Dependencias | 1:1 | ✅ | NPM instala herramientas frontend |
| CI-003 (Inventory) | CI-049 | Config | 1:1 | ✅ | Rutas define los endpoints |
| **CI-004 (Order)** | CI-012 | BD | 1:1 | ✅ | Order Service requiere DB Order |
| CI-004 (Order) | CI-017 | Config | N:1 | ✅ | Hereda credenciales de .env |
| CI-004 (Order) | CI-007 | Orquestación | N:1 | ✅ | Docker Compose define el contenedor |
| CI-004 (Order) | CI-023 | Build | 1:1 | ✅ | Dockerfile define la imagen |
| CI-004 (Order) | CI-029 | Script | 1:1 | ✅ | Entrypoint ejecuta el servicio |
| CI-004 (Order) | CI-035 | Dependencias | 1:1 | ✅ | Composer instala librerías PHP |
| CI-004 (Order) | CI-041 | Dependencias | 1:1 | ✅ | NPM instala herramientas frontend |
| CI-004 (Order) | CI-050 | Config | 1:1 | ✅ | Rutas define los endpoints |
| CI-004 (Order) | **CI-002** | Llamada HTTP | N:1 | ⚠️ | Consulta productos disponibles a Product Service |
| CI-004 (Order) | **CI-003** | Llamada HTTP | N:1 | ⚠️ | Verifica disponibilidad de insumos en Inventory Service |
| CI-004 (Order) | CI-019 | Queue | 1:1 | ⚠️ | Publica eventos order.created, order.completed |
| **CI-005 (Email)** | CI-013 | BD | 1:1 | ✅ | Email Service requiere DB Email |
| CI-005 (Email) | CI-017 | Config | N:1 | ✅ | Hereda credenciales de .env |
| CI-005 (Email) | CI-007 | Orquestación | N:1 | ✅ | Docker Compose define el contenedor |
| CI-005 (Email) | CI-024 | Build | 1:1 | ✅ | Dockerfile define la imagen |
| CI-005 (Email) | CI-030 | Script | 1:1 | ✅ | Entrypoint ejecuta el servicio |
| CI-005 (Email) | CI-036 | Dependencias | 1:1 | ✅ | Composer instala librerías PHP |
| CI-005 (Email) | CI-042 | Dependencias | 1:1 | ✅ | NPM instala herramientas frontend |
| CI-005 (Email) | CI-051 | Config | 1:1 | ✅ | Rutas define los endpoints |
| CI-005 (Email) | CI-019 | Queue | 1:1 | ✅ | Consume eventos (order.created, user.registered, etc.) |
| **CI-006 (API Gateway)** | CI-014 | BD | 1:1 | ✅ | API Gateway requiere DB API Gateway |
| CI-006 (API Gateway) | CI-017 | Config | N:1 | ✅ | Hereda credenciales de .env |
| CI-006 (API Gateway) | CI-007 | Orquestación | N:1 | ✅ | Docker Compose define el contenedor |
| CI-006 (API Gateway) | CI-025 | Build | 1:1 | ✅ | Dockerfile define la imagen |
| CI-006 (API Gateway) | CI-031 | Script | 1:1 | ✅ | Entrypoint ejecuta el servicio |
| CI-006 (API Gateway) | CI-037 | Dependencias | 1:1 | ✅ | Composer instala librerías PHP |
| CI-006 (API Gateway) | CI-043 | Dependencias | 1:1 | ✅ | NPM instala herramientas frontend |
| CI-006 (API Gateway) | CI-052 | Config | 1:1 | ✅ | Rutas define los endpoints proxy |
| CI-006 (API Gateway) | CI-018 | Proxy Config | 1:1 | ✅ | Nginx enruta peticiones |
| CI-006 (API Gateway) | **CI-001** | Llamada HTTP | N:1 | ✅ | Proxy hacia Auth Service (/auth/*) |
| CI-006 (API Gateway) | **CI-002** | Llamada HTTP | N:1 | ✅ | Proxy hacia Product Service (/api/v1/products*) |
| CI-006 (API Gateway) | **CI-003** | Llamada HTTP | N:1 | ✅ | Proxy hacia Inventory Service (/api/v1/inventory*) |
| CI-006 (API Gateway) | **CI-004** | Llamada HTTP | N:1 | ✅ | Proxy hacia Order Service (/api/v1/orders*) |
| CI-006 (API Gateway) | **CI-005** | Llamada HTTP | N:1 | ✅ | Proxy hacia Email Service (/api/v1/emails*) |
| **CI-007 (Compose)** | CI-017 | Config | 1:1 | ✅ | Lee variables de .env |
| CI-007 (Compose) | CI-020-031 | Build | N:N | ✅ | Usa Dockerfiles para construir imágenes |
| **CI-008 (PgSQL)** | CI-007 | Orquestación | N:1 | ✅ | Docker Compose define los contenedores |
| CI-008 (PgSQL) | CI-017 | Config | 1:1 | ✅ | Hereda credenciales de .env |
| **CI-009-014 (DBs)** | CI-007 | Orquestación | N:1 | ✅ | Docker Compose define cada contenedor |
| CI-009-014 (DBs) | CI-017 | Config | 1:1 | ✅ | Hereda credenciales de .env |
| **CI-015 (Frontend Admin)** | **CI-006** | HTTP API | N:1 | ✅ | Consume endpoints de API Gateway |
| CI-015 (Frontend Admin) | **CI-001** | HTTP API (via CI-006) | N:1 | ✅ | Accede a Auth Service vía Gateway |
| CI-015 (Frontend Admin) | **CI-002** | HTTP API (via CI-006) | N:1 | ✅ | Accede a Product Service vía Gateway |
| CI-015 (Frontend Admin) | **CI-003** | HTTP API (via CI-006) | N:1 | ✅ | Accede a Inventory Service vía Gateway |
| CI-015 (Frontend Admin) | **CI-004** | HTTP API (via CI-006) | N:1 | ✅ | Accede a Order Service vía Gateway |
| CI-015 (Frontend Admin) | CI-044 | Dependencias | 1:1 | ✅ | NPM instala librerías React |
| **CI-016 (Frontend Clientes)** | **CI-006** | HTTP API | N:1 | ✅ | Consume endpoints públicos de API Gateway |
| CI-016 (Frontend Clientes) | **CI-001** | HTTP API (via CI-006) | N:1 | ✅ | Accede a Auth Service vía Gateway (login/register) |
| CI-016 (Frontend Clientes) | **CI-002** | HTTP API (via CI-006) | N:1 | ✅ | Accede a Product Service vía Gateway (catálogo) |
| CI-016 (Frontend Clientes) | **CI-004** | HTTP API (via CI-006) | N:1 | ✅ | Accede a Order Service vía Gateway (crear/consultar órdenes) |
| CI-016 (Frontend Clientes) | CI-045 | Dependencias | 1:1 | ✅ | NPM instala librerías React |
| **CI-018 (Nginx Config)** | CI-006 | Archivo de conf. | 1:1 | ✅ | Usado por API Gateway container |
| CI-018 (Nginx Config) | CI-046 | Subreference | 1:1 | ⚠️ | Incluye configuración de Product Service |
| CI-018 (Nginx Config) | **CI-001-005** | Definición upstreams | N:N | ✅ | Define upstreams para todos los servicios |
| **CI-019 (RabbitMQ)** | CI-007 | Orquestación | 1:1 | ✅ | Docker Compose define el contenedor |
| CI-019 (RabbitMQ) | CI-017 | Config | 1:1 | ✅ | Hereda credenciales de .env |
| CI-019 (RabbitMQ) | **CI-004** | Event Pub/Sub | N:1 | ⚠️ | Order Service publica eventos |
| CI-019 (RabbitMQ) | **CI-005** | Event Pub/Sub | N:1 | ✅ | Email Service consume eventos |

---

## MATRIZ DE COMPONENTES CONSUMIDOS (ES CONSUMIDO POR)

| CI | Es Consumido Por | Tipo de Consumo | Relación | Frecuencia | Notas |
|---|---|---|---|---|---|
| **CI-001 (Auth)** | CI-006 | HTTP Proxy | 1:N | Alta | Login, Register, validación de tokens |
| CI-001 (Auth) | CI-015 | HTTP (via Gateway) | N:1 | Media | Autenticación de administradores |
| CI-001 (Auth) | CI-016 | HTTP (via Gateway) | N:1 | Media | Registro y login de clientes |
| **CI-002 (Product)** | CI-006 | HTTP Proxy | 1:N | Muy Alta | Catálogo público, CRUD administrativo |
| CI-002 (Product) | CI-004 | HTTP Request | N:1 | Alta | Consulta de productos en creación de órdenes |
| CI-002 (Product) | CI-015 | HTTP (via Gateway) | N:1 | Muy Alta | Gestión de productos en admin |
| CI-002 (Product) | CI-016 | HTTP (via Gateway) | N:1 | Muy Alta | Catálogo para clientes |
| **CI-003 (Inventory)** | CI-006 | HTTP Proxy | 1:N | Alta | Consultas de inventario, CRUD de insumos |
| CI-003 (Inventory) | CI-004 | HTTP Request | N:1 | Alta | Verificación y reserva de insumos |
| CI-003 (Inventory) | CI-015 | HTTP (via Gateway) | N:1 | Alta | Gestión de inventario en admin |
| **CI-004 (Order)** | CI-006 | HTTP Proxy | 1:N | Alta | CRUD de órdenes, proxy de pagos |
| CI-004 (Order) | CI-015 | HTTP (via Gateway) | N:1 | Alta | Gestión de ventas en admin |
| CI-004 (Order) | CI-016 | HTTP (via Gateway) | N:1 | Muy Alta | Crear órdenes y consultar mis órdenes |
| CI-004 (Order) | **CI-005** (indirecto) | Event RabbitMQ | 1:N | Alta | Publica order.created → Email consume |
| **CI-005 (Email)** | CI-019 | Consume Eventos | N:1 | Alta | Suscrito a: order.created, user.registered, etc. |
| **CI-006 (API Gateway)** | CI-015 | HTTP Request | N:1 | Muy Alta | Dashboard admin consume todos los endpoints |
| CI-006 (API Gateway) | CI-016 | HTTP Request | N:1 | Muy Alta | Clientes consumen endpoints de catálogo y órdenes |
| **CI-009-014 (DBs)** | CI-001 | Query/Write | N:1 | Muy Alta | Auth Service lee/escribe en DB Auth |
| CI-009-014 (DBs) | CI-002 | Query/Write | N:1 | Muy Alta | Product Service lee/escribe en DB Product |
| CI-009-014 (DBs) | CI-003 | Query/Write | N:1 | Muy Alta | Inventory Service lee/escribe en DB Inventory |
| CI-009-014 (DBs) | CI-004 | Query/Write | N:1 | Muy Alta | Order Service lee/escribe en DB Order |
| CI-009-014 (DBs) | CI-005 | Query/Write | N:1 | Muy Alta | Email Service lee/escribe en DB Email |
| CI-009-014 (DBs) | CI-006 | Query/Write | N:1 | Media | API Gateway lee/escribe en DB API Gateway |
| **CI-017 (.env)** | CI-007 | Lectura config | 1:N | Crítica | Docker Compose lee credenciales |
| CI-017 (.env) | CI-001-005 | Env vars | N:N | Crítica | Todos los servicios heredan variables |
| **CI-018 (Nginx)** | CI-006 | Config file | 1:1 | Crítica | API Gateway lo usa para enrutamiento |
| **CI-019 (RabbitMQ)** | CI-004 | Productor eventos | 1:N | Alta | Order Service publica eventos |
| CI-019 (RabbitMQ) | CI-005 | Consumidor eventos | N:1 | Alta | Email Service consume eventos |
| **CI-020-031 (Dockerfiles)** | CI-007 | Build source | N:1 | Crítica | Docker Compose los usa para construir imágenes |
| **CI-032-037 (composer.json)** | CI-020-025 | Instalación deps | N:1 | Crítica | Los Dockerfiles ejecutan composer install |
| **CI-038-043 (package.json)** | CI-020-025 | Instalación deps | N:1 | Crítica | Los Dockerfiles ejecutan npm install |
| **CI-044 (pkg.json Admin)** | CI-015 | Instalación deps | 1:1 | Crítica | NPM instala dependencias del frontend |
| **CI-045 (pkg.json Clientes)** | CI-016 | Instalación deps | 1:1 | Crítica | NPM instala dependencias del frontend |
| **CI-047-052 (Routes)** | CI-001-006 | Definición endpoints | 1:1 | Crítica | Define todos los endpoints disponibles |

---

## FLUJOS DE COMUNICACIÓN CRÍTICOS

### 1. Flujo de Autenticación

```
Inicio: Cliente intenta login
CI-016 (Frontend Clientes) 
    ↓ POST /auth/login
CI-006 (API Gateway)
    ↓ Proxy HTTP POST
CI-001 (Auth Service)
    ↓ Verifica credenciales
CI-009 (DB Auth)
    ↓ Query: SELECT usuario WHERE username=?
CI-001 (Auth Service)
    ↓ Genera token Sanctum
CI-006 (API Gateway)
    ↓ Retorna { token }
CI-016 (Frontend Clientes)
    ↓ Almacena token en localStorage
Fin: Cliente autenticado
```

**CIs Involucrados:** CI-001, CI-006, CI-009, CI-016, CI-017, CI-047
**Estado crítico:** ✅ Crítico
**Punto de fallo:** Si CI-009 cae, no hay autenticación

---

### 2. Flujo de Consulta de Catálogo (Público)

```
Inicio: Cliente abre página de productos
CI-016 (Frontend Clientes)
    ↓ GET /api/v1/products/available (sin token)
CI-006 (API Gateway)
    ↓ Nginx enruta según CI-018
    ↓ HTTP GET http://product-service-nginx/api/v1/products/available
CI-002 (Product Service)
    ↓ ProductController::getAvailable()
    ↓ Query: SELECT * FROM productos WHERE activo_web=true
CI-010 (DB Product)
    ↓ Retorna [] productos
CI-002 (Product Service)
    ↓ Retorna JSON con 200 OK
CI-006 (API Gateway)
    ↓ Retorna JSON al cliente
CI-016 (Frontend Clientes)
    ↓ Renderiza grid de productos
Fin: Usuario ve catálogo
```

**CIs Involucrados:** CI-002, CI-006, CI-010, CI-016, CI-018, CI-048
**Estado crítico:** ✅ Crítico
**Punto de fallo:** Si CI-010 cae, no hay catálogo

---

### 3. Flujo de Creación de Orden (Con Validaciones)

```
Inicio: Cliente realiza checkout
CI-016 (Frontend Clientes)
    ↓ POST /api/v1/orders (Bearer token)
    ├─ Body: { producto_id, cantidad }

CI-006 (API Gateway)
    ├─ Valida token (Sanctum)
    ├─ Nginx enruta según CI-018
    └─ HTTP POST http://order-service:8003/api/v1/orders

CI-004 (Order Service)
    ├─1. OrderController::store()
    │   └─ HTTP GET http://product-service-nginx/api/v1/products/{id}
    │
    ├─ 2. CI-002 (Product Service)
    │   └─ ProductController::show()
    │   └─ Valida que producto existe y está activo
    │   └─ Retorna { producto_id, precio, stock }
    │
    ├─ 3. Recibe respuesta de CI-002
    │   └─ Si FALLA → Retorna error 404 → Fin
    │
    ├─ 4. HTTP GET http://inventory-service:8002/api/v1/inventory/check/{id}/{qty}
    │   └─ InventoryController::checkAvailability()
    │   └─ Query receta: SELECT * FROM recetas WHERE producto_id=?
    │   └─ Query lotes: SELECT * FROM lote_insumo WHERE insumo_id=? AND cantidad >= needed
    │   └─ Calcula: disponible = lote.cantidad ÷ receta.cantidad_necesaria
    │   └─ Retorna { available: true/false }
    │
    ├─ 5. Recibe respuesta de CI-003
    │   └─ Si available=false → Retorna error 400 → Fin
    │
    ├─ 6. Inicia TRANSACCIÓN en CI-012 (DB Order)
    │   ├─ INSERT INTO ventas (cliente_id, total, estado) VALUES (...)
    │   ├─ INSERT INTO detalles_venta (venta_id, producto_id, precio, cantidad) VALUES (...)
    │   └─ Retorna venta_id
    │
    ├─ 7. HTTP POST http://inventory-service:8002/api/v1/inventory/reserve
    │   ├─ Body: { producto_id, cantidad, venta_id }
    │   └─ Inicia TRANSACCIÓN en CI-011 (DB Inventory)
    │   ├─ UPDATE lote_insumo SET cantidad = cantidad - {needed}
    │   └─ INSERT INTO reservas (venta_id, insumo_id, cantidad_reservada)
    │
    ├─ 8. Si falla reserva → Rollback en CI-012 → Retorna error 500
    │
    └─ 9. Si todo OK → Publica evento en CI-019
        ├─ event: order.created
        ├─ data: { venta_id, cliente_id, items }
        └─ RabbitMQ enruta a CI-005

CI-005 (Email Service)
    ├─ Consumidor de eventos RabbitMQ
    ├─ Recibe: order.created
    ├─ Query en CI-012: SELECT * FROM ventas WHERE venta_id=?
    ├─ Query en CI-009: SELECT email FROM usuarios WHERE usuario_id=? (cliente)
    ├─ Genera: Email HTML con detalles de orden
    ├─ INSERT INTO log_notificaciones (destinatario, asunto, tipo, estado, fecha_envio)
    └─ Envía: Email SMTP al cliente

Fin: Orden creada + Insumos reservados + Email enviado
```

**CIs Involucrados:** CI-001 (token), CI-002, CI-003, CI-004, CI-005, CI-006, CI-009, CI-010, CI-011, CI-012, CI-016, CI-018, CI-019, CI-047, CI-050, CI-052
**Estado crítico:** ✅ Crítico (múltiples dependencias)
**Puntos de fallo:**
- Si CI-012 cae: Órdenes no se crean
- Si CI-011 cae: Stock no se reserva (problema de consistencia)
- Si CI-019 cae: Emails no se envían pero orden se crea (aceptable)

---

## MATRIZ DE IMPACTO DE FALLO

| CI | Impacto en CI-001 | Impacto en CI-002 | Impacto en CI-003 | Impacto en CI-004 | Impacto en CI-005 | Impacto Global |
|---|---|---|---|---|---|---|
| **CI-007 (Compose)** | 🔴 Falla | 🔴 Falla | 🔴 Falla | 🔴 Falla | 🔴 Falla | CRÍTICO - Todo cae |
| **CI-009 (DB Auth)** | 🔴 Falla | ❌ Nada | ❌ Nada | ❌ Nada | ❌ Nada | CRÍTICO - Sin autenticación |
| **CI-010 (DB Prod)** | ❌ Nada | 🔴 Falla | ❌ Nada | 🟡 Falla parcial | ❌ Nada | CRÍTICO - Sin productos |
| **CI-011 (DB Inv)** | ❌ Nada | ❌ Nada | 🔴 Falla | 🔴 Falla | ❌ Nada | CRÍTICO - Sin inventario |
| **CI-012 (DB Ord)** | ❌ Nada | ❌ Nada | ❌ Nada | 🔴 Falla | ❌ Nada | CRÍTICO - Sin órdenes |
| **CI-013 (DB Email)** | ❌ Nada | ❌ Nada | ❌ Nada | ❌ Nada | 🔴 Falla | CRÍTICO - Sin logs email |
| **CI-014 (DB GW)** | ❌ Nada | ❌ Nada | ❌ Nada | ❌ Nada | ❌ Nada | MODERADO - Sin usuarios GW |
| **CI-006 (API GW)** | 🟡 Lento | 🟡 Lento | 🟡 Lento | 🟡 Lento | 🟡 Lento | CRÍTICO - Interfaz caída |
| **CI-018 (Nginx)** | 🟡 Lento | 🟡 Lento | 🟡 Lento | 🟡 Lento | 🟡 Lento | CRÍTICO - Enrutamiento falla |
| **CI-019 (RabbitMQ)** | ❌ Nada | ❌ Nada | ❌ Nada | 🟡 Órdenes sin email | 🔴 Falla | MODERADO - Sin emails |
| **CI-017 (.env)** | 🔴 Falla | 🔴 Falla | 🔴 Falla | 🔴 Falla | 🔴 Falla | CRÍTICO - Startup falla |

Leyenda:
- 🔴 = Falla completa / Servicio inoperable
- 🟡 = Funcionamiento degradado / Intermitente
- ❌ = Sin impacto directo

---

## RECOMENDACIONES

### Alta Disponibilidad

1. **Backup de Bases de Datos:** Implementar snapshots diarios de CI-009 a CI-014
2. **Réplicas de BD:** Configurar PostgreSQL replication para redundancia
3. **Load Balancing:** Agregar load balancer frente a CI-006
4. **RabbitMQ Cluster:** Cambiar CI-019 a cluster (3+ nodos)
5. **Health Checks:** Mejorar healthchecks en CI-007 (docker-compose.yml)

### Monitoreo

1. Monitorear puerto 5672 (RabbitMQ) - Critical
2. Monitorear puertos 5440-5445 (Bases de datos) - Critical
3. Monitorear puerto 80 (Nginx/API Gateway) - Critical
4. Alertas si algún servicio falla healthcheck

### Seguridad

1. Cambiar credenciales RabbitMQ (CI-019) de default (guest/guest)
2. Cambiar credenciales PostgreSQL (CI-017) en producción
3. Implementar API rate limiting en CI-006
4. Validar tokens JWT/Sanctum en CI-006

