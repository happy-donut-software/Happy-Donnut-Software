<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Aplicacion\CasosUso\AbrirTurnoUseCase;
use App\Aplicacion\CasosUso\CerrarTurnoUseCase;
use App\Aplicacion\CasosUso\RegistrarMovimientoUseCase;
use App\Aplicacion\DTOs\AbrirTurnoDTO;
use App\Aplicacion\DTOs\CerrarTurnoDTO;
use App\Aplicacion\DTOs\RegistrarMovimientoDTO;
use App\Infraestructura\Persistencia\Modelos\TurnoCajaModel;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TurnoCajaController extends Controller
{
    public function actual(): JsonResponse
    {
        $turno = TurnoCajaModel::query()
            ->with(['movimientos' => fn ($query) => $query->orderBy('fecha_hora')])
            ->where('estado', 'abierto')
            ->latest('fecha_inicio')
            ->first();

        if ($turno === null) {
            return response()->json(['abierto' => false, 'turno' => null]);
        }

        $entradas = ['apertura', 'venta', 'sobrante_arqueo'];
        $salidas = ['compra_insumos', 'gasto_operativo', 'retiro_dueno', 'faltante_arqueo'];
        $saldo = (float) $turno->monto_apertura;

        $movimientos = $turno->movimientos->map(function ($movimiento) use (&$saldo, $entradas, $salidas): array {
            $monto = (float) $movimiento->monto;
            if (in_array($movimiento->tipo, $entradas, true) && $movimiento->tipo !== 'apertura') {
                $saldo += $monto;
            } elseif (in_array($movimiento->tipo, $salidas, true)) {
                $saldo -= $monto;
            }

            return [
                'id' => $movimiento->id,
                'tipo' => $movimiento->tipo,
                'monto' => $monto,
                'fecha_hora' => $movimiento->fecha_hora,
                'descripcion' => $movimiento->descripcion,
                'es_entrada' => in_array($movimiento->tipo, $entradas, true),
            ];
        })->values();

        return response()->json([
            'abierto' => true,
            'turno' => [
                'id' => $turno->id,
                'cajero_id' => $turno->cajero_id,
                'monto_apertura' => (float) $turno->monto_apertura,
                'fecha_inicio' => $turno->fecha_inicio?->toISOString(),
                'estado' => $turno->estado,
                'saldo_esperado' => round($saldo, 2),
                'movimientos' => $movimientos,
            ],
        ]);
    }

    public function abrir(Request $request, AbrirTurnoUseCase $useCase): JsonResponse
    {
        $datos = $request->validate([
            'cajero_id' => 'required|string',
            'monto_apertura' => 'required|numeric|min:0',
        ]);

        try {
            $turno = $useCase->ejecutar(new AbrirTurnoDTO($datos['cajero_id'], (float) $datos['monto_apertura']));
            return response()->json([
                'mensaje' => 'Turno abierto con éxito',
                'turno_id' => $turno->obtenerId(),
                'estado' => $turno->obtenerEstado()->value,
                'monto_apertura' => (float) $datos['monto_apertura'],
            ], 201);
        } catch (DomainException $exception) {
            return response()->json(['error' => $exception->getMessage()], 400);
        }
    }

    public function registrarMovimiento(Request $request, RegistrarMovimientoUseCase $useCase): JsonResponse
    {
        $datos = $request->validate([
            'monto' => 'required|numeric|min:0.01',
            'tipo_movimiento' => 'required|string',
            'descripcion' => 'nullable|string',
        ]);

        try {
            $useCase->ejecutar(new RegistrarMovimientoDTO(
                (float) $datos['monto'],
                $datos['tipo_movimiento'],
                $datos['descripcion'] ?? null
            ));
            return response()->json(['mensaje' => 'Movimiento registrado correctamente en la caja actual.'], 201);
        } catch (DomainException $exception) {
            return response()->json(['error' => $exception->getMessage()], 400);
        }
    }

    public function cerrar(Request $request, CerrarTurnoUseCase $useCase): JsonResponse
    {
        $datos = $request->validate(['dinero_fisico_real' => 'required|numeric|min:0']);

        try {
            $turno = $useCase->ejecutar(new CerrarTurnoDTO((float) $datos['dinero_fisico_real']));
            return response()->json([
                'mensaje' => 'Turno cerrado y arqueo realizado con éxito.',
                'turno_id' => $turno->obtenerId(),
                'estado' => $turno->obtenerEstado()->value,
            ]);
        } catch (DomainException $exception) {
            return response()->json(['error' => $exception->getMessage()], 400);
        }
    }
}
