# Script de instalación de Laravel 12 en contenedor Docker para Windows
# Ejecutar como: powershell -ExecutionPolicy Bypass -File install.ps1

Write-Host "🚀 Iniciando instalación de Laravel 12..." -ForegroundColor Green

# Crear el proyecto Laravel 12
Write-Host "📦 Creando proyecto Laravel 12..." -ForegroundColor Yellow
docker-compose exec -T app composer create-project laravel/laravel .

# Esperar a que PostgreSQL esté listo
Write-Host "⏳ Esperando a que PostgreSQL esté disponible..." -ForegroundColor Yellow
$counter = 0
while ($counter -lt 30) {
    $result = docker-compose exec -T postgres pg_isready -U finance_user -d happy_donut_finance 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL está disponible" -ForegroundColor Green
        break
    }
    Write-Host "Intento $($counter + 1)/30: Esperando PostgreSQL..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
    $counter++
}

# Generar clave de aplicación
Write-Host "🔑 Generando clave de aplicación..." -ForegroundColor Yellow
docker-compose exec -T app php artisan key:generate

# Crear estructura de directorios
Write-Host "📁 Creando estructura de Arquitectura Hexagonal..." -ForegroundColor Yellow

New-Item -ItemType Directory -Force -Path "app/src/Shared/Domain/ValueObjects" | Out-Null
New-Item -ItemType Directory -Force -Path "app/src/Finanzas/Domain/Aggregates" | Out-Null
New-Item -ItemType Directory -Force -Path "app/src/Finanzas/Domain/Events" | Out-Null
New-Item -ItemType Directory -Force -Path "app/src/Finanzas/Domain/Repositories" | Out-Null
New-Item -ItemType Directory -Force -Path "app/src/Finanzas/Application/UseCases" | Out-Null
New-Item -ItemType Directory -Force -Path "app/src/Finanzas/Infrastructure/Persistence/Eloquent" | Out-Null
New-Item -ItemType Directory -Force -Path "app/src/Finanzas/Infrastructure/Controllers" | Out-Null

# Configurar composer.json
Write-Host "⚙️ Configurando namespaces en composer.json..." -ForegroundColor Yellow
docker-compose exec -T app php -r "
`$composer = json_decode(file_get_contents('composer.json'), true);
`$composer['autoload']['psr-4']['Finanzas\\\\'] = 'app/src/Finanzas/';
`$composer['autoload']['psr-4']['Shared\\\\'] = 'app/src/Shared/';
file_put_contents('composer.json', json_encode(`$composer, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
"

# Actualizar autoloader
Write-Host "🔄 Actualizando autoloader de Composer..." -ForegroundColor Yellow
docker-compose exec -T app composer dump-autoload

# Ejecutar migraciones
Write-Host "🗄️ Ejecutando migraciones de base de datos..." -ForegroundColor Yellow
docker-compose exec -T app php artisan migrate

# Crear enlace de almacenamiento
Write-Host "🔗 Creando enlace de almacenamiento..." -ForegroundColor Yellow
docker-compose exec -T app php artisan storage:link

Write-Host "✨ ¡Instalación completada exitosamente!" -ForegroundColor Green
Write-Host "🎉 Laravel 12 está listo para usar" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "- La aplicación está disponible en http://localhost" -ForegroundColor Cyan
Write-Host "- Base de datos: happy_donut_finance en PostgreSQL" -ForegroundColor Cyan
