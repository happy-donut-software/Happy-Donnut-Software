<?php

namespace Tests\Feature;

use Tests\TestCase;

/** @see tests/features/stock.feature */
class MvpFeatureSpecTest extends TestCase
{
    public function test_archivo_feature_stock_existe(): void
    {
        $this->assertFileExists(base_path('tests/features/stock.feature'));
        $contenido = file_get_contents(base_path('tests/features/stock.feature'));
        $this->assertStringContainsString('ventas.orden.pagada', $contenido);
    }
}