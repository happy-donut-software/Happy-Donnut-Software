<?php

declare(strict_types=1);

namespace App\Dominio\Puertos;

use App\Dominio\Agregados\CarritoCompras;

/**
 * Puerto de Salida para la persistencia del carrito temporal.
 * En la vida real de alto tráfico, este repositorio suele implementarse
 * con Redis (en memoria) en lugar de PostgreSQL para que sea rapidísimo,
 * pero usaremos nuestra base de datos relacional por simplicidad del MVP.
 */
interface CarritoRepositoryInterface
{
    /**
     * Busca el carrito activo de un cliente específico.
     */
    public function buscarPorClienteId(string $clienteId): ?CarritoCompras;

    /**
     * Guarda el estado actual del carrito y sus ítems.
     */
    public function guardar(CarritoCompras $carrito): void;
}