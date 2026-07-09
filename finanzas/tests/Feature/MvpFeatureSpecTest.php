<?php

namespace Tests\Feature;

use Tests\TestCase;

/** @see tests/features/caja.feature */
class MvpFeatureSpecTest extends TestCase
{
    public function test_archivo_feature_caja_existe(): void
    {
        $this->assertFileExists(base_path('tests/features/caja.feature'));
        $contenido = file_get_contents(base_path('tests/features/caja.feature'));
        $this->assertStringContainsString('Característica: Turno de caja', $contenido);
    }
}