<?php

declare(strict_types=1);

namespace App\Dominio\Agregados;

use App\Dominio\ObjetosValor\CantidadStock;

/**
 * Raíz del Agregado de Inventario.
 * Controla la lógica de entrada y salida de unidades de un producto específico.
 */
class ProductoInventario
{
    public function __construct(
        private readonly string $id,
        private readonly string $nombre,
        private CantidadStock $stockDisponible
    ) {
    }

    public function obtenerId(): string
    {
        return $this->id;
    }

    public function obtenerNombre(): string
    {
        return $this->nombre;
    }

    public function obtenerStockDisponible(): CantidadStock
    {
        return $this->stockDisponible;
    }

    /**
     * Regla de Negocio: Agregar unidades al inventario físico (ej. llegó el proveedor).
     */
    public function registrarEntrada(CantidadStock $cantidad): void
    {
        $this->stockDisponible = $this->stockDisponible->sumar($cantidad);
    }

    /**
     * Regla de Negocio: Descontar unidades definitivamente (ej. venta pagada o merma).
     */
    public function registrarSalida(CantidadStock $cantidad): void
    {
        // El Objeto de Valor 'CantidadStock' se encargará de lanzar la excepción
        // si la resta resulta en un número negativo (stock insuficiente).
        $this->stockDisponible = $this->stockDisponible->restar($cantidad);
    }
}