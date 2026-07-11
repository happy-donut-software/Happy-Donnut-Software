<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Dominio\Agregados\Usuario;
use App\Dominio\Puertos\UsuarioRepositoryInterface;
use DomainException;

class ObtenerPerfilUsuarioUseCase
{
    public function __construct(
        private readonly UsuarioRepositoryInterface $repositorio
    ) {
    }

    public function ejecutar(string $usuarioId): Usuario
    {
        $usuario = $this->repositorio->buscarPorId($usuarioId);

        if ($usuario === null) {
            throw new DomainException('El usuario autenticado no existe.');
        }

        return $usuario;
    }
}