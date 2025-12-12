<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Categoria;

class CategoriaController extends Controller
{
    public function index()
    {
        $items = Categoria::orderBy('nombre')->get();
        return response()->json(['data' => $items], 200);
    }

    public function show($id)
    {
        $categoria = Categoria::find($id);
        if (!$categoria) return response()->json(['error' => 'No encontrado'], 404);
        return response()->json(['data' => $categoria], 200);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:191|unique:categorias,nombre',
            'descripcion' => 'nullable|string',
        ]);

        $categoria = Categoria::create($data);

        return response()->json(['data' => $categoria], 201);
    }

    public function update(Request $request, $id)
    {
        $categoria = Categoria::find($id);
        if (!$categoria) return response()->json(['error' => 'No encontrado'], 404);

        $data = $request->validate([
            'nombre' => 'required|string|max:191|unique:categorias,nombre,' . $id,
            'descripcion' => 'nullable|string',
        ]);

        $categoria->update($data);
        return response()->json(['data' => $categoria], 200);
    }

    public function destroy($id)
    {
        $categoria = Categoria::find($id);
        if (!$categoria) return response()->json(['error' => 'No encontrado'], 404);
        $categoria->delete();
        return response()->json(['message' => 'Eliminado'], 200);
    }
}
