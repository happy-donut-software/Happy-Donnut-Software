<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Aplicacion\DTOs\RemoverProductoDTO;
use App\Dominio\Agregados\CarritoCompras;
use App\Dominio\Puertos\CarritoRepositoryInterface;
use DomainException;

/**
 * Caso de Uso: Elimina completamente un producto del carrito.
 */
class RemoverProductoUseCase
{
    public function __construct(
        private readonly CarritoRepositoryInterface $repositorio
    ) {
    }

    public function ejecutar(RemoverProductoDTO $dto): CarritoCompras
    {
        $carrito = $this->repositorio->buscarPorClienteId($dto->clienteId);

        if ($carrito === null) {
            throw new DomainException("No tienes un carrito activo.");
        }

        // Delegamos la eliminación al Agregado Raíz
        $carrito->removerProducto($dto->productoId);

        $this->repositorio->guardar($carrito);

        return $carrito;
    }
}