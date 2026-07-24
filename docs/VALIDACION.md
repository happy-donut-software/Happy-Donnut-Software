# Registro de validación - 2026-07-15

Commit base observado en rama `develop`. Los cambios de esta entrega permanecen sin commit para revisión del equipo.

## Validaciones completadas

| Comprobación | Resultado |
|---|---|
| Build frontend administrativo | Correcto: Vite transformó 3,188 módulos |
| Build portal clientes | Correcto: Create React App generó build optimizado |
| Sintaxis PHP de archivos cambiados | Correcta en 71 archivos; se neutralizó `readonly` únicamente en copias temporales porque el PHP anfitrión es 8.0 y los contenedores usan PHP 8.4 |
| OpenAPI | YAML 3.1 válido, 21 paths, 37 referencias internas resueltas y operationId únicos |
| Manifiestos YAML/JSON | 23 archivos parseados; overlay local consistente con 47 recursos, dos patches y sin IDs duplicados |
| Helm | Templates correctos para Argo CD 10.1.3, kube-prometheus-stack 87.16.1, Tempo 1.24.4, OTel Collector 0.165.0 y Chaos Mesh 2.8.3 |
| Docker Compose | `docker compose config --quiet` correcto usando entorno temporal |
| PowerShell | Los tres scripts locales compilan como ScriptBlock |
| Informe PDF | A4, 3 páginas, enlaces, fuentes embebidas, sin páginas vacías; las tres páginas fueron renderizadas y revisadas |

## Validación pendiente en el equipo del usuario

El sandbox de Codex no puede abrir `C:\Users\USUARIO\.kube\config` ni la tubería `npipe://./pipe/docker_engine`, aunque Docker Desktop esté abierto. Por ello no se declara un despliegue ejecutado ni cobertura/mutación aprobadas.

Ejecutar en PowerShell normal:

```powershell
cd C:\Users\USUARIO\Desktop\Happy-Donnut-Software
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\instalar-local.ps1
.\scripts\verificar-local.ps1
```

La segunda orden genera el ZIP de evidencia real. Después deben confirmarse los cambios y publicarse en `develop` antes de activar Argo CD con `-ActivarArgo`.
