<?php

namespace Tests\Feature;

use App\Infraestructura\Persistencia\Modelos\ProductoInventarioModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventarioApiTest extends TestCase
{
    use RefreshDatabase;

    private const PRODUCTO_ID = 'prod_donachoco';

    protected function setUp(): void
    {
        parent::setUp();

        ProductoInventarioModel::create([
            'id' => self::PRODUCTO_ID,
            'nombre' => 'Dona de Chocolate',
            'stock_disponible' => 10,
        ]);
    }

    public function test_reabastecer_aumenta_el_stock(): void
    {
        $response = $this->postJson('/api/inventario/stock/reabastecer', [
            'producto_id' => self::PRODUCTO_ID,
            'cantidad' => 5,
        ]);

        $response->assertOk()
            ->assertJson([
                'mensaje' => 'Stock reabastecido exitosamente.',
                'producto_id' => self::PRODUCTO_ID,
            ]);

        $this->assertDatabaseHas('productos_inventario', [
            'id' => self::PRODUCTO_ID,
            'stock_disponible' => 15,
        ]);
    }

    public function test_reabastecer_falla_si_el_producto_no_existe(): void
    {
        $response = $this->postJson('/api/inventario/stock/reabastecer', [
            'producto_id' => 'prod_inexistente',
            'cantidad' => 3,
        ]);

        $response->assertStatus(400)
            ->assertJson(['error' => 'El producto no existe en el inventario.']);
    }

    public function test_descontar_disminuye_el_stock(): void
    {
        $response = $this->postJson('/api/inventario/stock/descontar', [
            'producto_id' => self::PRODUCTO_ID,
            'cantidad' => 4,
        ]);

        $response->assertOk()
            ->assertJson([
                'mensaje' => 'Stock descontado exitosamente.',
                'producto_id' => self::PRODUCTO_ID,
            ]);

        $this->assertDatabaseHas('productos_inventario', [
            'id' => self::PRODUCTO_ID,
            'stock_disponible' => 6,
        ]);
    }

    public function test_descontar_falla_con_stock_insuficiente(): void
    {
        $response = $this->postJson('/api/inventario/stock/descontar', [
            'producto_id' => self::PRODUCTO_ID,
            'cantidad' => 100,
        ]);

        $response->assertStatus(400)
            ->assertJson(['error' => 'Stock insuficiente para realizar esta operación.']);

        $this->assertDatabaseHas('productos_inventario', [
            'id' => self::PRODUCTO_ID,
            'stock_disponible' => 10,
        ]);
    }

    public function test_validacion_rechaza_datos_invalidos(): void
    {
        $response = $this->postJson('/api/inventario/stock/reabastecer', [
            'producto_id' => '',
            'cantidad' => 0,
        ]);

        $response->assertStatus(422);
    }

    public function test_crud_de_producto_de_inventario(): void
    {
        $this->postJson('/api/inventario/productos', [
            'id' => 'prod_nueva', 'nombre' => 'Dona Nueva', 'stock_disponible' => 12, 'stock_minimo' => 3,
        ])->assertCreated()->assertJsonPath('producto.stock_disponible', 12);

        $this->getJson('/api/inventario/productos')->assertOk()->assertJsonFragment(['id' => 'prod_nueva']);
        $this->putJson('/api/inventario/productos/prod_nueva', [
            'nombre' => 'Dona Nueva', 'stock_disponible' => 8, 'stock_minimo' => 2,
        ])->assertOk()->assertJsonPath('producto.stock_disponible', 8);
        $this->deleteJson('/api/inventario/productos/prod_nueva')->assertOk();
        $this->assertDatabaseMissing('productos_inventario', ['id' => 'prod_nueva']);
    }
}
