<?php

namespace App\Providers;

use App\Core\Domain\Ports\ImpresoraPortInterface;
use App\Core\Domain\Ports\VentaRepositoryInterface;
use App\Core\Infrastructure\Adapters\EloquentVentaRepository;
use App\Core\Infrastructure\Adapters\ImpresoraAdapter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(VentaRepositoryInterface::class, EloquentVentaRepository::class);
        $this->app->bind(ImpresoraPortInterface::class, ImpresoraAdapter::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
