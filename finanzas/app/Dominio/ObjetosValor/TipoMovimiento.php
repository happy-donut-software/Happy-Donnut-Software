<?php

declare(strict_types=1);

namespace App\Dominio\ObjetosValor;

/**
 * Enum que clasifica todos los posibles flujos de dinero en la caja.
 * Delega la lógica de saber si el dinero entra o sale al propio Enum.
 */
enum TipoMovimiento: string
{
    // Entradas de dinero
    case APERTURA = 'apertura'; // El saldo base con el que inicia el cajero
    case VENTA = 'venta'; // Ingreso por vender donas
    case SOBRANTE_ARQUEO = 'sobrante_arqueo'; // Si al cerrar sobra plata sin explicación

    // Salidas de dinero
    case COMPRA_INSUMOS = 'compra_insumos'; // Salió plata para comprar harina/azúcar
    case GASTO_OPERATIVO = 'gasto_operativo'; // Pasajes, pago de luz, etc.
    case RETIRO_DUENO = 'retiro_dueno'; // El dueño retiró ganancias
    case FALTANTE_ARQUEO = 'faltante_arqueo'; // Si al cerrar falta plata

    /**
     * Regla de Negocio: Determina si el movimiento SUMA dinero a la caja.
     */
    public function esEntrada(): bool
    {
        return match ($this) {
            self::APERTURA, self::VENTA, self::SOBRANTE_ARQUEO => true,
            default => false,
        };
    }

    /**
     * Regla de Negocio: Determina si el movimiento RESTA dinero de la caja.
     */
    public function esSalida(): bool
    {
        return match ($this) {
            self::COMPRA_INSUMOS, self::GASTO_OPERATIVO, self::RETIRO_DUENO, self::FALTANTE_ARQUEO => true,
            default => false,
        };
    }
}