<?php

declare(strict_types=1);
namespace App\Infraestructura\Persistencia\Repositorios;
use App\Dominio\Agregados\ClienteFrecuente;
use App\Dominio\Puertos\ClienteFrecuenteRepositoryInterface;
use App\Infraestructura\Persistencia\Modelos\ClienteFrecuenteModel;
class EloquentClienteFrecuenteRepository implements ClienteFrecuenteRepositoryInterface { public function buscar(string $termino,int $limite=10): array { return ClienteFrecuenteModel::query()->when($termino!=='',fn($q)=>$q->where(fn($x)=>$x->where('nombre','ilike','%'.$termino.'%')->orWhere('telefono','like','%'.$termino.'%')))->limit($limite)->get()->map(fn($c)=>new ClienteFrecuente($c->id,$c->nombre,$c->telefono,$c->direccion))->all(); } }