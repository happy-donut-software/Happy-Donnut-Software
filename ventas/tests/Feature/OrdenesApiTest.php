<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrdenesApiTest extends TestCase
{
    use RefreshDatabase;

    private function crearOrden(): string
    {
        $response = $this->postJson('/api/ventas/ordenes', [
            'cliente_id' => 'cli_001',
            'items' => [
                [
                    'producto_id' => 'prod_donachoco',
                    'nombre_producto' => 'Dona de Chocolate',
                    'cantidad' => 2,
                    'precio_unitario' => 3.50,
                ],
                [
                    'producto_id' => 'prod_donavainilla',
                    'nombre_producto' => 'Dona de Vainilla',
                    'cantidad' => 1,
                    'precio_unitario' => 3.00,
                ],
            ],
        ]);

        $response->assertStatus(201);

        return $response->json('orden_id');
    }

    public function test_crear_orden_registra_pedido_pendiente(): void
    {
        $response = $this->postJson('/api/ventas/ordenes', [
            'cliente_id' => 'cli_001',
            'items' => [
                [
                    'producto_id' => 'prod_donachoco',
                    'nombre_producto' => 'Dona de Chocolate',
                    'cantidad' => 2,
                    'precio_unitario' => 3.50,
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'mensaje' => 'Orden de venta creada exitosamente',
                'total' => 7.0,
                'estado' => 'pendiente',
            ])
            ->assertJsonStructure(['orden_id']);

        $this->assertDatabaseHas('ordenes_venta', [
            'cliente_id' => 'cli_001',
            'estado' => 'pendiente',
            'total' => 7.00,
        ]);

        $this->assertDatabaseCount('lineas_orden', 1);
    }

    public function test_pagar_orden_cambia_estado_a_pagada(): void
    {
        $ordenId = $this->crearOrden();

        $response = $this->postJson("/api/ventas/ordenes/{$ordenId}/pagar");

        $response->assertOk()
            ->assertJson([
                'mensaje' => 'Orden pagada exitosamente. ¡A preparar las donas!',
                'orden_id' => $ordenId,
                'estado' => 'pagada',
            ]);

        $this->assertDatabaseHas('ordenes_venta', [
            'id' => $ordenId,
            'estado' => 'pagada',
        ]);
    }

    public function test_pagar_orden_inexistente_retorna_error(): void
    {
        $response = $this->postJson('/api/ventas/ordenes/ord_inexistente/pagar');

        $response->assertStatus(400)
            ->assertJson(['error' => 'La orden especificada no existe.']);
    }

    public function test_no_se_puede_pagar_una_orden_ya_pagada(): void
    {
        $ordenId = $this->crearOrden();

        $this->postJson("/api/ventas/ordenes/{$ordenId}/pagar")->assertOk();

        $response = $this->postJson("/api/ventas/ordenes/{$ordenId}/pagar");

        $response->assertStatus(400)
            ->assertJson(['error' => 'Esta orden no está en estado pendiente para ser pagada.']);
    }

    public function test_crear_orden_rechaza_items_vacios(): void
    {
        $response = $this->postJson('/api/ventas/ordenes', [
            'cliente_id' => 'cli_001',
            'items' => [],
        ]);

        $response->assertStatus(422);
    }
}
