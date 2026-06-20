<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Aplicacion\DTOs\AjustarStockDTO;
use App\Dominio\ObjetosValor\CantidadStock;
use App\Dominio\Puertos\ProductoRepositoryInterface;
use DomainException;

/**
 * Caso de Uso: Agrega unidades al stock de un producto existente.
 * Usado cuando el panadero/cocinero produce nuevas donas.
 */
class ReabastecerStockUseCase
{
    public function __construct(
        private readonly ProductoRepositoryInterface $repositorio
    ) {
    }

    public function ejecutar(AjustarStockDTO $dto): void
    {
        // 1. Buscamos el producto en la base de datos a través del puerto
        $producto = $this->repositorio->buscarPorId($dto->productoId);

        if ($producto === null) {
            throw new DomainException("El producto no existe en el inventario.");
        }

        // 2. Convertimos el dato primitivo en un Objeto de Valor (reglas de negocio)
        $cantidadIngreso = new CantidadStock($dto->cantidad);

        // 3. Ejecutamos la regla de negocio del Agregado
        $producto->registrarEntrada($cantidadIngreso);

        // 4. Guardamos el producto con su nuevo nivel de stock
        $this->repositorio->guardar($producto);
    }
}