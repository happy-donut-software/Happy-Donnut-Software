# ==============================================================================
# STAGE 1: Base (Dependencias y extensiones comunes)
# ==============================================================================
FROM php:8.4-fpm-alpine AS base

# Instalar dependencias del sistema requeridas por Laravel, Postgres y colas
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    oniguruma-dev \
    linux-headers

# Instalar extensiones de PHP 
# NOTA: pdo_pgsql es para BD, sockets es VITAL para la conexión estable con RabbitMQ
RUN docker-php-ext-install pdo_pgsql mbstring zip exif pcntl sockets

# Obtener Composer en su última versión oficial
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar el directorio de trabajo
WORKDIR /var/www

# LA MAGIA: Copiamos archivos de dependencias y las instalamos en la base
# Esto garantiza que la carpeta vendor exista DENTRO de la imagen antes de que
# Docker monte el volumen anónimo en la etapa local.
COPY composer.json composer.lock ./
RUN composer install --ignore-platform-reqs --no-interaction --no-scripts

# ==============================================================================
# STAGE 2: Desarrollo / Local
# ==============================================================================
FROM base AS local

# Copiamos el código (aunque se sobreescriba con el volumen de Windows, es buena práctica)
COPY . .

# En desarrollo, usamos el servidor interno de Laravel (artisan serve)
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

# ==============================================================================
# STAGE 3: Construcción (Solo para Producción)
# ==============================================================================
FROM base AS build

# Copiamos el resto del código fuente del microservicio
COPY . .

# Optimizamos dependencias para producción (reinstalamos sin dev)
RUN composer install --no-dev --optimize-autoloader --no-scripts --prefer-dist

# Optimizamos Laravel para producción (rutas, vistas y configuración en caché)
RUN php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache

# ==============================================================================
# STAGE 4: Producción Final
# ==============================================================================
FROM base AS produccion

# Copiamos la aplicación YA CONSTRUIDA desde el Stage 3 (Build)
COPY --from=build /var/www /var/www

# Seguridad: Asignamos propiedad de los archivos a www-data (no root)
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Cambiamos al usuario no privilegiado por seguridad
USER www-data

# En producción, usamos el motor robusto PHP-FPM en lugar de artisan serve
EXPOSE 9000
CMD ["php-fpm"]