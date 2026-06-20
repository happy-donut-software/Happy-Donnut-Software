<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Aplicacion\CasosUso\ReabastecerStockUseCase;
use App\Aplicacion\CasosUso\DescontarStockUseCase;
use App\Aplicacion\DTOs\AjustarStockDTO;
use DomainException;

class InventarioController extends Controller
{
    public function reabastecer(Request $request, ReabastecerStockUseCase $useCase): JsonResponse
    {
        $request->validate([
            'producto_id' => 'required|string',
            'cantidad' => 'required|integer|min:1',
        ]);

        try {
            $dto = new AjustarStockDTO($request->producto_id, (int) $request->cantidad);
            $useCase->ejecutar($dto);

            return response()->json([
                'mensaje' => 'Stock reabastecido exitosamente.',
                'producto_id' => $request->producto_id
            ]);

        } catch (DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function descontar(Request $request, DescontarStockUseCase $useCase): JsonResponse
    {
        $request->validate([
            'producto_id' => 'required|string',
            'cantidad' => 'required|integer|min:1',
        ]);

        try {
            $dto = new AjustarStockDTO($request->producto_id, (int) $request->cantidad);
            $useCase->ejecutar($dto);

            return response()->json([
                'mensaje' => 'Stock descontado exitosamente.',
                'producto_id' => $request->producto_id
            ]);

        } catch (DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}