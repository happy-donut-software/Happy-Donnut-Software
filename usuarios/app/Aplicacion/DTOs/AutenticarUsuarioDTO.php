<?php

declare(strict_types=1);

namespace App\Aplicacion\DTOs;

/**
 * Transporta las credenciales para el inicio de sesión.
 */
readonly class AutenticarUsuarioDTO
{
    public function __construct(
        public string $email,
        public string $passwordRaw
    ) {
    }
}