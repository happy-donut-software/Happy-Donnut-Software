<?php
namespace Database\Seeders;
use App\Infraestructura\Persistencia\Modelos\ProductoVentaModel;
use Illuminate\Database\Seeder;
class DatabaseSeeder extends Seeder { public function run(): void { foreach([
 ['id'=>'prod_donachoco','nombre'=>'Dona de Chocolate','precio'=>3.50,'activo'=>true],
 ['id'=>'prod_donavainilla','nombre'=>'Dona de Vainilla','precio'=>3.00,'activo'=>true],
 ['id'=>'prod_cafeamericano','nombre'=>'Cafe Americano','precio'=>6.00,'activo'=>true],
 ['id'=>'prod_frappe','nombre'=>'Frappe','precio'=>9.00,'activo'=>true],
] as $p){ProductoVentaModel::updateOrCreate(['id'=>$p['id']],$p);} } }