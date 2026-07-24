$ErrorActionPreference = 'Stop'
$Repo = Split-Path -Parent $PSScriptRoot
$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$Evidence = Join-Path $Repo "evidencias/local-$Stamp"
[IO.Directory]::CreateDirectory($Evidence) | Out-Null
function Capture([string]$Name, [scriptblock]$Action) {
    Write-Host "Verificando $Name..." -ForegroundColor Cyan
    $text = (& $Action 2>&1 | Out-String)
    [IO.File]::WriteAllText((Join-Path $Evidence "$Name.txt"), $text, [Text.UTF8Encoding]::new($false))
}
Capture 'cluster' { kubectl cluster-info }
Capture 'pods-happy-donut' { kubectl get pods,svc,statefulset,deployment -n happy-donut -o wide }
Capture 'pods-observability' { kubectl get pods,svc -n observability -o wide }
Capture 'argocd' { kubectl get applications.argoproj.io -n argocd -o json }
Capture 'sre' { kubectl get servicemonitor,prometheusrule -n happy-donut -o wide }
Capture 'imagenes' { docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.Size}}' }
Capture 'metricas-ventas' { kubectl exec deployment/servicio-ventas -n happy-donut -- curl -fsS http://127.0.0.1:8000/api/metrics }
Capture 'happy-donut-otel-collector' { kubectl logs deployment/happy-donut-otel-collector -n observability --tail=100 }
Capture 'rollouts' { foreach ($s in @('ventas','inventario','usuarios','finanzas','tienda-virtual')) { kubectl rollout status "deployment/servicio-$s" -n happy-donut --timeout=30s } }
$summary = "Happy Donut - evidencia local`nFecha: $(Get-Date -Format o)`nContexto: $(kubectl config current-context)`nCommit: $(git -C $Repo rev-parse HEAD)`nDirectorio: $Evidence`n"
[IO.File]::WriteAllText((Join-Path $Evidence 'RESUMEN.txt'),$summary,[Text.UTF8Encoding]::new($false))
Compress-Archive -Path "$Evidence\*" -DestinationPath "$Evidence.zip" -Force
Write-Host "Evidencias generadas en: $Evidence.zip" -ForegroundColor Green