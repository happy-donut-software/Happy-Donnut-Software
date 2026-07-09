<?php

namespace App\Infraestructura\Adaptadores\REST;

use App\Aplicacion\CasosUso\AutenticarUsuarioUseCase;
use App\Aplicacion\CasosUso\CerrarSesionUseCase;
use App\Aplicacion\CasosUso\ObtenerPerfilUsuarioUseCase;
use App\Aplicacion\CasosUso\RegistrarUsuarioUseCase;
use App\Aplicacion\DTOs\AutenticarUsuarioDTO;
use App\Aplicacion\DTOs\RegistrarUsuarioDTO;
use App\Http\Controllers\Controller;
use App\Infraestructura\Persistencia\Modelos\UsuarioModel;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function registrar(Request $request, RegistrarUsuarioUseCase $useCase): JsonResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6',
            'rol' => 'required|string',
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
                'usuario_id' => $usuario->obtenerId(),
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
            $dto = new AutenticarUsuarioDTO($request->email, $request->password);
            $usuarioDominio = $useCase->ejecutar($dto);

            $usuarioModel = UsuarioModel::find($usuarioDominio->obtenerId());
            $token = $usuarioModel->createToken('auth_token')->plainTextToken;

            return response()->json([
                'mensaje' => 'Login exitoso.',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'usuario' => [
                    'id' => $usuarioDominio->obtenerId(),
                    'nombre' => $usuarioDominio->obtenerNombre(),
                    'rol' => $usuarioDominio->obtenerRol()->value,
                ],
            ]);
        } catch (DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 401);
        }
    }

    public function me(Request $request, ObtenerPerfilUsuarioUseCase $useCase): JsonResponse
    {
        try {
            $usuario = $useCase->ejecutar((string) $request->user()->id);

            return response()->json([
                'usuario' => [
                    'id' => $usuario->obtenerId(),
                    'nombre' => $usuario->obtenerNombre(),
                    'email' => $usuario->obtenerEmail()->obtenerDireccion(),
                    'rol' => $usuario->obtenerRol()->value,
                ],
            ]);
        } catch (DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    public function logout(Request $request, CerrarSesionUseCase $useCase): JsonResponse
    {
        $token = $request->user()->currentAccessToken();
        $useCase->ejecutar((string) $request->user()->id, (string) $token->id);

        return response()->json([
            'mensaje' => 'Sesión cerrada exitosamente.',
        ]);
    }
}