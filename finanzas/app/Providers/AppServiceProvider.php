<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Dominio\Puertos\TurnoCajaRepositoryInterface;
use App\Infraestructura\Persistencia\Repositorios\EloquentTurnoCajaRepository;
use App\Dominio\Puertos\AcumuladoRusRepositoryInterface;
use App\Aplicacion\Puertos\TransaccionInterface;
use App\Infraestructura\Persistencia\Repositorios\EloquentAcumuladoRusRepository;
use App\Infraestructura\Persistencia\LaravelTransaccion;

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
        $this->app->bind(AcumuladoRusRepositoryInterface::class, EloquentAcumuladoRusRepository::class);
        $this->app->bind(TransaccionInterface::class, LaravelTransaccion::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}