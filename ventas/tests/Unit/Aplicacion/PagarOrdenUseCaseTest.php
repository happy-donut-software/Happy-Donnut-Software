<?php

namespace Tests\Unit\Aplicacion;

use App\Aplicacion\CasosUso\PagarOrdenUseCase;
use App\Dominio\Agregados\OrdenVenta;
use App\Dominio\Entidades\LineaOrden;
use App\Dominio\Eventos\OrdenPagada;
use App\Dominio\Puertos\OrdenPagadaPublicadorInterface;
use App\Dominio\Puertos\OrdenRepositoryInterface;
use App\Infraestructura\Adaptadores\RabbitMQ\NullOrdenPagadaPublicador;
use DateTimeImmutable;
use DomainException;
use PHPUnit\Framework\TestCase;

class PagarOrdenUseCaseTest extends TestCase
{
    protected function setUp(): void
    {
        NullOrdenPagadaPublicador::limpiar();
    }

    public function test_publica_evento_orden_pagada(): void
    {
        $orden = new OrdenVenta('ord_1', 'cli_1', new DateTimeImmutable());
        $orden->agregarLinea(new LineaOrden('lin_1', 'prod_1', 'Dona', 2, 3.50));

        $repositorio = $this->createMock(OrdenRepositoryInterface::class);
        $repositorio->method('buscarPorId')->willReturn($orden);
        $repositorio->expects($this->once())->method('guardar');

        $useCase = new PagarOrdenUseCase($repositorio, new NullOrdenPagadaPublicador());
        $useCase->ejecutar('ord_1');

        $publicados = NullOrdenPagadaPublicador::obtenerPublicados();
        $this->assertCount(1, $publicados);
        $this->assertInstanceOf(OrdenPagada::class, $publicados[0]);
        $this->assertSame('ord_1', $publicados[0]->ordenId);
    }

    public function test_falla_si_orden_no_existe(): void
    {
        $repositorio = $this->createMock(OrdenRepositoryInterface::class);
        $repositorio->method('buscarPorId')->willReturn(null);

        $useCase = new PagarOrdenUseCase($repositorio, $this->createMock(OrdenPagadaPublicadorInterface::class));

        $this->expectException(DomainException::class);
        $useCase->ejecutar('ord_inexistente');
    }
}