<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Aplicacion\DTOs\CrearOrdenDTO;
use App\Dominio\Agregados\OrdenVenta;
use App\Dominio\Entidades\LineaOrden;
use App\Dominio\Puertos\OrdenRepositoryInterface;
use DateTimeImmutable;

/**
 * Caso de Uso: Crear un nuevo pedido en el sistema.
 */
class CrearOrdenUseCase
{
    public function __construct(
        private readonly OrdenRepositoryInterface $repositorio
    ) {
    }

    public function ejecutar(CrearOrdenDTO $dto): OrdenVenta
    {
        // 1. Creamos la Raíz del Agregado (La Orden principal)
        $ordenId = uniqid('ord_');
        $orden = new OrdenVenta($ordenId, $dto->clienteId, new DateTimeImmutable());

        // 2. Iteramos sobre los DTOs de los ítems y los convertimos en Entidades de Dominio
        foreach ($dto->items as $itemDto) {
            $lineaId = uniqid('lin_');
            $linea = new LineaOrden(
                $lineaId,
                $itemDto->productoId,
                $itemDto->nombreProducto,
                $itemDto->cantidad,
                $itemDto->precioUnitario
            );
            
            // La Orden se encarga de proteger sus propias reglas al agregar líneas
            $orden->agregarLinea($linea);
        }

        // 3. Persistimos la orden usando el puerto (abstracción de BD)
        $this->repositorio->guardar($orden);

        return $orden;
    }
}