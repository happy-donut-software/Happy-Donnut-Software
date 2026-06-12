<?php

namespace Tests\Unit\Shared\Domain\ValueObjects;

use PHPUnit\Framework\TestCase;
use Shared\Domain\ValueObjects\Money;
use InvalidArgumentException;

/**
 * @covers \Shared\Domain\ValueObjects\Money
 */
final class MoneyTest extends TestCase
{
    /**
     * Test: Crear Money con monto positivo
     */
    public function test_crear_money_con_monto_positivo(): void
    {
        $money = Money::create(150.50);

        $this->assertEquals('150.50', $money->getAmount());
        $this->assertEquals('PEN', $money->getCurrency());
        $this->assertTrue($money->isPositive());
    }

    /**
     * Test: Crear Money con monto negativo
     */
    public function test_crear_money_con_monto_negativo(): void
    {
        $money = Money::create(-100.75);

        $this->assertEquals('-100.75', $money->getAmount());
        $this->assertTrue($money->isNegative());
    }

    /**
     * Test: Crear Money con valor cero
     */
    public function test_crear_money_zero(): void
    {
        $money = Money::zero();

        $this->assertEquals('0.00', $money->getAmount());
        $this->assertTrue($money->isZero());
        $this->assertFalse($money->isPositive());
        $this->assertFalse($money->isNegative());
    }

    /**
     * Test: Sumar dos Money
     */
    public function test_sumar_dos_money(): void
    {
        $dinero1 = Money::create(100);
        $dinero2 = Money::create(50.25);

        $resultado = $dinero1->add($dinero2);

        $this->assertEquals('150.25', $resultado->getAmount());
    }

    /**
     * Test: Restar dos Money
     */
    public function test_restar_dos_money(): void
    {
        $dinero1 = Money::create(200);
        $dinero2 = Money::create(75.50);

        $resultado = $dinero1->subtract($dinero2);

        $this->assertEquals('124.50', $resultado->getAmount());
    }

    /**
     * Test: Multiplicar Money
     */
    public function test_multiplicar_money(): void
    {
        $dinero = Money::create(50);

        $resultado = $dinero->multiply(3);

        $this->assertEquals('150.00', $resultado->getAmount());
    }

    /**
     * Test: Dividir Money
     */
    public function test_dividir_money(): void
    {
        $dinero = Money::create(300);

        $resultado = $dinero->divide(3);

        $this->assertEquals('100.00', $resultado->getAmount());
    }

    /**
     * Test: Operación de suma con montos negativos
     */
    public function test_suma_con_montos_negativos(): void
    {
        $ingreso = Money::create(500);
        $egreso = Money::create(-150);

        $resultado = $ingreso->add($egreso);

        $this->assertEquals('350.00', $resultado->getAmount());
    }

    /**
     * Test: Money es inmutable
     */
    public function test_money_es_inmutable(): void
    {
        $original = Money::create(100);
        $modificado = $original->add(Money::create(50));

        // El original no debe cambiar
        $this->assertEquals('100.00', $original->getAmount());
        // El nuevo debe tener el cambio
        $this->assertEquals('150.00', $modificado->getAmount());
    }

    /**
     * Test: Obtener monto como diferentes tipos
     */
    public function test_obtener_monto_en_diferentes_tipos(): void
    {
        $money = Money::create(123.45);

        $this->assertEquals('123.45', $money->getAmount());
        $this->assertEquals(123.45, $money->getAmountAsFloat());
        $this->assertEquals(12345, $money->getAmountAsInt()); // En centavos
    }

    /**
     * Test: Valor absoluto
     */
    public function test_valor_absoluto(): void
    {
        $dineroNegativo = Money::create(-100);
        $absoluto = $dineroNegativo->absolute();

        $this->assertEquals('100.00', $absoluto->getAmount());
        $this->assertTrue($absoluto->isPositive());
    }

    /**
     * Test: Negar Money
     */
    public function test_negar_money(): void
    {
        $dinero = Money::create(100);
        $negado = $dinero->negate();

        $this->assertEquals('-100.00', $negado->getAmount());
    }

    /**
     * Test: Comparación is greater than
     */
    public function test_is_greater_than(): void
    {
        $dinero1 = Money::create(100);
        $dinero2 = Money::create(50);

        $this->assertTrue($dinero1->isGreaterThan($dinero2));
        $this->assertFalse($dinero2->isGreaterThan($dinero1));
    }

    /**
     * Test: Comparación is less than
     */
    public function test_is_less_than(): void
    {
        $dinero1 = Money::create(50);
        $dinero2 = Money::create(100);

        $this->assertTrue($dinero1->isLessThan($dinero2));
        $this->assertFalse($dinero2->isLessThan($dinero1));
    }

    /**
     * Test: Comparación equals
     */
    public function test_equals(): void
    {
        $dinero1 = Money::create(100.50);
        $dinero2 = Money::create(100.50);
        $dinero3 = Money::create(100.51);

        $this->assertTrue($dinero1->equals($dinero2));
        $this->assertFalse($dinero1->equals($dinero3));
    }

    /**
     * Test: Monedas diferentes lanzan excepción
     */
    public function test_operacion_con_monedas_diferentes_lanza_excepcion(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage("No se pueden operar monedas diferentes");

        $dinero = Money::create(100);
        $dinero->add(Money::create(50, 'USD'));
    }

    /**
     * Test: Dividir entre cero lanza excepción
     */
    public function test_dividir_entre_cero_lanza_excepcion(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage("No se puede dividir entre cero");

        $dinero = Money::create(100);
        $dinero->divide(0);
    }

    /**
     * Test: Moneda inválida lanza excepción
     */
    public function test_moneda_invalida_lanza_excepcion(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage("La moneda 'USD' no es soportada");

        Money::create(100, 'USD');
    }

    /**
     * Test: Monto inválido lanza excepción
     */
    public function test_monto_invalido_lanza_excepcion(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage("no es un número válido");

        Money::create('abc123');
    }

    /**
     * Test: ToString formateado
     */
    public function test_to_string_formateado(): void
    {
        $money = Money::create(1234.56);

        $this->assertEquals('1,234.56 PEN', $money->toString());
    }

    /**
     * Test: Magic method __toString
     */
    public function test_magic_method_to_string(): void
    {
        $money = Money::create(999.99);

        $this->assertEquals('999.99 PEN', (string)$money);
    }

    /**
     * Test: Operaciones encadenadas
     */
    public function test_operaciones_encadenadas(): void
    {
        $dinero = Money::create(100);
        $resultado = $dinero
            ->add(Money::create(50))
            ->multiply(2)
            ->subtract(Money::create(30));

        $this->assertEquals('270.00', $resultado->getAmount());
    }

    /**
     * Test: Scenario de cafetería - calcular venta con descuento
     */
    public function test_scenario_cafeteria_venta_con_descuento(): void
    {
        $precioDonas = Money::create(45.00);
        $precioCafe = Money::create(12.50);
        $total = $precioDonas->add($precioCafe); // 57.50

        $descuento = Money::create(5.00);
        $totalConDescuento = $total->subtract($descuento); // 52.50

        $this->assertEquals('52.50', $totalConDescuento->getAmount());
        $this->assertTrue($totalConDescuento->isGreaterThan(Money::create(50)));
    }

    /**
     * Test: Scenario de cafetería - reconciliación de caja
     */
    public function test_scenario_cafeteria_reconciliacion_caja(): void
    {
        // Ingresos
        $venta1 = Money::create(150.00);
        $venta2 = Money::create(230.50);
        $venta3 = Money::create(87.25);

        $totalIngresos = $venta1
            ->add($venta2)
            ->add($venta3);

        // Egresos
        $pago_proveedores = Money::create(-500.00);
        $pago_servicios = Money::create(-150.00);

        $neto = $totalIngresos
            ->add($pago_proveedores)
            ->add($pago_servicios);

        $this->assertEquals('467.75', $totalIngresos->getAmount());
        $this->assertEquals('-182.75', $neto->getAmount());
        $this->assertTrue($neto->isNegative()); // Pérdida del día
    }
}
