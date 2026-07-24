<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Repositorios;

use App\Dominio\Agregados\OrdenVenta;
use App\Dominio\Entidades\LineaOrden;
use App\Dominio\ObjetosValor\EstadoOrden;
use App\Dominio\Puertos\OrdenRepositoryInterface;
use App\Infraestructura\Persistencia\Modelos\LineaOrdenModel;
use App\Infraestructura\Persistencia\Modelos\EventoDominioModel;
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
                    'monto_recibido' => $orden->obtenerMontoRecibido(),
                    'vuelto' => $orden->obtenerVuelto(),
                    'metodo_pago' => $orden->obtenerMetodoPago(),
                    'tipo_comprobante' => $orden->obtenerTipoComprobante(),
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

    /** @param array<string, mixed> $evento */
    public function guardarPagoYEvento(OrdenVenta $orden, array $evento): void
    {
        DB::transaction(function () use ($orden, $evento): void {
            $this->guardar($orden);
            EventoDominioModel::create([
                'id' => $evento['id'],
                'nombre' => $evento['nombre'],
                'agregado_id' => $orden->obtenerId(),
                'payload' => $evento['payload'],
                'ocurrido_en' => $evento['ocurrido_en'],
            ]);
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
            EstadoOrden::from($modelo->estado),
            $modelo->monto_recibido === null ? null : (float) $modelo->monto_recibido,
            $modelo->vuelto === null ? null : (float) $modelo->vuelto,
            $modelo->metodo_pago,
            $modelo->tipo_comprobante
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