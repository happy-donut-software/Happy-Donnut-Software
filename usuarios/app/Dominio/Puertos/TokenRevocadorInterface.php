<?php

declare(strict_types=1);

namespace App\Dominio\Puertos;

interface TokenRevocadorInterface
{
    public function revocarToken(string $usuarioId, string $tokenId): void;
}