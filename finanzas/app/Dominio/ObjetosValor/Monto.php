<?php

declare(strict_types=1);

namespace App\Dominio\ObjetosValor;

use InvalidArgumentException;

/**
 * Representa una cantidad de dinero en el sistema.
 * Es inmutable y garantiza que jamás exista dinero negativo o valores absurdos.
 */
readonly class Monto
{
    private float $valor;

    public function __construct(float $valor)
    {
        // Regla de Negocio: En finanzas, un "Monto" de dinero físico o transaccional
        // no puede ser menor a cero. Las salidas se manejan por el "Tipo de Movimiento",
        // no usando números negativos.
        if ($valor < 0) {
            throw new InvalidArgumentException("Un monto de dinero no puede ser negativo.");
        }

        // Forzamos a que siempre tenga exactamente 2 decimales para evitar
        // errores de coma flotante en PHP (ej: 10.005 se convierte en 10.01)
        $this->valor = round($valor, 2);
    }

    public function obtenerValor(): float
    {
        return $this->valor;
    }

    /**
     * Suma este monto con otro y devuelve un NUEVO objeto Monto.
     */
    public function sumar(Monto $otroMonto): self
    {
        return new self($this->valor + $otroMonto->obtenerValor());
    }

    /**
     * Resta un monto a este y devuelve un NUEVO objeto Monto.
     */
    public function restar(Monto $otroMonto): self
    {
        $nuevoValor = $this->valor - $otroMonto->obtenerValor();

        if ($nuevoValor < 0) {
            throw new InvalidArgumentException("La resta resultó en un monto negativo (Fondo insuficiente).");
        }

        return new self($nuevoValor);
    }

    /**
     * Compara si dos montos son exactamente iguales.
     */
    public function esIgualA(Monto $otroMonto): bool
    {
        return $this->valor === $otroMonto->obtenerValor();
    }
}