<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Aplicacion\DTOs\CrearOrdenDTO;
use App\Dominio\Agregados\OrdenVenta;
use App\Dominio\Entidades\LineaOrden;
use App\Dominio\Puertos\OrdenRepositoryInterface;
use DateTimeImmutable;
use App\Infraestructura\Persistencia\Modelos\ProductoVentaModel;

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
        $ordenId = uniqid('ord_');
        $orden = new OrdenVenta($ordenId, $dto->clienteId, new DateTimeImmutable());

        foreach ($dto->items as $itemDto) {
            // 1. Consulta REAL a la base de datos
            $productoDb = ProductoVentaModel::find($itemDto->productoId);

            if (!$productoDb) {
                throw new DomainException("El producto con ID {$itemDto->productoId} no existe en el catálogo.");
            }

            $lineaId = uniqid('lin_');
            $linea = new LineaOrden(
                $lineaId,
                $itemDto->productoId,
                $productoDb->nombre, // Dato real de BD
                $itemDto->cantidad,
                (float) $productoDb->precio // Dato real de BD
            );
            $orden->agregarLinea($linea);
        }

        // ... (resto del código de promociones y guardado)
        $this->repositorio->guardar($orden);
        return $orden;
    }
}