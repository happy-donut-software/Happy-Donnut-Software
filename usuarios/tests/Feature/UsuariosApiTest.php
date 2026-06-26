<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsuariosApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_registrar_crea_un_usuario_exitosamente(): void
    {
        $response = $this->postJson('/api/usuarios/registrar', [
            'nombre' => 'Ana García',
            'email' => 'ana@happydonut.com',
            'password' => 'secreto123',
            'rol' => 'cliente',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['mensaje', 'usuario_id']);

        $this->assertDatabaseHas('usuarios', [
            'nombre' => 'Ana García',
            'correo' => 'ana@happydonut.com',
            'rol' => 'cliente',
        ]);
    }

    public function test_registrar_falla_con_email_duplicado(): void
    {
        $payload = [
            'nombre' => 'Usuario Uno',
            'email' => 'duplicado@happydonut.com',
            'password' => 'secreto123',
            'rol' => 'cajero',
        ];

        $this->postJson('/api/usuarios/registrar', $payload)->assertStatus(201);

        $response = $this->postJson('/api/usuarios/registrar', [
            ...$payload,
            'nombre' => 'Usuario Dos',
        ]);

        $response->assertStatus(400)
            ->assertJson(['error' => 'El correo electrónico ya está registrado.']);
    }

    public function test_registrar_falla_con_rol_invalido(): void
    {
        $response = $this->postJson('/api/usuarios/registrar', [
            'nombre' => 'Usuario Inválido',
            'email' => 'invalido@happydonut.com',
            'password' => 'secreto123',
            'rol' => 'superadmin',
        ]);

        $response->assertStatus(400)
            ->assertJson(['error' => 'El rol proporcionado no es válido.']);
    }

    public function test_login_exitoso_devuelve_token(): void
    {
        $this->postJson('/api/usuarios/registrar', [
            'nombre' => 'Carlos Cajero',
            'email' => 'cajero@happydonut.com',
            'password' => 'miPassword1',
            'rol' => 'cajero',
        ]);

        $response = $this->postJson('/api/usuarios/login', [
            'email' => 'cajero@happydonut.com',
            'password' => 'miPassword1',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'mensaje',
                'access_token',
                'token_type',
                'usuario' => ['id', 'nombre', 'rol'],
            ])
            ->assertJson([
                'token_type' => 'Bearer',
                'usuario' => [
                    'nombre' => 'Carlos Cajero',
                    'rol' => 'cajero',
                ],
            ]);
    }

    public function test_login_falla_con_credenciales_incorrectas(): void
    {
        $this->postJson('/api/usuarios/registrar', [
            'nombre' => 'María Cliente',
            'email' => 'maria@happydonut.com',
            'password' => 'correcta123',
            'rol' => 'cliente',
        ]);

        $response = $this->postJson('/api/usuarios/login', [
            'email' => 'maria@happydonut.com',
            'password' => 'incorrecta123',
        ]);

        $response->assertStatus(401)
            ->assertJson(['error' => 'Credenciales incorrectas.']);
    }
}
