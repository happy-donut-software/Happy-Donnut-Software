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

// Importaciones estándar de OpenTelemetry para la trazabilidad y observabilidad
use OpenTelemetry\API\Trace\TracerProviderInterface;
use OpenTelemetry\API\Trace\StatusCode;

class AuthController extends Controller
{
    /**
     * Registra un nuevo usuario en el sistema.
     * Incorpora instrumentación OTel para medir la latencia y persistencia del dominio.
     */
    public function registrar(Request $request, RegistrarUsuarioUseCase $useCase): JsonResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6',
            'rol' => 'required|string', // admin, cajero, cliente
        ]);

        // 1. Resolver el proveedor de trazas e iniciar el Span de Registro
        $tracer = app(TracerProviderInterface::class)->getTracer('usuarios-auth-tracer');
        $span = $tracer->spanBuilder('usuario-registro')
            ->setAttribute('http.method', $request->method())
            ->setAttribute('http.url', $request->fullUrl())
            ->setAttribute('user.register_email', $request->email)
            ->setAttribute('user.register_role', $request->rol)
            ->startSpan();

        // 2. Activar el ámbito (scope) del Span en el contexto actual
        $scope = $span->activate();

        try {
            $dto = new RegistrarUsuarioDTO(
                $request->nombre,
                $request->email,
                $request->password,
                $request->rol
            );
            
            // Llamada al caso de uso de la arquitectura hexagonal
            $usuario = $useCase->ejecutar($dto);

            // 3. Registrar atributos de éxito en el Span
            $span->setAttribute('auth.status', 'created');
            $span->setAttribute('user.id', $usuario->obtenerId());
            $span->setStatus(StatusCode::STATUS_OK, 'Usuario creado con éxito');

            return response()->json([
                'mensaje' => 'Usuario registrado exitosamente.',
                'usuario_id' => $usuario->obtenerId()
            ], 201);

        } catch (DomainException $e) {
            // Capturar errores lógicos de negocio en la telemetría
            $span->setAttribute('auth.status', 'validation_failed');
            $span->setStatus(StatusCode::STATUS_ERROR, $e->getMessage());
            $span->recordException($e);

            return response()->json(['error' => $e->getMessage()], 400);

        } catch (\Exception $e) {
            // Capturar colapsos inesperados o caídas de infraestructura
            $span->setAttribute('auth.status', 'infrastructure_error');
            $span->setStatus(StatusCode::STATUS_ERROR, 'Fallo crítico de registro');
            $span->recordException($e);

            return response()->json(['error' => 'Error interno del servidor al registrar.'], 500);

        } finally {
            // 4. Asegurar el cierre del Span y desvincular el scope para enviarlo al Collector
            $span->end();
            $scope->detach();
        }
    }

    /**
     * Autentica un usuario y genera su respectivo Token de acceso (Bearer Token).
     * Este endpoint será el blanco principal del Chaos Mesh (Inyección de Fallos en Persistencia/Red).
     */
    public function login(Request $request, AutenticarUsuarioUseCase $useCase): JsonResponse
    {   
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // 1. Resolver el proveedor de trazas de OTel e iniciar el Span de Inicio de Sesión
        $tracer = app(TracerProviderInterface::class)->getTracer('usuarios-auth-tracer');
        $span = $tracer->spanBuilder('usuario-inicio-sesion')
            ->setAttribute('http.method', $request->method())
            ->setAttribute('http.url', $request->fullUrl())
            ->setAttribute('auth.login_attempt_email', $request->email)
            ->setAttribute('auth.provider', 'laravel-sanctum')
            ->startSpan();

        // 2. Activar el scope en el hilo de ejecución actual
        $scope = $span->activate();

        try {
            // 1. El dominio valida matemáticamente si las credenciales son correctas
            $dto = new AutenticarUsuarioDTO($request->email, $request->password);
            $usuarioDominio = $useCase->ejecutar($dto);

            // 2. Si llegamos aquí, el usuario es genuino. 
            // Buscamos el modelo de infraestructura para generar el Token de Sanctum.
            $usuarioModel = UsuarioModel::find($usuarioDominio->obtenerId());
            
            // Creamos un Bearer Token ("pase de acceso")
            $token = $usuarioModel->createToken('auth_token')->plainTextToken;

            // 3. Enriquecer el Span con datos finales del éxito de autenticación
            $span->setAttribute('auth.status', 'success');
            $span->setAttribute('user.id', $usuarioDominio->obtenerId());
            $span->setAttribute('user.rol', $usuarioDominio->obtenerRol()->value);
            $span->setStatus(StatusCode::STATUS_OK, 'Autenticación exitosa');

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
            // Registrar fallos de autenticación (Credenciales incorrectas) en OTel como error controlado
            $span->setAttribute('auth.status', 'unauthorized');
            $span->setAttribute('auth.failure_reason', $e->getMessage());
            $span->setStatus(StatusCode::STATUS_ERROR, $e->getMessage());
            $span->recordException($e);

            return response()->json(['error' => $e->getMessage()], 401);

        } catch (\Exception $e) {
            // Capturar errores críticos (p. ej., colapso de base de datos causado por Chaos Mesh)
            $span->setAttribute('auth.status', 'server_error');
            $span->setStatus(StatusCode::STATUS_ERROR, 'Excepción en el adaptador de persistencia o red');
            $span->recordException($e); // Guarda el stack trace completo del fallo

            return response()->json(['error' => 'Fallo crítico interno del sistema.'], 500);

        } finally {
            // 4. Obligatorio finalizar el span para evitar fugas de memoria y emitir la traza
            $span->end();
            $scope->detach();
        }
    }

    /**
     * Obtiene los datos del usuario autenticado actualmente.
     */
    public function me(Request $request)
    {
        // $request->user() obtiene el modelo Usuario basado en el Token enviado
        $usuario = $request->user();

        return response()->json([
            'usuario' => [
                'id' => $usuario->id, 
                'nombre' => $usuario->nombre,
                'email' => $usuario->correo, // Ajusta a 'correo' o 'email' según tu BD
                'rol' => $usuario->rol
            ]
        ], 200);
    }

    /**
     * Cierra la sesión revocando el token actual.
     */
    public function logout(Request $request)
    {
        // Buscamos el token actual que usó el usuario y lo borramos de la base de datos
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'mensaje' => 'Sesión cerrada exitosamente.'
        ], 200);
    }
}