<?php

declare(strict_types=1);

namespace Finanzas\Domain\Repositories;

use Finanzas\Domain\Aggregates\Caja;

/**
 * CajaRepository - Domain Repository Interface
 * 
 * Define el contrato (interfaz) para persistir y recuperar agregados Caja.
 * 
 * La implementación concreta estará en la capa Infrastructure (Eloquent).
 * Esto permite cambiar el mecanismo de persistencia sin afectar el dominio.
 * 
 * @package Finanzas\Domain\Repositories
 */
interface CajaRepository
{
    /**
     * Guardar (crear o actualizar) una caja
     * 
     * Si la caja es nueva, la crea.
     * Si ya existe, la actualiza con los nuevos valores.
     *
     * @param Caja $caja Agregado Caja a guardar
     * @return void
     */
    public function save(Caja $caja): void;

    /**
     * Buscar una caja por su identificador
     *
     * @param string $id ID único de la caja (UUID)
     * @return Caja|null Retorna la caja si existe, null en caso contrario
     */
    public function search(string $id): ?Caja;

    /**
     * Buscar la caja abierta de un vendedor específico
     * 
     * Retorna la caja abierta actualmente del vendedor, o null si no hay ninguna abierta.
     * Cada vendedor solo puede tener una caja abierta a la vez.
     *
     * @param string $vendedorId ID del vendedor
     * @return Caja|null Caja abierta del vendedor, o null si no hay
     */
    public function findOpenByVendedor(string $vendedorId): ?Caja;

    /**
     * Obtener todas las cajas de un vendedor (abiertas y cerradas)
     *
     * @param string $vendedorId ID del vendedor
     * @return array<Caja> Lista de cajas del vendedor
     */
    public function findByVendedor(string $vendedorId): array;

    /**
     * Obtener todas las cajas abiertas
     *
     * @return array<Caja> Lista de cajas abiertas
     */
    public function findAllAbiertas(): array;

    /**
     * Obtener todas las cajas cerradas en un rango de fechas
     *
     * @param \DateTime $fechaInicio Fecha inicial
     * @param \DateTime $fechaFinal Fecha final
     * @return array<Caja> Lista de cajas cerradas en el rango
     */
    public function findCerradasPorFecha(\DateTime $fechaInicio, \DateTime $fechaFinal): array;

    /**
     * Contar total de cajas abiertas
     *
     * @return int Total de cajas abiertas
     */
    public function countAbiertas(): int;

    /**
     * Contar total de cajas cerradas
     *
     * @return int Total de cajas cerradas
     */
    public function countCerradas(): int;

    /**
     * Eliminar una caja (por ID)
     * 
     * Nota: En un sistema real, probablemente no queremos eliminar cajas,
     * solo marcarlas como inactivas. Pero lo incluimos por completitud.
     *
     * @param string $id ID de la caja a eliminar
     * @return bool true si se eliminó, false si no existe
     */
    public function delete(string $id): bool;
}
