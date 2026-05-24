# 🚀 INICIO RÁPIDO - Pruebas BDD con Behat

## En 5 Pasos

### 1️⃣ Instalar dependencias
```bash
composer require behat/behat --dev
```

### 2️⃣ Verificar instalación
```bash
./vendor/bin/behat --version
```

### 3️⃣ Ejecutar todas las pruebas
```bash
./vendor/bin/behat features/
```

### 4️⃣ Ver reporte detallado
```bash
./vendor/bin/behat features/ --format=progress --verbose
```

### 5️⃣ Generar reporte HTML
```bash
./vendor/bin/behat features/ --format=html --out=coverage/reporte.html
```

---

## 📊 Salida Esperada (PASSING - Verde)

```
19 scenarios (19 passed)
57 steps (57 passed)
0m0.250s
```

---

## 📁 Estructura Creada

```
features/
├── registro_ventas.feature         ✅ 7 escenarios
├── gestion_productos.feature       ✅ 4 escenarios
├── autenticacion_usuario.feature   ✅ 4 escenarios
├── gestion_inventario.feature      ✅ 4 escenarios
├── bootstrap/
│   ├── FeatureContext.php          ✅ 57 step definitions
│   └── TestingAPI.php              ✅ Caso de uso mock
└── README.md                        ✅ Documentación completa
```

---

## 📖 Documentación Disponible

| Archivo | Propósito |
|---------|----------|
| `features/README.md` | Guía completa de Behat |
| `TABLA_VINCULACION_ARQUITECTONICA.md` | Mapeo Caso de Uso → Escenario |
| `ENTREGABLES_RESUMEN.md` | Validación de cumplimiento de rúbrica |
| `QUICK_START.md` | Este archivo |

---

## ✨ Características Implementadas

✅ 4 historias de usuario con especificaciones ejecutables  
✅ Desacoplamiento total de la UI (sin selectores CSS)  
✅ TestingAPI como intermediario del hexágono  
✅ Técnicas SWEBOK (Caja Negra, Partición, Frontera, Clase de Error)  
✅ Lenguaje Gherkin puramente declarativo en español  
✅ 19 escenarios con caminos felices y de error  
✅ Step Definitions listos para ejecutarse  

---

## 🎓 Próximos Pasos

1. **Implementar casos de uso reales** en lugar de mocks en TestingAPI
2. **Conectar a base de datos** real (repositorios del dominio)
3. **Ejecutar en CI/CD** (GitHub Actions, Jenkins, etc.)
4. **Expandir cobertura** con más historias de usuario

---

*Happy Donut Software - Práctica 6 BDD*
