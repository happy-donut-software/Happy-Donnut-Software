<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Aplicacion\DTOs\CrearOrdenDTO;
use App\Dominio\Agregados\OrdenVenta;
use App\Dominio\Entidades\LineaOrden;
use App\Dominio\Puertos\OrdenRepositoryInterface;
use App\Dominio\Puertos\ProductoVentaRepositoryInterface;
use DateTimeImmutable;
use DomainException;

class CrearOrdenUseCase
{
    public function __construct(
        private readonly OrdenRepositoryInterface $ordenes,
        private readonly ProductoVentaRepositoryInterface $productos
    ) {}

    public function ejecutar(CrearOrdenDTO $dto): OrdenVenta
    {
        $orden = new OrdenVenta('ord_' . bin2hex(random_bytes(12)), $dto->obtenerClienteId(), new DateTimeImmutable());

        foreach ($dto->obtenerItems() as $itemDto) {
            $producto = $this->productos->buscarActivoPorId($itemDto->productoId);
            if ($producto === null) {
                throw new DomainException('El producto no existe o no esta disponible: ' . $itemDto->productoId);
            }
            $orden->agregarLinea(new LineaOrden(
                'lin_' . bin2hex(random_bytes(12)),
                $producto->id,
                $producto->nombre,
                $itemDto->cantidad,
                $producto->precio
            ));
        }

        $this->ordenes->guardar($orden);
        return $orden;
    }
}
