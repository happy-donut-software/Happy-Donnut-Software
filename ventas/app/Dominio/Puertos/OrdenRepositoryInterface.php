<?php

declare(strict_types=1);

namespace App\Dominio\Puertos;

use App\Dominio\Agregados\OrdenVenta;

/**
 * Puerto de Salida.
 * El dominio y la aplicación dictan ESTE contrato. La base de datos (Infraestructura)
 * estará obligada a cumplirlo más adelante.
 */
interface OrdenRepositoryInterface
{
    public function guardar(OrdenVenta $orden): void;
    public function buscarPorId(string $id): ?OrdenVenta;
}