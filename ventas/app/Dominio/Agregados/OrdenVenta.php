<?php

declare(strict_types=1);

namespace App\Dominio\Agregados;

use App\Dominio\Entidades\LineaOrden;
use App\Dominio\ObjetosValor\EstadoOrden;
use DateTimeImmutable;
use DomainException;

/**
 * Raíz del Agregado de Ventas.
 * Controla toda la lógica matemática y de estado de un pedido en la tienda.
 */
class OrdenVenta
{
    /** @var LineaOrden[] */
    private array $lineas = [];

    public function __construct(
        private readonly string $id,
        private readonly ?string $clienteId,
        private readonly DateTimeImmutable $fechaCreacion,
        private EstadoOrden $estado = EstadoOrden::PENDIENTE,
        private ?float $montoRecibido = null,
        private ?float $vuelto = null,
        private ?string $metodoPago = null,
        private string $tipoComprobante = 'NOTA_PEDIDO'
    ) {
    }

    public function obtenerId(): string
    {
        return $this->id;
    }

    public function obtenerClienteId(): ?string 
    {
        return $this->clienteId;
    }

    public function obtenerEstado(): EstadoOrden
    {
        return $this->estado;
    }

    /**
     * @return LineaOrden[]
     */
    public function obtenerLineas(): array
    {
        return $this->lineas;
    }

    public function agregarLinea(LineaOrden $linea): void
    {
        if ($this->estado !== EstadoOrden::PENDIENTE) {
            throw new DomainException("No se pueden agregar productos a una orden que ya no está pendiente.");
        }

        $this->lineas[] = $linea;
    }

    public function calcularTotal(): float
    {
        $total = 0.0;
        foreach ($this->lineas as $linea) {
            $total += $linea->calcularSubtotal();
        }
        return $total;
    }

    public function registrarPago(float $montoRecibido, string $metodoPago, string $tipoComprobante): void
    {
        if (!$this->estado->puedeSerPagada()) {
            throw new DomainException("Esta orden no está en estado pendiente para ser pagada.");
        }
        $metodoPago = strtoupper(trim($metodoPago));
        $tipoComprobante = strtoupper(trim($tipoComprobante));
        if (!in_array($metodoPago, ['EFECTIVO', 'YAPE', 'PLIN'], true)) { throw new DomainException('El método de pago debe ser EFECTIVO, YAPE o PLIN.'); }
        if (!in_array($tipoComprobante, ['BOLETA', 'NOTA_PEDIDO'], true)) { throw new DomainException('El comprobante debe ser BOLETA o NOTA_PEDIDO.'); }
        $total = round($this->calcularTotal(), 2);
        if ($metodoPago === 'EFECTIVO' && $montoRecibido < $total) { throw new DomainException('El monto recibido no cubre el total de la venta.'); }
        if ($metodoPago !== 'EFECTIVO') { $montoRecibido = $total; }
        $this->montoRecibido = round($montoRecibido, 2);
        $this->vuelto = round(max(0, $montoRecibido - $total), 2);
        $this->metodoPago = $metodoPago;
        $this->tipoComprobante = $tipoComprobante;
        $this->estado = EstadoOrden::PAGADA;
    }

    public function obtenerMontoRecibido(): ?float { return $this->montoRecibido; }
    public function obtenerVuelto(): ?float { return $this->vuelto; }
    public function obtenerMetodoPago(): ?string { return $this->metodoPago; }
    public function obtenerTipoComprobante(): string { return $this->tipoComprobante; }
    public function cancelar(): void
    {
        if (!$this->estado->puedeSerCancelada()) {
            throw new DomainException("Esta orden ya no puede ser cancelada.");
        }

        $this->estado = EstadoOrden::CANCELADA;
    }
    
    public function obtenerFechaCreacion(): DateTimeImmutable
    {
        return $this->fechaCreacion;
    }
}