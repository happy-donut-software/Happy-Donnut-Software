<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Dominio\Puertos\ProductoRepositoryInterface;
use App\Infraestructura\Persistencia\Repositorios\EloquentProductoRepository;
use App\Dominio\Puertos\EventoProcesadoRepositoryInterface;
use App\Aplicacion\Puertos\TransaccionInterface;
use App\Infraestructura\Persistencia\Repositorios\EloquentEventoProcesadoRepository;
use App\Infraestructura\Persistencia\LaravelTransaccion;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Inyectamos la implementación de Eloquent cuando pidan el Repositorio de Productos
        $this->app->bind(
            ProductoRepositoryInterface::class,
            EloquentProductoRepository::class
        );
        $this->app->bind(EventoProcesadoRepositoryInterface::class, EloquentEventoProcesadoRepository::class);
        $this->app->bind(TransaccionInterface::class, LaravelTransaccion::class);
    }

    public function boot(): void
    {
        //
    }
}