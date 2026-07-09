<?php

namespace Tests\Feature;

use Tests\TestCase;

/** @see tests/features/autenticacion.feature */
class MvpFeatureSpecTest extends TestCase
{
    public function test_archivo_feature_autenticacion_existe(): void
    {
        $this->assertFileExists(base_path('tests/features/autenticacion.feature'));
        $contenido = file_get_contents(base_path('tests/features/autenticacion.feature'));
        $this->assertStringContainsString('Característica: Autenticación de usuarios', $contenido);
    }
}