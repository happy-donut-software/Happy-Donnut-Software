# 📂 Estructura del Proyecto - Happy Donut Finance Service

```
finance_service/                                    ← Raíz del proyecto
│
├── 📄 docker-compose.yml                          ← Orquestación de contenedores (PHP, PostgreSQL, Nginx)
├── 📄 Dockerfile                                  ← Imagen Docker personalizada (PHP 8.3)
├── 📄 phpunit.xml                                 ← Configuración de pruebas
├── 📄 .gitignore                                  ← Archivos a ignorar en Git
│
├── 📄 README.md                                   ← 📚 Documentación completa del proyecto
├── 📄 QUICK_START.md                              ← 🚀 Guía rápida (5 minutos)
├── 📄 HEXAGONAL_ARCHITECTURE.md                   ← 🏗️ Explicación de arquitectura hexagonal
├── 📄 INSTALLATION_SUMMARY.md                     ← ✅ Resumen de lo completado
│
├── 📁 nginx/                                      ← Configuración de Nginx
│   └── 📁 conf.d/
│       └── 📄 default.conf                        ← Configuración del proxy inverso
│
├── 📁 app/                                        ← Código de la aplicación Laravel
│   ├── 📄 composer.json                           ← Dependencias PHP (con namespaces configurados)
│   ├── 📄 .env.example                            ← Variables de entorno de ejemplo
│   │
│   └── 📁 src/                                    ← ⭐ ARQUITECTURA HEXAGONAL
│       │
│       ├── 📁 Shared/                             ← Código compartido entre módulos
│       │   └── 📁 Domain/
│       │       └── 📁 ValueObjects/
│       │           ├── 📄 Money.php               ← ✨ Value Object dinero (COMPLETADO)
│       │           └── 📄 .gitkeep                ← Mantiene estructura en Git
│       │
│       └── 📁 Finanzas/                           ← Módulo de Finanzas
│           ├── 📁 Domain/                         ← 🎯 NÚCLEO - Lógica pura de negocio
│           │   ├── 📁 Aggregates/                 ← Agregados del dominio
│           │   │   └── 📄 .gitkeep
│           │   ├── 📁 Events/                     ← Eventos de dominio
│           │   │   └── 📄 .gitkeep
│           │   └── 📁 Repositories/               ← Interfaces de repositorios
│           │       └── 📄 .gitkeep
│           │
│           ├── 📁 Application/                    ← 🔧 Orquestación de casos de uso
│           │   └── 📁 UseCases/                   ← Flujos de aplicación
│           │       └── 📄 .gitkeep
│           │
│           └── 📁 Infrastructure/                 ← 🔌 Adaptadores e implementaciones
│               ├── 📁 Controllers/                ← Controladores HTTP
│               │   └── 📄 .gitkeep
│               └── 📁 Persistence/Eloquent/       ← Implementaciones con base de datos
│                   └── 📄 .gitkeep
│
├── 📁 tests/                                      ← 🧪 Pruebas unitarias
│   └── 📁 Unit/
│       └── 📁 Shared/
│           └── 📁 Domain/
│               └── 📁 ValueObjects/
│                   └── 📄 MoneyTest.php            ← 20+ test cases para Money
│
├── 📄 install.sh                                  ← Script instalación (Linux/Mac)
└── 📄 install.ps1                                 ← Script instalación (Windows)
```

---

## 📊 Resumen de Archivos Creados

| Tipo | Cantidad | Ejemplos |
|------|----------|----------|
| 📄 Archivos de Configuración | 5 | docker-compose.yml, Dockerfile, .gitignore, phpunit.xml |
| 📄 Scripts de Instalación | 2 | install.sh, install.ps1 |
| 📄 Documentación | 4 | README.md, QUICK_START.md, HEXAGONAL_ARCHITECTURE.md, INSTALLATION_SUMMARY.md |
| 📄 Código Fuente | 1 | Money.php |
| 📄 Pruebas | 1 | MoneyTest.php |
| 📄 Configuración Servidor | 1 | default.conf (Nginx) |
| 📁 Directorios | 13 | Estructura hexagonal completa |

**Total: 27 elementos** (archivos + directorios)

---

## 🎯 Puntos de Entrada por Rol

### 👨‍💻 Desarrollador Backend (Empieza aquí)
1. Lee: [QUICK_START.md](QUICK_START.md)
2. Ejecuta: `docker-compose up -d && powershell -ExecutionPolicy Bypass -File install.ps1`
3. Explora: [HEXAGONAL_ARCHITECTURE.md](HEXAGONAL_ARCHITECTURE.md)
4. Desarrolla: En `app/src/Finanzas/`

### 🏛️ Arquitecto de Software
1. Lee: [HEXAGONAL_ARCHITECTURE.md](HEXAGONAL_ARCHITECTURE.md)
2. Revisa: Estructura en `app/src/`
3. Valida: Implementación en ejemplos

### 🧪 QA / Tester
1. Ve a: `tests/Unit/Shared/Domain/ValueObjects/MoneyTest.php`
2. Ejecuta: `docker-compose exec app php artisan test`
3. Escribe: Nuevos tests en `tests/`

### 🐳 DevOps / Infraestructura
1. Revisa: `docker-compose.yml`
2. Customiza: `Dockerfile` si necesitas
3. Configura: `nginx/conf.d/default.conf`

### 📚 Documentación
1. [README.md](README.md) - Completo
2. [QUICK_START.md](QUICK_START.md) - Rápido
3. [HEXAGONAL_ARCHITECTURE.md](HEXAGONAL_ARCHITECTURE.md) - Profundo
4. [INSTALLATION_SUMMARY.md](INSTALLATION_SUMMARY.md) - Resumen

---

## 🗂️ Dónde Agregar Nuevos Componentes

### Crear un nuevo Agregado
```
app/src/Finanzas/Domain/Aggregates/TuAgregado.php
```

### Crear un nuevo Evento
```
app/src/Finanzas/Domain/Events/TuEventoOcurrió.php
```

### Crear un nuevo Repositorio (Interface)
```
app/src/Finanzas/Domain/Repositories/TuRepositorio.php
```

### Crear un nuevo Use Case
```
app/src/Finanzas/Application/UseCases/TuCasoDeUsoUseCase.php
```

### Crear implementación de Repositorio
```
app/src/Finanzas/Infrastructure/Repositories/EloquentTuRepositorio.php
```

### Crear un nuevo Controlador
```
app/src/Finanzas/Infrastructure/Controllers/TuController.php
```

### Agregar tests
```
tests/Unit/Finanzas/Domain/Aggregates/TuAgregadoTest.php
tests/Feature/Finanzas/Application/UseCases/TuUseCaseTest.php
```

---

## 📌 Archivos Clave a Recordar

| Archivo | Propósito | Cuándo Modificar |
|---------|-----------|-----------------|
| `docker-compose.yml` | Orquestación de servicios | Cambiar puertos, versiones, credenciales |
| `app/composer.json` | Dependencias PHP | Agregar librerías |
| `Dockerfile` | Imagen PHP | Instalar extensiones adicionales |
| `nginx/conf.d/default.conf` | Enrutamiento web | Agregar nuevas rutas |
| `phpunit.xml` | Configuración de tests | Cambiar paths de tests |
| `app/.env.example` | Variables de entorno | Documentar nuevas variables |

---

## ✨ Características Destacadas

### Value Object Money
- **Ubicación**: `app/src/Shared/Domain/ValueObjects/Money.php`
- **Líneas de código**: ~300+
- **Métodos**: 25+
- **Test coverage**: 20+ test cases
- **Características**:
  - ✅ Inmutable
  - ✅ Moneda: PEN
  - ✅ Montos negativos permitidos
  - ✅ Precisión: 2 decimales
  - ✅ Validaciones
  - ✅ Operaciones aritméticas
  - ✅ Comparaciones

### Estructura Hexagonal
- **7 directorios** principales
- **Separación clara** de responsabilidades
- **Independencia** de frameworks
- **Fácil testing**
- **Escalable**

---

**¡Tu proyecto está listo para desarrollar! 🚀**

Consulta los documentos de guía para empezar.
