<?php

declare(strict_types=1);

namespace App\Aplicacion\DTOs;

/**
 * Transporta los datos limpios para registrar un nuevo usuario.
 */
readonly class RegistrarUsuarioDTO
{
    public function __construct(
        public string $nombre,
        public string $email,
        public string $passwordRaw, // Contraseña en texto plano (AÚN no encriptada)
        public string $rol
    ) {
    }
}