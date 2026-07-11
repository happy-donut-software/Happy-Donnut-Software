<?php

namespace Tests\Unit\Dominio;

use App\Dominio\Agregados\TurnoCaja;
use App\Dominio\Entidades\MovimientoCaja;
use App\Dominio\ObjetosValor\EstadoTurno;
use App\Dominio\ObjetosValor\Monto;
use App\Dominio\ObjetosValor\TipoMovimiento;
use DateTimeImmutable;
use DomainException;
use PHPUnit\Framework\TestCase;

class TurnoCajaTest extends TestCase
{
    private function crearTurno(): TurnoCaja
    {
        return new TurnoCaja(
            'turno_1',
            'cajero_1',
            new Monto(100.00),
            new DateTimeImmutable('2026-01-01 08:00:00')
        );
    }

    public function test_calcular_saldo_esperado_con_venta(): void
    {
        $turno = $this->crearTurno();
        $turno->registrarMovimiento(new MovimientoCaja(
            'mov_1',
            new Monto(25.50),
            TipoMovimiento::VENTA,
            new DateTimeImmutable('2026-01-01 09:00:00')
        ));

        $this->assertSame(125.50, $turno->calcularSaldoEsperado()->obtenerValor());
    }

    public function test_no_registra_movimientos_en_turno_cerrado(): void
    {
        $turno = $this->crearTurno();
        $turno->cerrarTurno(new Monto(100.00), new DateTimeImmutable('2026-01-01 18:00:00'));

        $this->expectException(DomainException::class);
        $turno->registrarMovimiento(new MovimientoCaja(
            'mov_1',
            new Monto(10.00),
            TipoMovimiento::VENTA,
            new DateTimeImmutable('2026-01-01 18:30:00')
        ));
    }

    public function test_cerrar_turno_con_arqueo_correcto(): void
    {
        $turno = $this->crearTurno();
        $turno->registrarMovimiento(new MovimientoCaja(
            'mov_1',
            new Monto(25.50),
            TipoMovimiento::VENTA,
            new DateTimeImmutable('2026-01-01 09:00:00')
        ));

        $turno->cerrarTurno(new Monto(125.50), new DateTimeImmutable('2026-01-01 18:00:00'));

        $this->assertSame(EstadoTurno::CERRADO, $turno->obtenerEstado());
    }

    public function test_cerrar_turno_registra_sobrante_de_arqueo(): void
    {
        $turno = $this->crearTurno();
        $turno->cerrarTurno(new Monto(105.00), new DateTimeImmutable('2026-01-01 18:00:00'));

        $movimientos = $turno->obtenerMovimientos();
        $this->assertCount(1, $movimientos);
        $this->assertSame(TipoMovimiento::SOBRANTE_ARQUEO, $movimientos[0]->obtenerTipo());
    }
}