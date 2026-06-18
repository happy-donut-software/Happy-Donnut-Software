<?php

declare(strict_types=1);

namespace App\Dominio\ObjetosValor;

/**
 * Enum que define el ciclo de vida estricto de un Turno de Caja.
 */
enum EstadoTurno: string
{
    case ABIERTO = 'abierto';
    case CERRADO = 'cerrado';

    public function estaAbierto(): bool
    {
        return $this === self::ABIERTO;
    }

    public function estaCerrado(): bool
    {
        return $this === self::CERRADO;
    }
}