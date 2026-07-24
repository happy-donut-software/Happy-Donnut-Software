<?php

namespace Database\Seeders;

use App\Infraestructura\Persistencia\Modelos\UsuarioModel;
use App\Infraestructura\Persistencia\Modelos\ClienteFrecuenteModel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        UsuarioModel::updateOrCreate(['correo'=>'admin@happydonut.local'],[
            'id'=>'usr_admin_local','nombre'=>'Kelly Flores','password'=>Hash::make('Admin123!'),'rol'=>'admin',
        ]);
        UsuarioModel::updateOrCreate(['correo'=>'cajero@happydonut.local'],[
            'id'=>'usr_cajero_local','nombre'=>'Cajero Local','password'=>Hash::make('Cajero123!'),'rol'=>'cajero',
        ]);
        ClienteFrecuenteModel::updateOrCreate(['id'=>'cli_001'],['nombre'=>'Ana Torres','telefono'=>'987654321','direccion'=>'Av. Principal 123']);
        ClienteFrecuenteModel::updateOrCreate(['id'=>'cli_002'],['nombre'=>'Luis Flores','telefono'=>'912345678','direccion'=>'Calle Las Donas 45']);
    }
}