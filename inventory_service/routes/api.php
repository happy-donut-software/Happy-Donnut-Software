<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InsumoController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\NotaInventarioController;

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

Route::middleware('auth:sanctum')->prefix('/v1')->group(function () {
    // Inventario
    Route::get('/inventory', [InventoryController::class, 'index']);
    Route::post('/inventory/reserve', [InventoryController::class, 'reserve']);
    Route::post('/inventory/release', [InventoryController::class, 'release']);
    Route::get('/inventory/check/{productId}/{quantity}', [InventoryController::class, 'checkAvailability']);
    Route::put('/inventory/adjust', [InventoryController::class, 'adjustInventory']);
    
    // Insumos
    Route::get('/insumos', [InsumoController::class, 'index']);
    Route::post('/insumos', [InsumoController::class, 'store']);
    Route::get('/insumos/{id}', [InsumoController::class, 'show']);
    Route::put('/insumos/{id}', [InsumoController::class, 'update']);
    Route::delete('/insumos/{id}', [InsumoController::class, 'destroy']);
    
    // Lotes de insumos
    Route::get('/lotes', [InsumoController::class, 'getLotes']);
    Route::post('/lotes', [InsumoController::class, 'createLote']);
    Route::put('/lotes/{id}', [InsumoController::class, 'updateLote']);
    
    // Recetas (productos terminados)
    Route::get('/recetas', [ProductoController::class, 'index']);
    Route::post('/recetas', [ProductoController::class, 'store']);
    Route::get('/recetas/{id}', [ProductoController::class, 'show']);
    Route::put('/recetas/{id}', [ProductoController::class, 'update']);
    Route::delete('/recetas/{id}', [ProductoController::class, 'destroy']);

    // Categorias (CRUD)
    Route::get('/categorias', [CategoriaController::class, 'index']);
    Route::get('/categorias/{id}', [CategoriaController::class, 'show']);
    Route::post('/categorias', [CategoriaController::class, 'store']);
    Route::put('/categorias/{id}', [CategoriaController::class, 'update']);
    Route::delete('/categorias/{id}', [CategoriaController::class, 'destroy']);

    // Notas de inventario (entrada/salida)
    Route::get('/notas', [NotaInventarioController::class, 'index']);
    Route::get('/notas/{id}', [NotaInventarioController::class, 'show']);
    Route::post('/notas', [NotaInventarioController::class, 'store']);
    Route::put('/notas/{id}', [NotaInventarioController::class, 'update']);
    Route::delete('/notas/{id}', [NotaInventarioController::class, 'destroy']);
});

// Rutas públicas (sin autenticación)
Route::prefix('/v1')->group(function () {
    Route::get('/inventory/available/{productId}', [InventoryController::class, 'getAvailableQuantity']);
});


// Rutas para Apertura de Caja
Route::get('/apertura/verificar-estado', [App\Http\Controllers\AperturaController::class, 'verificarEstado']);
Route::post('/apertura', [App\Http\Controllers\AperturaController::class, 'store']);

Route::get('/apertura/actual', [App\Http\Controllers\AperturaController::class, 'estadoActual']);
