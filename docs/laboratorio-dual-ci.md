# Laboratorio Dual CI

Este laboratorio implementa dos carriles de integración continua independientes para el monorepo de Happy Donut.

## Carril backend

`backend-ci.yml` ejecuta una matriz sobre los cinco microservicios Laravel: Ventas, Inventario, Usuarios, Finanzas y Tienda virtual. Cada ejecución instala PHP 8.3 y las dependencias bloqueadas por Composer, y después ejecuta `composer test`.

## Carril frontend

`frontend-ci.yml` valida las dos aplicaciones con Node.js 22:

- Clientes: pruebas no interactivas y compilación de producción.
- Administrativo: lint, comprobación de tipos y compilación de producción.

Las instalaciones usan `npm ci` para respetar exactamente cada `package-lock.json`.

## Disparadores y seguridad

Ambos workflows se ejecutan en pull requests dirigidos a `develop` o `main`, y en pushes a esas ramas o a ramas `feat/**` y `fix/**`. Sus permisos se limitan a lectura. Una ejecución anterior de la misma rama se cancela cuando llega un commit nuevo.

## Criterios de aceptación

1. Los cinco contextos `Laravel · <servicio>` terminan correctamente.
2. Los contextos `Frontend · clientes` y `Frontend · administrativo` terminan correctamente.
3. Una falla identifica su componente sin ocultar los resultados de los demás.

Después de observar una ejecución completa, los siete contextos pueden configurarse como verificaciones requeridas de `develop`.
