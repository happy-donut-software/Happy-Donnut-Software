<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GatewayController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('auth')->group(function (){
    Route::post('login',[GatewayController::class,'login']);
    Route::post('register',[GatewayController::class,'register']);
});

// Rutas públicas v1
Route::prefix('v1')->group(function () {
    Route::get('/products/available', [GatewayController::class, 'getAvailableProducts']);
    Route::get('/products/search', [GatewayController::class, 'searchProducts']);
    Route::get('/categories', [GatewayController::class, 'getCategories']);
});

Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    
    // Órdenes (clientes)
    Route::get('/orders', [GatewayController::class, 'getOrders']);
    Route::post('/orders', [GatewayController::class, 'createOrder']);
    Route::get('/orders/{id}', [GatewayController::class, 'getOrder']);
    Route::delete('/orders/{id}', [GatewayController::class, 'cancelOrder']);
    
    // Auth
    Route::get('/auth/me', [GatewayController::class, 'getProfile']);
    Route::get('/orders-by-status/{status}', [GatewayController::class, 'getOrdersByStatus']);

    // ===================================================================
    //  RUTAS DE APERTURA DE CAJA
    // ===================================================================
    Route::prefix('caja')->group(function () {
        Route::get('/verificar-estado', [GatewayController::class, 'verificarEstadoApertura']);
        Route::post('/abrir', [GatewayController::class, 'abrirCaja']);
        Route::get('/estado-actual', [GatewayController::class, 'getEstadoActualApertura']);
    });

});