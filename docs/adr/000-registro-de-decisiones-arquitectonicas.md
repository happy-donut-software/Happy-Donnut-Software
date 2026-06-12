# ADR 000: Estándar para el Registro de Decisiones Arquitectónicas (ADRs)

## Estado (propuesto|aceptado|rechazado|superado)
Aceptado

## Contexto
El desarrollo del sistema para Happy Donut implica una transición hacia una arquitectura de microservicios utilizando Domain-Driven Design (DDD) y Arquitectura Hexagonal. Con múltiples desarrolladores trabajando en diferentes áreas (Ventas, Inventario, Tienda Virtual, Finanzas, y Usuarios y Promociones) y tecnologías (Laravel, PostgreSQL, RabbitMQ, React), necesitamos una forma ágil y estandarizada de documentar las decisiones técnicas y de diseño.

Documentar mediante diagramas pesados es ineficiente y difícil de mantener. Sin embargo, no documentar el "por qué" detrás de una decisión genera confusión técnica a largo plazo y debates repetitivos en los Pull Requests.

## Decisión
Adoptaremos el uso de Architecture Decision Records (ADRs) basados en la plantilla simplificada de Michael Nygard para documentar cualquier decisión que impacte la estructura, patrones, tecnologías o flujos del proyecto.

Se establecen las siguientes reglas obligatorias para la creación y gestión de ADRs:

1. **Ubicación y Nomenclatura:** Todos los ADRs se guardarán en la carpeta `docs/adr/` del repositorio principal. El formato del archivo será Markdown y su nombre seguirá el patrón `[Numero Secuencial de 3 digitos]-[titulo-kebab-case].md` (ejemplo: `001-estructura-directorios-hexagonal.md`).
2. **Idioma Estricto:** El contenido del ADR debe redactarse en español. Para los conceptos del dominio de negocio (Bounded Contexts), está estrictamente prohibido el uso de términos en inglés, respetando el Lenguaje Ubicuo (ej. se usará "Ventas", no "Sales").
3. **Estructura Interna:** Cada documento debe contener obligatoriamente las secciones: Título, Estado (Propuesto, Aceptado, Rechazado, Superado), Contexto, Decisión y Consecuencias.
4. **Ciclo de Aprobación:** Un ADR nace con estado "Propuesto" en una rama separada. Pasará a estado "Aceptado" únicamente tras la revisión y fusión (merge) del Pull Request por parte del equipo.

## Consecuencias

* **Positivo:** Tendremos un historial inmutable y transparente de por qué tomamos ciertas decisiones con Laravel, PostgreSQL o DDD, facilitando la incorporación de nuevos miembros al equipo.
* **Positivo:** Las revisiones de código (Code Reviews) serán más rápidas, ya que las discusiones arquitectónicas se resuelven en el ADR y no en el código.
* **Negativo:** Requiere disciplina por parte del equipo de desarrollo para no tomar decisiones de alto impacto "en el aire" o por chat sin documentarlas previamente.