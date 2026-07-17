<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Infraestructura\Persistencia\Modelos\OrdenVentaModel;
use App\Infraestructura\Persistencia\Modelos\ProductoVentaModel;
use App\Aplicacion\CasosUso\CrearOrdenUseCase;
use App\Aplicacion\CasosUso\PagarOrdenUseCase;
use App\Aplicacion\DTOs\CrearOrdenDTO;
use App\Aplicacion\DTOs\ItemOrdenDTO;
use DomainException;
class OrdenController extends Controller
{
    /**
     * Historial de Comprobantes para el Frontend
     */
    public function index(): JsonResponse
    {
        // Usamos Eloquent directamente como Read Model para agilizar las consultas del front
        $ordenes = OrdenVentaModel::with('lineas')
            ->orderBy('fecha_creacion', 'desc')
            ->get();

        return response()->json($ordenes);
    }

    /**
     * Catálogo rápido de productos para el POS
     */
    public function productos(): JsonResponse
    {
        // Consulta real a la base de datos de PostgreSQL
        $productos = ProductoVentaModel::all(['id', 'nombre', 'precio', 'categoria']);

        return response()->json($productos);
    }

    public function crear(Request $request, CrearOrdenUseCase $useCase): JsonResponse
    {
        $request->validate([
            'cliente_id' => 'nullable|string', // ✓ Corregido a nullable
            'codigo_promocion' => 'nullable|string', 
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|string',
            'items.*.cantidad' => 'required|integer|min:1',
            // X BORRADOS: nombre_producto y precio_unitario
        ]);

        try {
            $itemsDto = [];
            foreach ($request->items as $item) {
                $itemsDto[] = new ItemOrdenDTO(
                    $item['producto_id'],
                    $item['cantidad']
                );
            }
            $dto = new CrearOrdenDTO($request->input('cliente_id'), $request->input('codigo_promocion'), $itemsDto);
            $orden = $useCase->ejecutar($dto);

            return response()->json([
                'mensaje' => 'Orden de venta creada exitosamente',
                'orden_id' => $orden->obtenerId(),
                'total' => $orden->calcularTotal(),
                'estado' => $orden->obtenerEstado()->value
            ], 201);

        } catch (DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function pagar(string $id, Request $request, PagarOrdenUseCase $useCase): JsonResponse
    {
        $request->validate([
            'monto_recibido' => 'required|numeric|min:0',
            'tipo_comprobante' => 'required|string|in:BOLETA,NOTA_PEDIDO' // ✓ Nuevo campo
        ]);

        try {
            $orden = $useCase->ejecutar(
                $id, 
                (float) $request->input('monto_recibido'),
                $request->input('tipo_comprobante') // ✓ Pasamos el comprobante
            );

            return response()->json([
                'mensaje' => 'Orden pagada exitosamente.',
                'orden_id' => $orden->obtenerId(),
                'tipo_comprobante' => $orden->obtenerTipoComprobante(),
                'vuelto' => $orden->obtenerVuelto()
            ]);

        } catch (DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}