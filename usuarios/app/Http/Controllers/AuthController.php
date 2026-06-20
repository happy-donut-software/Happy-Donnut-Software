<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Aplicacion\CasosUso\RegistrarUsuarioUseCase;
use App\Aplicacion\CasosUso\AutenticarUsuarioUseCase;
use App\Aplicacion\DTOs\RegistrarUsuarioDTO;
use App\Aplicacion\DTOs\AutenticarUsuarioDTO;
use App\Infraestructura\Persistencia\Modelos\UsuarioModel;
use DomainException;

class AuthController extends Controller
{
    public function registrar(Request $request, RegistrarUsuarioUseCase $useCase): JsonResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6',
            'rol' => 'required|string', // admin, cajero, cliente
        ]);

        try {
            $dto = new RegistrarUsuarioDTO(
                $request->nombre,
                $request->email,
                $request->password,
                $request->rol
            );
            
            $usuario = $useCase->ejecutar($dto);

            return response()->json([
                'mensaje' => 'Usuario registrado exitosamente.',
                'usuario_id' => $usuario->obtenerId()
            ], 201);

        } catch (DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function login(Request $request, AutenticarUsuarioUseCase $useCase): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        try {
            // 1. El dominio valida matemáticamente si las credenciales son correctas
            $dto = new AutenticarUsuarioDTO($request->email, $request->password);
            $usuarioDominio = $useCase->ejecutar($dto);

            // 2. Si llegamos aquí, el usuario es genuino. 
            // Buscamos el modelo de infraestructura para generar el Token de Sanctum.
            $usuarioModel = UsuarioModel::find($usuarioDominio->obtenerId());
            
            // Creamos un Bearer Token ("pase de acceso")
            $token = $usuarioModel->createToken('auth_token')->plainTextToken;

            return response()->json([
                'mensaje' => 'Login exitoso.',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'usuario' => [
                    'id' => $usuarioDominio->obtenerId(),
                    'nombre' => $usuarioDominio->obtenerNombre(),
                    'rol' => $usuarioDominio->obtenerRol()->value,
                ]
            ]);

        } catch (DomainException $e) {
            // Error 401 = No autorizado (Credenciales inválidas)
            return response()->json(['error' => $e->getMessage()], 401);
        }
    }
}