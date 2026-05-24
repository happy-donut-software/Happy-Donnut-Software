<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;
use App\Models\Insumo;
use App\Models\LoteInsumo;
use App\Models\AjusteInventario;
use App\Core\Application\UseCases\DescontarStockFIFOUseCase;

class InventoryController extends Controller
{
    public function __construct(private readonly DescontarStockFIFOUseCase $descontarStockFIFOUseCase)
    {
    }

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
            'available_quantity' => $maxQuantity,
        ]);
    }

    /**
     * Reservar inventario para una orden usando FIFO sobre lotes de insumo
     */
    public function reserve(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Producto::with('insumos')->find($request->product_id);

        if (!$product) {
            return response()->json(['error' => 'Producto no encontrado'], 404);
        }

        if (!$this->canProduceQuantity($product, $request->quantity)) {
            return response()->json(['error' => 'Inventario insuficiente'], 400);
        }

        foreach ($product->insumos as $insumo) {
            $requiredQuantity = $insumo->pivot->cantidad_necesaria * $request->quantity;
            $this->descontarStockFIFOUseCase->execute($insumo->insumo_id, $requiredQuantity);
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
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Producto::with('insumos')->find($request->product_id);

        if (!$product) {
            return response()->json(['error' => 'Producto no encontrado'], 404);
        }

<<<<<<< HEAD:inventory_service/app/Http/Controllers/inventoryController.php
        // Liberar insumos reservados
        $this->releaseIngredients($product, $request->quantity);
        return response()->json(['message' => 'Inventario liberado exitosamente'], 200);
=======
        foreach ($product->insumos as $insumo) {
            $releaseQuantity = $insumo->pivot->cantidad_necesaria * $request->quantity;
            $this->releaseIngredients($insumo->insumo_id, $releaseQuantity);
        }

        return response()->json(['message' => 'Inventario liberado exitosamente']);
>>>>>>> feature/hexagonal-refactor:inventory_service/app/Http/Controllers/InventoryController.php
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
            'tipo_ajuste' => 'required|in:entrada,salida,ajuste',
        ]);

        $insumo = Insumo::find($request->insumo_id);

        if (!$insumo) {
            return response()->json(['error' => 'Insumo no encontrado'], 404);
        }

        $ajuste = AjusteInventario::create([
            'insumo_id' => $request->insumo_id,
            'cantidad_ajuste' => $request->cantidad_ajuste,
            'motivo' => $request->motivo,
            'tipo_ajuste' => $request->tipo_ajuste,
            'fecha_ajuste' => now(),
        ]);

        $this->updateInsumoStock($request->insumo_id, $request->cantidad_ajuste, $request->tipo_ajuste);

        return response()->json([
            'message' => 'Ajuste realizado exitosamente',
            'ajuste' => $ajuste,
        ]);
    }

<<<<<<< HEAD:inventory_service/app/Http/Controllers/inventoryController.php
    /**
     * Verificar si se puede producir una cantidad específica
     */
=======
>>>>>>> feature/hexagonal-refactor:inventory_service/app/Http/Controllers/InventoryController.php
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

    private function getAvailableInsumoQuantity($insumoId)
    {
        return LoteInsumo::where('insumo_id', $insumoId)
            ->where('cantidad_restante', '>', 0)
            ->sum('cantidad_restante');
    }

    private function releaseIngredients(int $insumoId, float $releaseQuantity): void
    {
        $lote = LoteInsumo::where('insumo_id', $insumoId)
<<<<<<< HEAD:inventory_service/app/Http/Controllers/inventoryController.php
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
=======
            ->orderBy('fecha_caducidad', 'desc')
            ->first();

        if ($lote) {
            $lote->cantidad_restante = max(0, $lote->cantidad_restante + $releaseQuantity);
            $lote->save();
        }
    }

    private function updateInsumoStock(int $insumoId, int $quantity, string $type): void
    {
        $lote = LoteInsumo::where('insumo_id', $insumoId)
            ->orderBy('fecha_caducidad')
            ->first();

        if (!$lote) {
            LoteInsumo::create([
                'insumo_id' => $insumoId,
                'cantidad_comprada' => $quantity,
                'cantidad_restante' => $quantity,
                'costo_total_compra' => 0,
                'fecha_compra' => now(),
                'fecha_caducidad' => now()->addYear(),
            ]);

            return;
        }

        if ($type === 'entrada') {
            $lote->cantidad_restante += $quantity;
        } else {
            $lote->cantidad_restante = max(0, $lote->cantidad_restante - $quantity);
        }

        $lote->save();
    }
}
>>>>>>> feature/hexagonal-refactor:inventory_service/app/Http/Controllers/InventoryController.php
