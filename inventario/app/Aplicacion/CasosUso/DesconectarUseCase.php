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
        // 1. Buscamos el producto
        $producto = $this->repositorio->buscarPorId($dto->productoId);

        if ($producto === null) {
            throw new DomainException("El producto no existe en el inventario.");
        }

        // 2. Convertimos a Objeto de Valor
        $cantidadSalida = new CantidadStock($dto->cantidad);

        // 3. Descontamos. ¡Ojo! Si no hay suficiente stock, el Agregado 
        // (a través de CantidadStock) lanzará una DomainException aquí mismo.
        $producto->registrarSalida($cantidadSalida);

        // 4. Si todo salió bien y no hubo excepciones, guardamos
        $this->repositorio->guardar($producto);
    }
}