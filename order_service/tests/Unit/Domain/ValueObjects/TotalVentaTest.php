<?php

namespace Tests\Unit\Domain\ValueObjects;

use App\ValueObjects\TotalVenta;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

final class TotalVentaTest extends TestCase
{
    public function test_total_venta_normaliza_a_dos_decimales(): void
    {
        $total = new TotalVenta(123.456);

        $this->assertSame('123.46', $total->value());
        $this->assertSame('123.46', (string) $total);
    }

    public function test_total_venta_no_acepta_valor_negativo(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new TotalVenta(-1);
    }
}
