<?php
namespace App\Http\Controllers;
use App\Dominio\Puertos\AcumuladoRusRepositoryInterface;
use Illuminate\Http\JsonResponse;
class RusController extends Controller { public function consultar(string $periodo,AcumuladoRusRepositoryInterface $rus): JsonResponse { $actual=$rus->buscarPorPeriodo($periodo); return response()->json(['periodo'=>$periodo,'acumulado'=>$actual?->obtenerTotal()??0.0,'limite'=>$actual?->obtenerLimite()??5000.0,'estado'=>$actual?->obtenerEstado()??'NORMAL']); } }