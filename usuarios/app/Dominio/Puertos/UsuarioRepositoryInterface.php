<?php

declare(strict_types=1);

namespace App\Dominio\Puertos;

use App\Dominio\Agregados\Usuario;

/**
 * Puerto de Salida para guardar y buscar usuarios.
 */
interface UsuarioRepositoryInterface
{
    public function guardar(Usuario $usuario): void;
    public function buscarPorEmail(string $email): ?Usuario;
}