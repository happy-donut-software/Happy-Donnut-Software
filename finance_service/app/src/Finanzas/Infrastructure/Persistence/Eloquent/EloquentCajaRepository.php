<?php

declare(strict_types=1);

namespace Finanzas\Infrastructure\Persistence\Eloquent;

use Finanzas\Domain\Aggregates\Caja;
use Finanzas\Domain\Repositories\CajaRepository;
use Finanzas\Domain\ValueObjects\TransactionType;
use Shared\Domain\ValueObjects\Money;
use DateTime;

/**
 * Implementación del repositorio Caja usando Eloquent ORM.
 *
 * Esta clase proporciona la implementación concreta del repositorio,
 * mapeando entre:
 * - Lado izquierdo: Entidad de dominio Caja (con Value Objects)
 * - Lado derecho: Modelo Eloquent CajaModel (datos de base de datos)
 *
 * Responsabilidades:
 * - Persistir cajas en PostgreSQL via Eloquent
 * - Reconstruir agregados Caja desde la base de datos
 * - Convertir entre tipos de dominio (Money, TransactionType) y tipos de base de datos
 * - Implementar todas las búsquedas definidas en la interfaz CajaRepository
 *
 * Patrón: Repository Pattern + Data Mapper
 *
 * @package Finanzas\Infrastructure\Persistence\Eloquent
 */
class EloquentCajaRepository implements CajaRepository
{
    /**
     * Constructor.
     *
     * No requiere inyección de dependencias ya que usamos Eloquent globalmente,
     * pero podría recibir configuración si fuera necesario en el futuro.
     */
    public function __construct()
    {
    }

    /**
     * Persiste una caja en la base de datos.
     *
     * Utiliza updateOrCreate para manejar tanto inserciones como actualizaciones.
     * Si la caja ya existe (por su ID), se actualiza; si no, se inserta.
     *
     * Conversiones realizadas:
     * - Caja::getId() [string UUID] → id
     * - Caja::getVendedorId() [string] → vendedor_id
     * - Caja::getMontoApertura() [Money] → monto_apertura [float]
     * - Caja::getMontoActual() [Money] → monto_actual [float]
     * - Caja::getEstado() [string] → estado
     * - Caja::getFechaApertura() [DateTime] → fecha_apertura
     * - Caja::getFechaCierre() [DateTime|null] → fecha_cierre
     *
     * @param Caja $caja El agregado de dominio a persistir
     * @return void
     * @throws \Exception Si hay error en la conversión o persistencia
     */
    public function save(Caja $caja): void
    {
        CajaModel::updateOrCreate(
            ['id' => $caja->getId()],
            [
                'vendedor_id' => $caja->getVendedorId(),
                'monto_apertura' => $caja->getMontoApertura()->getAmountAsFloat(),
                'monto_actual' => $caja->getMontoActual()->getAmountAsFloat(),
                'estado' => $caja->getEstado(),
                'monto_cierre_real' => $caja->getDiferencia() !== null
                    ? $caja->getMontoActual()->add(
                        Money::create($caja->getDiferencia()->negate()->getAmountAsFloat())
                    )->getAmountAsFloat()
                    : null,
                'diferencia' => $caja->getDiferencia()?->getAmountAsFloat(),
                'fecha_apertura' => $caja->getFechaApertura()->format('Y-m-d H:i:s'),
                'fecha_cierre' => $caja->getFechaCierre(),
            ]
        );
    }

    /**
     * Busca una caja por su ID.
     *
     * Reconstruye el agregado Caja desde el modelo Eloquent.
     *
     * @param string $id El UUID de la caja
     * @return Caja|null El agregado Caja reconstruido, o null si no existe
     */
    public function search(string $id): ?Caja
    {
        $modelo = CajaModel::find($id);

        if (null === $modelo) {
            return null;
        }

        return $this->reconstructAggregate($modelo);
    }

    /**
     * Busca la caja abierta de un vendedor.
     *
     * Un vendedor solo puede tener una caja abierta a la vez.
     *
     * @param string $vendedorId El ID del vendedor
     * @return Caja|null El agregado Caja reconstruido, o null si no tiene abierta
     */
    public function findOpenByVendedor(string $vendedorId): ?Caja
    {
        $modelo = CajaModel::where('vendedor_id', $vendedorId)
            ->where('estado', 'abierta')
            ->first();

        if (null === $modelo) {
            return null;
        }

        return $this->reconstructAggregate($modelo);
    }

    /**
     * Busca todas las cajas de un vendedor.
     *
     * Retorna tanto cajas abiertas como cerradas, ordenadas por fecha más reciente.
     *
     * @param string $vendedorId El ID del vendedor
     * @return array<int, Caja> Array de agregados Caja reconstruidos
     */
    public function findByVendedor(string $vendedorId): array
    {
        $modelos = CajaModel::where('vendedor_id', $vendedorId)
            ->orderByDesc('fecha_apertura')
            ->get();

        return $modelos->map(fn($modelo) => $this->reconstructAggregate($modelo))->toArray();
    }

    /**
     * Busca todas las cajas abiertas en el sistema.
     *
     * Útil para dashboards y reportes administrativos.
     *
     * @return array<int, Caja> Array de agregados Caja reconstruidos
     */
    public function findAllAbiertas(): array
    {
        $modelos = CajaModel::where('estado', 'abierta')
            ->orderByDesc('fecha_apertura')
            ->get();

        return $modelos->map(fn($modelo) => $this->reconstructAggregate($modelo))->toArray();
    }

    /**
     * Busca cajas cerradas en un rango de fechas.
     *
     * Útil para reportes de cierre diario, semanal, mensual.
     *
     * @param string $desde Fecha inicial en formato Y-m-d
     * @param string $hasta Fecha final en formato Y-m-d
     * @return array<int, Caja> Array de agregados Caja reconstruidos
     */
    public function findCerradasPorFecha(\DateTime $fechaInicio, \DateTime $fechaFinal): array
    {
        $desde = $fechaInicio->format('Y-m-d 00:00:00');
        $hasta = $fechaFinal->format('Y-m-d 23:59:59');

        $modelos = CajaModel::where('estado', 'cerrada')
            ->whereBetween('fecha_cierre', [
                $desde . ' 00:00:00',
                $hasta . ' 23:59:59',
            ])
            ->orderByDesc('fecha_cierre')
            ->get();

        return $modelos->map(fn($modelo) => $this->reconstructAggregate($modelo))->toArray();
    }

    /**
     * Cuenta las cajas abiertas en el sistema.
     *
     * Útil para validaciones y dashboards.
     *
     * @return int Número de cajas abiertas
     */
    public function countAbiertas(): int
    {
        return CajaModel::where('estado', 'abierta')->count();
    }

    /**
     * Cuenta las cajas cerradas en el sistema.
     *
     * Útil para estadísticas.
     *
     * @return int Número de cajas cerradas
     */
    public function countCerradas(): int
    {
        return CajaModel::where('estado', 'cerrada')->count();
    }

    /**
     * Elimina una caja de la base de datos.
     *
     * Nota: Raramente se usa en producción. Mejor usar soft deletes.
     * Esta es principalmente para testing.
     *
     * @param string $id El UUID de la caja a eliminar
     * @return void
     */
    public function delete(string $id): bool
    {
        CajaModel::destroy($id);
    }

    /**
     * Reconstruye el agregado Caja desde un modelo Eloquent.
     *
     * Este método privado centraliza toda la lógica de conversión entre
     * el modelo de persistencia y el agregado de dominio.
     *
     * Conversiones:
     * - monto_apertura [float] → Money
     * - monto_actual [float] → Money
     * - diferencia [float|null] → Money|null
     * - fecha_apertura [datetime] → DateTime
     * - fecha_cierre [datetime|null] → DateTime|null
     *
     * @param CajaModel $modelo El modelo Eloquent
     * @return Caja El agregado de dominio reconstruido
     */
    private function reconstructAggregate(CajaModel $modelo): Caja
    {
        // Reconstruir desde modelo usando reflexión o método privado
        // Aquí asumimos que Caja tiene método privado para hidratación

        // Para este ejercicio, usamos la estructura de Caja
        // En producción, podría haber un factory method o un constructor específico

        return new Caja(
            id: $modelo->id,
            vendedor_id: $modelo->vendedor_id,
            // Usamos las propiedades directas del modelo Eloquent
            monto_apertura: Money::create((float) $modelo->monto_apertura),
            fecha_apertura: is_string($modelo->fecha_apertura) ? new \DateTime($modelo->fecha_apertura) : $modelo->fecha_apertura,
            
            // Parámetros opcionales para recuperar el estado completo
            monto_actual: Money::create((float) $modelo->monto_actual),
            estado: $modelo->estado,
            fecha_cierre: $modelo->fecha_cierre ? (is_string($modelo->fecha_cierre) ? new \DateTime($modelo->fecha_cierre) : $modelo->fecha_cierre) : null,
            diferencia: $modelo->diferencia !== null ? Money::create((float) $modelo->diferencia) : null
        );
    }
}
