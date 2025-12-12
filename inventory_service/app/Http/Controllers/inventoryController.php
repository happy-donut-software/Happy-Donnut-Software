<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;
use App\Models\Insumo;
use App\Models\LoteInsumo;
use App\Models\AjusteInventario;

class InventoryController extends Controller
{
    /**
     * Obtener todo el inventario
     */
    public function index(Request $request)
    {
        $inventory = Producto::with(['insumos', 'lotesInsumos'])->get();
        
        return response()->json($inventory);
    }

    /**
     * Verificar disponibilidad de producto
     */
    public function checkAvailability($productId, $quantity)
    {
        $product = Producto::find($productId);
        
        if (!$product) {
            return response()->json(['available' => false, 'error' => 'Producto no encontrado'], 404);
        }

        $canProduce = $this->canProduceQuantity($product, $quantity);
        
        return response()->json(['available' => $canProduce]);
    }

    /**
     * Obtener cantidad disponible de producto
     */
    public function getAvailableQuantity($productId)
    {
        $product = Producto::find($productId);
        
        if (!$product) {
            return response()->json(['error' => 'Producto no encontrado'], 404);
        }

        $maxQuantity = $this->calculateMaxProducible($product);
        
        return response()->json([
            'product_id' => $productId,
            'available_quantity' => $maxQuantity
        ]);
    }

    /**
     * Reservar inventario para una orden
     */
    public function reserve(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer',
            'quantity' => 'required|integer|min:1'
        ]);

        $product = Producto::find($request->product_id);
        
        if (!$product) {
            return response()->json(['error' => 'Producto no encontrado'], 404);
        }

        if (!$this->canProduceQuantity($product, $request->quantity)) {
            return response()->json(['error' => 'Inventario insuficiente'], 400);
        }

        // Reservar insumos (implementar lógica de reserva)
        $reserved = $this->reserveIngredients($product, $request->quantity);
        
        if (!$reserved) {
            return response()->json(['error' => 'No se pudo reservar el inventario'], 500);
        }

        return response()->json(['message' => 'Inventario reservado exitosamente']);
    }

    /**
     * Liberar inventario reservado
     */
    public function release(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer',
            'quantity' => 'required|integer|min:1'
        ]);

        $product = Producto::find($request->product_id);
        
        if (!$product) {
            return response()->json(['error' => 'Producto no encontrado'], 404);
        }

        // Liberar insumos reservados
        $this->releaseIngredients($product, $request->quantity);
        return response()->json(['message' => 'Inventario liberado exitosamente'], 200);
    }

    /**
     * Ajustar inventario manualmente
     */
    public function adjustInventory(Request $request)
    {
        $request->validate([
            'insumo_id' => 'required|integer',
            'cantidad_ajuste' => 'required|integer',
            'motivo' => 'required|string',
            'tipo_ajuste' => 'required|in:entrada,salida,ajuste'
        ]);

        $insumo = Insumo::find($request->insumo_id);
        
        if (!$insumo) {
            return response()->json(['error' => 'Insumo no encontrado'], 404);
        }

        // Crear ajuste de inventario
        $ajuste = AjusteInventario::create([
            'insumo_id' => $request->insumo_id,
            'cantidad_ajuste' => $request->cantidad_ajuste,
            'motivo' => $request->motivo,
            'tipo_ajuste' => $request->tipo_ajuste,
            'fecha_ajuste' => now()
        ]);

        // Actualizar stock del insumo
        $this->updateInsumoStock($request->insumo_id, $request->cantidad_ajuste, $request->tipo_ajuste);

        return response()->json([
            'message' => 'Ajuste realizado exitosamente',
            'ajuste' => $ajuste
        ]);
    }

    /**
     * Verificar si se puede producir una cantidad específica
     */
    private function canProduceQuantity($product, $quantity)
    {
        foreach ($product->insumos as $insumo) {
            $requiredQuantity = $insumo->pivot->cantidad_necesaria * $quantity;
            $availableQuantity = $this->getAvailableInsumoQuantity($insumo->insumo_id);

            if ($availableQuantity < $requiredQuantity) {
                return false;
            }
        }

        return true;
    }

    /**
     * Calcular cantidad máxima producible
     */
    private function calculateMaxProducible($product)
    {
        $maxQuantity = PHP_INT_MAX;
        
        foreach ($product->insumos as $insumo) {
            $requiredPerUnit = $insumo->pivot->cantidad_necesaria;
            $availableQuantity = $this->getAvailableInsumoQuantity($insumo->insumo_id);
            
            if ($requiredPerUnit > 0) {
                $canProduce = intval($availableQuantity / $requiredPerUnit);
                $maxQuantity = min($maxQuantity, $canProduce);
            }
        }
        
        return $maxQuantity === PHP_INT_MAX ? 0 : $maxQuantity;
    }

    /**
     * Obtener cantidad disponible de insumo
     */
    private function getAvailableInsumoQuantity($insumoId)
    {
        return LoteInsumo::where('insumo_id', $insumoId)
                        ->where('cantidad_actual', '>', 0)
                        ->sum('cantidad_actual');
    }

    /**
     * Reservar ingredientes
     */
    private function reserveIngredients($product, $quantity)
    {
        // Implementar lógica de reserva de insumos
        // Por ahora, simplemente reducimos el stock
        foreach ($product->insumos as $insumo) {
            $requiredQuantity = $insumo->pivot->cantidad_necesaria * $quantity;
            
            $lotes = LoteInsumo::where('insumo_id', $insumo->insumo_id)
                              ->where('cantidad_actual', '>', 0)
                              ->orderBy('fecha_vencimiento')
                              ->get();
            
            $toReserve = $requiredQuantity;
            
            foreach ($lotes as $lote) {
                if ($toReserve <= 0) break;
                
                $reserveFromLote = min($toReserve, $lote->cantidad_actual);
                $lote->cantidad_actual -= $reserveFromLote;
                $lote->save();
                
                $toReserve -= $reserveFromLote;
            }
            
            if ($toReserve > 0) {
                return false; // No se pudo reservar suficiente
            }
        }
        
        return true;
    }

    /**
     * Liberar ingredientes
     */
    private function releaseIngredients($product, $quantity)
    {
        // Implementar lógica de liberación de insumos
        foreach ($product->insumos as $insumo) {
            $releaseQuantity = $insumo->pivot->cantidad_necesaria * $quantity;
            
            // Encontrar el lote más reciente para devolver el stock
            $lote = LoteInsumo::where('insumo_id', $insumo->insumo_id)
                            ->orderBy('fecha_vencimiento', 'desc')
                            ->first();
            
            if ($lote) {
                $lote->cantidad_actual += $releaseQuantity;
                $lote->save();
            }
        }
    }

    /**
     * Actualizar stock de insumo
     */
    private function updateInsumoStock($insumoId, $quantity, $type)
    {
        $lote = LoteInsumo::where('insumo_id', $insumoId)
                          ->orderBy('fecha_vencimiento')
                          ->first();
        
            if (!$lote) {
            // Crear nuevo lote si no existe
            $lote = LoteInsumo::create([
                'insumo_id' => $insumoId,
                'cantidad_inicial' => $quantity,
                'cantidad_actual' => $quantity,
                'fecha_vencimiento' => now()->addYear()
            ]);
        } else {
            // Ajustar cantidad existente
            if ($type === 'entrada') {
                $lote->cantidad_actual += $quantity;
            } else {
                $lote->cantidad_actual = max(0, $lote->cantidad_actual - $quantity);
            }
            $lote->save();
        }
    }
}