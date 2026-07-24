# Happy Donut Software

Sistema local de ventas y comercio electrónico basado en cinco bounded contexts: Ventas, Inventario, Finanzas, Usuarios y Tienda Virtual. Incluye Laravel, React, PostgreSQL por servicio, transactional outbox, consumidores idempotentes, Kubernetes, Argo CD, Prometheus, Grafana, Tempo, OpenTelemetry y Chaos Mesh.

## Inicio rápido en Kubernetes local

Requisitos: Docker Desktop abierto, Kubernetes habilitado, PowerShell 7, `kubectl` y `helm`. Se recomiendan 8 GB de RAM disponibles.

```powershell
cd C:\Users\USUARIO\Desktop\Happy-Donnut-Software
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\instalar-local.ps1
.\scripts\paneles-local.ps1
```

El instalador fija versiones de charts, construye siete imágenes locales, crea las cinco bases PostgreSQL, ejecuta migraciones/seeders, levanta la observabilidad y ejecuta el escenario Cucumber E2E. No requiere dominio ni servidor de pago.

| Recurso | URL / credenciales |
|---|---|
| Portal clientes | http://localhost:30080 |
| Administración / POS | http://localhost:30080/admin/ |
| Argo CD | NodePort libre mostrado por paneles-local.ps1 - usuario `admin`; contraseña mostrada por `paneles-local.ps1` |
| Grafana SRE | http://localhost:30300/d/happy-donut-sre/happy-donut-sre - `admin / happy-donut-local` |
| RabbitMQ | http://localhost:31672 - `happy_donut / happy_donut_local` |
| Usuario administrador | `admin@happydonut.local / Admin123!` |
| Usuario cajero | `cajero@happydonut.local / Cajero123!` |

La aplicación GitOps apunta a `develop3`. Con el repositorio limpio y publicado, el instalador registra automáticamente la aplicación en Argo CD. Para repetir sin reconstruir imágenes:

```powershell
.\scripts\instalar-local.ps1 -OmitirBuild
```

Argo CD solo puede leer lo que ya existe en GitHub; por eso el instalador omite el registro GitOps cuando el árbol local tiene cambios sin publicar. En clústeres `kind`, las imágenes se cargan automáticamente y `paneles-local.ps1` abre los port-forward necesarios.

## Flujo funcional implementado

1. La categoría `Donas` se crea por defecto; Administración gestiona categorías, productos y stock mediante las APIs de Ventas e Inventario.
2. El portal de clientes consulta el mismo catálogo en `GET /api/ventas/productos` y refleja los cambios del panel administrativo.
3. Administración debe abrir un turno real mediante `POST /api/finanzas/caja/abrir`; con caja cerrada los pagos se rechazan.
4. El POS o portal crea la orden en `POST /api/ventas/ordenes`.
5. El pago admite `EFECTIVO`, `YAPE` o `PLIN`, calcula vuelto y genera `BOLETA` o `NOTA_PEDIDO`.
6. Pago y evento `VentaFinalizada.v1` se guardan atómicamente en la outbox.
7. El relay reintenta la entrega autenticada a Inventario y Finanzas.
8. Inventario descuenta stock idempotentemente y señala mínimos.
9. Finanzas registra el ingreso en la caja abierta; solo las boletas incrementan el acumulado RUS.
10. Prometheus recoge métricas HTTP y OpenTelemetry exporta trazas a Tempo.

## Evidencia y documentación

- [Informe final](docs/INFORME_FINAL.md)
- [Registro de validación](docs/VALIDACION.md)
- [Informe PDF](output/pdf/Informe_Final_Happy_Donut.pdf)
- [OpenAPI 3.1](openapi/openapi.yaml)
- [SAD](docs/SAD.md)
- [Lenguaje ubicuo](docs/ddd/lenguaje-ubicuo.md)
- [Event Storming](docs/ddd/event-storming.md)
- [Context Map](docs/ddd/context-map.md)
- [Trazabilidad bidireccional](docs/trazabilidad.md)
- [Estrategia de pruebas](docs/qa/estrategia-pruebas.md)
- [Plan SCM IEEE 828](docs/scm/plan-gestion-configuracion.md)
- [SLI, SLO y presupuesto de error](docs/sre/SLI-SLO.md)
- [ADRs](docs/adr)
- [Cucumber E2E](features/e2e_local.feature)
- [Manifiesto Argo CD local](gitops/argocd/happy-donut-local.yaml)

Después del despliegue, genera evidencia fechada:

```powershell
.\scripts\verificar-local.ps1
```

El ZIP incluye estado del clúster, workloads, imágenes, métricas, logs del collector, rollouts y commit observado.

## Calidad y entrega

`.github/workflows/ci.yml` ejecuta PHPUnit con umbral de cobertura de 80 %, compila ambos frontends, valida OpenAPI, Compose y Kustomize. `mutation.yml` ejecuta Infection con MSI mínimo. Los porcentajes y estados se consideran evidencia únicamente cuando GitHub Actions termina sobre el SHA entregado; no se inventan resultados.

## Seguridad y límites del entorno local

Los secretos incluidos en el overlay local son exclusivamente didácticos y no deben reutilizarse fuera del equipo. Para un despliegue público deben reemplazarse por External Secrets, TLS/DNS, almacenamiento administrado, registro de imágenes y control de acceso al gateway. El overlay `production` contiene marcadores explícitos para impedir una promoción accidental con credenciales de ejemplo.
