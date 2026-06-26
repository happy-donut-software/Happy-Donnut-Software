<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TurnoCajaApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_flujo_completo_abrir_movimiento_y_cerrar_turno(): void
    {
        $apertura = $this->postJson('/api/finanzas/caja/abrir', [
            'cajero_id' => 'usr_cajero_01',
            'monto_apertura' => 100.00,
        ]);

        $apertura->assertStatus(201)
            ->assertJson([
                'mensaje' => 'Turno abierto con éxito',
                'estado' => 'abierto',
                'monto_apertura' => 100.00,
            ]);

        $turnoId = $apertura->json('turno_id');

        $venta = $this->postJson('/api/finanzas/caja/movimiento', [
            'monto' => 25.50,
            'tipo_movimiento' => 'venta',
            'descripcion' => 'Venta de donas',
        ]);

        $venta->assertStatus(201)
            ->assertJson(['mensaje' => 'Movimiento registrado correctamente en la caja actual.']);

        $cierre = $this->postJson('/api/finanzas/caja/cerrar', [
            'dinero_fisico_real' => 125.50,
        ]);

        $cierre->assertOk()
            ->assertJson([
                'mensaje' => 'Turno cerrado y arqueo realizado con éxito.',
                'turno_id' => $turnoId,
                'estado' => 'cerrado',
            ]);

        $this->assertDatabaseHas('turnos_caja', [
            'id' => $turnoId,
            'estado' => 'cerrado',
        ]);

        $this->assertDatabaseHas('movimientos_caja', [
            'turno_caja_id' => $turnoId,
            'tipo' => 'venta',
        ]);
    }

    public function test_no_se_puede_abrir_dos_turnos_simultaneos(): void
    {
        $this->postJson('/api/finanzas/caja/abrir', [
            'cajero_id' => 'usr_cajero_01',
            'monto_apertura' => 50.00,
        ])->assertStatus(201);

        $response = $this->postJson('/api/finanzas/caja/abrir', [
            'cajero_id' => 'usr_cajero_02',
            'monto_apertura' => 75.00,
        ]);

        $response->assertStatus(400)
            ->assertJson(['error' => 'No se puede abrir la caja porque ya existe un turno abierto.']);
    }

    public function test_movimiento_sin_turno_abierto_falla(): void
    {
        $response = $this->postJson('/api/finanzas/caja/movimiento', [
            'monto' => 10.00,
            'tipo_movimiento' => 'venta',
        ]);

        $response->assertStatus(400)
            ->assertJson(['error' => 'No hay un turno de caja abierto para registrar movimientos.']);
    }

    public function test_movimiento_con_tipo_invalido_falla(): void
    {
        $this->postJson('/api/finanzas/caja/abrir', [
            'cajero_id' => 'usr_cajero_01',
            'monto_apertura' => 100.00,
        ]);

        $response = $this->postJson('/api/finanzas/caja/movimiento', [
            'monto' => 5.00,
            'tipo_movimiento' => 'tipo_inexistente',
        ]);

        $response->assertStatus(400)
            ->assertJson(['error' => 'El tipo de movimiento proporcionado no es válido.']);
    }

    public function test_cerrar_sin_turno_abierto_falla(): void
    {
        $response = $this->postJson('/api/finanzas/caja/cerrar', [
            'dinero_fisico_real' => 100.00,
        ]);

        $response->assertStatus(400)
            ->assertJson(['error' => 'No hay ningún turno de caja abierto para cerrar.']);
    }
}
