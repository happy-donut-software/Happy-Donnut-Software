# ADR 001: Estructura Hexagonal y Estándar de Directorios para Microservicios

## Estado
Aceptado

## Contexto
Happy Donut está siendo desarrollado bajo una arquitectura de microservicios, donde cada Bounded Context (Ventas, Inventario, etc.) reside en su propio proyecto de Laravel aislado y en su propio contenedor Docker. 

Por defecto, Laravel utiliza un patrón MVC acoplado. Para implementar Domain-Driven Design (DDD) y aislar las reglas de negocio del framework, necesitamos reestructurar las carpetas raíz. Además, es necesario definir la convención de nomenclatura de estos nuevos directorios para mantener la compatibilidad con el sistema de autocarga de clases de PHP (PSR-4) y respetar el Lenguaje Ubicuo del equipo.

## Decisión
Dado que todo el repositorio de Laravel representa a un único microservicio, las capas de la Arquitectura Hexagonal se colocarán directamente en la raíz de la carpeta `app/`. 

Se establecen las siguientes reglas estructurales y de nomenclatura:

1. **Estándar de Nombres (PSR-4):** Todos los directorios creados para la arquitectura usarán `PascalCase` y estarán estrictamente en español (ej. `CasosUso`, `ObjetosValor`), permitiendo que los namespaces de PHP coincidan exactamente con la ruta física.
2. **Estructura de Capas:** El directorio `app/` se reorganizará de la siguiente manera:

\`\`\`text
app/
├── Aplicacion/           <-- Orquestación y Casos de Uso
│   ├── CasosUso/         
│   └── DTOs/             
├── Dominio/              <-- Core del Negocio (Cero dependencias externas)
│   ├── Agregados/        
│   ├── Entidades/        
│   ├── ObjetosValor/     
│   └── Puertos/          <-- Interfaces de entrada y salida
└── Infraestructura/      <-- Detalles técnicos (Laravel, Base de Datos, APIs)
    ├── Adaptadores/
    │   ├── RabbitMQ/     <-- Publicadores y Consumidores de Eventos Asíncronos
    │   └── REST/         <-- Controladores API HTTP (Consumidos por React)
    └── Persistencia/     <-- Modelos Eloquent y Repositorios Concretos
\`\`\`

*Nota: Las carpetas nativas de Laravel (`Http`, `Models`, `Console`) serán consideradas conceptualmente como parte de la Infraestructura.*

## Consecuencias
* **Positivo:** El modelo de dominio queda totalmente agnóstico al framework. Podríamos actualizar Laravel o cambiar a otro framework de PHP sin tocar las reglas de negocio.
* **Positivo:** Al seguir el estándar `PascalCase` para las carpetas, Composer (PSR-4) podrá autocargar todas nuestras clases sin configuraciones adicionales.
* **Positivo:** La estructura refleja fielmente que este repositorio es un microservicio autónomo, sin subcarpetas redundantes.
* **Negativo:** Los desarrolladores habituados al MVC tradicional de Laravel tendrán una curva de aprendizaje inicial para ubicar los archivos.