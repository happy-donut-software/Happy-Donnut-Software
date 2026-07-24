<?php
namespace App\Http\Controllers;
use App\Aplicacion\CasosUso\BuscarClientesFrecuentesUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ClienteFrecuenteController extends Controller { public function buscar(Request $request,BuscarClientesFrecuentesUseCase $useCase): JsonResponse { $termino=(string)$request->query('buscar',''); return response()->json(['clientes'=>array_map(fn($c)=>['id'=>$c->id,'nombre'=>$c->nombre,'telefono'=>$c->telefono,'direccion'=>$c->direccion],$useCase->ejecutar($termino))]); } }