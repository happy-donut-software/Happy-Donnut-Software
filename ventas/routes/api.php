<?php

use Illuminate\Support\Facades\Route;
use App\Infraestructura\Adaptadores\REST\OrdenController;

Route::prefix('ventas/ordenes')->group(function () {
    // POST /api/ventas/ordenes -> Crea un nuevo pedido
    Route::post('/', [OrdenController::class, 'crear']);
    
    // POST /api/ventas/ordenes/{id}/pagar -> Paga un pedido existente
    Route::post('/{id}/pagar', [OrdenController::class, 'pagar']);
});