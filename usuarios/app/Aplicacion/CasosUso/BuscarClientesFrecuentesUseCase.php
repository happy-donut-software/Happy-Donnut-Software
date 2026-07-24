<?php

declare(strict_types=1);
namespace App\Aplicacion\CasosUso;
use App\Dominio\Puertos\ClienteFrecuenteRepositoryInterface;
class BuscarClientesFrecuentesUseCase { public function __construct(private readonly ClienteFrecuenteRepositoryInterface $clientes){} public function ejecutar(string $termino): array { return $this->clientes->buscar(trim($termino)); } }