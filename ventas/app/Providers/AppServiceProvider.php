<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Dominio\Puertos\OrdenRepositoryInterface;
use App\Infraestructura\Persistencia\Repositorios\EloquentOrdenRepository;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Le decimos a Laravel qué repositorio usar cuando pidan la interfaz
        $this->app->bind(
            OrdenRepositoryInterface::class,
            EloquentOrdenRepository::class
        );
    }

    public function boot(): void
    {
        //
    }
}