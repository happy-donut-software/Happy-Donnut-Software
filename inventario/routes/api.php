<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InventarioController;

Route::prefix('inventario/stock')->group(function () {
    // POST /api/inventario/stock/reabastecer -> Sube el stock
    Route::post('/reabastecer', [InventarioController::class, 'reabastecer']);
    
    // POST /api/inventario/stock/descontar -> Baja el stock (usado por Ventas)
    Route::post('/descontar', [InventarioController::class, 'descontar']);
});