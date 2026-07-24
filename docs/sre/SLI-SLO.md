# SLIs, SLOs y presupuesto de error

Ventana móvil: 30 días.

| Servicio | SLI | SLO | Presupuesto |
|---|---|---|---|
| APIs core | solicitudes exitosas / válidas | 99.9% | 43m 12s de indisponibilidad/30d |
| Ventas | p95 de `/api/ventas/*` | < 500 ms en 99% de ventanas de 5m | 1% de ventanas |
| Eventos | `VentaFinalizada` procesada sin DLQ | 99.5% en < 60 s | 0.5% |
| Checkout | confirmaciones correctas | 99.5% | 0.5% |

Alertas de burn rate: rápida 14.4x (5m/1h) y lenta 6x (30m/6h). Si se consume >50% del presupuesto se congelan cambios no urgentes. Grafana usa `observability/grafana/dashboards/happy-donut-sre.json`; los valores reales solo existen después del despliegue y la prueba de carga.