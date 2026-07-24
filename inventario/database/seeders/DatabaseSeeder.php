<?php

namespace Database\Seeders;

use App\Infraestructura\Persistencia\Modelos\ProductoInventarioModel;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['id'=>'prod_donachoco','nombre'=>'Dona de Chocolate','stock_disponible'=>50,'stock_minimo'=>10],
            ['id'=>'prod_donavainilla','nombre'=>'Dona de Vainilla','stock_disponible'=>50,'stock_minimo'=>10],
            ['id'=>'prod_cafeamericano','nombre'=>'Cafe Americano','stock_disponible'=>40,'stock_minimo'=>8],
            ['id'=>'prod_frappe','nombre'=>'Frappe','stock_disponible'=>30,'stock_minimo'=>6],
        ] as $producto) { ProductoInventarioModel::updateOrCreate(['id'=>$producto['id']],$producto); }
    }
}