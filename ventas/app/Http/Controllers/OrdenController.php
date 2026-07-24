<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Aplicacion\CasosUso\CrearOrdenUseCase;
use App\Aplicacion\CasosUso\PagarOrdenUseCase;
use App\Aplicacion\DTOs\CrearOrdenDTO;
use App\Aplicacion\DTOs\ItemOrdenDTO;
use App\Infraestructura\Persistencia\Modelos\OrdenVentaModel;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrdenController extends Controller
{
    public function listar(Request $request): JsonResponse
    {
        $ordenes = OrdenVentaModel::query()
            ->with('lineas')
            ->when($request->filled('estado'), fn ($query) => $query->where('estado', $request->string('estado')->toString()))
            ->orderByDesc('fecha_creacion')
            ->limit(500)
            ->get()
            ->map(fn (OrdenVentaModel $orden): array => [
                'id' => $orden->id,
                'cliente_id' => $orden->cliente_id,
                'fecha_creacion' => $orden->fecha_creacion?->toISOString(),
                'estado' => $orden->estado,
                'total' => (float) $orden->total,
                'monto_recibido' => $orden->monto_recibido === null ? null : (float) $orden->monto_recibido,
                'vuelto' => $orden->vuelto === null ? null : (float) $orden->vuelto,
                'metodo_pago' => $orden->metodo_pago,
                'tipo_comprobante' => $orden->tipo_comprobante,
                'lineas' => $orden->lineas->map(fn ($linea): array => [
                    'id' => $linea->id,
                    'producto_id' => $linea->producto_id,
                    'nombre_producto' => $linea->nombre_producto,
                    'cantidad' => (int) $linea->cantidad,
                    'precio_unitario' => (float) $linea->precio_unitario,
                    'subtotal' => round((int) $linea->cantidad * (float) $linea->precio_unitario, 2),
                ])->values(),
            ]);

        return response()->json(['ordenes' => $ordenes]);
    }

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

            $orden = $useCase->ejecutar(new CrearOrdenDTO($request->input('cliente_id'), $itemsDto));

            return response()->json([
                'mensaje' => 'Orden de venta creada exitosamente',
                'orden_id' => $orden->obtenerId(),
                'total' => $orden->calcularTotal(),
                'estado' => $orden->obtenerEstado()->value,
            ], 201);
        } catch (DomainException $exception) {
            return response()->json(['error' => $exception->getMessage()], 400);
        }
    }

    public function pagar(string $id, Request $request, PagarOrdenUseCase $useCase): JsonResponse
    {
        $request->validate([
            'monto_recibido' => 'required|numeric|min:0',
            'metodo_pago' => 'sometimes|string|in:EFECTIVO,YAPE,PLIN,efectivo,yape,plin',
            'tipo_comprobante' => 'sometimes|string|in:BOLETA,NOTA_PEDIDO,boleta,nota_pedido',
        ]);

        try {
            $orden = $useCase->ejecutar(
                $id,
                (float) $request->input('monto_recibido'),
                (string) $request->input('metodo_pago', 'EFECTIVO'),
                (string) $request->input('tipo_comprobante', 'NOTA_PEDIDO')
            );

            return response()->json([
                'mensaje' => 'Orden pagada exitosamente. ¡A preparar las donas!',
                'orden_id' => $orden->obtenerId(),
                'estado' => $orden->obtenerEstado()->value,
                'total' => $orden->calcularTotal(),
                'monto_recibido' => $orden->obtenerMontoRecibido(),
                'vuelto' => $orden->obtenerVuelto(),
                'metodo_pago' => $orden->obtenerMetodoPago(),
                'tipo_comprobante' => $orden->obtenerTipoComprobante(),
            ]);
        } catch (DomainException $exception) {
            return response()->json(['error' => $exception->getMessage()], 400);
        }
    }
}
