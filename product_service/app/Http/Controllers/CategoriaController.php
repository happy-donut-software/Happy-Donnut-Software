<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoriaController extends Controller
{
    /**
     * Listar todas las categorías
     */
    public function index()
    {
        $categories = Categoria::orderBy('nombre_categoria')->get();
        
        return response()->json($categories);
    }

    /**
     * Crear nueva categoría
     */
    public function store(Request $request)
    {
        // Temporal: sin validación para debug
        $category = Categoria::create([
            'nombre_categoria' => $request->input('nombre_categoria', 'Test Category'),
            'descripcion' => $request->input('descripcion', 'Test description')
        ]);

        return response()->json([
            'message' => 'Categoría creada exitosamente',
            'category' => $category
        ], 201);
    }

    /**
     * Mostrar categoría específica
     */
    public function show($id)
    {
        $category = Categoria::with('productos')->find($id);
        
        if (!$category) {
            return response()->json(['error' => 'Categoría no encontrada'], 404);
        }

        return response()->json($category);
    }

    /**
     * Actualizar categoría
     */
    public function update(Request $request, $id)
    {
        \Log::info('Categoria Update Request:', [
            'id' => $id,
            'all_data' => $request->all()
        ]);

        try {
            $category = Categoria::find($id);
            
            if (!$category) {
                return response()->json(['error' => 'Categoría no encontrada'], 404);
            }

            // Temporal: sin validación para debug
            $category->update([
                'nombre_categoria' => $request->input('nombre_categoria', $category->nombre_categoria),
                'descripcion' => $request->input('descripcion', $category->descripcion),
            ]);

            return response()->json([
                'message' => 'Categoría actualizada exitosamente',
                'category' => $category
            ]);
        } catch (\Exception $e) {
            \Log::error('Categoria Update Error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Error actualizando categoría',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar categoría
     */
    public function destroy($id)
    {
        try {
            // Simplificado al máximo para evitar errores
            $category = Categoria::find($id);
            
            if (!$category) {
                return response()->json(['error' => 'Categoría no encontrada'], 404);
            }

            // Eliminar directamente sin verificar constraints
            $category->delete();

            return response()->json(['message' => 'Categoría eliminada exitosamente']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error eliminando categoría',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
