<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Infraestructura\Persistencia\Modelos\ProductoVentaModel;
use App\Aplicacion\Puertos\CajaGatewayInterface;

class OrdenesApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->app->instance(CajaGatewayInterface::class, new class implements CajaGatewayInterface {
            public function hayTurnoAbierto(): bool { return true; }
        });
        ProductoVentaModel::create(['id' => 'prod_donachoco', 'nombre' => 'Dona de Chocolate', 'precio' => 3.50, 'activo' => true]);
        ProductoVentaModel::create(['id' => 'prod_donavainilla', 'nombre' => 'Dona de Vainilla', 'precio' => 3.00, 'activo' => true]);
    }


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

        $response = $this->postJson("/api/ventas/ordenes/{$ordenId}/pagar", [
            'monto_recibido' => 20, 'metodo_pago' => 'EFECTIVO', 'tipo_comprobante' => 'BOLETA',
        ]);

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

        $this->assertDatabaseHas('eventos_dominio', [
            'nombre' => 'VentaFinalizada.v1',
            'agregado_id' => $ordenId,
        ]);
    }

    public function test_pagar_orden_inexistente_retorna_error(): void
    {
        $response = $this->postJson('/api/ventas/ordenes/ord_inexistente/pagar', ['monto_recibido' => 10]);

        $response->assertStatus(400)
            ->assertJson(['error' => 'La orden especificada no existe.']);
    }

    public function test_no_se_puede_pagar_una_orden_ya_pagada(): void
    {
        $ordenId = $this->crearOrden();

        $this->postJson("/api/ventas/ordenes/{$ordenId}/pagar", ['monto_recibido' => 10])->assertOk();

        $response = $this->postJson("/api/ventas/ordenes/{$ordenId}/pagar", [
            'monto_recibido' => 20, 'metodo_pago' => 'EFECTIVO', 'tipo_comprobante' => 'BOLETA',
        ]);

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
    public function test_ignora_precio_manipulado_por_el_cliente(): void
    {
        $response = $this->postJson('/api/ventas/ordenes', [
            'items' => [[
                'producto_id' => 'prod_donachoco', 'nombre_producto' => 'Alterado',
                'cantidad' => 2, 'precio_unitario' => 0,
            ]],
        ]);
        $response->assertCreated()->assertJson(['total' => 7.0]);
        $this->assertDatabaseHas('lineas_orden', ['nombre_producto' => 'Dona de Chocolate', 'precio_unitario' => 3.50]);
    }
    public function test_rechaza_pago_cuando_la_caja_esta_cerrada(): void
    {
        $this->app->instance(CajaGatewayInterface::class, new class implements CajaGatewayInterface {
            public function hayTurnoAbierto(): bool { return false; }
        });
        $ordenId = $this->crearOrden();

        $this->postJson("/api/ventas/ordenes/{$ordenId}/pagar", [
            'monto_recibido' => 20,
            'metodo_pago' => 'EFECTIVO',
            'tipo_comprobante' => 'BOLETA',
        ])->assertStatus(400)
          ->assertJson(['error' => 'Debe aperturar la caja antes de realizar una venta.']);

        $this->assertDatabaseHas('ordenes_venta', ['id' => $ordenId, 'estado' => 'pendiente']);
    }

    public function test_lista_comprobantes_pagados_con_sus_lineas(): void
    {
        $ordenId = $this->crearOrden();
        $this->postJson("/api/ventas/ordenes/{$ordenId}/pagar", [
            'monto_recibido' => 20,
            'metodo_pago' => 'EFECTIVO',
            'tipo_comprobante' => 'BOLETA',
        ])->assertOk();

        $this->getJson('/api/ventas/ordenes?estado=pagada')
            ->assertOk()
            ->assertJsonPath('ordenes.0.id', $ordenId)
            ->assertJsonPath('ordenes.0.estado', 'pagada')
            ->assertJsonPath('ordenes.0.lineas.0.nombre_producto', 'Dona de Chocolate');
    }

    public function test_rechaza_producto_inactivo(): void
    {
        ProductoVentaModel::create([
            'id' => 'prod_inactivo',
            'nombre' => 'Dona fuera de catálogo',
            'precio' => 4.00,
            'activo' => false,
        ]);

        $this->postJson('/api/ventas/ordenes', [
            'items' => [[
                'producto_id' => 'prod_inactivo',
                'cantidad' => 1,
            ]],
        ])->assertStatus(400)
          ->assertJson(['error' => 'El producto no existe o no esta disponible: prod_inactivo']);
    }

}