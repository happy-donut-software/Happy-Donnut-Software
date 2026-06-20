<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TurnoCajaController;

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