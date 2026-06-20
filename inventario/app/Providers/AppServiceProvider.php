<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Dominio\Puertos\ProductoRepositoryInterface;
use App\Infraestructura\Persistencia\Repositorios\EloquentProductoRepository;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Inyectamos la implementación de Eloquent cuando pidan el Repositorio de Productos
        $this->app->bind(
            ProductoRepositoryInterface::class,
            EloquentProductoRepository::class
        );
    }

    public function boot(): void
    {
        //
    }
}