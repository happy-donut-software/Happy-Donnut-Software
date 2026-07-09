<?php

namespace Tests\Feature;

use Tests\TestCase;

/** @see tests/features/carrito.feature */
class MvpFeatureSpecTest extends TestCase
{
    public function test_archivo_feature_carrito_existe(): void
    {
        $this->assertFileExists(base_path('tests/features/carrito.feature'));
        $contenido = file_get_contents(base_path('tests/features/carrito.feature'));
        $this->assertStringContainsString('Característica: Carrito de compras online', $contenido);
    }
}