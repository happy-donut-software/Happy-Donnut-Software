<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Repositorios;

use App\Dominio\Agregados\CarritoCompras;
use App\Dominio\Puertos\CarritoRepositoryInterface;
use App\Infraestructura\Persistencia\Modelos\CarritoModel;
use App\Infraestructura\Persistencia\Modelos\ItemCarritoModel;
use Illuminate\Support\Facades\DB;

class EloquentCarritoRepository implements CarritoRepositoryInterface
{
    public function buscarPorClienteId(string $clienteId): ?CarritoCompras
    {
        $modelo = CarritoModel::with('items')->where('cliente_id', $clienteId)->first();

        if (!$modelo) {
            return null;
        }

        // Reconstruimos la raíz del agregado
        $carrito = new CarritoCompras($modelo->id, $modelo->cliente_id);

        // Agregamos los ítems guardados en BD usando el método del dominio
        foreach ($modelo->items as $itemModel) {
            $carrito->agregarProducto(
                $itemModel->producto_id,
                $itemModel->nombre_producto,
                (int) $itemModel->cantidad,
                (float) $itemModel->precio_unitario
            );
        }

        return $carrito;
    }

    public function guardar(CarritoCompras $carrito): void
    {
        DB::transaction(function () use ($carrito) {
            // 1. Guardar el carrito principal
            CarritoModel::updateOrCreate(
                ['id' => $carrito->obtenerId()],
                [
                    'cliente_id' => $carrito->obtenerClienteId(),
                    'total_estimado' => $carrito->calcularTotalEstimado(),
                ]
            );

            // 2. Sincronizar los ítems
            // Primero, obtenemos los IDs de los productos que *actualmente* están en el carrito
            $productosIds = array_map(
                fn($item) => $item->obtenerProductoId(), 
                $carrito->obtenerItems()
            );

            // Eliminamos de la base de datos los ítems que el cliente sacó del carrito
            ItemCarritoModel::where('carrito_id', $carrito->obtenerId())
                ->whereNotIn('producto_id', $productosIds)
                ->delete();

            // Insertamos o actualizamos los ítems que quedaron
            foreach ($carrito->obtenerItems() as $item) {
                ItemCarritoModel::updateOrCreate(
                    [
                        'carrito_id' => $carrito->obtenerId(),
                        'producto_id' => $item->obtenerProductoId()
                    ],
                    [
                        'nombre_producto' => $item->obtenerNombreProducto(),
                        'cantidad' => $item->obtenerCantidad(),
                        'precio_unitario' => $item->obtenerPrecioUnitario()
                    ]
                );
            }
        });
    }
}