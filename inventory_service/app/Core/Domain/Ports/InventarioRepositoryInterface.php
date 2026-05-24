<?php

namespace App\Core\Domain\Ports;

use App\Core\Domain\Models\Insumo;

interface InventarioRepositoryInterface
{
    public function obtenerInsumoConLotesActivos(int $insumoId): ?Insumo;

    /**
     * @param array<int, App\Core\Domain\Models\Lote> $lotes
     */
    public function guardarLotes(array $lotes): void;
}
