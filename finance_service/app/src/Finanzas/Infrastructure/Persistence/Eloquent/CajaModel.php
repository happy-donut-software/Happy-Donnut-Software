<?php

declare(strict_types=1);

namespace Finanzas\Infrastructure\Persistence\Eloquent;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * Modelo Eloquent para la entidad Caja.
 *
 * Este modelo mapea la tabla 'cajas' de la base de datos a una clase PHP.
 * Actúa como puente entre la capa de infraestructura (base de datos) y
 * la capa de dominio (entidad de negocio Caja).
 *
 * Responsabilidades:
 * - Mapear la tabla 'cajas' en PostgreSQL
 * - Proporcionar interfaz para consultas a base de datos
 * - Convertir entre tipos de base de datos y PHP
 * - Ser persistido por el repositorio Eloquent
 *
 * Propiedades mapeadas:
 * - id: UUID del modelo
 * - vendedor_id: Identificador del vendedor
 * - monto_apertura: Monto inicial (DECIMAL)
 * - monto_actual: Monto actual (DECIMAL)
 * - estado: 'abierta' o 'cerrada'
 * - monto_cierre_real: Monto real al cerrar (nullable)
 * - diferencia: Diferencia calculada (nullable)
 * - fecha_apertura: Timestamp de apertura
 * - fecha_cierre: Timestamp de cierre (nullable)
 *
 * @package Finanzas\Infrastructure\Persistence\Eloquent
 */
class CajaModel extends Model
{
    use HasUuids;

    /**
     * Nombre de la tabla en la base de datos.
     *
     * @var string
     */
    protected $table = 'cajas';

    /**
     * Nombre de la columna que actúa como clave primaria.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * Indicar si el modelo maneja timestamps automáticamente.
     *
     * @var bool
     */
    public $timestamps = true;

    /**
     * Atributos que son asignables en masa.
     *
     * Laravel usa esto para prevenir asignación en masa no deseada.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'vendedor_id',
        'monto_apertura',
        'monto_actual',
        'estado',
        'monto_cierre_real',
        'diferencia',
        'fecha_apertura',
        'fecha_cierre',
    ];

    /**
     * Atributos que deberían castearse a tipos nativos.
     *
     * Cuando obtenemos datos de la base de datos, los valores DECIMAL
     * se convierten automáticamente a float para facilitar operaciones.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'id' => 'string',
        'monto_apertura' => 'float',
        'monto_actual' => 'float',
        'monto_cierre_real' => 'float',
        'diferencia' => 'float',
        'fecha_apertura' => 'datetime',
        'fecha_cierre' => 'datetime',
    ];

    /**
     * Atributos que no deben ser incluidos en JSON.
     *
     * @var array<int, string>
     */
    protected $hidden = [];

    /**
     * Obtiene los campos desde la base de datos como float.
     *
     * Esto es útil para las propiedades monetarias que necesitan
     * ser convertidas a Money Value Object.
     *
     * @return float
     */
    public function getMontoAperturaAsFloat(): float
    {
        return (float) $this->monto_apertura;
    }

    /**
     * Obtiene el monto actual como float.
     *
     * @return float
     */
    public function getMontoActualAsFloat(): float
    {
        return (float) $this->monto_actual;
    }

    /**
     * Obtiene el monto de cierre real como float.
     *
     * @return float|null
     */
    public function getMontoCitrreRealAsFloat(): ?float
    {
        return $this->monto_cierre_real !== null ? (float) $this->monto_cierre_real : null;
    }

    /**
     * Obtiene la diferencia como float.
     *
     * @return float|null
     */
    public function getDiferenciaAsFloat(): ?float
    {
        return $this->diferencia !== null ? (float) $this->diferencia : null;
    }

    /**
     * Busca una caja abierta por vendedor.
     *
     * Scope útil para consultas comunes.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $vendedorId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeAbiertaByVendedor($query, string $vendedorId)
    {
        return $query
            ->where('vendedor_id', $vendedorId)
            ->where('estado', 'abierta')
            ->first();
    }

    /**
     * Busca todas las cajas abiertas.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeAbiertas($query)
    {
        return $query->where('estado', 'abierta');
    }

    /**
     * Busca todas las cajas cerradas.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCerradas($query)
    {
        return $query->where('estado', 'cerrada');
    }

    /**
     * Busca cajas cerradas en un rango de fechas.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $desde Fecha inicial (Y-m-d)
     * @param string $hasta Fecha final (Y-m-d)
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePorFecha($query, string $desde, string $hasta)
    {
        return $query
            ->whereBetween('fecha_cierre', [$desde . ' 00:00:00', $hasta . ' 23:59:59'])
            ->where('estado', 'cerrada');
    }
}
