<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Aplicacion\DTOs\AgregarProductoDTO;
use App\Dominio\Agregados\CarritoCompras;
use App\Dominio\Puertos\CarritoRepositoryInterface;

/**
 * Caso de Uso: Añade un producto al carrito del cliente.
 * Si el carrito no existe, lo crea automáticamente.
 */
class AgregarProductoUseCase
{
    public function __construct(
        private readonly CarritoRepositoryInterface $repositorio
    ) {
    }

    public function ejecutar(AgregarProductoDTO $dto): CarritoCompras
    {
        // 1. Buscamos si el cliente ya tiene un carrito empezado
        $carrito = $this->repositorio->buscarPorClienteId($dto->clienteId);

        // 2. Si es la primera dona que agrega, le creamos un carrito nuevo
        if ($carrito === null) {
            $carritoId = uniqid('cart_');
            $carrito = new CarritoCompras($carritoId, $dto->clienteId);
        }

        // 3. Delegamos al Dominio la regla de negocio (agregar o sumar cantidad)
        $carrito->agregarProducto(
            $dto->productoId,
            $dto->nombreProducto,
            $dto->cantidad,
            $dto->precioUnitario
        );

        // 4. Guardamos el nuevo estado del carrito
        $this->repositorio->guardar($carrito);

        return $carrito;
    }
}