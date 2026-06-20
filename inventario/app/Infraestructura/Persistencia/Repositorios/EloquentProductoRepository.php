<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Repositorios;

use App\Dominio\Agregados\ProductoInventario;
use App\Dominio\ObjetosValor\CantidadStock;
use App\Dominio\Puertos\ProductoRepositoryInterface;
use App\Infraestructura\Persistencia\Modelos\ProductoInventarioModel;

class EloquentProductoRepository implements ProductoRepositoryInterface
{
    public function buscarPorId(string $id): ?ProductoInventario
    {
        $modelo = ProductoInventarioModel::find($id);

        if (!$modelo) {
            return null;
        }

        return new ProductoInventario(
            $modelo->id,
            $modelo->nombre,
            new CantidadStock((int) $modelo->stock_disponible)
        );
    }

    public function guardar(ProductoInventario $producto): void
    {
        ProductoInventarioModel::updateOrCreate(
            ['id' => $producto->obtenerId()],
            [
                'nombre' => $producto->obtenerNombre(),
                'stock_disponible' => $producto->obtenerStockDisponible()->obtenerValor(),
            ]
        );
    }
}