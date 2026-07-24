<?php

declare(strict_types=1);

namespace App\Dominio\Puertos;

use App\Dominio\Entidades\ProductoVenta;

interface ProductoVentaRepositoryInterface
{
    /** @return ProductoVenta[] */
    public function listarActivos(): array;
    public function buscarActivoPorId(string $id): ?ProductoVenta;
}
