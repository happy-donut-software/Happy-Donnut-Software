<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoriaProductoController;
use App\Http\Controllers\OrdenController;
use App\Http\Controllers\ProductoVentaController;
use App\Http\Middleware\RegistrarMetricas;
use App\Infraestructura\Persistencia\Modelos\EventoDominioModel;

Route::prefix('ventas/ordenes')->group(function (): void {
    Route::get('/', [OrdenController::class, 'listar']);
    Route::post('/', [OrdenController::class, 'crear']);
    Route::post('/{id}/pagar', [OrdenController::class, 'pagar']);
});

Route::prefix('ventas')->group(function (): void {
    Route::get('/productos', [ProductoVentaController::class, 'listar']);
    Route::post('/productos', [ProductoVentaController::class, 'crear']);
    Route::put('/productos/{id}', [ProductoVentaController::class, 'actualizar']);
    Route::delete('/productos/{id}', [ProductoVentaController::class, 'eliminar']);
    Route::get('/categorias', [CategoriaProductoController::class, 'listar']);
    Route::post('/categorias', [CategoriaProductoController::class, 'crear']);
    Route::put('/categorias/{id}', [CategoriaProductoController::class, 'actualizar']);
    Route::delete('/categorias/{id}', [CategoriaProductoController::class, 'eliminar']);
});

Route::get('/metrics', function () {
    $metricas = RegistrarMetricas::exportar();
    $pendientes = EventoDominioModel::whereNull('publicado_en')->count();
    $metricas .= "# HELP happy_donut_outbox_pending Eventos pendientes de entrega.\n";
    $metricas .= "# TYPE happy_donut_outbox_pending gauge\n";
    $metricas .= "happy_donut_outbox_pending{service=\"ventas\"} {$pendientes}\n";
    return response($metricas, 200, ['Content-Type' => 'text/plain; version=0.0.4; charset=utf-8']);
});
