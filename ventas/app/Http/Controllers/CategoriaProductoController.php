<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Infraestructura\Persistencia\Modelos\CategoriaProductoModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoriaProductoController extends Controller
{
    public function listar(): JsonResponse
    {
        $categorias = CategoriaProductoModel::query()
            ->where('activa', true)
            ->withCount(['productos' => fn ($query) => $query->where('activo', true)])
            ->orderBy('nombre')
            ->get()
            ->map(fn (CategoriaProductoModel $categoria) => $this->respuesta($categoria));

        return response()->json(['categorias' => $categorias]);
    }

    public function crear(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:100', 'unique:categorias_producto,nombre'],
            'descripcion' => ['nullable', 'string', 'max:500'],
        ]);

        $categoria = CategoriaProductoModel::create([
            'nombre' => trim($datos['nombre']),
            'slug' => $this->slugUnico($datos['nombre']),
            'descripcion' => $datos['descripcion'] ?? null,
            'activa' => true,
        ]);

        return response()->json(['categoria' => $this->respuesta($categoria)], 201);
    }

    public function actualizar(Request $request, int $id): JsonResponse
    {
        $categoria = CategoriaProductoModel::findOrFail($id);
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:100', Rule::unique('categorias_producto', 'nombre')->ignore($categoria->id)],
            'descripcion' => ['nullable', 'string', 'max:500'],
            'activa' => ['sometimes', 'boolean'],
        ]);
        $nombreCambio = trim($datos['nombre']) !== $categoria->nombre;
        $categoria->fill($datos);
        $categoria->nombre = trim($datos['nombre']);
        if ($nombreCambio) {
            $categoria->slug = $this->slugUnico($categoria->nombre, $categoria->id);
        }
        $categoria->save();

        return response()->json(['categoria' => $this->respuesta($categoria)]);
    }

    public function eliminar(int $id): JsonResponse
    {
        $categoria = CategoriaProductoModel::findOrFail($id);
        if ($categoria->productos()->where('activo', true)->exists()) {
            return response()->json(['message' => 'No se puede eliminar una categoria con productos activos.'], 409);
        }
        $categoria->delete();
        return response()->json(['message' => 'Categoria eliminada.']);
    }

    private function slugUnico(string $nombre, ?int $ignorarId = null): string
    {
        $base = Str::slug($nombre) ?: 'categoria';
        $slug = $base;
        $numero = 2;
        while (CategoriaProductoModel::where('slug', $slug)
            ->when($ignorarId, fn ($query) => $query->where('id', '!=', $ignorarId))->exists()) {
            $slug = $base . '-' . $numero++;
        }
        return $slug;
    }

    private function respuesta(CategoriaProductoModel $categoria): array
    {
        return [
            'id' => (int) $categoria->id,
            'nombre' => $categoria->nombre,
            'slug' => $categoria->slug,
            'descripcion' => $categoria->descripcion,
            'activa' => (bool) $categoria->activa,
            'productos_count' => (int) ($categoria->productos_count ?? $categoria->productos()->where('activo', true)->count()),
        ];
    }
}
