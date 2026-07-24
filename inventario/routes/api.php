<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\EventoVentaController;

Route::prefix('inventario/stock')->group(function () {
    // POST /api/inventario/stock/reabastecer -> Sube el stock
    Route::post('/reabastecer', [InventarioController::class, 'reabastecer']);
    
    // POST /api/inventario/stock/descontar -> Baja el stock (usado por Ventas)
    Route::post('/descontar', [InventarioController::class, 'descontar']);
});

Route::get('/metrics', fn () => response(
    \App\Http\Middleware\RegistrarMetricas::exportar(),
    200,
    ['Content-Type' => 'text/plain; version=0.0.4; charset=utf-8']
));

Route::post('/inventario/eventos/venta-finalizada', [EventoVentaController::class, 'procesar']);

Route::get('/inventario/stock/{id}', [InventarioController::class, 'consultar']);
