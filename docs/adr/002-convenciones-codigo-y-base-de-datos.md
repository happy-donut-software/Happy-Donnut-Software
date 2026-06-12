# ADR 002: Convenciones de Código y Base de Datos (PostgreSQL)

## Estado
Aceptado

## Contexto
El microservicio de Ventas utilizará Laravel (PHP) en el backend y PostgreSQL como motor de base de datos. Laravel asume por defecto que las bases de datos están diseñadas con convenciones en inglés (ej. tablas en plural inglés como `sales`, llaves foráneas como `sale_id`). 

Dado que nuestro equipo adoptó la regla de usar un Lenguaje Ubicuo 100% en español para el dominio (ADR 000), necesitamos establecer un estándar de nomenclatura claro para que los modelos de Eloquent mapeen correctamente las tablas en PostgreSQL sin generar errores. Además, para garantizar la agilidad en el desarrollo del MVP, se requiere un sistema de identificadores eficiente y nativo del framework.

## Decisión
Se establecen las siguientes convenciones obligatorias para la escritura de código y el diseño de la base de datos:

### 1. Convenciones de Base de Datos (PostgreSQL)
* **Tablas:** Se escribirán en español, en plural y utilizando `snake_case` (ej. `ventas`, `detalles_venta`, `promociones`). 
*Nota: En cada modelo de Eloquent será obligatorio especificar explícitamente el nombre de la tabla usando `protected $table = 'nombre_tabla';`.*
* **Columnas y Atributos:** Se escribirán en singular y utilizando `snake_case` (ej. `monto_total`, `fecha_emision`, `metodo_pago`).
* **Llaves Primarias (PK):** Se utilizarán IDs numéricos autoincrementales estándar (`BigInt`). La columna se llamará estrictamente `id`.
* **Llaves Foráneas (FK):** Utilizarán el formato `[entidad_singular]_id` (ej. `cliente_id`, `venta_id`).
* **Soft Deletes (Borrado Lógico):** Los registros no se eliminarán físicamente. Se utilizará la columna estándar de Laravel `deleted_at`, mapeada conceptualmente en el negocio como "fecha de eliminación".

### 2. Convenciones de Código (PHP puro y Laravel)
Se respetarán los estándares PSR-1 y PSR-12 de PHP, adaptados a nuestro Lenguaje Ubicuo:
* **Clases, Interfaces y Traits:** Utilizarán `PascalCase` y estarán en español (ej. `ProcesarPago`, `RepositorioVentas`, `CalculadoraVuelto`).
* **Métodos y Funciones:** Utilizarán `camelCase` describiendo la acción con un verbo (ej. `calcularVuelto()`, `obtenerMontoTotal()`).
* **Variables y Propiedades:** Utilizarán `camelCase` descriptivo (ej. `montoRecibido`, `clienteFrecuente`). No se permiten abreviaturas confusas.
* **Framework vs Dominio:** Las clases nativas del framework, librerías externas o métodos heredados mantendrán su idioma original (ej. `extends Model`, `belongsTo()`, `dispatch()`), pero toda la lógica interna y variables propias serán en español.

## Consecuencias
* **Positivo:** Velocidad máxima de desarrollo, ya que Eloquent funciona de manera nativa y transparente con IDs autoincrementales sin necesidad de configuración extra en los modelos.
* **Positivo:** Estandarización visual y estructural que facilita la lectura del código y reduce la carga cognitiva al cambiar entre la base de datos (snake_case) y el código PHP (camelCase).
* **Positivo:** Depuración rápida; rastrear errores con IDs cortos (ej. Venta 15) es significativamente más eficiente que buscar cadenas complejas.
* **Negativo:** Si en el futuro el sistema evoluciona hacia una sincronización de múltiples bases de datos físicas independientes, existirá el riesgo de colisión de IDs (ej. dos registros con el ID 1).