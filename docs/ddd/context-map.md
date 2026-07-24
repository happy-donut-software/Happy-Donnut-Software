# Context Map

```mermaid
flowchart LR
  U["Usuarios y Promociones (Upstream)"] -->|"OHS: identidad, cupones"| V["Ventas (Downstream)"]
  U -->|"OHS: perfil y cupones"| T["Tienda Virtual (Downstream)"]
  I["Inventario (Upstream)"] -->|"Customer-Supplier: disponibilidad"| T
  V -->|"Evento VentaFinalizada.v1 / Conformist"| I
  V -->|"Evento VentaFinalizada.v1 / ACL de integración"| F["Finanzas (Downstream)"]
  T -->|"Customer-Supplier: solicitud de facturación"| V
```

Cada contexto posee PostgreSQL propio y no consulta tablas ajenas. OHS se publica mediante OpenAPI. La ACL de Finanzas traduce el evento de Ventas a `MovimientoCaja` y `AcumuladoRus`; Inventario reacciona idempotentemente al mismo evento. No se usa Shared Kernel entre dominios.