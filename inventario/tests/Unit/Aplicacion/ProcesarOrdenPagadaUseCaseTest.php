<?php

namespace Tests\Unit\Aplicacion;

use App\Aplicacion\CasosUso\DescontarStockUseCase;
use App\Aplicacion\CasosUso\ProcesarOrdenPagadaUseCase;
use App\Aplicacion\DTOs\AjustarStockDTO;
use DomainException;
use PHPUnit\Framework\TestCase;

class ProcesarOrdenPagadaUseCaseTest extends TestCase
{
    public function test_procesa_items_de_orden_pagada(): void
    {
        $descontar = $this->createMock(DescontarStockUseCase::class);
        $descontar->expects($this->exactly(2))
            ->method('ejecutar')
            ->with($this->callback(fn (AjustarStockDTO $dto) => in_array($dto->productoId, ['prod_1', 'prod_2'], true)));

        $useCase = new ProcesarOrdenPagadaUseCase($descontar);
        $useCase->ejecutar('ord_1', [
            ['producto_id' => 'prod_1', 'cantidad' => 2],
            ['producto_id' => 'prod_2', 'cantidad' => 1],
        ]);
    }

    public function test_rechaza_orden_sin_id(): void
    {
        $useCase = new ProcesarOrdenPagadaUseCase($this->createMock(DescontarStockUseCase::class));

        $this->expectException(DomainException::class);
        $useCase->ejecutar('', []);
    }
}