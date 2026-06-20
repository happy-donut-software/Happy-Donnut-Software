<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Repositorios;

use App\Dominio\Agregados\Usuario;
use App\Dominio\ObjetosValor\Email;
use App\Dominio\ObjetosValor\RolUsuario;
use App\Dominio\Puertos\UsuarioRepositoryInterface;
use App\Infraestructura\Persistencia\Modelos\UsuarioModel;

class EloquentUsuarioRepository implements UsuarioRepositoryInterface
{
    public function guardar(Usuario $usuario): void
    {
        UsuarioModel::updateOrCreate(
            ['id' => $usuario->obtenerId()],
            [
                'nombre' => $usuario->obtenerNombre(),
                'correo' => $usuario->obtenerEmail()->obtenerDireccion(),
                'password' => $usuario->obtenerPasswordHashed(),
                'rol' => $usuario->obtenerRol()->value,
            ]
        );
    }

    public function buscarPorEmail(string $email): ?Usuario
    {
        $modelo = UsuarioModel::where('correo', $email)->first();

        if (!$modelo) {
            return null;
        }

        return new Usuario(
            $modelo->id,
            $modelo->nombre,
            new Email($modelo->correo),
            $modelo->password,
            RolUsuario::from($modelo->rol)
        );
    }
}