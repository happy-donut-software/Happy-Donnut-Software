<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClienteFrecuenteController;

Route::prefix('usuarios')->group(function () {
    //--------------------------------------------------------
    // RUTAS PÚBLICAS (Dentro del prefijo 'usuarios')
    //--------------------------------------------------------
    // POST /api/usuarios/registrar
    Route::post('/registrar', [AuthController::class, 'registrar']);
    
    // POST /api/usuarios/login
    Route::post('/login', [AuthController::class, 'login']);

    //--------------------------------------------------------
    // RUTAS PROTEGIDAS (Requieren Token de Sanctum)
    //--------------------------------------------------------
    Route::middleware('auth:sanctum')->group(function () {
        
        // GET /api/usuarios/me
        Route::get('/me', [AuthController::class, 'me']);
        
        // POST /api/usuarios/logout
        Route::post('/logout', [AuthController::class, 'logout']);
        
    });
});

Route::get('/metrics', fn () => response(
    \App\Http\Middleware\RegistrarMetricas::exportar(),
    200,
    ['Content-Type' => 'text/plain; version=0.0.4; charset=utf-8']
));

Route::get('/usuarios/clientes-frecuentes', [ClienteFrecuenteController::class, 'buscar']);
