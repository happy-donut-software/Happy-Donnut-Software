<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventoVentaController;
use App\Http\Controllers\InventarioController;

Route::prefix('inventario')->group(function (): void {
    Route::get('/productos', [InventarioController::class, 'listarProductos']);
    Route::post('/productos', [InventarioController::class, 'crearProducto']);
    Route::put('/productos/{id}', [InventarioController::class, 'actualizarProducto']);
    Route::delete('/productos/{id}', [InventarioController::class, 'eliminarProducto']);

    Route::post('/stock/reabastecer', [InventarioController::class, 'reabastecer']);
    Route::post('/stock/descontar', [InventarioController::class, 'descontar']);
    Route::get('/stock/{id}', [InventarioController::class, 'consultar']);
    Route::post('/eventos/venta-finalizada', [EventoVentaController::class, 'procesar']);
});

Route::get('/metrics', fn () => response(
    \App\Http\Middleware\RegistrarMetricas::exportar(),
    200,
    ['Content-Type' => 'text/plain; version=0.0.4; charset=utf-8']
));
