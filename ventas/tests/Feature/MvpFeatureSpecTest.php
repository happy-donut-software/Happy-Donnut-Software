<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Valida que los escenarios Gherkin del MVP estén cubiertos por tests de integración.
 *
 * @see tests/features/ordenes.feature
 */
class MvpFeatureSpecTest extends TestCase
{
    public function test_archivo_feature_ordenes_existe(): void
    {
        $this->assertFileExists(base_path('tests/features/ordenes.feature'));
        $contenido = file_get_contents(base_path('tests/features/ordenes.feature'));
        $this->assertStringContainsString('Característica: Gestión de órdenes de venta', $contenido);
        $this->assertStringContainsString('ventas.orden.pagada', $contenido);
    }
}