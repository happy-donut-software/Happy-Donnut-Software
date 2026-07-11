<?php

namespace Tests\Unit\Dominio;

use App\Dominio\Agregados\Usuario;
use App\Dominio\ObjetosValor\Email;
use App\Dominio\ObjetosValor\RolUsuario;
use DomainException;
use PHPUnit\Framework\TestCase;

class UsuarioTest extends TestCase
{
    private function crearUsuario(): Usuario
    {
        return new Usuario(
            'usr_1',
            'Juan Pérez',
            new Email('juan@happydonut.com'),
            'hash_seguro',
            RolUsuario::CAJERO
        );
    }

    public function test_cambiar_rol(): void
    {
        $usuario = $this->crearUsuario();
        $usuario->cambiarRol(RolUsuario::ADMIN);

        $this->assertSame(RolUsuario::ADMIN, $usuario->obtenerRol());
    }

    public function test_actualizar_password(): void
    {
        $usuario = $this->crearUsuario();
        $usuario->actualizarPassword('nuevo_hash');

        $this->assertSame('nuevo_hash', $usuario->obtenerPasswordHashed());
    }

    public function test_rechaza_nombre_vacio(): void
    {
        $this->expectException(DomainException::class);
        new Usuario('usr_1', '   ', new Email('a@b.com'), 'hash', RolUsuario::CLIENTE);
    }

    public function test_rechaza_password_vacio(): void
    {
        $usuario = $this->crearUsuario();

        $this->expectException(DomainException::class);
        $usuario->actualizarPassword('   ');
    }
}