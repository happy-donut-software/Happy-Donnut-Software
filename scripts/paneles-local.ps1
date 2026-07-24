$ErrorActionPreference = 'Stop'
Write-Host 'Happy Donut local' -ForegroundColor Magenta
Write-Host 'Aplicacion y API Gateway: http://localhost:30080'
Write-Host 'Administracion: http://localhost:30080/admin/'
$argoPort = (& kubectl -n argocd get service argocd-server --ignore-not-found -o jsonpath='{.spec.ports[0].nodePort}')
if ($argoPort) {
    Write-Host "Argo CD: http://localhost:$argoPort (usuario admin)"
} else {
    Write-Host 'Argo CD: aun no instalado.' -ForegroundColor Yellow
}
Write-Host 'Grafana: http://localhost:30300 (admin / happy-donut-local)'
Write-Host 'RabbitMQ: http://localhost:31672 (happy_donut / happy_donut_local)'
Write-Host 'Contrasena inicial de Argo CD:'
$encoded = (& kubectl -n argocd get secret argocd-initial-admin-secret --ignore-not-found -o jsonpath='{.data.password}')
if ($encoded) {
    Write-Host ([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($encoded))) -ForegroundColor Yellow
} else {
    Write-Host 'Se mostrara cuando Argo CD termine de instalarse.' -ForegroundColor Yellow
}
