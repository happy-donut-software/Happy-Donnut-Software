<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Dominio\Puertos\TurnoCajaRepositoryInterface;
use App\Infraestructura\Persistencia\Repositorios\EloquentTurnoCajaRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // INYECCIÓN DE DEPENDENCIAS (MAGIA HEXAGONAL)
        // Le decimos a Laravel: "Cuando un Caso de Uso te pida la interfaz TurnoCajaRepositoryInterface,
        // entrégale automáticamente una instancia de EloquentTurnoCajaRepository".
        $this->app->bind(
            TurnoCajaRepositoryInterface::class,
            EloquentTurnoCajaRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}