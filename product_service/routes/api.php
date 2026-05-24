<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\PromocionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Ruta de prueba para debug
Route::get('/test', function() {
    return response()->json(['message' => 'API working']);
});

Route::post('/test-post', function(Request $request) {
    return response()->json(['data' => $request->all(), 'message' => 'POST working']);
});

Route::post('/create-simple', function() {
    $product = \App\Models\Producto::create([
        'categoria_id' => 1,
        'nombre_producto' => 'Producto Simple',
        'descripcion' => 'Creado desde ruta simple',
        'precio_base' => 12.50,
        'tipo_producto' => 'donut',
        'activo_web' => true
    ]);

    return response()->json([
        'message' => 'Producto creado exitosamente',
        'product' => $product
    ], 201);
});

// Productos (sin autenticación para desarrollo)
Route::prefix('/v1')->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::put('/products/{id}/status', [ProductController::class, 'updateStatus']);
});

Route::middleware('auth:sanctum')->prefix('/v1')->group(function () {
    // Categorías
    Route::get('/categories', [CategoriaController::class, 'index']);
    Route::post('/categories', [CategoriaController::class, 'store']);
    Route::get('/categories/{id}', [CategoriaController::class, 'show']);
    Route::put('/categories/{id}', [CategoriaController::class, 'update']);
    Route::delete('/categories/{id}', [CategoriaController::class, 'destroy']);
    
    // Promociones
    Route::get('/promotions', [PromocionController::class, 'index']);
    Route::post('/promotions', [PromocionController::class, 'store']);
    Route::get('/promotions/{id}', [PromocionController::class, 'show']);
    Route::put('/promotions/{id}', [PromocionController::class, 'update']);
    Route::delete('/promotions/{id}', [PromocionController::class, 'destroy']);
});

// Rutas públicas (sin autenticación)
Route::prefix('/v1')->group(function () {
    Route::get('/products/available', [ProductController::class, 'getAvailable']);
    Route::get('/products/search', [ProductController::class, 'search']);
    
    // Categorías públicas
    Route::get('/categories', [CategoriaController::class, 'index']);
    Route::post('/categories', [CategoriaController::class, 'store']);
    Route::put('/categories/{id}', [CategoriaController::class, 'update']);
    Route::delete('/categories/{id}', [CategoriaController::class, 'destroy']);
    
    Route::get('/promotions/active', [PromocionController::class, 'getActive']);
    
    // Ruta de prueba para DELETE
    Route::get('/test-delete', function() {
        return response()->json(['message' => 'Test DELETE working']);
    });
});
