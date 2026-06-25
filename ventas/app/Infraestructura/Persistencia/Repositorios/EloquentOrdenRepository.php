<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Repositorios;

use App\Dominio\Agregados\OrdenVenta;
use App\Dominio\Entidades\LineaOrden;
use App\Dominio\ObjetosValor\EstadoOrden;
use App\Dominio\Puertos\OrdenRepositoryInterface;
use App\Infraestructura\Persistencia\Modelos\LineaOrdenModel;
use App\Infraestructura\Persistencia\Modelos\OrdenVentaModel;
use DateTimeImmutable;
use Illuminate\Support\Facades\DB;
use ReflectionProperty;

class EloquentOrdenRepository implements OrdenRepositoryInterface
{
    public function guardar(OrdenVenta $orden): void
    {
        DB::transaction(function () use ($orden) {
            // 1. Guardar la Orden Principal
            OrdenVentaModel::updateOrCreate(
                ['id' => $orden->obtenerId()],
                [
                    'cliente_id' => $orden->obtenerClienteId(),
                    'fecha_creacion' => $orden->obtenerFechaCreacion()->format('Y-m-d H:i:s'),
                    'estado' => $orden->obtenerEstado()->value,
                    'total' => $orden->calcularTotal(),
                ]
            );

            // 2. Guardar las líneas de la orden
            foreach ($orden->obtenerLineas() as $linea) {
                LineaOrdenModel::updateOrCreate(
                    ['id' => $linea->obtenerId()],
                    [
                        'orden_venta_id' => $orden->obtenerId(),
                        'producto_id' => $linea->obtenerProductoId(),
                        'nombre_producto' => $linea->obtenerNombreProducto(),
                        'cantidad' => $linea->obtenerCantidad(),
                        'precio_unitario' => $linea->obtenerPrecioUnitario(),
                    ]
                );
            }
        });
    }

    public function buscarPorId(string $id): ?OrdenVenta
    {
        $modelo = OrdenVentaModel::with('lineas')->find($id);

        if (!$modelo) {
            return null;
        }

        // Reconstruimos la entidad pura de Dominio
        $orden = new OrdenVenta(
            $modelo->id,
            $modelo->cliente_id,
            new DateTimeImmutable($modelo->fecha_creacion->toDateTimeString()),
            EstadoOrden::from($modelo->estado)
        );

        // Inyectamos las líneas saltándonos la validación de estado (porque ya existen)
        $propiedadLineas = new ReflectionProperty(OrdenVenta::class, 'lineas');
        $lineasDominio = [];

        foreach ($modelo->lineas as $lineaModel) {
            $lineasDominio[] = new LineaOrden(
                $lineaModel->id,
                $lineaModel->producto_id,
                $lineaModel->nombre_producto,
                $lineaModel->cantidad,
                (float) $lineaModel->precio_unitario
            );
        }

        $propiedadLineas->setValue($orden, $lineasDominio);

        return $orden;
    }
}