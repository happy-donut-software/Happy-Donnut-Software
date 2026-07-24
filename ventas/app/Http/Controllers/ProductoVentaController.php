<?php
namespace App\Http\Controllers;
use App\Aplicacion\CasosUso\ListarProductosVentaUseCase;
use Illuminate\Http\JsonResponse;
class ProductoVentaController extends Controller { public function listar(ListarProductosVentaUseCase $useCase): JsonResponse { return response()->json(['productos'=>array_map(fn($p)=>['id'=>$p->id,'nombre'=>$p->nombre,'precio'=>$p->precio],$useCase->ejecutar())]); } }