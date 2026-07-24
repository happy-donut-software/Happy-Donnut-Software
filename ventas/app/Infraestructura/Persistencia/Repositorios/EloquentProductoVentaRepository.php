<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Repositorios;

use App\Dominio\Entidades\ProductoVenta;
use App\Dominio\Puertos\ProductoVentaRepositoryInterface;
use App\Infraestructura\Persistencia\Modelos\ProductoVentaModel;

class EloquentProductoVentaRepository implements ProductoVentaRepositoryInterface
{
    public function listarActivos(): array
    {
        return ProductoVentaModel::where('activo', true)->orderBy('nombre')->get()
            ->map(fn ($producto) => $this->aDominio($producto))->all();
    }

    public function buscarActivoPorId(string $id): ?ProductoVenta
    {
        $modelo = ProductoVentaModel::whereKey($id)->where('activo', true)->first();
        return $modelo ? $this->aDominio($modelo) : null;
    }

    private function aDominio(ProductoVentaModel $modelo): ProductoVenta
    {
        return new ProductoVenta($modelo->id, $modelo->nombre, (float) $modelo->precio, (bool) $modelo->activo);
    }
}
