<?php

declare(strict_types=1);

use Finanzas\Infrastructure\Controllers\CajaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Rutas para el API de Finance Service.
| Prefijo: /api/finanzas
| 
| Endpoints camelCase según especificación:
| - POST   /abrirCaja                    - Abre nueva caja
| - POST   /registrarIngreso/{cajaId}    - Registra ingreso
| - POST   /registrarEgreso/{cajaId}     - Registra egreso
| - POST   /cerrarCaja/{cajaId}          - Cierra caja con reconciliación
| - GET    /cajas/{cajaId}               - Obtiene caja específica
| - GET    /cajas                        - Lista cajas (filtrable)
|
*/

Route::prefix('finanzas')->group(function () {
    /**
     * Abre una nueva caja.
     *
     * POST /api/finanzas/abrirCaja
     * 
     * Body: {
     *   "vendedor_id": "juan",
     *   "monto": 500.00
     * }
     * 
     * Response (201 Created):
     * {
     *   "id": "550e8400-e29b-41d4-a716-446655440000",
     *   "vendedor_id": "juan",
     *   "monto_apertura": 500.00,
     *   "estado": "abierta",
     *   ...
     * }
     */
    Route::post('abrirCaja', [CajaController::class, 'abrirCaja'])
        ->name('cajas.abrirCaja');

    /**
     * Registra un ingreso/venta en una caja.
     *
     * POST /api/finanzas/registrarIngreso/{cajaId}
     * 
     * URL Params:
     * - cajaId: UUID de la caja
     * 
     * Body: {
     *   "monto": 150.00,
     *   "descripcion": "Venta: 2 donas + 1 café"
     * }
     * 
     * Response (200 OK): Caja actualizada
     * Response (404): Caja no encontrada
     * Response (422): Caja cerrada o datos inválidos
     */
    Route::post('registrarIngreso/{cajaId}', [CajaController::class, 'registrarIngreso'])
        ->where('cajaId', '[0-9a-f-]{36}')
        ->name('cajas.registrarIngreso');

    /**
     * Registra un egreso/gasto en una caja.
     *
     * POST /api/finanzas/registrarEgreso/{cajaId}
     * 
     * URL Params:
     * - cajaId: UUID de la caja
     * 
     * Body: {
     *   "monto": 50.00,
     *   "descripcion": "Cambio cliente"
     * }
     * 
     * Response (200 OK): Caja actualizada
     * Response (404): Caja no encontrada
     * Response (422): Caja cerrada o datos inválidos
     */
    Route::post('registrarEgreso/{cajaId}', [CajaController::class, 'registrarEgreso'])
        ->where('cajaId', '[0-9a-f-]{36}')
        ->name('cajas.registrarEgreso');

    /**
     * Cierra una caja con reconciliación.
     *
     * POST /api/finanzas/cerrarCaja/{cajaId}
     * 
     * URL Params:
     * - cajaId: UUID de la caja
     * 
     * Body: {
     *   "monto_real": 680.50
     * }
     * 
     * Response (200 OK): 
     * {
     *   "id": "...",
     *   "estado": "cerrada",
     *   "monto_actual": 680.50,
     *   "diferencia": 0.00,
     *   ...
     * }
     * 
     * Response (404): Caja no encontrada
     * Response (422): Datos inválidos
     */
    Route::post('cerrarCaja/{cajaId}', [CajaController::class, 'cerrarCaja'])
        ->where('cajaId', '[0-9a-f-]{36}')
        ->name('cajas.cerrarCaja');

    /**
     * Obtiene una caja específica.
     *
     * GET /api/finanzas/cajas/{cajaId}
     * 
     * URL Params:
     * - cajaId: UUID de la caja
     * 
     * Response (200 OK): Datos completos de la caja
     * Response (404): Caja no encontrada
     */
    Route::get('cajas/{cajaId}', [CajaController::class, 'show'])
        ->where('cajaId', '[0-9a-f-]{36}')
        ->name('cajas.show');

    /**
     * Lista cajas.
     *
     * GET /api/finanzas/cajas
     * GET /api/finanzas/cajas?estado=abierta
     * GET /api/finanzas/cajas?estado=cerrada
     * 
     * Query Params:
     * - estado: 'abierta' (default) o 'cerrada'
     * 
     * Response (200 OK): 
     * {
     *   "total": 5,
     *   "cajas": [...]
     * }
     */
    Route::get('cajas', [CajaController::class, 'index'])
        ->name('cajas.index');
});
