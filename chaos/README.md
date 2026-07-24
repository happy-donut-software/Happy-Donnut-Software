# Experimentos de caos

Ejecutar solo en staging con autorización. Hipótesis pod-failure: al perder un pod de Ventas, el PDB/HPA y Service mantienen disponibilidad y el SLO no supera 0.1% de errores. Hipótesis network-delay: una demora de 300 ms entre Ventas e Inventario no pierde eventos; se reintenta y procesa en menos de 60 s.

Registrar antes/después: hora UTC, versión SHA, tráfico, p95, error rate, backlog/DLQ, tiempo de recuperación y captura Grafana. Los manifiestos no constituyen evidencia de ejecución; el informe final debe incorporar resultados reales.