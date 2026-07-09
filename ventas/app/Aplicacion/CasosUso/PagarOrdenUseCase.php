<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Dominio\Agregados\OrdenVenta;
use App\Dominio\Eventos\OrdenPagada;
use App\Dominio\Puertos\OrdenPagadaPublicadorInterface;
use App\Dominio\Puertos\OrdenRepositoryInterface;
use DateTimeImmutable;
use DomainException;

/**
 * Caso de Uso: Procesar el pago de un pedido existente.
 */
class PagarOrdenUseCase
{
    public function __construct(
        private readonly OrdenRepositoryInterface $repositorio,
        private readonly OrdenPagadaPublicadorInterface $publicador
    ) {
    }

    public function ejecutar(string $ordenId): OrdenVenta
    {
        // 1. Buscamos la orden
        $orden = $this->repositorio->buscarPorId($ordenId);

        if ($orden === null) {
            throw new DomainException("La orden especificada no existe.");
        }

        // 2. Delegamos la lógica de negocio al Agregado
        // Él verificará si está PENDIENTE antes de cambiar a PAGADA.
        $orden->marcarComoPagada();

        // 3. Guardamos los cambios
        $this->repositorio->guardar($orden);

        $items = array_map(
            fn ($linea) => [
                'producto_id' => $linea->obtenerProductoId(),
                'cantidad' => $linea->obtenerCantidad(),
            ],
            $orden->obtenerLineas()
        );

        $this->publicador->publicar(new OrdenPagada(
            $orden->obtenerId(),
            $orden->obtenerClienteId(),
            $orden->calcularTotal(),
            $items,
            (new DateTimeImmutable())->format(DATE_ATOM)
        ));

        return $orden;
    }
}