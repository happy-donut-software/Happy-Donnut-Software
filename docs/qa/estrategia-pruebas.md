# Estrategia ISO/IEC/IEEE 29119

- Unitarias: agregados y objetos de valor sin framework.
- Integración: repositorios Eloquent contra SQLite/PostgreSQL efímero.
- API: validación y reglas mediante PHPUnit Feature.
- BDD: escenarios críticos en `features/`, vinculados a pruebas por nombre de negocio.
- E2E: POS/portal -> Ventas -> outbox -> Inventario/Finanzas en Docker Desktop Kubernetes; Cucumber ejecuta verificaciones reales con espera eventual.
- Mutación: Infection semanal sobre Ventas; MSI mínimo 70 y covered MSI 80.
- Cobertura: CI falla por debajo de 80%; el XML generado es el registro auditable.
- Carga: p95 <500 ms y error <0.1% con tráfico representativo.

No se versionan porcentajes inventados: cobertura y mutación deben provenir de la ejecución de GitHub Actions asociada al SHA evaluado.