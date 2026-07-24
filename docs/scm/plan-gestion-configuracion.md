# Plan de gestión de configuración - IEEE 828

## Ítems de configuración

| CI | Propietario | Línea base | Control |
|---|---|---|---|
| Código Laravel/React | equipo de dominio | tag de release + SHA | PR, CI, revisión |
| Esquema PostgreSQL | cada microservicio | migraciones versionadas | prueba migrate/fresh |
| Contrato OpenAPI | arquitectura | `openapi/3.0.0` | lint y revisión consumidores |
| Imágenes OCI | plataforma | digest SHA256 | firma/SBOM y GHCR |
| Kubernetes/Kustomize | plataforma | commit Git | ArgoCD prune/self-heal |
| SLO/dashboard/alertas | SRE | commit Git | revisión post-incidente |
| Secretos | seguridad | versión del gestor externo | nunca Git |

Flujo: rama corta desde `develop` -> Conventional Commit en español de dominio -> PR con trazabilidad -> CI obligatoria -> squash/merge -> promoción a `main` mediante PR -> imagen por SHA -> ArgoCD reconcilia. Cambios urgentes siguen PR y retrospectiva; no se modifica el clúster manualmente salvo break-glass auditado.