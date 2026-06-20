<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::prefix('usuarios')->group(function () {
    // POST /api/usuarios/registrar -> Crea un nuevo usuario
    Route::post('/registrar', [AuthController::class, 'registrar']);
    
    // POST /api/usuarios/login -> Valida y devuelve el Token
    Route::post('/login', [AuthController::class, 'login']);
});