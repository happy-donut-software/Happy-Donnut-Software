<?php

namespace App\Infraestructura\Adaptadores\REST;

use App\Aplicacion\CasosUso\AbrirTurnoUseCase;
use App\Aplicacion\CasosUso\CerrarTurnoUseCase;
use App\Aplicacion\CasosUso\RegistrarMovimientoUseCase;
use App\Aplicacion\DTOs\AbrirTurnoDTO;
use App\Aplicacion\DTOs\CerrarTurnoDTO;
use App\Aplicacion\DTOs\RegistrarMovimientoDTO;
use App\Http\Controllers\Controller;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TurnoCajaController extends Controller
{
    public function abrir(Request $request, AbrirTurnoUseCase $useCase): JsonResponse
    {
        $request->validate([
            'cajero_id' => 'required|string',
            'monto_apertura' => 'required|numeric|min:0',
        ]);

        try {
            $dto = new AbrirTurnoDTO($request->cajero_id, (float) $request->monto_apertura);
            $turno = $useCase->ejecutar($dto);

            return response()->json([
                'mensaje' => 'Turno abierto con éxito',
                'turno_id' => $turno->obtenerId(),
                'estado' => $turno->obtenerEstado()->value,
                'monto_apertura' => $request->monto_apertura,
            ], 201);
        } catch (DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function registrarMovimiento(Request $request, RegistrarMovimientoUseCase $useCase): JsonResponse
    {
        $request->validate([
            'monto' => 'required|numeric|min:0.01',
            'tipo_movimiento' => 'required|string',
            'descripcion' => 'nullable|string',
        ]);

        try {
            $dto = new RegistrarMovimientoDTO(
                (float) $request->monto,
                $request->tipo_movimiento,
                $request->descripcion
            );

            $useCase->ejecutar($dto);

            return response()->json([
                'mensaje' => 'Movimiento registrado correctamente en la caja actual.',
            ], 201);
        } catch (DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function cerrar(Request $request, CerrarTurnoUseCase $useCase): JsonResponse
    {
        $request->validate([
            'dinero_fisico_real' => 'required|numeric|min:0',
        ]);

        try {
            $dto = new CerrarTurnoDTO((float) $request->dinero_fisico_real);
            $turnoCerrado = $useCase->ejecutar($dto);

            return response()->json([
                'mensaje' => 'Turno cerrado y arqueo realizado con éxito.',
                'turno_id' => $turnoCerrado->obtenerId(),
                'estado' => $turnoCerrado->obtenerEstado()->value,
            ]);
        } catch (DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}