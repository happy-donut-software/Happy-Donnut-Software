<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Aplicacion\DTOs\AjustarStockDTO;
use DomainException;

/**
 * Caso de Uso: Procesa el evento OrdenPagada descontando stock por cada ítem.
 */
class ProcesarOrdenPagadaUseCase
{
    public function __construct(
        private readonly DescontarStockUseCase $descontarStockUseCase
    ) {
    }

    /**
     * @param array<int, array{producto_id: string, cantidad: int}> $items
     */
    public function ejecutar(string $ordenId, array $items): void
    {
        if ($ordenId === '') {
            throw new DomainException('El identificador de la orden es obligatorio.');
        }

        foreach ($items as $item) {
            $dto = new AjustarStockDTO($item['producto_id'], (int) $item['cantidad']);
            $this->descontarStockUseCase->ejecutar($dto);
        }
    }
}