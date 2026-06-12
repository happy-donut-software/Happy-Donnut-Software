<?php

declare(strict_types=1);

namespace Finanzas\Infrastructure\Controllers;

use Finanzas\Application\DTOs\CajaAperturaRequest;
use Finanzas\Application\DTOs\CajaResponse;
use Finanzas\Application\DTOs\TransaccionRequest;
use Finanzas\Application\DTOs\CajaCierreRequest;
use Finanzas\Application\DTOs\CajaCierreResponse;
use Finanzas\Application\Exceptions\CajaNotFoundException;
use Finanzas\Application\Exceptions\CajaCerradaException;
use Finanzas\Application\Exceptions\TransaccionInvalidaException;
use Finanzas\Application\UseCases\AbrirCajaUseCase;
use Finanzas\Application\UseCases\RegistrarIngresoUseCase;
use Finanzas\Application\UseCases\RegistrarEgresoUseCase;
use Finanzas\Application\UseCases\CerrarCajaUseCase;
use Finanzas\Domain\Repositories\CajaRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use InvalidArgumentException;
use Throwable;

/**
 * Controlador HTTP para operaciones de Caja.
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP
 * - Validar entrada con Form Request o DTO
 * - Llamar Use Cases inyectados
 * - Transformar respuestas a JSON
 * - Manejar excepciones y retornar códigos HTTP apropiados
 *
 * Endpoints (ver routes/api.php):
 * - POST /api/finanzas/abrirCaja
 * - POST /api/finanzas/registrarIngreso/{cajaId}
 * - POST /api/finanzas/registrarEgreso/{cajaId}
 * - POST /api/finanzas/cerrarCaja/{cajaId}
 * - GET /api/finanzas/cajas/{cajaId}
 * - GET /api/finanzas/cajas
 *
 * @package Finanzas\Infrastructure\Controllers
 */
class CajaController extends Controller
{
    /**
     * Constructor con inyección de dependencias.
     *
     * Los 4 Use Cases se inyectan aquí para poder ser utilizados
     * en los métodos del controlador. Laravel automáticamente resuelve
     * las dependencias desde el contenedor de servicios.
     *
     * @param AbrirCajaUseCase $abrirCaja Use Case para abrir caja
     * @param RegistrarIngresoUseCase $registrarIngreso Use Case para ingresos
     * @param RegistrarEgresoUseCase $registrarEgreso Use Case para egresos
     * @param CerrarCajaUseCase $cerrarCaja Use Case para cerrar caja
     * @param CajaRepository $cajaRepository Repositorio para consultas
     */
    public function __construct(
        private readonly AbrirCajaUseCase $abrirCaja,
        private readonly RegistrarIngresoUseCase $registrarIngreso,
        private readonly RegistrarEgresoUseCase $registrarEgreso,
        private readonly CerrarCajaUseCase $cerrarCaja,
        private readonly CajaRepository $cajaRepository,
    ) {
    }

    /**
     * Abre una nueva caja.
     *
     * POST /api/finanzas/abrirCaja
     * Body: {"vendedor_id": "juan", "monto": 500.00}
     *
     * @param Request $request La petición HTTP
     * @return JsonResponse Respuesta JSON con la caja abierta
     *
     * Respuesta exitosa (201 Created):
     * {
     *   "id": "550e8400-e29b-41d4-a716-446655440000",
     *   "vendedor_id": "juan",
     *   "monto_apertura": 500.00,
     *   "monto_actual": 500.00,
     *   "estado": "abierta",
     *   "fecha_apertura": "2024-01-15T08:00:00+00:00",
     *   "fecha_cierre": null,
     *   "diferencia": null,
     *   "total_transacciones": 0
     * }
     */
    public function abrirCaja(Request $request): JsonResponse
    {
        try {
            // Validar entrada
            $validated = $request->validate([
                'vendedor_id' => 'required|string|min:1|max:100',
                'monto' => 'required|numeric|min:0|max:100000',
            ]);

            // Crear DTO de entrada
            $dto = new CajaAperturaRequest(
                vendedorId: $validated['vendedor_id'],
                montoAperturaPen: (float) $validated['monto'],
            );

            // Ejecutar Use Case
            $caja = $this->abrirCaja->execute(
                $dto->vendedorId,
                $dto->montoAperturaPen,
            );

            // Transformar a DTO de respuesta
            $response = CajaResponse::fromAggregate($caja);

            // Retornar JSON con código 201 Created
            //return response()->json($response->toArray(), 201);
            return response()->json([
                'mensaje' => 'Caja abierta exitosamente',
                'caja_id' => $caja->getId(),
                'fecha_apertura' => $caja->getFechaApertura()->format('Y-m-d H:i:s')
            ], 201);

        } catch (InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'code' => 'invalid_argument',
            ], 400);
        } catch (Throwable $e) {
            return response()->json([
                'error' => 'Error al abrir caja: ' . $e->getMessage(),
                'code' => 'internal_error',
            ], 500);
        }
    }

    /**
     * Registra un ingreso en una caja.
     *
     * POST /api/finanzas/registrarIngreso/{cajaId}
     * Body: {"monto": 150.00, "descripcion": "Venta: 2 donas"}
     *
     * @param string $cajaId El ID de la caja
     * @param Request $request La petición HTTP
     * @return JsonResponse Respuesta JSON con la caja actualizada
     */
    public function registrarIngreso(string $cajaId, Request $request): JsonResponse
    {
        try {
            // Validar entrada
            $validated = $request->validate([
                'monto' => 'required|numeric|min:0.01',
                'descripcion' => 'required|string|min:3|max:255',
            ]);

            // Crear DTO de entrada
            $dto = new TransaccionRequest(
                cajaId: $cajaId,
                montoPen: (float) $validated['monto'],
                descripcion: $validated['descripcion'],
            );

            // Validar DTO
            if (!$dto->esValido()) {
                return response()->json([
                    'error' => 'Datos inválidos',
                    'errors' => $dto->validar(),
                ], 422);
            }

            // Ejecutar Use Case
            $this->registrarIngreso->execute(
                $dto->cajaId,
                $dto->montoPen,
                $dto->descripcion,
            );

            // Obtener caja actualizada
            $caja = $this->cajaRepository->search($cajaId);

            // Transformar a respuesta
            $response = CajaResponse::fromAggregate($caja);

            // Retornar JSON con código 200 OK
            return response()->json($response->toArray(), 200);

        } catch (CajaNotFoundException $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'code' => 'caja_not_found',
            ], 404);
        } catch (CajaCerradaException $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'code' => 'caja_cerrada',
            ], 422);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'code' => 'invalid_argument',
            ], 400);
        } catch (Throwable $e) {
            return response()->json([
                'error' => 'Error al registrar ingreso: ' . $e->getMessage(),
                'code' => 'internal_error',
            ], 500);
        }
    }

    /**
     * Registra un egreso en una caja.
     *
     * POST /api/finanzas/registrarEgreso/{cajaId}
     * Body: {"monto": 50.00, "descripcion": "Cambio cliente"}
     *
     * @param string $cajaId El ID de la caja
     * @param Request $request La petición HTTP
     * @return JsonResponse Respuesta JSON con la caja actualizada
     */
    public function registrarEgreso(string $cajaId, Request $request): JsonResponse
    {
        try {
            // Validar entrada
            $validated = $request->validate([
                'monto' => 'required|numeric|min:0.01',
                'descripcion' => 'required|string|min:3|max:255',
            ]);

            // Crear DTO de entrada
            $dto = new TransaccionRequest(
                cajaId: $cajaId,
                montoPen: (float) $validated['monto'],
                descripcion: $validated['descripcion'],
            );

            // Validar DTO
            if (!$dto->esValido()) {
                return response()->json([
                    'error' => 'Datos inválidos',
                    'errors' => $dto->validar(),
                ], 422);
            }

            // Ejecutar Use Case
            $this->registrarEgreso->execute(
                $dto->cajaId,
                $dto->montoPen,
                $dto->descripcion,
            );

            // Obtener caja actualizada
            $caja = $this->cajaRepository->search($cajaId);

            // Transformar a respuesta
            $response = CajaResponse::fromAggregate($caja);

            // Retornar JSON con código 200 OK
            return response()->json($response->toArray(), 200);

        } catch (CajaNotFoundException $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'code' => 'caja_not_found',
            ], 404);
        } catch (CajaCerradaException $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'code' => 'caja_cerrada',
            ], 422);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'code' => 'invalid_argument',
            ], 400);
        } catch (Throwable $e) {
            return response()->json([
                'error' => 'Error al registrar egreso: ' . $e->getMessage(),
                'code' => 'internal_error',
            ], 500);
        }
    }

    /**
     * Cierra una caja con reconciliación.
     *
     * POST /api/finanzas/cerrarCaja/{cajaId}
     * Body: {"monto_real": 680.50}
     *
     * @param string $cajaId El ID de la caja
     * @param Request $request La petición HTTP
     * @return JsonResponse Respuesta JSON con análisis del cierre
     *
     * Respuesta exitosa (200 OK):
     * {
     *   "caja_id": "...",
     *   "vendedor_id": "juan",
     *   "monto_teórico": 985.49,
     *   "monto_real": 1084.50,
     *   "diferencia": 99.01,
     *   "cuadra_perfectamente": false,
     *   "hay_faltante": false,
     *   "hay_sobrante": true,
     *   "resumen": {
     *     "estado": "SOBRANTE",
     *     "mensaje": "✅ Hay sobrante de 99.01 PEN"
     *   },
     *   "fecha_cierre": "2024-01-15T17:00:00+00:00"
     * }
     */
    public function cerrarCaja(string $cajaId, Request $request): JsonResponse
    {
        try {
            // Validar entrada
            $validated = $request->validate([
                'monto_real' => 'required|numeric|min:0',
            ]);

            // Crear DTO de entrada
            $dto = new CajaCierreRequest(
                cajaId: $cajaId,
                montoFinalRealPen: (float) $validated['monto_real'],
            );

            // Validar DTO
            if (!$dto->esValido()) {
                return response()->json([
                    'error' => 'Datos inválidos',
                    'errors' => $dto->validar(),
                ], 422);
            }

            // Ejecutar Use Case
            $this->cerrarCaja->execute(
                $dto->cajaId,
                $dto->montoFinalRealPen,
            );

            // Obtener caja actualizada
            $caja = $this->cajaRepository->search($cajaId);

            // Obtener evento de cierre para la respuesta
            // En una implementación real, el evento estaría en el agregado
            $response = CajaResponse::fromAggregate($caja);

            // Retornar JSON con código 200 OK
            return response()->json($response->toArray(), 200);

        } catch (CajaNotFoundException $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'code' => 'caja_not_found',
            ], 404);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'code' => 'invalid_argument',
            ], 400);
        } catch (Throwable $e) {
            return response()->json([
                'error' => 'Error al cerrar caja: ' . $e->getMessage(),
                'code' => 'internal_error',
            ], 500);
        }
    }

    /**
     * Obtiene una caja específica.
     *
     * GET /api/finanzas/cajas/{cajaId}
     *
     * @param string $cajaId El ID de la caja
     * @return JsonResponse Respuesta JSON con los datos de la caja
     */
    public function show(string $cajaId): JsonResponse
    {
        try {
            // Buscar caja
            $caja = $this->cajaRepository->search($cajaId);

            if (null === $caja) {
                return response()->json([
                    'error' => sprintf("La caja con ID '%s' no existe.", $cajaId),
                    'code' => 'caja_not_found',
                ], 404);
            }

            // Transformar a respuesta
            $response = CajaResponse::fromAggregate($caja);

            return response()->json($response->toArray(), 200);

        } catch (Throwable $e) {
            return response()->json([
                'error' => 'Error al obtener caja: ' . $e->getMessage(),
                'code' => 'internal_error',
            ], 500);
        }
    }

    /**
     * Lista todas las cajas abiertas.
     *
     * GET /api/finanzas/cajas?estado=abierta
     *
     * @param Request $request La petición HTTP
     * @return JsonResponse Respuesta JSON con lista de cajas
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $estado = $request->query('estado', 'abierta');

            $cajas = match ($estado) {
                'abierta' => $this->cajaRepository->findAllAbiertas(),
                'cerrada' => $this->cajaRepository->findCerradasPorFecha(
                    date('Y-m-d', strtotime('-30 days')),
                    date('Y-m-d')
                ),
                default => [],
            };

            // Transformar a respuestas
            $responses = array_map(
                fn($caja) => CajaResponse::fromAggregate($caja)->toArray(),
                $cajas
            );

            return response()->json([
                'total' => count($responses),
                'cajas' => $responses,
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'error' => 'Error al listar cajas: ' . $e->getMessage(),
                'code' => 'internal_error',
            ], 500);
        }
    }
}
