<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Aplicacion\DTOs\AjustarStockDTO;
use App\Dominio\ObjetosValor\CantidadStock;
use App\Dominio\Puertos\ProductoRepositoryInterface;
use DomainException;

/**
 * Caso de Uso: Resta unidades del stock de un producto.
 * Será llamado principalmente cuando el microservicio de Ventas avise que se pagó una orden.
 */
class DescontarStockUseCase
{
    public function __construct(
        private readonly ProductoRepositoryInterface $repositorio
    ) {
    }

    public function ejecutar(AjustarStockDTO $dto): void
    {
        $producto = $this->repositorio->buscarPorId($dto->productoId);

        if ($producto === null) {
            throw new DomainException("El producto no existe en el inventario.");
        }

        $cantidadSalida = new CantidadStock($dto->cantidad);
        $producto->registrarSalida($cantidadSalida);
        $this->repositorio->guardar($producto);
    }
}