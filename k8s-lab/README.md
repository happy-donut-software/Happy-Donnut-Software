# Happy Donut Kubernetes Lab

Entorno preparado para la práctica de Resiliencia, OpenTelemetry y Chaos Engineering.

## Estado preparado

- Cluster local kind: `kind-happydonut-lab`
- Chaos Mesh: namespace `chaos-mesh`
- OpenTelemetry Collector: namespace `observability`, service `otel-collector:4317/4318`
- Jaeger UI: http://localhost:16686
- Grafana UI: http://localhost:8081
  - usuario: `admin`
  - password: `admin`
- Namespace para el MVP: `happydonut-lab`

## Verificaciones

```powershell
kubectl config current-context
kubectl get nodes
kubectl get pods -n chaos-mesh
kubectl get pods -n observability
kubectl get pods -n monitoring
```

## Reaplicar observabilidad si hace falta

```powershell
kubectl apply -f k8s-lab/observability.yaml
```

## Plantilla de caos

La plantilla `chaos-network-latency-template.yaml` inyecta 200 ms de latencia durante 5 minutos al componente con label `app=bd-inventario` en el namespace `happydonut-lab`.

Aplicar durante la práctica:

```powershell
kubectl apply -f k8s-lab/chaos-network-latency-template.yaml
```

Eliminar el experimento:

```powershell
kubectl delete -f k8s-lab/chaos-network-latency-template.yaml
```

## Infraestructura del MVP ya aplicada

Se aplicó `01-lab-infra.yaml` y están corriendo:

- `rabbitmq`
- `bd-inventario` con label `app=bd-inventario`
- `bd-ventas` con label `app=bd-ventas`

Verificar:

```powershell
kubectl get pods,svc -n happydonut-lab
```

## Pendiente antes de ejecutar el experimento real sobre Happy Donut

1. Construir imágenes Kubernetes para los servicios Laravel que quieras probar.
2. Cargarlas en kind con `kind load docker-image ... --name happydonut-lab`.
3. Ajustar `02-apps-template.yaml` con esas imágenes.
4. Agregar instrumentación OpenTelemetry real en al menos dos servicios Laravel.
5. Aplicar las apps:

```powershell
kubectl apply -f k8s-lab/02-apps-template.yaml
```

Después de eso, el experimento de latencia contra `app=bd-inventario` ya tendrá sentido de extremo a extremo.

