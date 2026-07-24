<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // <-- ¡EL ESLABÓN PERDIDO!
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withCommands([\App\Console\Commands\PublicarEventosOutbox::class])
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->append(\App\Http\Middleware\RegistrarMetricas::class);
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Obligamos a Laravel a devolver JSON (y no una página web de error blanca)
        // si algo falla dentro de las rutas de la API.
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*')
        );
    })->create();