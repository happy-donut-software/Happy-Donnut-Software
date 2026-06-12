# 🎯 Guía Rápida de Acceso

## 📍 Estoy en [Capa de Aplicación] ¿Qué necesito?

### 🤔 Entender la Arquitectura
- **¿Cómo funciona la aplicación?** → [APPLICATION_LAYER_COMPLETE.md](APPLICATION_LAYER_COMPLETE.md)
- **¿Qué es un Use Case?** → [APPLICATION_LAYER_DOCUMENTATION.md](APPLICATION_LAYER_DOCUMENTATION.md)
- **¿Cómo se comunican los componentes?** → [DTOS_AND_EXCEPTIONS.md](DTOS_AND_EXCEPTIONS.md)

### 💻 Ver Código
- **Ubicación de Use Cases** → `app/src/Finanzas/Application/UseCases/`
- **Ubicación de DTOs** → `app/src/Finanzas/Application/DTOs/`
- **Ubicación de Excepciones** → `app/src/Finanzas/Application/Exceptions/`

### 📚 Aprender con Ejemplos
- **Caso 1: Abrir caja** → [APPLICATION_EXAMPLES.md](APPLICATION_EXAMPLES.md#caso-1-abrir-caja)
- **Caso 2: Registrar ingreso** → [APPLICATION_EXAMPLES.md](APPLICATION_EXAMPLES.md#caso-2-registrar-ingreso)
- **Caso 3: Múltiples transacciones** → [APPLICATION_EXAMPLES.md](APPLICATION_EXAMPLES.md#caso-3-múltiples-ingresos)
- **Flujo completo del día** → [APPLICATION_EXAMPLES.md](APPLICATION_EXAMPLES.md#flujo-completo-un-día-entero)

### 🔍 Buscar por Tema
- **Money (dinero)** → [VALUE_OBJECTS_GUIDE.md](VALUE_OBJECTS_GUIDE.md)
- **Caja (agregado)** → [AGGREGATES_GUIDE.md](AGGREGATES_GUIDE.md)
- **Eventos** → [DOMAIN_EVENTS_GUIDE.md](DOMAIN_EVENTS_GUIDE.md)
- **Repositorio** → [REPOSITORY_PATTERN.md](REPOSITORY_PATTERN.md)

### 🐛 Resolver Bugs
- **Use Case no funcionando** → Ver [APPLICATION_EXAMPLES.md](APPLICATION_EXAMPLES.md)
- **DTO no valida correctamente** → Ver [DTOS_AND_EXCEPTIONS.md](DTOS_AND_EXCEPTIONS.md)
- **Excepción incorrecta** → Ver [DTOS_AND_EXCEPTIONS.md](DTOS_AND_EXCEPTIONS.md#excepciones-de-aplicación)

### ✍️ Crear Nueva Funcionalidad
- **Proceso completo** → Ver [APPLICATION_LAYER_COMPLETE.md](APPLICATION_LAYER_COMPLETE.md#continuación-plan)
- **Template de Use Case** → [APPLICATION_LAYER_DOCUMENTATION.md](APPLICATION_LAYER_DOCUMENTATION.md)
- **Template de DTO** → [DTOS_AND_EXCEPTIONS.md](DTOS_AND_EXCEPTIONS.md#dtos-de-solicitud-input)

### 🧪 Escribir Tests
- **Test de Use Case** → [APPLICATION_EXAMPLES.md](APPLICATION_EXAMPLES.md#testing-los-use-cases)
- **Mock del repositorio** → [APPLICATION_EXAMPLES.md](APPLICATION_EXAMPLES.md#patrón-inyección-en-laravel)
```

**Contenido:**
```php
<?php
namespace Finanzas\Domain\Aggregates;

use Shared\Domain\ValueObjects\Money;

class Venta
{
    private int $id;
    private Money $monto;
    private string $descripcion;
    private \DateTime $fecha;

    public function __construct(int $id, Money $monto, string $descripcion)
    {
        $this->id = $id;
        $this->monto = $monto;
        $this->descripcion = $descripcion;
        $this->fecha = new \DateTime();
    }

    public function getMonto(): Money
    {
        return $this->monto;
    }

    public function getDescripcion(): string
    {
        return $this->descripcion;
    }

    public function getFecha(): \DateTime
    {
        return $this->fecha;
    }
}
```

## 5️⃣ Crear un Use Case

**Archivo:** `app/src/Finanzas/Application/UseCases/CalcularTotalVentasUseCase.php`

```php
<?php
namespace Finanzas\Application\UseCases;

use Shared\Domain\ValueObjects\Money;

class CalcularTotalVentasUseCase
{
    /**
     * @param array<Money> $ventas
     */
    public function ejecutar(array $ventas): Money
    {
        $total = Money::zero();

        foreach ($ventas as $venta) {
            $total = $total->add($venta);
        }

        return $total;
    }
}
```

### Usar el Use Case desde Tinker
```php
>>> use Shared\Domain\ValueObjects\Money;
>>> use Finanzas\Application\UseCases\CalcularTotalVentasUseCase;

>>> $useCase = new CalcularTotalVentasUseCase();
>>> $ventas = [
...   Money::create(100),
...   Money::create(50.50),
...   Money::create(25)
... ];
>>> $total = $useCase->ejecutar($ventas);
>>> $total->toString();
=> "175.50 PEN"
```

## 6️⃣ Escribir pruebas unitarias

**Archivo:** `tests/Unit/MoneyValueObjectTest.php`

```php
<?php
namespace Tests\Unit;

use Shared\Domain\ValueObjects\Money;
use PHPUnit\Framework\TestCase;

class MoneyValueObjectTest extends TestCase
{
    public function test_crear_money_con_monto_positivo()
    {
        $money = Money::create(150.50);

        $this->assertEquals('150.50', $money->getAmount());
        $this->assertEquals('PEN', $money->getCurrency());
    }

    public function test_sumar_dos_monedas()
    {
        $dinero1 = Money::create(100);
        $dinero2 = Money::create(50);

        $suma = $dinero1->add($dinero2);

        $this->assertEquals('150.00', $suma->getAmount());
    }

    public function test_money_es_inmutable()
    {
        $original = Money::create(100);
        $modificado = $original->add(Money::create(50));

        $this->assertEquals('100.00', $original->getAmount());
        $this->assertEquals('150.00', $modificado->getAmount());
    }

    public function test_permitir_montos_negativos()
    {
        $deuda = Money::create(-100);

        $this->assertTrue($deuda->isNegative());
        $this->assertEquals('-100.00', $deuda->getAmount());
    }

    public function test_operaciones_con_montos_negativos()
    {
        $ingreso = Money::create(200);
        $egreso = Money::create(-50);

        $neto = $ingreso->add($egreso);

        $this->assertEquals('150.00', $neto->getAmount());
    }
}
```

### Ejecutar las pruebas
```bash
docker-compose exec app php artisan test tests/Unit/MoneyValueObjectTest.php

# O ejecutar todas las pruebas:
docker-compose exec app php artisan test
```

## 7️⃣ Comandos útiles día a día

```bash
# Ver todos los contenedores corriendo
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f app

# Acceder a bash dentro del contenedor
docker-compose exec app bash

# Actualizar dependencias
docker-compose exec app composer update

# Crear migraciones
docker-compose exec app php artisan make:migration crear_tabla_ventas

# Ver la base de datos
docker-compose exec postgres psql -U finance_user -d happy_donut_finance

# Detener todo (los datos se mantienen)
docker-compose stop

# Reiniciar los contenedores
docker-compose restart
```

## 📚 Estructura del proyecto

```
finance_service/
├── app/
│   ├── src/
│   │   ├── Shared/
│   │   │   └── Domain/
│   │   │       └── ValueObjects/
│   │   │           └── Money.php          ← Value Object dinero
│   │   └── Finanzas/
│   │       ├── Domain/
│   │       │   ├── Aggregates/            ← Tus agregados (Venta, etc)
│   │       │   ├── Events/                ← Eventos de dominio
│   │       │   └── Repositories/          ← Interfaces
│   │       ├── Application/
│   │       │   └── UseCases/              ← Lógica de negocio
│   │       └── Infrastructure/
│   │           ├── Controllers/           ← Controladores HTTP
│   │           └── Persistence/Eloquent/  ← Implementaciones BD
│   ├── composer.json                      ← Dependencias
│   └── .env.example                       ← Variables de entorno
├── docker-compose.yml                     ← Configuración Docker
├── Dockerfile                             ← Imagen PHP
├── nginx/
│   └── conf.d/
│       └── default.conf                   ← Configuración Nginx
├── tests/                                 ← Pruebas
├── install.sh / install.ps1               ← Scripts de instalación
└── README.md                              ← Documentación completa
```

## 🔍 Probar Money Value Object

El Value Object `Money` ya está listo para usar. Pruébalo en Tinker:

```php
>>> use Shared\Domain\ValueObjects\Money;

// Crear dinero
>>> $dinero = Money::create(1000.50);
>>> $dinero->toString();

// Operaciones
>>> $dinero->add(Money::create(500))->toString();
>>> $dinero->subtract(Money::create(100))->toString();
>>> $dinero->multiply(2)->toString();
>>> $dinero->divide(2)->toString();

// Comparaciones
>>> $dinero->isGreaterThan(Money::create(500));
>>> $dinero->equals(Money::create(1000.50));

// Información
>>> $dinero->isPositive();
>>> $dinero->isNegative();
>>> $dinero->getAmountAsInt();  // En centavos: 100050
```

## ❓ Preguntas frecuentes

**P: ¿Cómo cambio la contraseña de PostgreSQL?**
R: Edita `docker-compose.yml`, en la sección `postgres`, cambia `POSTGRES_PASSWORD`.

**P: ¿La aplicación no carga en http://localhost?**
R: Espera unos segundos, verifica con `docker-compose ps` que todos estén "Up", mira los logs con `docker-compose logs app`.

**P: ¿Cómo agrego una nueva dependencia PHP?**
R: `docker-compose exec app composer require nombre/paquete`, luego `docker-compose exec app composer dump-autoload`

**P: ¿Puedo hacer backup de la BD?**
R: Sí: `docker-compose exec postgres pg_dump -U finance_user happy_donut_finance > backup.sql`

---

¡Ya estás listo para comenzar! 🎉

Ver [README.md](README.md) para documentación completa.
