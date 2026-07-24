<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Aplicacion\CasosUso\CrearOrdenUseCase;
use App\Aplicacion\CasosUso\PagarOrdenUseCase;
use App\Aplicacion\DTOs\CrearOrdenDTO;
use App\Aplicacion\DTOs\ItemOrdenDTO;
use DomainException;

class OrdenController extends Controller
{
    public function crear(Request $request, CrearOrdenUseCase $useCase): JsonResponse
    {
        $request->validate([
            'cliente_id' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|string',
            'items.*.nombre_producto' => 'sometimes|string',
            'items.*.cantidad' => 'required|integer|min:1',
            'items.*.precio_unitario' => 'sometimes|numeric|min:0',
        ]);
        try {
            $itemsDto = [];
            foreach ($request->items as $item) {
                $itemsDto[] = new ItemOrdenDTO(
                    $item['producto_id'],
                    $item['nombre_producto'] ?? '',
                    $item['cantidad'],
                    (float) ($item['precio_unitario'] ?? 0)
                );
            }

            $dto = new CrearOrdenDTO($request->input('cliente_id'), $itemsDto);
            $orden = $useCase->ejecutar($dto);

            return response()->json([
                'mensaje' => 'Orden de venta creada exitosamente',
                'orden_id' => $orden->obtenerId(),
                'total' => $orden->calcularTotal(),
                'estado' => $orden->obtenerEstado()->value
            ], 201);

        } catch (DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function pagar(string $id, Request $request, PagarOrdenUseCase $useCase): JsonResponse
    {
        // 1. Validamos que nos envíen el monto recibido en caja
        $request->validate([
            'monto_recibido' => 'required|numeric|min:0',
            'metodo_pago' => 'sometimes|string|in:EFECTIVO,YAPE,PLIN,efectivo,yape,plin',
            'tipo_comprobante' => 'sometimes|string|in:BOLETA,NOTA_PEDIDO,boleta,nota_pedido',
        ]);

        try {
            // 2. Pasamos el ID y el monto recibido como float
            $orden = $useCase->ejecutar($id, (float) $request->input('monto_recibido'), (string) $request->input('metodo_pago', 'EFECTIVO'), (string) $request->input('tipo_comprobante', 'NOTA_PEDIDO'));

            return response()->json([
                'mensaje' => 'Orden pagada exitosamente. ¡A preparar las donas!',
                'orden_id' => $orden->obtenerId(),
                'estado' => $orden->obtenerEstado()->value,
                'total' => $orden->calcularTotal(),
                'monto_recibido' => $orden->obtenerMontoRecibido(),
                'vuelto' => $orden->obtenerVuelto(),
                'metodo_pago' => $orden->obtenerMetodoPago(),
                'tipo_comprobante' => $orden->obtenerTipoComprobante()
            ]);

        } catch (DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}