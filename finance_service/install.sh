#!/bin/bash

# Script de instalación de Laravel 12 en contenedor Docker
# Este script debe ejecutarse dentro del contenedor

set -e

echo "🚀 Iniciando instalación de Laravel 12..."

# Crear el proyecto Laravel 12
echo "📦 Creando proyecto Laravel 12..."
composer create-project laravel/laravel .

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté disponible..."
for i in {1..30}; do
    if pg_isready -h postgres -U finance_user -d happy_donut_finance > /dev/null 2>&1; then
        echo "✅ PostgreSQL está disponible"
        break
    fi
    echo "Intento $i/30: Esperando PostgreSQL..."
    sleep 1
done

# Generar clave de aplicación
echo "🔑 Generando clave de aplicación..."
php artisan key:generate

# Crear estructura de directorios para Arquitectura Hexagonal
echo "📁 Creando estructura de Arquitectura Hexagonal..."

mkdir -p app/src/Shared/Domain/ValueObjects
mkdir -p app/src/Finanzas/Domain/Aggregates
mkdir -p app/src/Finanzas/Domain/Events
mkdir -p app/src/Finanzas/Domain/Repositories
mkdir -p app/src/Finanzas/Application/UseCases
mkdir -p app/src/Finanzas/Infrastructure/Persistence/Eloquent
mkdir -p app/src/Finanzas/Infrastructure/Controllers

# Crear archivo .gitkeep en cada directorio para mantener la estructura
touch app/src/Shared/Domain/ValueObjects/.gitkeep
touch app/src/Finanzas/Domain/Aggregates/.gitkeep
touch app/src/Finanzas/Domain/Events/.gitkeep
touch app/src/Finanzas/Domain/Repositories/.gitkeep
touch app/src/Finanzas/Application/UseCases/.gitkeep
touch app/src/Finanzas/Infrastructure/Persistence/Eloquent/.gitkeep
touch app/src/Finanzas/Infrastructure/Controllers/.gitkeep

# Configurar composer.json con los namespaces
echo "⚙️ Configurando namespaces en composer.json..."

# Actualizar composer.json con los autoloads
php -r "
\$composer = json_decode(file_get_contents('composer.json'), true);
\$composer['autoload']['psr-4']['Finanzas\\\\'] = 'app/src/Finanzas/';
\$composer['autoload']['psr-4']['Shared\\\\'] = 'app/src/Shared/';
file_put_contents('composer.json', json_encode(\$composer, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
"

# Actualizar autoloader
echo "🔄 Actualizando autoloader de Composer..."
composer dump-autoload

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones de base de datos..."
php artisan migrate

# Crear enlace de almacenamiento
echo "🔗 Creando enlace de almacenamiento..."
php artisan storage:link

echo "✨ ¡Instalación completada exitosamente!"
echo "🎉 Laravel 12 está listo para usar"
echo ""
echo "Próximos pasos:"
echo "- La aplicación está disponible en http://localhost"
echo "- Base de datos: happy_donut_finance en PostgreSQL"
echo "- Para desarrollo, ejecuta: docker-compose exec app php artisan serve"
