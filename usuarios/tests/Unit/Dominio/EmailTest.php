<?php

namespace Tests\Unit\Dominio;

use App\Dominio\ObjetosValor\Email;
use DomainException;
use PHPUnit\Framework\TestCase;

class EmailTest extends TestCase
{
    public function test_acepta_email_valido(): void
    {
        $email = new Email('cliente@happydonut.com');

        $this->assertSame('cliente@happydonut.com', $email->obtenerDireccion());
    }

    public function test_rechaza_email_invalido(): void
    {
        $this->expectException(DomainException::class);
        new Email('correo-invalido');
    }

    public function test_compara_igualdad(): void
    {
        $a = new Email('a@happydonut.com');
        $b = new Email('a@happydonut.com');

        $this->assertTrue($a->esIgualA($b));
    }
}