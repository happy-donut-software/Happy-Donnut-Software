<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Aplicacion\CasosUso\ReabastecerStockUseCase;
use App\Aplicacion\CasosUso\DescontarStockUseCase;
use App\Aplicacion\DTOs\AjustarStockDTO;
use DomainException;
use App\Dominio\Puertos\ProductoRepositoryInterface;

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

    public function consultar(string $id, ProductoRepositoryInterface $productos): JsonResponse
    {
        $producto = $productos->buscarPorId($id);
        if ($producto === null) { return response()->json(['error' => 'Producto no encontrado.'], 404); }
        return response()->json([
            'id' => $producto->obtenerId(), 'nombre' => $producto->obtenerNombre(),
            'stock_disponible' => $producto->obtenerStockDisponible()->obtenerValor(),
            'stock_minimo' => $producto->obtenerStockMinimo(),
            'requiere_reabastecimiento' => $producto->requiereReabastecimiento(),
        ]);
    }}