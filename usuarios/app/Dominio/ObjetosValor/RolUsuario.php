<?php

declare(strict_types=1);

namespace App\Dominio\ObjetosValor;

/**
 * Enum que define los niveles de acceso dentro del sistema Happy Donut.
 */
enum RolUsuario: string
{
    case ADMIN = 'admin';       // Dueño / Gerente (Acceso total a finanzas, inventario)
    case CAJERO = 'cajero';     // Empleado de mostrador (Abre caja, hace ventas)
    case CLIENTE = 'cliente';   // Compra por la tienda virtual

    public function esAdmin(): bool
    {
        return $this === self::ADMIN;
    }

    public function esCajero(): bool
    {
        return $this === self::CAJERO;
    }
}