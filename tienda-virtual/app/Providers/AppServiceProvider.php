<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Dominio\Puertos\CarritoRepositoryInterface;
use App\Infraestructura\Persistencia\Repositorios\EloquentCarritoRepository;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Inyectamos la implementación de Eloquent cuando soliciten el Repositorio del Carrito
        $this->app->bind(
            CarritoRepositoryInterface::class,
            EloquentCarritoRepository::class
        );
    }

    public function boot(): void
    {
        //
    }
}