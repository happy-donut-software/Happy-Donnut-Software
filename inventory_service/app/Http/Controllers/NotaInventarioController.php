<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NotaInventario;
use App\Models\NotaItem;
use Illuminate\Support\Facades\DB;

class NotaInventarioController extends Controller
{
    public function index(Request $request)
    {
        $tipo = $request->query('tipo');
        $query = NotaInventario::with('items');
        if (in_array($tipo, ['entrada', 'salida'])) {
            $query->where('tipo', $tipo);
        }
        $list = $query->orderBy('fecha', 'desc')->get();
        return response()->json(['data' => $list], 200);
    }

    public function show($id)
    {
        $nota = NotaInventario::with('items')->find($id);
        if (!$nota) return response()->json(['error' => 'No encontrado'], 404);
        return response()->json(['data' => $nota], 200);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'tipo' => 'required|in:entrada,salida',
            'fecha' => 'nullable|date',
            'descripcion' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.insumo_id' => 'nullable|integer|exists:insumos,id',
            'items.*.producto_id' => 'nullable|integer|exists:productos,id',
            'items.*.cantidad' => 'required|numeric|min:0.001',
        ]);

        DB::beginTransaction();
        try {
            $nota = NotaInventario::create([
                'tipo' => $data['tipo'],
                'fecha' => $data['fecha'] ?? now(),
                'descripcion' => $data['descripcion'] ?? null,
                'user_id' => auth()?->id() ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $nota->items()->create([
                    'insumo_id' => $item['insumo_id'] ?? null,
                    'producto_id' => $item['producto_id'] ?? null,
                    'cantidad' => $item['cantidad'],
                ]);
            }

            DB::commit();
            return response()->json(['data' => $nota->load('items')], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al crear nota', 'detail' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $nota = NotaInventario::find($id);
        if (!$nota) return response()->json(['error' => 'No encontrado'], 404);

        $data = $request->validate([
            'descripcion' => 'nullable|string',
            'fecha' => 'nullable|date',
            'items' => 'nullable|array',
            'items.*.insumo_id' => 'nullable|integer',
            'items.*.producto_id' => 'nullable|integer',
            'items.*.cantidad' => 'required_with:items|numeric|min:0.001',
        ]);

        DB::beginTransaction();
        try {
            $nota->update(array_filter([
                'descripcion' => $data['descripcion'] ?? null,
                'fecha' => $data['fecha'] ?? null,
            ]));

            if (!empty($data['items'])) {
                $nota->items()->delete();
                foreach ($data['items'] as $item) {
                    $nota->items()->create([
                        'insumo_id' => $item['insumo_id'] ?? null,
                        'producto_id' => $item['producto_id'] ?? null,
                        'cantidad' => $item['cantidad'],
                    ]);
                }
            }

            DB::commit();
            return response()->json(['data' => $nota->load('items')], 200);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al actualizar', 'detail' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $nota = NotaInventario::find($id);
        if (!$nota) return response()->json(['error' => 'No encontrado'], 404);
        $nota->delete();
        return response()->json(['message' => 'Eliminado'], 200);
    }
}
