<?php

namespace App\Console\Commands;

use App\Infraestructura\Adaptadores\RabbitMQ\ConsumidorOrdenPagada;
use Illuminate\Console\Command;

class ConsumirOrdenesPagadasCommand extends Command
{
    protected $signature = 'inventario:consumir-ordenes-pagadas';

    protected $description = 'Consume eventos OrdenPagada desde RabbitMQ y descuenta stock';

    public function handle(ConsumidorOrdenPagada $consumidor): int
    {
        $this->info('Escuchando eventos ventas.orden.pagada...');

        $consumidor->consumir(fn () => !$this->laravel->isDownForMaintenance());

        return self::SUCCESS;
    }
}