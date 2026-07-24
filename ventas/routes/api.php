<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrdenController;
use App\Http\Controllers\ProductoVentaController;
use App\Http\Middleware\RegistrarMetricas;
use App\Infraestructura\Persistencia\Modelos\EventoDominioModel;

Route::prefix('ventas/ordenes')->group(function () {
    Route::post('/', [OrdenController::class, 'crear']);
    Route::post('/{id}/pagar', [OrdenController::class, 'pagar']);
});

Route::get('/metrics', function () {
    $metricas = RegistrarMetricas::exportar();
    $pendientes = EventoDominioModel::whereNull('publicado_en')->count();
    $metricas .= "# HELP happy_donut_outbox_pending Eventos pendientes de entrega.\n";
    $metricas .= "# TYPE happy_donut_outbox_pending gauge\n";
    $metricas .= "happy_donut_outbox_pending{service=\"ventas\"} {$pendientes}\n";
    return response($metricas, 200, ['Content-Type' => 'text/plain; version=0.0.4; charset=utf-8']);
});

Route::get('/ventas/productos', [ProductoVentaController::class, 'listar']);
