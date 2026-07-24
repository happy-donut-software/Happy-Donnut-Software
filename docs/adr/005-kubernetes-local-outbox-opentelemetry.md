# ADR 005 - Kubernetes local, outbox transaccional y OpenTelemetry

- Estado: aceptado
- Fecha: 2026-07-15
- Responsables: equipo Happy Donut

## Contexto

El producto debe demostrar orquestación, GitOps, observabilidad y resiliencia, pero el equipo no dispone de un servidor pagado. Docker Desktop ofrece un clúster Kubernetes de un nodo adecuado para evaluación y desarrollo.

## Decisión

El overlay `local` crea bases y servicios dentro de Docker Desktop. Las imágenes se construyen con etiqueta `:local` y `imagePullPolicy: IfNotPresent`. Argo CD observa `develop` únicamente cuando los cambios ya fueron publicados.

La consistencia entre servicios usa transactional outbox en Ventas y consumidores idempotentes en Inventario y Finanzas. El relay usa HTTP autenticado y reintentos; RabbitMQ queda desplegado como infraestructura preparada, pero no se declara como transporte del evento actual.

La telemetría usa OpenTelemetry PHP, OTLP HTTP, Collector y Tempo. Las métricas RED se exponen en formato Prometheus.

## Consecuencias

- La entrega completa puede ejecutarse sin costo de nube.
- Las URL son locales y la evidencia se genera después de cada instalación.
- Un despliegue público requiere reemplazar secretos, persistencia, registro, DNS y TLS.
- Argo CD no puede reconciliar cambios que solo están en el disco local.
