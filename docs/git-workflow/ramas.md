# 🚀 ramas - Happy Donut Software

## 📌 Ramas Eternas
*   **`main`** ➔ ⚠️ **PRODUCCIÓN**. Solo código 100% probado. Nadie toca aquí.
*   **`develop`** ➔ 🛠️ **DESARROLLO**. Base del proyecto. De aquí se sacan todas las copias.

---

## 🛠️ Ramas Temporales (Se borran al terminar)
*Usa minúsculas, guiones y lenguaje ubicuo: `categoría/módulo-acción-descripción`*

*   **`feature/`** ➔ Nuevas funciones o refactorizaciones de arquitectura.
    *   *Estructura:* `feature/módulo-acción-descripción`
    *   *Ejemplo:* `feature/inventario-agregar-impresion-de-boletas`
    *   *Ejemplo:* `feature/inventario-agregar-alerta-de-stock`
    *   *Flujo:* Nace de `develop` ➔ Muere en `develop`.

*   **`bugfix/`** ➔ Arreglar un error encontrado durante la etapa de desarrollo.
    *   *Estructura:* `bugfix/módulo-acción-descripción`
    *   *Ejemplo:* `bugfix/inventario-corregir-calculo-stock`
    *   *Flujo:* Nace de `develop` ➔ Muere en `develop`.

*   **`release/`** ➔ Congelar código para pruebas antes de una presentación o despliegue.
    *   *Estructura:* `release/vVersión-motivo`
    *   *Ejemplo:* `release/v1.0.0-presentacion-mvp`
    *   *Flujo:* Nace de `develop` ➔ Muere en `main` y `develop`.

*   **`hotfix/`** ➔ Errores críticos en vivo que detienen o afectan el negocio.
    *   *Estructura:* `hotfix/módulo-acción-descripción`
    *   *Ejemplo:* `hotfix/pedido-reparar-caida-pasarela-pago`
    *   *Flujo:* Nace de `main` ➔ Muere en `main` y `develop`.

*   **`docs/`** ➔ Cambios exclusivos en manuales, guías o documentación del proyecto.
    *   *Estructura:* `docs/tema-acción-descripción`
    *   *Ejemplo:* `docs/arquitectura-editar-categoria-de-pedidos`
    *   *Flujo:* Nace de `develop` ➔ Muere en `develop`.

---

## 🚨 Reglas de Oro (Obligatorias)

1. **Actualiza tu rama todas las mañanas** (Evita conflictos masivos):
   ```bash
   git checkout develop && git pull origin develop
   git checkout feature/tu-tarea && git merge develop
   ```
2. **Nombres con Lenguaje Ubicuo** ➔ Usa los términos reales del negocio en español (ej: `pedido`, `inventario`, `rosquilla`), nunca términos técnicos genéricos.
3. **Prohibido `git push --force`** ➔ Los conflictos se resuelven en tu PC, no a la fuerza en el servidor.
4. **Una rama = Una sola tarea** ➔ No mezcles refactorizar el inventario con arreglar otra pantalla.
