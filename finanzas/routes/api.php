<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TurnoCajaController;
use App\Http\Controllers\EventoVentaController;
use App\Http\Controllers\RusController;

/*
|--------------------------------------------------------------------------
| Rutas de la API del Microservicio de Finanzas
|--------------------------------------------------------------------------
| En DDD, estas rutas son la puerta de entrada principal.
| Todas estas URLs tendrán el prefijo /api/ automáticamente.
*/

Route::prefix('finanzas/caja')->group(function () {
    Route::post('/abrir', [TurnoCajaController::class, 'abrir']);
    Route::post('/movimiento', [TurnoCajaController::class, 'registrarMovimiento']);
    Route::post('/cerrar', [TurnoCajaController::class, 'cerrar']);
});

Route::get('/metrics', fn () => response(
    \App\Http\Middleware\RegistrarMetricas::exportar(),
    200,
    ['Content-Type' => 'text/plain; version=0.0.4; charset=utf-8']
));

Route::post('/finanzas/eventos/venta-finalizada', [EventoVentaController::class, 'procesar']);

Route::get('/finanzas/rus/{periodo}', [RusController::class, 'consultar']);
