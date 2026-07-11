<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Dominio\Puertos\OrdenPagadaPublicadorInterface;
use App\Dominio\Puertos\OrdenRepositoryInterface;
use App\Infraestructura\Adaptadores\RabbitMQ\NullOrdenPagadaPublicador;
use App\Infraestructura\Adaptadores\RabbitMQ\RabbitMQOrdenPagadaPublicador;
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

        $this->app->bind(OrdenPagadaPublicadorInterface::class, function () {
            if (config('messaging.driver') === 'rabbitmq' && class_exists(RabbitMQOrdenPagadaPublicador::class)) {
                return new RabbitMQOrdenPagadaPublicador();
            }

            return new NullOrdenPagadaPublicador();
        });
    }

    public function boot(): void
    {
        //
    }
}