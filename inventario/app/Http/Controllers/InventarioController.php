<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Aplicacion\CasosUso\DescontarStockUseCase;
use App\Aplicacion\CasosUso\ReabastecerStockUseCase;
use App\Aplicacion\DTOs\AjustarStockDTO;
use App\Dominio\Puertos\ProductoRepositoryInterface;
use App\Infraestructura\Persistencia\Modelos\ProductoInventarioModel;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventarioController extends Controller
{
    public function listarProductos(): JsonResponse
    {
        return response()->json(['productos' => ProductoInventarioModel::query()->orderBy('nombre')->get()]);
    }

    public function crearProducto(Request $request): JsonResponse
    {
        $datos = $this->validarProducto($request);
        $producto = ProductoInventarioModel::updateOrCreate(['id' => $datos['id']], $datos);
        return response()->json(['producto' => $producto], 201);
    }

    public function actualizarProducto(Request $request, string $id): JsonResponse
    {
        $producto = ProductoInventarioModel::findOrFail($id);
        $producto->update($this->validarProducto($request, true));
        return response()->json(['producto' => $producto->fresh()]);
    }

    public function eliminarProducto(string $id): JsonResponse
    {
        $producto = ProductoInventarioModel::findOrFail($id);
        $producto->delete();
        return response()->json(['message' => 'Producto eliminado del inventario.']);
    }

    public function reabastecer(Request $request, ReabastecerStockUseCase $useCase): JsonResponse
    {
        $request->validate(['producto_id' => 'required|string', 'cantidad' => 'required|integer|min:1']);
        try {
            $useCase->ejecutar(new AjustarStockDTO($request->producto_id, (int) $request->cantidad));
            return response()->json(['mensaje' => 'Stock reabastecido exitosamente.', 'producto_id' => $request->producto_id]);
        } catch (DomainException $error) {
            return response()->json(['error' => $error->getMessage()], 400);
        }
    }

    public function descontar(Request $request, DescontarStockUseCase $useCase): JsonResponse
    {
        $request->validate(['producto_id' => 'required|string', 'cantidad' => 'required|integer|min:1']);
        try {
            $useCase->ejecutar(new AjustarStockDTO($request->producto_id, (int) $request->cantidad));
            return response()->json(['mensaje' => 'Stock descontado exitosamente.', 'producto_id' => $request->producto_id]);
        } catch (DomainException $error) {
            return response()->json(['error' => $error->getMessage()], 400);
        }
    }

    public function consultar(string $id, ProductoRepositoryInterface $productos): JsonResponse
    {
        $producto = $productos->buscarPorId($id);
        if ($producto === null) {
            return response()->json(['error' => 'Producto no encontrado.'], 404);
        }
        return response()->json([
            'id' => $producto->obtenerId(),
            'nombre' => $producto->obtenerNombre(),
            'stock_disponible' => $producto->obtenerStockDisponible()->obtenerValor(),
            'stock_minimo' => $producto->obtenerStockMinimo(),
            'requiere_reabastecimiento' => $producto->requiereReabastecimiento(),
        ]);
    }

    private function validarProducto(Request $request, bool $actualizacion = false): array
    {
        $requerido = $actualizacion ? 'sometimes' : 'required';
        return $request->validate([
            'id' => [$actualizacion ? 'sometimes' : 'required', 'string', 'max:100'],
            'nombre' => [$requerido, 'string', 'max:150'],
            'stock_disponible' => [$requerido, 'integer', 'min:0'],
            'stock_minimo' => ['sometimes', 'integer', 'min:0'],
        ]);
    }
}
