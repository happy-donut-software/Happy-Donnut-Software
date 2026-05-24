# 🎨 Estructura Visual del Proyecto HappyDonuts

## 📂 Árbol de Directorios Completo

```
happydonuts/
│
├── 📁 src/                             ← NUEVO: Código fuente reorganizado
│   │
│   ├── 📁 types/                       ← NUEVO: Tipos TypeScript
│   │   ├── 📄 index.ts                 (Export central)
│   │   ├── 📄 auth.types.ts            (Autenticación, roles)
│   │   ├── 📄 ventas.types.ts          (Comprobantes, métodos de pago)
│   │   ├── 📄 inventario.types.ts      (Productos, insumos, notas)
│   │   ├── 📄 compras.types.ts         (Órdenes de compra)
│   │   ├── 📄 clientes.types.ts        (Clientes y proveedores)
│   │   ├── 📄 promociones.types.ts     (Promociones y combos)
│   │   ├── 📄 caja.types.ts            (Caja, movimientos, cierres)
│   │   └── 📄 configuracion.types.ts   (Empresa, usuarios, locales)
│   │
│   ├── 📁 config/                      ← NUEVO: Configuración centralizada
│   │   ├── 📄 app.config.ts            (Config general de la app)
│   │   ├── 📄 api.config.ts            (Config API/Backend) 🔥
│   │   └── 📄 constants.ts             (Constantes del sistema)
│   │
│   ├── 📁 services/                    ← NUEVO: Capa de servicios
│   │   │
│   │   ├── 📁 api/                     ← Backend Ready 🔌
│   │   │   ├── 📄 index.ts             (Export central)
│   │   │   └── 📄 productos.service.ts (Ejemplo implementado)
│   │   │   └── 📄 *.service.ts         (Otros servicios - futuro)
│   │   │
│   │   └── 📁 storage/                 ← LocalStorage actual
│   │       └── 📄 localStorage.service.ts (Toda la lógica de datos)
│   │
│   ├── 📁 hooks/                       ← Para hooks personalizados (futuro)
│   ├── 📁 utils/                       ← Para utilidades (futuro)
│   │
│   ├── 📄 App.tsx                      ← ACTUALIZADO: Componente principal
│   └── 📄 main.tsx                     ← NUEVO: Entry point
│
├── 📁 components/                      ← EXISTENTE: Sin cambios
│   │
│   ├── 📁 views/                       ← Todas las vistas del sistema
│   │   ├── 📄 Login.tsx
│   │   ├── 📄 Dashboard.tsx
│   │   ├── 📄 Comprobantes.tsx
│   │   ├── 📄 NuevoComprobante.tsx
│   │   ├── 📄 Productos.tsx
│   │   ├── 📄 Categorias.tsx
│   │   ├── 📄 NotasEntrada.tsx
│   │   ├── 📄 NuevaNotaEntrada.tsx
│   │   ├── 📄 NotasSalida.tsx
│   │   ├── 📄 NuevaNotaSalida.tsx
│   │   ├── 📄 ClientesProveedores.tsx
│   │   ├── 📄 Compras.tsx
│   │   ├── 📄 NuevaCompra.tsx
│   │   ├── 📄 Promociones.tsx
│   │   ├── 📄 NuevaPromocion.tsx
│   │   ├── 📄 AperturaCaja.tsx
│   │   ├── 📄 MovimientosCaja.tsx
│   │   ├── 📄 RegistrarEgreso.tsx
│   │   ├── 📄 CierreCaja.tsx
│   │   ├── 📄 HistorialCierres.tsx
│   │   ├── 📄 DatosEmpresa.tsx
│   │   ├── 📄 Usuarios.tsx
│   │   ├── 📄 Locales.tsx
│   │   ├── 📄 Soporte.tsx
│   │   └── 📄 PlaceholderView.tsx
│   │
│   ├── 📁 ui/                          ← Componentes UI reutilizables
│   │   ├── 📄 button.tsx
│   │   ├── 📄 dialog.tsx
│   │   ├── 📄 table.tsx
│   │   ├── 📄 input.tsx
│   │   ├── 📄 select.tsx
│   │   ├── 📄 label.tsx
│   │   ├── 📄 card.tsx
│   │   ├── 📄 badge.tsx
│   │   ├── 📄 alert-dialog.tsx
│   │   ├── 📄 sidebar.tsx
│   │   ├── 📄 sonner.tsx
│   │   └── ... (y más componentes UI)
│   │
│   ├── 📁 figma/                       ← Componentes de Figma
│   │   └── 📄 ImageWithFallback.tsx
│   │
│   └── 📄 AppSidebar.tsx               ← Sidebar principal
│
├── 📁 docs/                            ← NUEVO: Documentación completa
│   ├── 📄 SETUP.md                     (Guía de instalación) 🔧
│   ├── 📄 ESTRUCTURA.md                (Arquitectura del proyecto) 🏗️
│   ├── 📄 BACKEND-INTEGRATION.md       (Conectar con backend) 🔌
│   └── 📄 API-REFERENCE.md             (Referencia de servicios) 📡
│
├── 📁 scripts/                         ← NUEVO: Scripts de automatización
│   ├── 📄 setup.sh                     (Setup Linux/Mac)
│   └── 📄 setup.bat                    (Setup Windows)
│
├── 📁 styles/                          ← EXISTENTE: Estilos
│   └── 📄 globals.css                  (Estilos globales Tailwind)
│
├── 📁 lib/                             ← EXISTENTE: Librerías
│   └── 📄 utils.ts                     (Utilidades cn())
│
├── 📁 imports/                         ← EXISTENTE: Assets de Figma
│   └── ... (SVGs y assets)
│
├── 📁 public/                          ← Assets públicos
│   └── 📄 favicon.ico
│
├── 📄 index.html                       ← NUEVO: HTML principal
├── 📄 vite.config.ts                   ← NUEVO: Configuración Vite
├── 📄 tsconfig.json                    ← NUEVO: Configuración TypeScript
├── 📄 tsconfig.node.json               ← NUEVO: Config TS para Node
├── 📄 package.json                     ← ACTUALIZADO: Dependencias y scripts
├── 📄 .env.example                     ← NUEVO: Ejemplo de variables
├── 📄 .gitignore                       ← ACTUALIZADO: Archivos ignorados
│
├── 📄 README.md                        ← NUEVO: Readme principal 📖
├── 📄 INICIO-RAPIDO.md                 ← NUEVO: Guía rápida ⚡
├── 📄 REORGANIZACION-COMPLETADA.md     ← NUEVO: Reporte de cambios ✅
└── 📄 ESTRUCTURA-VISUAL.md             ← ESTE ARCHIVO 🎨
```

---

## 🔄 Flujo de Datos del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO                               │
└────────────────────┬────────────────────────────────────────┘
                     │ Interactúa con
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  CAPA DE PRESENTACIÓN                        │
│                                                               │
│  📁 components/views/                                         │
│    ├── Login.tsx                                             │
│    ├── Dashboard.tsx                                         │
│    ├── Productos.tsx                                         │
│    └── ... (más vistas)                                      │
│                                                               │
└────────────────────┬────────────────────────────────────────┘
                     │ Llama a
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  CAPA DE SERVICIOS API                       │
│                                                               │
│  📁 src/services/api/                                         │
│    ├── productos.service.ts                                  │
│    ├── ventas.service.ts (futuro)                            │
│    └── ... (más servicios)                                   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  🔄 Decisión: useLocalStorage?                       │    │
│  └────────┬────────────────────────────┬────────────────┘    │
│           │ SÍ (actual)                │ NO (futuro)         │
│           ▼                            ▼                     │
└───────────┼────────────────────────────┼─────────────────────┘
            │                            │
            ▼                            ▼
┌───────────────────────┐    ┌──────────────────────────┐
│ CAPA DE STORAGE       │    │ BACKEND API REST         │
│                       │    │                          │
│ 📁 services/storage/  │    │ 🔌 http://backend/api    │
│   localStorage.service│    │                          │
│                       │    │ ├── POST /productos       │
│         │             │    │ ├── GET /productos        │
│         ▼             │    │ └── ...                  │
│   ┌─────────────┐     │    │         │                │
│   │ localStorage│     │    │         ▼                │
│   │  (Navegador)│     │    │   ┌─────────────┐        │
│   └─────────────┘     │    │   │  PostgreSQL │        │
└───────────────────────┘    │   │    MySQL    │        │
                             │   │   MongoDB   │        │
                             │   └─────────────┘        │
                             └──────────────────────────┘
```

---

## 🎯 Arquitectura de Capas

```
┌──────────────────────────────────────────────────────────────┐
│                      CAPA 1: UI/PRESENTACIÓN                  │
│  Responsabilidad: Renderizar UI, manejar eventos             │
│  Ubicación: /components/views, /components/ui                │
│  Tecnología: React + TypeScript + Tailwind                   │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ usa
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    CAPA 2: LÓGICA DE NEGOCIO                  │
│  Responsabilidad: Servicios, lógica de aplicación            │
│  Ubicación: /src/services/api                                │
│  Patrón: Service Layer (async/await)                         │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ accede a
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     CAPA 3: ACCESO A DATOS                    │
│  Responsabilidad: CRUD, persistencia                         │
│  Ubicación: /src/services/storage O Backend API              │
│  Modo actual: localStorage                                    │
│  Modo futuro: HTTP REST API                                   │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ persiste en
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                        CAPA 4: DATOS                          │
│  Responsabilidad: Almacenamiento persistente                 │
│  Actual: localStorage del navegador                          │
│  Futuro: Base de datos (PostgreSQL, MySQL, etc.)             │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔐 Flujo de Autenticación

```
┌──────────┐
│  Login   │
│  Page    │
└────┬─────┘
     │ 1. Usuario ingresa credenciales
     ▼
┌──────────────────┐
│ handleLogin()    │
│ (validación)     │
└────┬─────────────┘
     │ 2. Credenciales válidas
     ▼
┌──────────────────┐
│ setCurrentUser() │
│ setUserRole()    │
└────┬─────────────┘
     │ 3. Usuario autenticado
     ▼
┌──────────────────┐
│ renderView()     │
│ (con permisos)   │
└────┬─────────────┘
     │ 4. Verifica rol para cada vista
     ▼
┌──────────────────────────────┐
│ ¿Es Administrador?           │
│   SÍ → Acceso completo       │
│   NO → Acceso limitado       │
└──────────────────────────────┘
```

---

## 💾 Flujo de Datos CRUD (Ejemplo: Productos)

### Lectura (Read)

```
[Productos.tsx]
    │
    │ useEffect()
    ▼
[productosAPI.getAll()]
    │
    │ ¿useLocalStorage?
    ▼
[localStorage.service.ts]
    │
    │ localStorage.getItem('productos')
    ▼
[JSON.parse()]
    │
    │ return Producto[]
    ▼
[setProductos(data)]
    │
    │ Actualiza estado React
    ▼
[Renderiza tabla]
```

### Creación (Create)

```
[FormularioProducto]
    │
    │ onSubmit
    ▼
[productosAPI.create(producto)]
    │
    │ ¿useLocalStorage?
    ▼
[localStorage.service.ts]
    │
    │ productos.push(nuevoProducto)
    │ localStorage.setItem('productos', JSON.stringify(productos))
    ▼
[return producto]
    │
    │ toast.success()
    ▼
[Recargar lista]
```

---

## 🔄 Cambio de localStorage a Backend API

### ANTES (localStorage)

```typescript
// api.config.ts
useLocalStorage: true

// productos.service.ts
async getAll() {
  return localStorageService.getAll(); // ← Lee de localStorage
}
```

### DESPUÉS (Backend API)

```typescript
// .env
VITE_API_URL=http://localhost:3000/api

// api.config.ts
useLocalStorage: false

// productos.service.ts
async getAll() {
  const response = await fetch(`${API_URL}/productos`); // ← Llama API
  return response.json();
}
```

**🎉 Los componentes NO cambian!**

---

## 📦 Dependencias del Proyecto

```
happydonuts
├── React 18.2              (Framework UI)
├── TypeScript 5.2          (Tipado estático)
├── Vite 5                  (Build tool)
├── Tailwind CSS 4          (Estilos)
├── Radix UI                (Componentes accesibles)
│   ├── Dialog
│   ├── Select
│   ├── Sidebar
│   └── ... (más componentes)
├── Lucide React            (Iconos)
├── Sonner                  (Notificaciones)
└── React Hook Form         (Formularios)
```

---

## 🎨 Convenciones de Naming

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| **Componentes React** | PascalCase | `Productos.tsx` |
| **Servicios** | camelCase + `.service.ts` | `productos.service.ts` |
| **Tipos** | camelCase + `.types.ts` | `inventario.types.ts` |
| **Hooks** | camelCase + `use` | `useAuth.ts` |
| **Constantes** | UPPER_SNAKE_CASE | `API_CONFIG` |
| **Funciones** | camelCase | `handleSubmit()` |
| **Variables** | camelCase | `currentUser` |

---

## 🔑 Conceptos Clave

### Path Aliases (`@/`)

```typescript
// ❌ ANTES
import { Producto } from '../../../types/inventario.types';

// ✅ AHORA
import { Producto } from '@/types';
```

### Servicios Async

```typescript
// Todos los servicios usan async/await
const productos = await productosAPI.getAll();
```

### Tipado Fuerte

```typescript
// Todo está tipado
const [productos, setProductos] = useState<Producto[]>([]);
```

### Configuración Centralizada

```typescript
// No hay "magic numbers" o "magic strings"
import { APP_CONFIG } from '@/config/app.config';
```

---

## 🚀 Escalabilidad

El sistema está preparado para crecer:

### Hoy
- ✅ localStorage
- ✅ Sin backend
- ✅ Monolítico

### Mañana
- 🔌 Backend API REST
- 🔌 Base de datos
- 🔌 Microservicios (opcional)
- 🔌 Deploy en cloud

**Sin cambiar los componentes!**

---

**Esta estructura garantiza:**
- ✅ Código mantenible
- ✅ Fácil testing
- ✅ Escalabilidad
- ✅ Developer experience óptima

---

Para más detalles, consulta:
- **[ESTRUCTURA.md](docs/ESTRUCTURA.md)** - Explicación detallada
- **[README.md](README.md)** - Visión general
