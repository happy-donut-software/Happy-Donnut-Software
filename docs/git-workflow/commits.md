# 💬 Estándar de Mensajes de Commit (DDD & Hexagonal)

Todos los desarrolladores de **Happy Donut Software** deben seguir esta convención estricta para escribir los mensajes de commit. Esto asegura un historial limpio, legible y alineado al negocio.

---

## 📐 Estructura Obligatoria
Cada commit debe escribirse en minúsculas y seguir este formato exacto:
👉 `tipo(módulo): acción + componente técnico + descripción del negocio`

---

## 📌 Los 5 Tipos Permitidos

*   `feat` ➔ Nueva funcionalidad para el usuario final.
*   `fix` ➔ Corrección de un error o falla (bug).
*   `refactor` ➔ Cambios de código para la migración a DDD/Hexagonal (sin cambiar funciones).
*   `docs` ➔ Cambios exclusivos en manuales, guías o comentarios de código.
*   `test` ➔ Añadir o modificar pruebas automatizadas.

---

## 📝 Ejemplos Reales en Español (Lenguaje Ubicuo)

*   **Para una nueva función (Capa de Aplicación):**
    `feat(inventario): crear caso de uso para agregar alerta de stock`

*   **Para una refactorización de arquitectura (Capa de Infraestructura):**
    `refactor(inventario): migrar repositorio para impresión de boletas a hexagonal`

*   **Para corregir un error que afecte el flujo:**
    `fix(pedido): reparar validación en la pasarela de pago`

*   **Para documentar el lenguaje ubicuo:**
    `docs(pedido): editar categorías de pedidos en el glosario técnico`

*   **Para asegurar el código con pruebas:**
    `test(rosquilla): añadir prueba unitaria para el cálculo de precio con IGV`

---

## 🚨 Reglas de Oro para el Programador
1. **Verbo en infinitivo:** La descripción debe iniciar siempre con un verbo como `crear`, `migrar`, `reparar` o `añadir`.
2. **Sin punto final:** Nunca agregues un punto al terminar la frase del commit.
3. **Módulo exacto:** El texto entre paréntesis `()` debe ser el nombre del contexto del negocio en español(carpeta o modulo).
