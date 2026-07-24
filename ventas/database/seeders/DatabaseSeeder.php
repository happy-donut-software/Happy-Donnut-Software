<?php

namespace Database\Seeders;

use App\Infraestructura\Persistencia\Modelos\CategoriaProductoModel;
use App\Infraestructura\Persistencia\Modelos\ProductoVentaModel;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $donas = CategoriaProductoModel::updateOrCreate(
            ['slug' => 'donas'],
            ['nombre' => 'Donas', 'descripcion' => 'Donas artesanales de Happy Donut.', 'activa' => true]
        );

        foreach ([
            ['id' => 'prod_donachoco', 'nombre' => 'Dona de Chocolate', 'descripcion' => 'Dona cubierta con chocolate.', 'precio' => 3.50, 'activo' => true],
            ['id' => 'prod_donavainilla', 'nombre' => 'Dona de Vainilla', 'descripcion' => 'Dona con glaseado de vainilla.', 'precio' => 3.00, 'activo' => true],
            ['id' => 'prod_cafeamericano', 'nombre' => 'Cafe Americano', 'descripcion' => 'Cafe americano recien preparado.', 'precio' => 6.00, 'activo' => true],
            ['id' => 'prod_frappe', 'nombre' => 'Frappe', 'descripcion' => 'Bebida frappe cremosa.', 'precio' => 9.00, 'activo' => true],
        ] as $producto) {
            ProductoVentaModel::updateOrCreate(
                ['id' => $producto['id']],
                [...$producto, 'categoria_id' => $donas->id]
            );
        }
    }
}
