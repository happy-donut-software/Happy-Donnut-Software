<?php
namespace App\Http\Controllers;
use App\Aplicacion\CasosUso\ProcesarVentaFinalizadaUseCase;
use App\Aplicacion\DTOs\VentaFinalizadaDTO;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class EventoVentaController extends Controller {
    public function procesar(Request $request, ProcesarVentaFinalizadaUseCase $useCase): JsonResponse {
        $secret=(string)env('EVENTOS_SECRET','');
        if($secret==='' || !hash_equals($secret,(string)$request->header('X-Eventos-Secret',''))) { return response()->json(['error'=>'Evento no autorizado.'],401); }
        $datos=$request->validate(['evento_id'=>'required|string|max:100','venta_id'=>'required|string|max:100','lineas'=>'required|array|min:1','lineas.*.producto_id'=>'required|string','lineas.*.cantidad'=>'required|integer|min:1']);
        try { $resultado=$useCase->ejecutar(new VentaFinalizadaDTO($datos['evento_id'],$datos['venta_id'],$datos['lineas'])); return response()->json($resultado,$resultado['duplicado']?200:202); }
        catch(DomainException $error) { return response()->json(['error'=>$error->getMessage()],409); }
    }
}