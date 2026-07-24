<?php

declare(strict_types=1);
namespace App\Aplicacion\CasosUso;
use App\Dominio\Puertos\ProductoVentaRepositoryInterface;
class ListarProductosVentaUseCase { public function __construct(private readonly ProductoVentaRepositoryInterface $productos) {} public function ejecutar(): array { return $this->productos->listarActivos(); } }