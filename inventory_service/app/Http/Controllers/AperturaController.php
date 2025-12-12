<?php

namespace App\Http\Controllers;

use App\Models\Apertura;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class AperturaController extends Controller
{
    /**
     * Verifica si ya existe una caja abierta para el día de hoy.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function verificarEstado()
    {
        $hoy = Carbon::today()->toDateString();

        $cajaAbierta = Apertura::where('fecha', $hoy)->exists();

        return response()->json(['cajaAbierta' => $cajaAbierta]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'fondo_inicial' => 'required|numeric',
            ]);

            $hoy = Carbon::today()->toDateString();

            // Doble verificación para seguridad
            if (Apertura::where('fecha', $hoy)->exists()) {
                return response()->json(['message' => 'Ya existe una caja abierta para el día de hoy.'], 409); // 409 Conflict
            }

            $apertura = DB::transaction(function () use ($request, $hoy) {
                // Crear la apertura
                $nuevaApertura = Apertura::create([
                    'fondo_inicial' => $request->input('fondo_inicial'),
                    'responsable_caja' => $request->input('responsable_caja', 'No especificado'), // Valor por defecto
                    'observaciones' => $request->input('observaciones'),
                    'fecha' => $hoy,
                    'hora' => Carbon::now()->toTimeString(),
                ]);

                // Crear el primer movimiento del día asociado
                $nuevaApertura->movimientoDia()->create([
                    'total_entradas' => 0,
                    'total_salidas' => 0,
                    'total_ventas' => 0,
                    'total_gastos' => 0,
                    'total_efectivo_caja' => $request->input('fondo_inicial'),
                ]);

                return $nuevaApertura;
            });

            return response()->json([
                'message' => 'Apertura de caja registrada exitosamente.',
                'apertura' => $apertura->load('movimientoDia') // Cargar la relación para la respuesta
            ], 201);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Log::error('Error al registrar la apertura de caja: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al registrar la apertura de caja.'], 500);
        }
    }

    /**
     * Obtiene el estado actual de la caja para el día de hoy.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function estadoActual()
    {
        $hoy = Carbon::today()->toDateString();

        $apertura = Apertura::where('fecha', $hoy)->latest('id_apertura')->first();

        if (!$apertura) {
            return response()->json([
                'estado' => 'cerrada',
                'mensaje' => 'No hay una caja abierta para el día de hoy.'
            ]);
        }

        return response()->json([
            'estado' => 'abierta',
            'datos' => [
                'id_apertura' => $apertura->id_apertura,
                'responsable' => $apertura->responsable_caja,
                'fecha' => Carbon::parse($apertura->fecha)->format('Y-m-d'),
                'hora' => Carbon::parse($apertura->hora)->format('h:i a'),
                'fondo_inicial_efectivo' => (float) $apertura->fondo_inicial,
                'fondo_inicial_yape' => 0.00,
                'fondo_inicial_plin' => 0.00,
            ],
            'mensaje' => 'Caja abierta actualmente.'
        ]);
    }
}
