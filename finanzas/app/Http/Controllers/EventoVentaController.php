<?php

namespace App\Http\Controllers;

use App\Aplicacion\CasosUso\ProcesarVentaFinalizadaUseCase;
use App\Aplicacion\DTOs\VentaFinalizadaDTO;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventoVentaController extends Controller
{
    public function procesar(Request $request, ProcesarVentaFinalizadaUseCase $useCase): JsonResponse
    {
        $secret = (string) env('EVENTOS_SECRET', '');
        if ($secret === '' || !hash_equals($secret, (string) $request->header('X-Eventos-Secret', ''))) {
            return response()->json(['error' => 'Evento no autorizado.'], 401);
        }
        $datos = $request->validate([
            'evento_id' => 'required|string|max:100', 'venta_id' => 'required|string|max:100',
            'total' => 'required|numeric|min:0.01', 'tipo_comprobante' => 'required|in:BOLETA,NOTA_PEDIDO',
            'metodo_pago' => 'required|in:EFECTIVO,YAPE,PLIN', 'ocurrido_en' => 'required|date',
        ]);
        try {
            $resultado = $useCase->ejecutar(new VentaFinalizadaDTO(
                $datos['evento_id'], $datos['venta_id'], (float) $datos['total'], $datos['tipo_comprobante'], $datos['metodo_pago'], $datos['ocurrido_en']
            ));
            return response()->json($resultado, $resultado['duplicado'] ? 200 : 202);
        } catch (DomainException $error) {
            return response()->json(['error' => $error->getMessage()], 409);
        }
    }
}