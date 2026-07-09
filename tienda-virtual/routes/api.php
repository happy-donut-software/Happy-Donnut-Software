<?php

use Illuminate\Support\Facades\Route;
use App\Infraestructura\Adaptadores\REST\CarritoController;

Route::prefix('tienda/carrito')->group(function () {
    // GET /api/tienda/carrito/{cliente_id} -> Muestra el carrito actual
    Route::get('/{cliente_id}', [CarritoController::class, 'ver']);
    
    // POST /api/tienda/carrito/agregar -> Agrega o suma un producto
    Route::post('/agregar', [CarritoController::class, 'agregar']);
    
    // POST /api/tienda/carrito/remover -> Quita un producto por completo
    Route::post('/remover', [CarritoController::class, 'remover']);
});