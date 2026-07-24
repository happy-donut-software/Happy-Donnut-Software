<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Infraestructura\Persistencia\Modelos\ProductoVentaModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductoVentaController extends Controller
{
    public function listar(Request $request): JsonResponse
    {
        $productos = ProductoVentaModel::query()
            ->with('categoria')
            ->when(!$request->boolean('incluir_inactivos'), fn ($query) => $query->where('activo', true))
            ->orderBy('nombre')
            ->get()
            ->map(fn (ProductoVentaModel $producto) => $this->respuesta($producto));

        return response()->json(['productos' => $productos]);
    }

    public function crear(Request $request): JsonResponse
    {
        $datos = $this->validar($request);
        $producto = ProductoVentaModel::create([
            ...$datos,
            'id' => $this->idUnico($datos['nombre']),
            'activo' => $datos['activo'] ?? true,
        ]);
        $producto->load('categoria');

        return response()->json(['producto' => $this->respuesta($producto)], 201);
    }

    public function actualizar(Request $request, string $id): JsonResponse
    {
        $producto = ProductoVentaModel::findOrFail($id);
        $producto->update($this->validar($request, true));
        $producto->load('categoria');

        return response()->json(['producto' => $this->respuesta($producto)]);
    }

    public function eliminar(string $id): JsonResponse
    {
        $producto = ProductoVentaModel::findOrFail($id);
        $producto->update(['activo' => false]);
        return response()->json(['message' => 'Producto desactivado.']);
    }

    private function validar(Request $request, bool $actualizacion = false): array
    {
        $requerido = $actualizacion ? 'sometimes' : 'required';
        return $request->validate([
            'nombre' => [$requerido, 'string', 'max:150'],
            'categoria_id' => [$requerido, 'integer', 'exists:categorias_producto,id'],
            'descripcion' => ['nullable', 'string', 'max:1000'],
            'precio' => [$requerido, 'numeric', 'gt:0'],
            'imagen_url' => ['nullable', 'url', 'max:500'],
            'activo' => ['sometimes', 'boolean'],
        ]);
    }

    private function idUnico(string $nombre): string
    {
        $base = 'prod_' . (Str::slug($nombre, '') ?: 'producto');
        $id = $base;
        $numero = 2;
        while (ProductoVentaModel::whereKey($id)->exists()) {
            $id = $base . $numero++;
        }
        return $id;
    }

    private function respuesta(ProductoVentaModel $producto): array
    {
        return [
            'id' => $producto->id,
            'nombre' => $producto->nombre,
            'descripcion' => $producto->descripcion,
            'precio' => (float) $producto->precio,
            'imagen_url' => $producto->imagen_url,
            'activo' => (bool) $producto->activo,
            'categoria_id' => $producto->categoria_id ? (int) $producto->categoria_id : null,
            'categoria' => $producto->categoria ? [
                'id' => (int) $producto->categoria->id,
                'nombre' => $producto->categoria->nombre,
                'slug' => $producto->categoria->slug,
            ] : null,
        ];
    }
}
