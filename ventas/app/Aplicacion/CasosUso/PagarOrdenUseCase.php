<?php

declare(strict_types=1);

namespace App\Aplicacion\CasosUso;

use App\Dominio\Agregados\OrdenVenta;
use App\Dominio\Puertos\OrdenRepositoryInterface;
use DomainException;

/**
 * Caso de Uso: Procesar el pago de un pedido existente.
 */
class PagarOrdenUseCase
{
    public function __construct(
        private readonly OrdenRepositoryInterface $repositorio
    ) {
    }

    public function ejecutar(string $ordenId, float $montoRecibido, string $tipoComprobante): OrdenVenta
    {
        $orden = $this->repositorio->buscarPorId($ordenId);

        if ($orden === null) {
            throw new DomainException("La orden especificada no existe.");
        }

        // Asignar el comprobante ANTES de pagar
        $orden->establecerTipoComprobante($tipoComprobante);
        
        $orden->marcarComoPagada($montoRecibido);

        // TODO: Si es BOLETA, emitir evento "VentaAcumuladaEnRUS" para Finanzas

        $this->repositorio->guardar($orden);

        return $orden;
    }
}