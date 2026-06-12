# 🎯 Referencia Rápida - Cheat Sheet

## 🚀 Iniciar Rápido

### Windows
```powershell
docker-compose up -d
Set-ExecutionPolicy Bypass -Scope Process
powershell -ExecutionPolicy Bypass -File install.ps1
http://localhost  # En navegador
```

### Linux/Mac
```bash
docker-compose up -d
docker-compose exec app bash install.sh
open http://localhost
```

---

## 💰 Money Value Object

### Crear
```php
$money = Money::create(100.50);        // 100.50 PEN
$zero = Money::zero();                 // 0.00 PEN
$deuda = Money::create(-50);           // -50.00 PEN
```

### Operar
```php
$a = Money::create(100);
$a->add(Money::create(50))->toString();           // "150.00 PEN"
$a->subtract(Money::create(30))->toString();      // "70.00 PEN"
$a->multiply(2)->toString();                      // "200.00 PEN"
$a->divide(2)->toString();                        // "50.00 PEN"
```

### Comparar
```php
$a->isGreaterThan($b);
$a->isLessThan($b);
$a->equals($b);
$a->isPositive();
$a->isNegative();
$a->isZero();
```

### Obtener Valor
```php
$money->getAmount();           // "100.50" (string)
$money->getAmountAsFloat();    // 100.50 (float)
$money->getAmountAsInt();      // 10050 (int, centavos)
$money->toString();            // "100.50 PEN"
```

---

## 📁 Estructura Hexagonal

```
Finanzas/
├── Domain/
│   ├── Aggregates/        ← Tus modelos
│   ├── Events/            ← Lo que pasó
│   └── Repositories/      ← Interfaces
├── Application/
│   └── UseCases/          ← La lógica
└── Infrastructure/
    ├── Controllers/       ← HTTP API
    └── Persistence/       ← Base de datos
```

---

## 🐳 Comandos Docker

```bash
# Servicios
docker-compose up -d                  # Iniciar
docker-compose down                   # Parar
docker-compose ps                     # Ver estado
docker-compose logs -f app            # Ver logs

# PHP/Laravel
docker-compose exec app php artisan tinker     # REPL
docker-compose exec app php artisan test       # Ejecutar tests
docker-compose exec app composer require pkg   # Agregar librería
docker-compose exec app composer dump-autoload # Actualizar autoload

# PostgreSQL
docker-compose exec postgres psql -U finance_user -d happy_donut_finance
```

---

## 📂 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `docker-compose.yml` | Configuración contenedores |
| `Dockerfile` | Imagen PHP |
| `app/composer.json` | Dependencias + namespaces |
| `app/src/Shared/Domain/ValueObjects/Money.php` | Money Value Object |
| `tests/Unit/.../MoneyTest.php` | Tests unitarios |
| `nginx/conf.d/default.conf` | Configuración HTTP |

---

## 📚 Documentación

| Documento | Para |
|-----------|------|
| `README.md` | Visión general completa |
| `QUICK_START.md` | Empezar en 5 minutos |
| `HEXAGONAL_ARCHITECTURE.md` | Entender la arquitectura |
| `MONEY_USAGE_GUIDE.md` | Usar Money value object |
| `PROJECT_STRUCTURE.md` | Ver estructura de archivos |

---

## 🧪 Tests

```bash
# Ejecutar tests de Money
docker-compose exec app php artisan test tests/Unit/Shared/Domain/ValueObjects/MoneyTest.php

# Todos los tests
docker-compose exec app php artisan test

# Con cobertura
docker-compose exec app php artisan test --coverage
```

---

## ⚙️ Configuración

### Variables de Entorno
```bash
# Copiar ejemplo
cp app/.env.example app/.env

# Generar clave
docker-compose exec app php artisan key:generate

# Editar variables
# app/.env
```

### Namespaces
```php
// Ya configurados en composer.json
use Finanzas\Domain\Aggregates\MiAgregado;
use Shared\Domain\ValueObjects\Money;
```

Después de agregar clases nuevas:
```bash
docker-compose exec app composer dump-autoload
```

---

## 🆘 Problemas Comunes

| Problema | Solución |
|----------|----------|
| "Module not found" | `composer dump-autoload` |
| No carga en localhost | Espera 30s, `docker-compose logs app` |
| BD no conecta | `docker-compose restart postgres` |
| Tests no corren | `mkdir -p tests/Unit` |

---

## 💡 Próximos Pasos

1. **Crear agregado**: `app/src/Finanzas/Domain/Aggregates/TuClase.php`
2. **Crear use case**: `app/src/Finanzas/Application/UseCases/TuUseCaseUseCase.php`
3. **Crear repositorio**: `app/src/Finanzas/Infrastructure/Repositories/EloquentTuRepositorio.php`
4. **Crear controlador**: `app/src/Finanzas/Infrastructure/Controllers/TuController.php`
5. **Escribir tests**: `tests/Unit/.../TuTest.php`

---

## 🔗 Enlaces Útiles

- Laravel: https://laravel.com/docs/12.x
- PostgreSQL: https://www.postgresql.org/docs/
- PHPUnit: https://phpunit.de/
- DDD: https://www.domainlanguage.com/ddd/

---

**Última actualización: Mayo 2026**
