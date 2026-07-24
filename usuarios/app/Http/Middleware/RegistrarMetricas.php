<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RegistrarMetricas
{
    private const BALDES = [0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0];

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('api/metrics')) {
            return $next($request);
        }

        $inicio = microtime(true);
        try {
            $respuesta = $next($request);
            $this->registrar($respuesta->getStatusCode(), microtime(true) - $inicio);
            return $respuesta;
        } catch (\Throwable $error) {
            $this->registrar(500, microtime(true) - $inicio);
            throw $error;
        }
    }

    private function registrar(int $estado, float $duracion): void
    {
        $this->conArchivo(function (array &$datos) use ($estado, $duracion): void {
            $datos['solicitudes'][(string) $estado] = ($datos['solicitudes'][(string) $estado] ?? 0) + 1;
            $datos['duracion_suma'] = ($datos['duracion_suma'] ?? 0.0) + $duracion;
            $datos['duracion_conteo'] = ($datos['duracion_conteo'] ?? 0) + 1;
            foreach (self::BALDES as $balde) {
                $clave = (string) $balde;
                if ($duracion <= $balde) {
                    $datos['baldes'][$clave] = ($datos['baldes'][$clave] ?? 0) + 1;
                }
            }
        });
    }

    public static function exportar(): string
    {
        $instancia = new self();
        $datos = [];
        $instancia->conArchivo(function (array &$actuales) use (&$datos): void { $datos = $actuales; });
        $servicio = addcslashes((string) env('SERVICE_NAME', config('app.name', 'happy-donut')), "\\\"");
        $lineas = [
            '# HELP http_requests_total Solicitudes HTTP procesadas.',
            '# TYPE http_requests_total counter',
        ];
        foreach (array_replace(['200' => 0, '500' => 0], $datos['solicitudes'] ?? []) as $estado => $cantidad) {
            $lineas[] = sprintf('http_requests_total{service="%s",status="%s"} %d', $servicio, $estado, $cantidad);
        }
        $lineas[] = '# HELP http_request_duration_seconds Duracion de solicitudes HTTP.';
        $lineas[] = '# TYPE http_request_duration_seconds histogram';
        $conteo = (int) ($datos['duracion_conteo'] ?? 0);
        foreach (self::BALDES as $balde) {
            $clave = (string) $balde;
            $lineas[] = sprintf('http_request_duration_seconds_bucket{service="%s",le="%s"} %d', $servicio, $clave, (int) ($datos['baldes'][$clave] ?? 0));
        }
        $lineas[] = sprintf('http_request_duration_seconds_bucket{service="%s",le="+Inf"} %d', $servicio, $conteo);
        $lineas[] = sprintf('http_request_duration_seconds_sum{service="%s"} %.6f', $servicio, (float) ($datos['duracion_suma'] ?? 0.0));
        $lineas[] = sprintf('http_request_duration_seconds_count{service="%s"} %d', $servicio, $conteo);
        return implode("\n", $lineas) . "\n";
    }

    /** @param callable(array<string, mixed>&): void $operacion */
    private function conArchivo(callable $operacion): void
    {
        $ruta = storage_path('app/metricas-prometheus.json');
        $directorio = dirname($ruta);
        if (!is_dir($directorio)) { mkdir($directorio, 0775, true); }
        $archivo = fopen($ruta, 'c+');
        if ($archivo === false) { return; }
        try {
            if (!flock($archivo, LOCK_EX)) { return; }
            rewind($archivo);
            $contenido = stream_get_contents($archivo);
            $datos = $contenido ? (json_decode($contenido, true) ?: []) : [];
            $operacion($datos);
            ftruncate($archivo, 0);
            rewind($archivo);
            fwrite($archivo, json_encode($datos, JSON_THROW_ON_ERROR));
            fflush($archivo);
            flock($archivo, LOCK_UN);
        } finally {
            fclose($archivo);
        }
    }
}