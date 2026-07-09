<?php

namespace App\Infraestructura\Adaptadores\REST;

use App\Aplicacion\CasosUso\AgregarProductoUseCase;
use App\Aplicacion\CasosUso\ObtenerCarritoUseCase;
use App\Aplicacion\CasosUso\RemoverProductoUseCase;
use App\Aplicacion\DTOs\AgregarProductoDTO;
use App\Aplicacion\DTOs\RemoverProductoDTO;
use App\Http\Controllers\Controller;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CarritoController extends Controller
{
    public function ver(string $clienteId, ObtenerCarritoUseCase $useCase): JsonResponse
    {
        $carrito = $useCase->ejecutar($clienteId);

        $itemsFormateados = array_map(function ($item) {
            return [
                'producto_id' => $item->obtenerProductoId(),
                'nombre' => $item->obtenerNombreProducto(),
                'cantidad' => $item->obtenerCantidad(),
                'precio_unitario' => $item->obtenerPrecioUnitario(),
                'subtotal' => $item->calcularSubtotal(),
            ];
        }, $carrito->obtenerItems());

        return response()->json([
            'carrito_id' => $carrito->obtenerId(),
            'cliente_id' => $carrito->obtenerClienteId(),
            'items' => $itemsFormateados,
            'total_estimado' => $carrito->calcularTotalEstimado(),
        ]);
    }

    public function agregar(Request $request, AgregarProductoUseCase $useCase): JsonResponse
    {
        $request->validate([
            'cliente_id' => 'required|string',
            'producto_id' => 'required|string',
            'nombre_producto' => 'required|string',
            'cantidad' => 'required|integer|min:1',
            'precio_unitario' => 'required|numeric|min:0',
        ]);

        try {
            $dto = new AgregarProductoDTO(
                $request->cliente_id,
                $request->producto_id,
                $request->nombre_producto,
                (int) $request->cantidad,
                (float) $request->precio_unitario
            );

            $carrito = $useCase->ejecutar($dto);

            return response()->json([
                'mensaje' => 'Producto agregado al carrito.',
                'total_estimado' => $carrito->calcularTotalEstimado(),
            ]);
        } catch (DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function remover(Request $request, RemoverProductoUseCase $useCase): JsonResponse
    {
        $request->validate([
            'cliente_id' => 'required|string',
            'producto_id' => 'required|string',
        ]);

        try {
            $dto = new RemoverProductoDTO($request->cliente_id, $request->producto_id);
            $carrito = $useCase->ejecutar($dto);

            return response()->json([
                'mensaje' => 'Producto removido del carrito.',
                'total_estimado' => $carrito->calcularTotalEstimado(),
            ]);
        } catch (DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}