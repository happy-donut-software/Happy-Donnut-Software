<?php

declare(strict_types=1);

namespace App\Dominio\ObjetosValor;

use DomainException;

/**
 * Objeto de valor que representa la cantidad de unidades de un producto.
 * Garantiza que la cantidad nunca sea negativa.
 */
readonly class CantidadStock
{
    public function __construct(private int $valor)
    {
        if ($this->valor < 0) {
            throw new DomainException("El stock no puede ser un número negativo.");
        }
    }

    public function obtenerValor(): int
    {
        return $this->valor;
    }

    public function sumar(CantidadStock $cantidad): self
    {
        return new self($this->valor + $cantidad->obtenerValor());
    }

    public function restar(CantidadStock $cantidad): self
    {
        $nuevoValor = $this->valor - $cantidad->obtenerValor();
        
        if ($nuevoValor < 0) {
            throw new DomainException("Stock insuficiente para realizar esta operación.");
        }

        return new self($nuevoValor);
    }
}