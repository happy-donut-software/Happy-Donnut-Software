# Endpoints implementados

La fuente contractual es `openapi/openapi.yaml` (OpenAPI 3.1). El gateway Kubernetes expone `http://localhost:30080/api`.

## Ventas

- `GET /ventas/productos`
- `POST /ventas/ordenes`
- `POST /ventas/ordenes/{id}/pagar`

## Inventario

- `POST /inventario/stock/reabastecer`
- `POST /inventario/stock/descontar`
- `GET /inventario/stock/{id}`
- `POST /inventario/eventos/venta-finalizada` (interno, `X-Eventos-Secret`)

## Finanzas

- `POST /finanzas/caja/abrir`
- `POST /finanzas/caja/movimiento`
- `POST /finanzas/caja/cerrar`
- `GET /finanzas/rus/{periodo}`
- `POST /finanzas/eventos/venta-finalizada` (interno, `X-Eventos-Secret`)

## Usuarios

- `POST /usuarios/registrar`
- `POST /usuarios/login`
- `GET /usuarios/me`
- `POST /usuarios/logout`
- `GET /usuarios/clientes-frecuentes?buscar=`

## Tienda virtual

- `GET /tienda/carrito/{cliente_id}`
- `POST /tienda/carrito/agregar`
- `POST /tienda/carrito/remover`

## Observabilidad

Cada microservicio expone `GET /metrics` mediante acceso directo interno. Prometheus lo consulta por `ServiceMonitor`.

Las rutas históricas `/api/v1/*` no forman parte del producto entregado y no deben usarse.
