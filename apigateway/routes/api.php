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

// Rutas públicas de productos (temporal para desarrollo)
Route::prefix('/v1')->group(function () {
    // Productos (públicos)
    Route::get('/products/available', [GatewayController::class, 'getAvailableProducts']);
    Route::get('/products/search', [GatewayController::class, 'searchProducts']);
    Route::get('/categories', [GatewayController::class, 'getCategories']);
    Route::post('/categories', [GatewayController::class, 'createCategory']);
    Route::put('/categories/{id}', [GatewayController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [GatewayController::class, 'deleteCategory']);

    // Productos (administrativos)
    Route::get('/products', [GatewayController::class, 'getProducts']);
    Route::post('/products', [GatewayController::class, 'createProduct']);
    Route::get('/products/{id}', [GatewayController::class, 'getProduct']);
    Route::put('/products/{id}', [GatewayController::class, 'updateProduct']);
    Route::delete('/products/{id}', [GatewayController::class, 'deleteProduct']);
    Route::put('/products/{id}/status', [GatewayController::class, 'updateProductStatus']);
});

Route::middleware('auth:sanctum')->prefix('/v1')->group(function () {
    
    // Órdenes (clientes)
    Route::get('/orders', [GatewayController::class, 'getOrders']);
    Route::post('/orders', [GatewayController::class, 'createOrder']);
    Route::get('/orders/{id}', [GatewayController::class, 'getOrder']);
    Route::delete('/orders/{id}', [GatewayController::class, 'cancelOrder']);
    
    // Auth
    Route::get('/auth/me', [GatewayController::class, 'getProfile']);
    Route::post('/auth/logout', [GatewayController::class, 'logout']);
});
