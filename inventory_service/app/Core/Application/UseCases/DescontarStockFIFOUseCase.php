<?php

namespace App\Core\Application\UseCases;

use App\Core\Domain\Ports\InventarioRepositoryInterface;

final class DescontarStockFIFOUseCase
{
    public function __construct(private readonly InventarioRepositoryInterface $inventarioRepository)
    {
    }

    public function execute(int $insumoId, float $cantidadRequerida): void
    {
        $insumo = $this->inventarioRepository->obtenerInsumoConLotesActivos($insumoId);

        if (!$insumo) {
            throw new \DomainException('El insumo indicado no existe o no tiene lotes activos.');
        }

        $insumo->consumirStock($cantidadRequerida);
        $this->inventarioRepository->guardarLotes($insumo->lotes());
    }
}
