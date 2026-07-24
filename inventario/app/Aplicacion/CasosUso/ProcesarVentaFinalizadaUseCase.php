<?php

declare(strict_types=1);
namespace App\Aplicacion\CasosUso;
use App\Aplicacion\DTOs\VentaFinalizadaDTO;
use App\Aplicacion\Puertos\TransaccionInterface;
use App\Dominio\ObjetosValor\CantidadStock;
use App\Dominio\Puertos\EventoProcesadoRepositoryInterface;
use App\Dominio\Puertos\ProductoRepositoryInterface;
use DomainException;
class ProcesarVentaFinalizadaUseCase {
    public function __construct(private readonly ProductoRepositoryInterface $productos, private readonly EventoProcesadoRepositoryInterface $eventos, private readonly TransaccionInterface $transaccion) {}
    /** @return array{duplicado:bool,alertas:array<int,string>} */
    public function ejecutar(VentaFinalizadaDTO $dto): array {
        return $this->transaccion->ejecutar(function () use ($dto): array {
            if ($this->eventos->fueProcesado($dto->eventoId)) { return ['duplicado'=>true,'alertas'=>[]]; }
            $alertas=[];
            foreach ($dto->lineas as $linea) {
                $producto=$this->productos->buscarPorId($linea['producto_id']);
                if ($producto===null) { throw new DomainException('Producto no encontrado: '.$linea['producto_id']); }
                $producto->registrarSalida(new CantidadStock($linea['cantidad']));
                $this->productos->guardar($producto);
                if ($producto->requiereReabastecimiento()) { $alertas[]=$producto->obtenerId(); }
            }
            $this->eventos->marcarProcesado($dto->eventoId);
            return ['duplicado'=>false,'alertas'=>$alertas];
        });
    }
}