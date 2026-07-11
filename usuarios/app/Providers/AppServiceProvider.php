<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Dominio\Puertos\PasswordHasherInterface;
use App\Dominio\Puertos\TokenRevocadorInterface;
use App\Dominio\Puertos\UsuarioRepositoryInterface;
use App\Infraestructura\Persistencia\Repositorios\EloquentUsuarioRepository;
use App\Infraestructura\Seguridad\LaravelPasswordHasher;
use App\Infraestructura\Seguridad\SanctumTokenRevocador;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // 1. Inyectamos la base de datos (PostgreSQL vía Eloquent)
        $this->app->bind(
            UsuarioRepositoryInterface::class,
            EloquentUsuarioRepository::class
        );

        // 2. Inyectamos el motor de seguridad (Bcrypt de Laravel)
        $this->app->bind(
            PasswordHasherInterface::class,
            LaravelPasswordHasher::class
        );

        $this->app->bind(
            TokenRevocadorInterface::class,
            SanctumTokenRevocador::class
        );
    }

    public function boot(): void
    {
        //
    }
}