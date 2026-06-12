<?php

declare(strict_types=1);

namespace App\Providers;

use Finanzas\Application\UseCases\AbrirCajaUseCase;
use Finanzas\Application\UseCases\RegistrarIngresoUseCase;
use Finanzas\Application\UseCases\RegistrarEgresoUseCase;
use Finanzas\Application\UseCases\CerrarCajaUseCase;
use Finanzas\Domain\Repositories\CajaRepository;
use Finanzas\Infrastructure\Persistence\Eloquent\EloquentCajaRepository;
use Illuminate\Support\ServiceProvider;

/**
 * Application Service Provider.
 *
 * Responsable de registrar las vinculaciones de servicios en el contenedor
 * de inyección de dependencias de Laravel.
 */
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * Registra las vinculaciones (bindings) del contenedor de servicios.
     * Laravel usará estas configuraciones para resolver automáticamente
     * las dependencias cuando se soliciten en constructores.
     */
    public function register(): void
    {
        // Binding: Interfaz → Implementación (singleton)
        // Cuando Laravel vea: CajaRepository
        // Proporciona: EloquentCajaRepository (misma instancia siempre)
        $this->app->singleton(
            CajaRepository::class,
            EloquentCajaRepository::class
        );

        // Registrar Use Cases como singletons (opcional pero recomendado)
        $this->app->singleton(AbrirCajaUseCase::class);
        $this->app->singleton(RegistrarIngresoUseCase::class);
        $this->app->singleton(RegistrarEgresoUseCase::class);
        $this->app->singleton(CerrarCajaUseCase::class);
    }

    /**
     * Bootstrap any application services.
     *
     * Se ejecuta después de que todos los servicios hayan sido registrados.
     * Útil para lógica que depende de que todos los servicios estén listos.
     */
    public function boot(): void
    {
        //
    }
}
