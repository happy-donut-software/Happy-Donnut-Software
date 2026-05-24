<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Core\Application\UseCases\ProcesarVentaUseCase;
use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Pago;
use App\Models\MetodoPago;

class VentaController extends Controller
{
    public function __construct(private readonly ProcesarVentaUseCase $procesarVentaUseCase)
    {
    }
    /**
     * Listar todas las ventas (para admin)
     */
    public function index(Request $request)
    {
        $ventas = Venta::with(['cliente', 'detalles', 'pagos'])
                      ->orderBy('created_at', 'desc')
                      ->paginate(10);
        
        return response()->json($ventas);
    }

    /**
     * Crear nueva venta (para admin/empleados)
     */
    public function store(Request $request)
    {
        $request->validate([
            'cliente_id' => 'required|integer',
            'total_apagar' => 'required|numeric|min:0',
            'dinero_recibido' => 'required|numeric|min:0',
            'metodo_pago_id' => 'required|integer',
        ]);

        $venta = $this->procesarVentaUseCase->execute([
            'cliente_id' => $request->cliente_id,
            'empleado_id' => $request->user()->id ?? 1,
            'total_apagar' => $request->total_apagar,
            'dinero_recibido' => $request->dinero_recibido,
            'metodo_pago_id' => $request->metodo_pago_id,
            'estado_pedido' => 'pendiente',
        ]);

        return response()->json([
            'message' => 'Venta procesada exitosamente',
            'venta' => $venta->toArray(),
        ], 201);
    }

    /**
     * Mostrar venta específica
     */
    public function show($id)
    {
        $venta = Venta::with(['cliente', 'detalles', 'pagos'])
                     ->find($id);

        if (!$venta) {
            return response()->json(['error' => 'Venta no encontrada'], 404);
        }

        return response()->json($venta);
    }

    /**
     * Actualizar estado de venta
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'estado_pedido' => 'required|in:pendiente,en_proceso,completado,cancelado'
        ]);

        $venta = Venta::find($id);

        if (!$venta) {
            return response()->json(['error' => 'Venta no encontrada'], 404);
        }

        $venta->update(['estado_pedido' => $request->estado_pedido]);

        return response()->json([
            'message' => 'Estado actualizado exitosamente',
            'venta' => $venta
        ]);
    }

    /**
     * Obtener detalles de una venta
     */
    public function getDetalles($id)
    {
        $venta = Venta::find($id);

        if (!$venta) {
            return response()->json(['error' => 'Venta no encontrada'], 404);
        }

        $detalles = DetalleVenta::where('venta_id', $id)->get();

        return response()->json($detalles);
    }
}
