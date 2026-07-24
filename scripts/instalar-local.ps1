[CmdletBinding()]
param([switch]$ActivarArgo,[switch]$OmitirBuild,[switch]$OmitirChaos)
$ErrorActionPreference = 'Stop'
$Repo = Split-Path -Parent $PSScriptRoot
Set-Location $Repo
function Invoke-Checked {
    param([Parameter(Mandatory)][string]$Command,[string[]]$Arguments=@())
    Write-Host "`n> $Command $($Arguments -join ' ')" -ForegroundColor Cyan
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Fallo: $Command (codigo $LASTEXITCODE)" }
}
Write-Host 'Happy Donut - instalacion local reproducible' -ForegroundColor Magenta
Write-Host 'Recomendado: Docker Desktop con Kubernetes y al menos 8 GB de RAM.'
Invoke-Checked docker @('info')
$contexts = & kubectl config get-contexts -o name
if ($contexts -contains 'docker-desktop') { Invoke-Checked kubectl @('config','use-context','docker-desktop') }
Invoke-Checked kubectl @('cluster-info')
$existingArgoPort = (& kubectl -n argocd get service argocd-server --ignore-not-found -o jsonpath='{.spec.ports[0].nodePort}')
if ($existingArgoPort -match '^\d+$') {
    $ArgoNodePort = [int] $existingArgoPort
} else {
    $serviceData = (& kubectl get services --all-namespaces -o json | ConvertFrom-Json)
    $usedNodePorts = @($serviceData.items | ForEach-Object { $_.spec.ports } | ForEach-Object { $_.nodePort } | Where-Object { $_ })
    $ArgoNodePort = 30081
    while ($usedNodePorts -contains $ArgoNodePort) { $ArgoNodePort++ }
    if ($ArgoNodePort -gt 30100) { throw 'No hay un NodePort libre entre 30081 y 30100 para Argo CD.' }
}
Write-Host "Argo CD usara el NodePort $ArgoNodePort." -ForegroundColor Yellow
Invoke-Checked helm @('repo','add','argo','https://argoproj.github.io/argo-helm','--force-update')
Invoke-Checked helm @('repo','add','prometheus-community','https://prometheus-community.github.io/helm-charts','--force-update')
Invoke-Checked helm @('repo','add','open-telemetry','https://open-telemetry.github.io/opentelemetry-helm-charts','--force-update')
Invoke-Checked helm @('repo','add','grafana','https://grafana.github.io/helm-charts','--force-update')
Invoke-Checked helm @('repo','add','chaos-mesh','https://charts.chaos-mesh.org','--force-update')
Invoke-Checked helm @('repo','update')
Invoke-Checked helm @('upgrade','--install','argocd','argo/argo-cd','--version','10.1.3','-n','argocd','--create-namespace','--set','server.service.type=NodePort','--set',"server.service.nodePortHttp=$ArgoNodePort",'--set-string','configs.params.server\.insecure=true','--wait','--timeout','15m')
Invoke-Checked helm @('upgrade','--install','prometheus','prometheus-community/kube-prometheus-stack','--version','87.16.1','-n','observability','--create-namespace','-f','observability/kube-prometheus-values.yaml','--wait','--timeout','20m')
Invoke-Checked helm @('upgrade','--install','tempo','grafana/tempo','--version','1.24.4','-n','observability','--create-namespace','-f','observability/tempo-values.yaml','--wait','--timeout','15m')
Invoke-Checked helm @('upgrade','--install','otel-collector','open-telemetry/opentelemetry-collector','--version','0.165.0','-n','observability','--create-namespace','-f','observability/otel-collector-values.yaml','--wait','--timeout','15m')
if (-not $OmitirChaos) { Invoke-Checked helm @('upgrade','--install','chaos-mesh','chaos-mesh/chaos-mesh','--version','2.8.3','-n','chaos-mesh','--create-namespace','--set','chaosDaemon.runtime=containerd','--set','chaosDaemon.socketPath=/run/containerd/containerd.sock','--wait','--timeout','15m') }
if (-not $OmitirBuild) {
    foreach ($service in @('ventas','inventario','usuarios','finanzas','tienda-virtual')) { Invoke-Checked docker @('build','--target','observabilidad','-t',"happy-donut/$service`:local","./$service") }
    Invoke-Checked docker @('build','--target','production','-t','happy-donut/frontend-clientes:local','./frontend-clientes')
    Invoke-Checked docker @('build','--target','production','-t','happy-donut/frontend-administrativo:local','./frontend-administrativo')
}
$currentContext = (& kubectl config current-context).Trim()
if (-not $OmitirBuild -and $currentContext.StartsWith('kind-')) {
    $kindCluster = $currentContext.Substring(5)
    $localImages = @(
        'happy-donut/ventas:local','happy-donut/inventario:local','happy-donut/usuarios:local',
        'happy-donut/finanzas:local','happy-donut/tienda-virtual:local',
        'happy-donut/frontend-clientes:local','happy-donut/frontend-administrativo:local'
    )
    Invoke-Checked kind (@('load','docker-image','--name',$kindCluster) + $localImages)
}
Invoke-Checked kubectl @('apply','-k','gitops/k8s/overlays/local')
foreach ($database in @('ventas','inventario','usuarios','finanzas','tienda-virtual')) { Invoke-Checked kubectl @('rollout','status',"statefulset/bd-$database",'-n','happy-donut','--timeout=10m') }
Invoke-Checked kubectl @('rollout','status','deployment/rabbitmq','-n','happy-donut','--timeout=10m')
Invoke-Checked kubectl @('rollout','status','deployment/redis','-n','happy-donut','--timeout=10m')
foreach ($service in @('ventas','inventario','usuarios','finanzas','tienda-virtual')) {
    Invoke-Checked kubectl @('rollout','status',"deployment/servicio-$service",'-n','happy-donut','--timeout=10m')
    Invoke-Checked kubectl @('exec',"deployment/servicio-$service",'-n','happy-donut','--','php','artisan','migrate','--force')
    if ($service -in @('ventas','inventario','usuarios','finanzas')) { Invoke-Checked kubectl @('exec',"deployment/servicio-$service",'-n','happy-donut','--','php','artisan','db:seed','--force') }
}
Invoke-Checked kubectl @('rollout','status','deployment/frontend-clientes','-n','happy-donut','--timeout=10m')
Invoke-Checked kubectl @('rollout','status','deployment/frontend-administrativo','-n','happy-donut','--timeout=10m')
Invoke-Checked kubectl @('rollout','status','deployment/happy-donut-gateway','-n','happy-donut','--timeout=10m')
Invoke-Checked kubectl @('rollout','status','deployment/ventas-outbox-worker','-n','happy-donut','--timeout=10m')
& (Join-Path $PSScriptRoot 'paneles-local.ps1')
Invoke-Checked kubectl @('apply','-f','observability/service-monitors.yaml')
Invoke-Checked kubectl @('apply','-f','observability/prometheus-rules.yaml','-n','happy-donut')
$dashboard = & kubectl create configmap happy-donut-sre-dashboard -n observability --from-file=happy-donut-sre.json=observability/grafana/dashboards/happy-donut-sre.json --dry-run=client -o yaml
$dashboard | & kubectl apply -f -
Invoke-Checked kubectl @('label','configmap','happy-donut-sre-dashboard','-n','observability','grafana_dashboard=1','--overwrite')
Invoke-Checked docker @('run','--rm','-e','BASE_URL=http://host.docker.internal:30080','-v',"${Repo}:/workspace",'-v','/workspace/qa-e2e/node_modules','-w','/workspace/qa-e2e','node:22-alpine','sh','-lc','npm install --ignore-scripts && npm test')
$dirty = git status --porcelain
if ($dirty) { Write-Warning 'Argo CD se omitio porque hay cambios locales sin publicar. Haz commit/push a develop3 y vuelve a ejecutar el instalador.' }
else { Invoke-Checked kubectl @('apply','-f','gitops/argocd/happy-donut-local.yaml') }
Write-Host "`nInstalacion terminada." -ForegroundColor Green
Write-Host 'Ejecuta scripts/paneles-local.ps1 y despues scripts/verificar-local.ps1.'
