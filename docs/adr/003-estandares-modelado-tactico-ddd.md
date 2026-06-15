# ADR 003: Estándares de Modelado Táctico (DDD)

## Estado
Aceptado

## Contexto
El microservicio de Ventas tiene reglas de negocio críticas (ej. cálculo exacto de vueltos, exclusión de boletas del RUS). Si colocamos estas reglas en los controladores de Laravel o mezcladas con Eloquent, el sistema será inmanejable. Necesitamos definir reglas estrictas sobre cómo programar los componentes de DDD en PHP puro.

## Decisión
Se establecen los siguientes estándares técnicos para programar la capa de Dominio y Aplicación:

1. **Objetos de Valor (Value Objects):** Serán clases de PHP estrictamente **inmutables**. No tendrán métodos "setters". Si un valor debe cambiar (ej. modificar un `Monto`), se debe crear y retornar una nueva instancia. Toda la validación lógica (ej. no permitir montos negativos) debe ir en su constructor.
2. **Entidades y Agregados:** Serán las únicas clases con estado mutable e identidad única (ID). Nunca serán "anémicas"; es decir, sus propiedades serán privadas y solo se modificarán a través de métodos de negocio que representen una acción real (ej. `$venta->aplicarDescuento()`).
3. **Casos de Uso (Application Services):** Actuarán solo como orquestadores. Su única función es recibir datos (DTOs), buscar la entidad en la base de datos, ejecutar la acción en la entidad y guardar los cambios. Tienen **prohibido** contener reglas de negocio ("if/else" para decidir si un descuento es válido).

## Consecuencias
* **Positivo:** Todo el código del negocio será testeable al 100% mediante Pruebas Unitarias ultrarrápidas, sin necesidad de levantar PostgreSQL.
* **Positivo:** Los controladores de Laravel quedarán vacíos y limpios (menos de 10 líneas de código).
* **Negativo:** Requiere escribir más clases pequeñas y específicas en lugar de archivos grandes y centralizados.