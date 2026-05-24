<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Core\Application\UseCases\ProcesarVentaUseCase;

class OrderController extends Controller
{
    public function __construct(private readonly ProcesarVentaUseCase $procesarVentaUseCase)
    {
    }
    /**
     * Obtener productos disponibles desde product_service
     */
    public function getAvailableProducts()
    {
        try {
            $response = Http::get('http://product-service:8000/api/v1/products');
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json(['error' => 'No se pudieron obtener los productos'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error de conexión con product service'], 500);
        }
    }

    /**
     * Obtener categorías desde product_service
     */
    public function getCategories()
    {
        try {
            $response = Http::get('http://product-service:8000/api/v1/categories');
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json(['error' => 'No se pudieron obtener las categorías'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error de conexión con product service'], 500);
        }
    }

    /**
     * Verificar disponibilidad en inventario
     */
    private function checkInventory($productId, $quantity)
    {
        try {
            $response = Http::get("http://inventory-service:8002/api/v1/inventory/check/{$productId}/{$quantity}");
            
            return $response->successful() && $response->json()['available'];
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Reservar inventario
     */
    private function reserveInventory($productId, $quantity)
    {
        try {
            $response = Http::post("http://inventory-service:8002/api/v1/inventory/reserve", [
                'product_id' => $productId,
                'quantity' => $quantity
            ]);
            
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Listar órdenes del usuario
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $ventas = Venta::where('cliente_id', $userId)
                      ->with(['detalles', 'pagos'])
                      ->orderBy('created_at', 'desc')
                      ->get();
        
        return response()->json($ventas);
    }

    /**
     * Crear nueva orden
     */
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.nombre_producto' => 'required|string',
            'items.*.precio_unitario_venta' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'metodo_pago_id' => 'nullable|integer',
            'dinero_recibido' => 'required|numeric|min:0',
        ]);

        $payload = [
            'cliente_id' => $request->user()->id,
            'empleado_id' => 1,
            'metodo_pago_id' => $request->input('metodo_pago_id'),
            'dinero_recibido' => $request->input('dinero_recibido'),
            'items' => $request->input('items'),
        ];

        try {
            $venta = $this->procesarVentaUseCase->execute($payload);
            return response()->json([
                'message' => 'Orden procesada exitosamente',
                'order' => $venta->toArray(),
            ], 201);
        } catch (\DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al procesar la orden'], 500);
        }
    }

    /**
     * Mostrar orden específica
     */
    public function show(Request $request, $id)
    {
        $userId = $request->user()->id;
        $venta = Venta::where('cliente_id', $userId)
                     ->where('venta_id', $id)
                     ->with(['detalles', 'pagos'])
                     ->first();

        if (!$venta) {
            return response()->json(['error' => 'Orden no encontrada'], 404);
        }

        return response()->json($venta);
    }

    /**
     * Actualizar orden
     */
    public function update(Request $request, $id)
    {
        // Implementar lógica de actualización si es necesario
        return response()->json(['message' => 'No implementado aún'], 501);
    }

    /**
     * Cancelar orden
     */
    public function destroy(Request $request, $id)
    {
        $userId = $request->user()->id;
        $venta = Venta::where('cliente_id', $userId)
                     ->where('venta_id', $id)
                     ->first();

        if (!$venta) {
            return response()->json(['error' => 'Orden no encontrada'], 404);
        }

        if ($venta->estado_pedido !== 'pendiente') {
            return response()->json(['error' => 'Solo se pueden cancelar órdenes pendientes'], 400);
        }

        // Liberar inventario
        foreach ($venta->detalles as $detalle) {
            Http::post("http://inventory-service:8002/api/v1/inventory/release", [
                'product_id' => $detalle->producto_id,
                'quantity' => $detalle->cantidad
            ]);
        }

        $venta->update(['estado_pedido' => 'cancelado']);

        return response()->json(['message' => 'Orden cancelada exitosamente']);
    }
}
