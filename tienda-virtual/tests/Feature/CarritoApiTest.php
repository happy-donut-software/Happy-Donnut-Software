<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CarritoApiTest extends TestCase
{
    use RefreshDatabase;

    private const CLIENTE_ID = 'cli_web_001';

    public function test_agregar_producto_crea_carrito_nuevo(): void
    {
        $response = $this->postJson('/api/tienda/carrito/agregar', [
            'cliente_id' => self::CLIENTE_ID,
            'producto_id' => 'prod_donachoco',
            'nombre_producto' => 'Dona de Chocolate',
            'cantidad' => 2,
            'precio_unitario' => 3.50,
        ]);

        $response->assertOk()
            ->assertJson([
                'mensaje' => 'Producto agregado al carrito.',
                'total_estimado' => 7.0,
            ]);

        $this->assertDatabaseHas('carritos_compras', [
            'cliente_id' => self::CLIENTE_ID,
            'total_estimado' => 7.00,
        ]);

        $this->assertDatabaseHas('items_carrito', [
            'producto_id' => 'prod_donachoco',
            'cantidad' => 2,
        ]);
    }

    public function test_agregar_mismo_producto_incrementa_cantidad(): void
    {
        $payload = [
            'cliente_id' => self::CLIENTE_ID,
            'producto_id' => 'prod_donavainilla',
            'nombre_producto' => 'Dona de Vainilla',
            'cantidad' => 1,
            'precio_unitario' => 3.00,
        ];

        $this->postJson('/api/tienda/carrito/agregar', $payload)->assertOk();
        $this->postJson('/api/tienda/carrito/agregar', [
            ...$payload,
            'cantidad' => 2,
        ])->assertOk()
            ->assertJson(['total_estimado' => 9.0]);

        $this->assertDatabaseCount('items_carrito', 1);
        $this->assertDatabaseHas('items_carrito', [
            'producto_id' => 'prod_donavainilla',
            'cantidad' => 3,
        ]);
    }

    public function test_ver_carrito_devuelve_items_y_total(): void
    {
        $this->postJson('/api/tienda/carrito/agregar', [
            'cliente_id' => self::CLIENTE_ID,
            'producto_id' => 'prod_donachoco',
            'nombre_producto' => 'Dona de Chocolate',
            'cantidad' => 1,
            'precio_unitario' => 4.00,
        ]);

        $response = $this->getJson('/api/tienda/carrito/' . self::CLIENTE_ID);

        $response->assertOk()
            ->assertJsonStructure([
                'carrito_id',
                'cliente_id',
                'items' => [['producto_id', 'nombre', 'cantidad', 'precio_unitario', 'subtotal']],
                'total_estimado',
            ])
            ->assertJson([
                'cliente_id' => self::CLIENTE_ID,
                'total_estimado' => 4.0,
            ]);
    }

    public function test_remover_producto_actualiza_total(): void
    {
        $this->postJson('/api/tienda/carrito/agregar', [
            'cliente_id' => self::CLIENTE_ID,
            'producto_id' => 'prod_donachoco',
            'nombre_producto' => 'Dona de Chocolate',
            'cantidad' => 2,
            'precio_unitario' => 3.50,
        ]);

        $this->postJson('/api/tienda/carrito/agregar', [
            'cliente_id' => self::CLIENTE_ID,
            'producto_id' => 'prod_donavainilla',
            'nombre_producto' => 'Dona de Vainilla',
            'cantidad' => 1,
            'precio_unitario' => 3.00,
        ]);

        $response = $this->postJson('/api/tienda/carrito/remover', [
            'cliente_id' => self::CLIENTE_ID,
            'producto_id' => 'prod_donachoco',
        ]);

        $response->assertOk()
            ->assertJson([
                'mensaje' => 'Producto removido del carrito.',
                'total_estimado' => 3.0,
            ]);

        $this->assertDatabaseMissing('items_carrito', [
            'producto_id' => 'prod_donachoco',
        ]);
    }

    public function test_remover_de_carrito_inexistente_falla(): void
    {
        $response = $this->postJson('/api/tienda/carrito/remover', [
            'cliente_id' => 'cli_sin_carrito',
            'producto_id' => 'prod_donachoco',
        ]);

        $response->assertStatus(400)
            ->assertJson(['error' => 'No tienes un carrito activo.']);
    }
}
