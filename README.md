# Happy-Donnut-Software
software para la microempresa happy donnut

## 🌳 Convención de Ramas 

Para mantener el repositorio organizado, los nombres de las ramas deben indicar claramente **qué** se está haciendo y **dónde**.

### 1. El Modelo (Sintaxis)

Cada rama nueva debe seguir esta estructura exacta:

`tipo/alcance/accion-descripcion`

* **tipo**: La categoría del trabajo (ver lista abajo).
* **alcance**: El microservicio o carpeta afectada (ej: `auth`, `inventory`, `frontend`).
* **accion-descripcion**: Una descripción breve usando guiones (kebab-case) que empiece preferiblemente con un verbo.

> **Ejemplo real:** `feature/auth/implement-google-login`

### 2. Lista de Tipos de Ramas

Usa estos prefijos para categorizar tus ramas:

| Prefijo | Cuándo usarlo (Propósito) | Ejemplo de Nombre |
| :--- | :--- | :--- |
| **`feature/`** | **Nuevas funcionalidades** o cambios en la lógica de negocio. | `feature/order/create-invoice-pdf` |
| **`fix/`** | **Corrección de errores** (*bugs*) normales. | `fix/frontend/pagination-error` |
| **`hotfix/`** | **Errores críticos** que deben arreglarse urgentemente en producción. | `hotfix/auth/security-patch` |
| **`refactor/`** | **Reorganización de código** o limpieza que no cambia la funcionalidad. | `refactor/product/simplify-db-query` |
| **`chore/`** | **Mantenimiento**, actualizaciones de librerías o configuración. | `chore/docker/update-python-version` |
| **`docs/`** | Cambios exclusivos en **documentación**. | `docs/add-architecture-diagram` |
| **`test/`** | Creación o arreglo de **pruebas** (tests). | `test/inventory/add-stock-unit-tests` |
## 📝 Convención de Commits

Para mantener un historial limpio y generar versiones automáticamente, utilizamos la especificación **Conventional Commits**.

### 1. El Modelo (Sintaxis)

Cada mensaje de commit debe seguir esta estructura exacta:

`tipo(alcance): descripción`

* **tipo**: La clase de cambio que estás haciendo (ver lista abajo).
* **alcance**: (Opcional pero recomendado) El microservicio o módulo afectado (ej: `auth`, `frontend`, `inventory`).
* **descripción**: Un resumen corto y claro de lo que se hizo (en imperativo, ej: "añadir", "corregir", no "añadido" o "corregí").

> **Ejemplo real:** `feat(auth): implementar login con Google`

### 2. Lista de Tipos de Commit

Usa exclusivamente estos tipos para categorizar tus cambios:

| Etiqueta | Nombre Completo | Cuándo usarlo (Propósito) |
| :--- | :--- | :--- |
| **`feat`** | Feature | Cuando añades una **NUEVA funcionalidad** o característica al sistema. |
| **`fix`** | Fix | Cuando **CORRIGES un error** (*bug*) en el código. |
| **`refactor`** | Refactor | Cuando reescribes código para mejorarlo o limpiarlo **sin cambiar su funcionalidad** externa. |
| **`chore`** | Chore | Tareas de **mantenimiento**, configuración, scripts o actualización de dependencias. |
| **`docs`** | Documentation | Cambios que afectan **exclusivamente a la documentación** (README, comentarios). |
| **`test`** | Test | Cuando añades o corriges **pruebas** (unitarias, integración). |
| **`style`** | Style | Cambios de formato (espacios, comas, indentación) que no afectan la lógica del código. |
| **`perf`** | Performance | Cambios dedicados exclusivamente a mejorar el **rendimiento/velocidad**. |
| **`revert`** | Revert | Cuando deshaces (reviertes) un commit anterior. |





## 🚀 Arquitectura y Servicios

## Bases de datos (conexión)

Ya puedes conectarte a las bases de datos desde tu máquina. Configura tu cliente o aplicación con los siguientes datos:

- Host: `localhost`
- Port: `5440`
- User: `admin`
- Pass: `secret`
- Database: `auth_db`

Nota: usamos el puerto `5440` mapeado en el host para el servicio de base de datos. Si otro servicio requiere acceso directo desde tu equipo, usa el puerto correspondiente que aparece en `docker-compose.yml`.

Conexión desde línea de comandos (ejemplos):

- Postgres (si tu contenedor expone un servidor Postgres)(lo de abajo es opcional pueden conectarse como en la imagen que envie al whatsap):

```powershell
# desde cualquier sgbd como pgadmin o dbeaver o en vscode con extensiones 
host = localhost
puerto = depende al servicio(desde 5440 para arriva, esta en el docker-compose los puertos)
database = <nombre-del-servicio>_db -> ej: auth_db(en el docker-compose tambien esta)
            nombres de db: auth_db,product_db,inventory_db,order_db,email_db,apigateway_db
username = admin
password = secret
```

- MySQL/MariaDB (si usas MySQL en su lugar):

```powershell
# desde el host (requiere el cliente mysql instalado)
mysql -h 127.0.0.1 -P 5440 -u admin -psecret auth_db
```

Si prefieres GUI (DBeaver, TablePlus, HeidiSQL): usa `localhost` como host, `5440` como puerto y las credenciales anteriores.

Si necesitas entrar al contenedor de la base de datos para ejecutar comandos internamente:

```powershell
# listar contenedores
docker-compose ps
# abrir shell en el contenedor (reemplaza <db_service> por el nombre, ej. auth_db o postgres)
docker exec -it <db_service> bash
# dentro del contenedor puedes usar psql/mysql según corresponda
```

## Correr los contenedores (rápido)

Para levantar todos los servicios definidos en `docker-compose.yml`:

```powershell
# en la raíz del repositorio
docker-compose up -d --build

# ver estado y puertos mapeados
docker-compose ps

# ver logs de un servicio (reemplaza <service> por el nombre)
docker-compose logs -f <service>

# parar y borrar contenedores
docker-compose down
```

Consejos prácticos:

- esperen a que termine de crear todos los contenedores para que puedan hacer los cambios, al principio demora un huevo.

cat << 'EOF' > API_STANDARDS.md
# 📘 API Reference & Developer Guide (v1)

Este documento define los estándares de comunicación, estructura de respuestas y convenciones para todos los microservicios del proyecto.

## 1. 🌐 Estándares de Comunicación

Todas las interacciones HTTP deben seguir estrictamente estas reglas.

* **Base URL:** `http://gateway:8000/api/v1`
* **Formato de Fecha:** ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)
* **Headers Obligatorios:**

| Header | Valor | Descripción |
| :--- | :--- | :--- |
| `Accept` | `application/json` | Requerido siempre. |
| `Content-Type` | `application/json` | Requerido en POST/PUT/PATCH. |
| `Authorization` | `Bearer <token>` | Requerido en rutas privadas. |

---

## 2. 📦 Estructura de Respuesta (Standard Wrapper)

Para garantizar consistencia en el Frontend, **TODAS** las respuestas (Exitosas o Errores) usan este envoltorio.

### ✅ Respuesta Exitosa (200, 201)
```json
{
  "success": true,
  "message": "Operación realizada correctamente.",
  "data": {
      "id": 105,
      "name": "Laptop Gamer X1",
      "stock": 50
  },
  "meta": {  // Solo presente en listas paginadas
      "current_page": 1,
      "per_page": 15,
      "total": 450,
      "last_page": 30
  }
}

❌ Respuesta de Error (400, 404, 422, 500)
{
  "success": false,
  "message": "Datos de entrada inválidos.",
  "error_code": "VALIDATION_ERROR",
  "errors": {
      "sku": ["El código SKU ya ha sido registrado."],
      "price": ["El precio debe ser mayor a 0."]
  }
}

cat << 'EOF' >> README.md

## 3. 🔍 Query Parameters (Estándar de Filtrado)

Para mantener los endpoints limpios, utilizamos un estándar similar a `JSON:API` para filtrado, ordenamiento y paginación en todas las listas (GET).

| Parámetro | Sintaxis | Ejemplo de Uso | Descripción |
| :--- | :--- | :--- | :--- |
| **Ordenar** | `sort` | `?sort=-price` | Ordenar por precio descendente (`-`). |
| | | `?sort=name` | Ordenar por nombre ascendente. |
| **Filtrar** | `filter` | `?filter[category_id]=5` | Filtrar donde `category_id` sea 5. |
| | | `?filter[active]=true` | Filtrar solo activos. |
| **Página** | `page` | `?page=2` | Ver la página 2 de resultados. |
| **Límite** | `limit` | `?limit=50` | Traer 50 elementos por página. |
| **Relaciones**| `include` | `?include=provider,tags` | Cargar relaciones (Eager Loading) para evitar N+1. |

EOF

cat << 'EOF' >> README.md

## 4. 📦 Inventory Service (Contexto: Productos)

Microservicio encargado de la gestión de catálogo, control de stock y listas de precios.

### 📡 Endpoints Principales

| Verbo | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/inventory/products` | Listar catálogo (admite filtros) | 🌍 Público |
| `GET` | `/inventory/products/{id}` | Ver detalle completo de un producto | 🌍 Público |
| `POST` | `/inventory/products` | Crear nuevo producto | 🔐 Admin |
| `PUT` | `/inventory/products/{id}` | Actualizar información del producto | 🔐 Admin |
| `PATCH`| `/inventory/products/{id}/stock`| Ajuste rápido de inventario | 🔐 Admin/System |
| `DELETE`| `/inventory/products/{id}` | Eliminar producto (Soft Delete) | 🔐 Admin |

---

### 📝 Ejemplos de Uso (Payloads)

#### **1. Crear Nuevo Producto**
> **POST** `/inventory/products`
> Crea el producto en la base de datos central.

**Body (JSON):**
```json
{
  "sku": "LP-GAMER-001",
  "name": "Laptop MSI Raider GE76",
  "description": "Intel i9 12th Gen, 32GB RAM, RTX 4080, 1TB SSD",
  "price": 2400.00,
  "stock": 15,
  "category_id": 3,
  "min_stock_alert": 5,
  "is_active": true
}
cat << 'EOF' >> README.md

## 5. 🚦 Referencia de Códigos HTTP

No adivines qué pasó. Usa esta tabla para saber cómo manejar la respuesta en el Frontend.

| Código | Estado | Significado | Acción sugerida para Frontend |
| :--- | :--- | :--- | :--- |
| **200** | OK | Petición exitosa estándar. | Mostrar los datos de `data`. |
| **201** | Created | Recurso creado exitosamente. | Mostrar mensaje de éxito y limpiar formulario. |
| **204** | No Content | Éxito, pero sin respuesta. | Actualizar la lista local (ej: después de borrar). |
| **400** | Bad Request | Error de sintaxis o lógica del cliente. | Mostrar el mensaje `message` en una alerta. |
| **401** | Unauthorized | Falta Token o Token vencido. | **Redirigir a Login inmediatamente.** |
| **403** | Forbidden | Tienes Token, pero no permisos. | Mostrar "Acceso Denegado". |
| **404** | Not Found | El recurso (ID) no existe. | Redirigir a lista o página 404. |
| **422** | Unprocessable | Error de validación de campos. | Leer objeto `errors` y pintar los inputs en rojo. |
| **500** | Server Error | Error crítico del backend. | Mostrar "Error del sistema, intente más tarde". |

EOF