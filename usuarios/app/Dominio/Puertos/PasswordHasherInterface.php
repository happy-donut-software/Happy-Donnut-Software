<?php

declare(strict_types=1);

namespace App\Dominio\Puertos;

/**
 * Puerto de Salida para encriptar y verificar contraseñas.
 * El dominio sabe QUE necesita encriptar, pero no le importa SI usamos
 * Bcrypt, Argon2 o MD5 (eso lo decidirá la infraestructura).
 */
interface PasswordHasherInterface
{
    public function hashear(string $passwordRaw): string;
    public function verificar(string $passwordRaw, string $passwordHashed): bool;
}