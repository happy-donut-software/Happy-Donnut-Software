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
        return ProductoVentaModel::with('categoria')->where('activo', true)->orderBy('nombre')->get()
            ->map(fn (ProductoVentaModel $producto) => $this->aDominio($producto))->all();
    }

    public function buscarActivoPorId(string $id): ?ProductoVenta
    {
        $modelo = ProductoVentaModel::with('categoria')->whereKey($id)->where('activo', true)->first();
        return $modelo ? $this->aDominio($modelo) : null;
    }

    private function aDominio(ProductoVentaModel $modelo): ProductoVenta
    {
        return new ProductoVenta(
            $modelo->id,
            $modelo->nombre,
            (float) $modelo->precio,
            (bool) $modelo->activo,
            $modelo->categoria_id ? (int) $modelo->categoria_id : null,
            $modelo->categoria?->nombre,
            $modelo->categoria?->slug,
            $modelo->descripcion,
            $modelo->imagen_url,
        );
    }
}
