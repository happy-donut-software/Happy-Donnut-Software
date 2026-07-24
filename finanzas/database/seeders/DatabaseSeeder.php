<?php

namespace Database\Seeders;

use App\Infraestructura\Persistencia\Modelos\TurnoCajaModel;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (!TurnoCajaModel::where('estado','abierto')->exists()) {
            TurnoCajaModel::create([
                'id'=>'turno_local_inicial','cajero_id'=>'usr_cajero_local','monto_apertura'=>100,
                'fecha_inicio'=>now(),'fecha_cierre'=>null,'estado'=>'abierto',
            ]);
        }
    }
}