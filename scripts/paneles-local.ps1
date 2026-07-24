$ErrorActionPreference = 'Stop'

function Test-LocalPort {
    param([int]$Port)
    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $connection = $client.BeginConnect('127.0.0.1', $Port, $null, $null)
        if (-not $connection.AsyncWaitHandle.WaitOne(700)) { return $false }
        $client.EndConnect($connection)
        return $true
    } catch { return $false } finally { $client.Dispose() }
}

function Start-LocalForward {
    param([string]$Namespace,[string]$Resource,[int]$LocalPort,[int]$RemotePort)
    if (Test-LocalPort $LocalPort) {
        Write-Host "Puerto $LocalPort disponible (NodePort o port-forward existente)." -ForegroundColor DarkGreen
        return
    }
    $mapping = $LocalPort.ToString() + ':' + $RemotePort.ToString()
    $process = Start-Process kubectl -ArgumentList @(
        '-n', $Namespace, 'port-forward', '--address=0.0.0.0', $Resource, $mapping
    ) -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 2
    if ($process.HasExited -or -not (Test-LocalPort $LocalPort)) {
        Write-Warning "No se pudo abrir $Resource en localhost:$LocalPort. Revisa sus pods con kubectl -n $Namespace get pods."
    } else {
        Write-Host "Port-forward iniciado para $Resource (PID $($process.Id))." -ForegroundColor DarkGreen
    }
}

$argoPortText = (& kubectl -n argocd get service argocd-server --ignore-not-found -o jsonpath='{.spec.ports[0].nodePort}')
$argoPort = if ($argoPortText -match '^\d+$') { [int]$argoPortText } else { 30081 }

Start-LocalForward 'happy-donut' 'service/happy-donut-gateway' 30080 80
Start-LocalForward 'observability' 'service/prometheus-grafana' 30300 80
Start-LocalForward 'argocd' 'service/argocd-server' $argoPort 80
Start-LocalForward 'happy-donut' 'service/rabbitmq' 31672 15672

Write-Host ''
Write-Host 'Happy Donut local' -ForegroundColor Magenta
Write-Host 'Aplicacion y API Gateway: http://localhost:30080'
Write-Host 'Administracion: http://localhost:30080/admin/'
Write-Host "Argo CD: http://localhost:$argoPort (usuario admin)"
Write-Host 'Grafana SRE: http://localhost:30300/d/happy-donut-sre/happy-donut-sre (admin / happy-donut-local)'
Write-Host 'RabbitMQ: http://localhost:31672 (happy_donut / happy_donut_local)'
Write-Host 'Contrasena inicial de Argo CD:'
$encoded = (& kubectl -n argocd get secret argocd-initial-admin-secret --ignore-not-found -o jsonpath='{.data.password}')
if ($encoded) {
    Write-Host ([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($encoded))) -ForegroundColor Yellow
} else {
    Write-Host 'No disponible; Argo CD puede seguir iniciando.' -ForegroundColor Yellow
}
