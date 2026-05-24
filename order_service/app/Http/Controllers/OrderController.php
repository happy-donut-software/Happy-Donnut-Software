<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Venta;
use App\Models\DetalleVenta;

class OrderController extends Controller
{
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
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string'
        ]);

        $userId = $request->user()->id;
        $total = 0;

        // Verificar disponibilidad y calcular total
        foreach ($request->items as $item) {
            if (!$this->checkInventory($item['product_id'], $item['quantity'])) {
                return response()->json([
                    'error' => 'Producto no disponible o sin stock suficiente',
                    'product_id' => $item['product_id']
                ], 400);
            }
        }

        // Obtener precios de productos
        try {
            $productsResponse = Http::get('http://product-service:8000/api/v1/products');
            $products = collect($productsResponse->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener precios de productos'], 500);
        }

        // Calcular total y reservar inventario
        foreach ($request->items as $item) {
            $product = $products->firstWhere('producto_id', $item['product_id']);
            if (!$product) {
                return response()->json(['error' => 'Producto no encontrado'], 404);
            }
            
            $total += $product['precio_base'] * $item['quantity'];
            
            if (!$this->reserveInventory($item['product_id'], $item['quantity'])) {
                return response()->json(['error' => 'No se pudo reservar el inventario'], 400);
            }
        }

        // Crear venta
        $venta = Venta::create([
            'cliente_id' => $userId,
            'empleado_id' => 1, // Empleado por defecto
            'total_venta' => $total,
            'estado_pedido' => 'pendiente',
            'fecha_venta' => now()
        ]);

        // Crear detalles de venta
        foreach ($request->items as $item) {
            $product = $products->firstWhere('producto_id', $item['product_id']);
            
            DetalleVenta::create([
                'venta_id' => $venta->venta_id,
                'producto_id' => $item['product_id'],
                'nombre_producto' => $product['nombre_producto'],
                'precio_unitario_venta' => $product['precio_base'],
                'cantidad' => $item['quantity']
            ]);
        }

        return response()->json([
            'message' => 'Orden creada exitosamente',
            'order' => $venta->load('detalles')
        ], 201);
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
