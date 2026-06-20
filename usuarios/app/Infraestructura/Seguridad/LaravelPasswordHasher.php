<?php

declare(strict_types=1);

namespace App\Infraestructura\Seguridad;

use App\Dominio\Puertos\PasswordHasherInterface;
use Illuminate\Support\Facades\Hash;

/**
 * Adaptador de Infraestructura que implementa el contrato de encriptación.
 * Usa el motor nativo de Laravel (Bcrypt o Argon2 según configuración).
 */
class LaravelPasswordHasher implements PasswordHasherInterface
{
    public function hashear(string $passwordRaw): string
    {
        return Hash::make($passwordRaw);
    }

    public function verificar(string $passwordRaw, string $passwordHashed): bool
    {
        return Hash::check($passwordRaw, $passwordHashed);
    }
}