<?php

declare(strict_types=1);

namespace App\Dominio\Puertos;

use App\Dominio\Agregados\CarritoCompras;

/**
 * Puerto de Salida para la persistencia del carrito temporal.
 */
interface CarritoRepositoryInterface
{
    public function buscarPorClienteId(string $clienteId): ?CarritoCompras;

    public function guardar(CarritoCompras $carrito): void;
}