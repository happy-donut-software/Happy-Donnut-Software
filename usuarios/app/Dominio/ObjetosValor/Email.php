<?php

declare(strict_types=1);

namespace App\Dominio\ObjetosValor;

use DomainException;

/**
 * Objeto de Valor que garantiza que un correo electrónico tenga un formato válido.
 * Una vez creado, es inmutable.
 */
readonly class Email
{
    private string $direccion;

    public function __construct(string $direccion)
    {
        $direccionLimpia = filter_var(trim($direccion), FILTER_SANITIZE_EMAIL);

        if (!filter_var($direccionLimpia, FILTER_VALIDATE_EMAIL)) {
            throw new DomainException("El formato del correo electrónico '{$direccion}' no es válido.");
        }

        $this->direccion = $direccionLimpia;
    }

    public function obtenerDireccion(): string
    {
        return $this->direccion;
    }

    public function esIgualA(Email $otroEmail): bool
    {
        return $this->direccion === $otroEmail->obtenerDireccion();
    }
}