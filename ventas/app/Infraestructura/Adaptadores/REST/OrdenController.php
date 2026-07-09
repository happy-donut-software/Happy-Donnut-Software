<?php

namespace App\Infraestructura\Adaptadores\REST;

use App\Aplicacion\CasosUso\CrearOrdenUseCase;
use App\Aplicacion\CasosUso\PagarOrdenUseCase;
use App\Aplicacion\DTOs\CrearOrdenDTO;
use App\Aplicacion\DTOs\ItemOrdenDTO;
use App\Http\Controllers\Controller;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrdenController extends Controller
{
    public function crear(Request $request, CrearOrdenUseCase $useCase): JsonResponse
    {
        $request->validate([
            'cliente_id' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|string',
            'items.*.nombre_producto' => 'required|string',
            'items.*.cantidad' => 'required|integer|min:1',
            'items.*.precio_unitario' => 'required|numeric|min:0',
        ]);

        try {
            $itemsDto = [];
            foreach ($request->items as $item) {
                $itemsDto[] = new ItemOrdenDTO(
                    $item['producto_id'],
                    $item['nombre_producto'],
                    $item['cantidad'],
                    (float) $item['precio_unitario']
                );
            }

            $dto = new CrearOrdenDTO($request->cliente_id, $itemsDto);
            $orden = $useCase->ejecutar($dto);

            return response()->json([
                'mensaje' => 'Orden de venta creada exitosamente',
                'orden_id' => $orden->obtenerId(),
                'total' => $orden->calcularTotal(),
                'estado' => $orden->obtenerEstado()->value,
            ], 201);
        } catch (DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function pagar(string $id, PagarOrdenUseCase $useCase): JsonResponse
    {
        try {
            $orden = $useCase->ejecutar($id);

            return response()->json([
                'mensaje' => 'Orden pagada exitosamente. ¡A preparar las donas!',
                'orden_id' => $orden->obtenerId(),
                'estado' => $orden->obtenerEstado()->value,
            ]);
        } catch (DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}