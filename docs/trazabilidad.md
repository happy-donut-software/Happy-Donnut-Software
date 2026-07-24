# Matriz de trazabilidad bidireccional

| ID | Requisito de negocio | Dominio / implementación | Especificación y prueba | Operación / evidencia |
|---|---|---|---|---|
| RF-01 | Registrar venta física | `OrdenVenta`, `CrearOrdenUseCase`, POS | `realizar_venta.feature`, `OrdenesApiTest` | `POST /ventas/ordenes` |
| RF-02 | Calcular vuelto exacto | `OrdenVenta::registrarPago` | escenarios feliz e importe insuficiente | métricas de 4xx y latencia |
| RF-03 | Efectivo, Yape y Plin | método de pago/comprobante en agregado y migración | PHPUnit + Cucumber E2E | OpenAPI y panel POS |
| RF-04 | Descontar stock tras venta | consumidor `ProcesarVentaFinalizadaUseCase` de Inventario | `actualizar_inventario.feature`, E2E | stock antes/después en evidencia |
| RF-05 | Alertar stock mínimo | `ProductoInventario::requiereReabastecimiento` | escenario inventario | respuesta `alertas` del consumidor |
| RF-06 | Abrir, mover y cerrar caja | `TurnoCaja`, `MovimientoCaja` | `TurnoCajaApiTest` | endpoints `/finanzas/caja/*` |
| RF-07 | Acumular RUS solo por boleta | `AcumuladoRus::registrarComprobante` | `AcumuladoRusTest`, Cucumber E2E | `GET /finanzas/rus/{periodo}` |
| RF-08 | Carrito y compra web | `CarritoCompras`, portal React y Ventas | `CarritoApiTest`, build React | gateway `:30080` |
| RF-09 | Usuarios y roles | `Usuario`, `RolUsuario`, Sanctum | `UsuariosApiTest` | login/registro OpenAPI |
| RF-10 | Clientes frecuentes | `ClienteFrecuente`, buscador POS | build frontend + caso de uso | `GET /usuarios/clientes-frecuentes` |
| RNF-01 | Disponibilidad objetivo 99.9 % | stateless, probes, PDB/HPA | smoke/rollout | SLO, burn rate y dashboard |
| RNF-02 | Latencia p95 menor a 500 ms | métricas RED | escenario E2E | PrometheusRule/Grafana |
| RNF-03 | Persistencia independiente | puertos y DB por servicio | pruebas unitarias/feature | cinco StatefulSets locales |
| RNF-04 | Entrega reproducible e inmutable | Docker multi-stage/Kustomize | CI de config | Argo CD prune/self-heal, SHA en producción |
| RNF-05 | Resiliencia e idempotencia | outbox + registro de eventos consumidos | duplicados y Cucumber | relay, Chaos Mesh, logs |
| RNF-06 | Trazabilidad distribuida | auto-instrumentación Laravel/PDO | arranque de imagen observabilidad | Collector + Tempo |

## Trazabilidad inversa

- `openapi/openapi.yaml` cubre todos los paths declarados por `routes/api.php`.
- `gitops/k8s/overlays/local` materializa los componentes descritos por el SAD.
- `scripts/verificar-local.ps1` liga evidencia, fecha, contexto Kubernetes y commit.
- Todo nuevo endpoint, evento o SLO debe actualizar esta tabla en el mismo PR.
