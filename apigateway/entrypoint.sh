#!/bin/sh
set -e

# 1. MANEJO DE VARIABLES DE ENTORNO
# Las variables son leídas por el shell automáticamente desde Docker Compose,
# pero se recomienda inicializar con un fallback seguro (p. ej., si se ejecuta solo).
# Nota: La variable APP_KEY debe estar vacía en el .env.example para que funcione.
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}

# 2. ASEGURAR ARCHIVO .ENV (DEBE IR ANTES DE CUALQUIER COMANDO ARTISAN)
# Esto resuelve el error "Failed to open stream: No such file or directory"
if [ ! -f /var/www/.env ]; then
  echo "Creating .env file from .env.example..."
  cp /var/www/.env.example /var/www/.env
fi

# 3. ESPERAR A LA BASE DE DATOS (DEBE IR ANTES DE ARTISAN QUE SE CONECTA A LA DB)
echo "Waiting for database at $DB_HOST:$DB_PORT..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "Database $DB_HOST is ready."

# 4. GENERAR APP_KEY (AHORA SÍ PUEDE ACCEDER A LA DB SI ES NECESARIO)
# Solo generamos la clave si la línea APP_KEY no contiene una clave (base64).
if ! grep -q "APP_KEY=base64:" /var/www/.env; then
  echo "Generating application key..."
  # Usar un simple key:generate es suficiente, se basa en el .env que ya creamos.
  php artisan key:generate
fi

# 5. LIMPIAR CACHÉ DE PAQUETES Y EJECUTAR MIGRACIONES
# Eliminamos el manifiesto de paquetes para evitar referencias obsoletas (como Laravel\Pail\PailServiceProvider)
cd /var/www
rm -f bootstrap/cache/packages.php

# Regeneramos el manifiesto de paquetes según los paquetes realmente instalados
php artisan package:discover --ansi || true

# Usamos 'php artisan migrate --force' para entornos no interactivos.
# El env=production es opcional si ya está en .env, pero lo mantenemos si lo necesitas.
echo "Running migrations..."
php artisan migrate --force

echo "Entorno listo. Ejecutando comando..."

# Ejecuta cualquier comando que Docker le pase (o el CMD por defecto)
exec "$@"