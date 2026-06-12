FROM php:8.3-fpm-alpine

# Instalar dependencias del sistema necesarias para Alpine
RUN apk add --no-cache \
    build-base \
    autoconf \
    curl-dev \
    postgresql-dev \
    oniguruma-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    bash

# Instalar extensiones PHP necesarias para Laravel (sin curl porque ya viene por defecto)
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    mbstring \
    zip \
    bcmath

# Instalar Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Crear directorio de trabajo
WORKDIR /app

# (Opcional por ahora, ya que crearás el proyecto de cero) Copiar archivos de composer si existen
# COPY ./app/composer.json* ./

# Cambiar permisos
RUN chown -R www-data:www-data /app

# Usuario www-data
USER www-data

# Exponer puerto para PHP-FPM
EXPOSE 9000

CMD ["php-fpm"]