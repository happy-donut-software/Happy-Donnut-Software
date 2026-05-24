<?php

namespace App\Providers;

use App\Core\Domain\Ports\InventarioRepositoryInterface;
use App\Core\Infrastructure\Adapters\EloquentInventarioRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(InventarioRepositoryInterface::class, EloquentInventarioRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
