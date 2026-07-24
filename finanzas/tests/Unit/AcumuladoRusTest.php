<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Dominio\Agregados\AcumuladoRus;
use PHPUnit\Framework\TestCase;

class AcumuladoRusTest extends TestCase
{
    public function test_acumula_solo_boletas_y_alerta_al_noventa_por_ciento(): void
    {
        $rus = new AcumuladoRus('2026-07', 4000);
        self::assertSame('NORMAL', $rus->registrarComprobante(400, 'NOTA_PEDIDO'));
        self::assertSame(4000.0, $rus->obtenerTotal());
        self::assertSame('PROXIMO_AL_LIMITE', $rus->registrarComprobante(500, 'BOLETA'));
        self::assertSame(4500.0, $rus->obtenerTotal());
    }

    public function test_marca_exceso_del_limite(): void
    {
        $rus = new AcumuladoRus('2026-07', 4900);
        self::assertSame('EXCEDIDO', $rus->registrarComprobante(200, 'BOLETA'));
    }
}