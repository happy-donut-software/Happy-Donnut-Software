# 🏗️ Estructura del Proyecto - HappyDonuts

Esta guía explica la arquitectura y organización del código del sistema HappyDonuts.

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Capas de la Arquitectura](#capas-de-la-arquitectura)
4. [Convenciones de Código](#convenciones-de-código)
5. [Flujo de Datos](#flujo-de-datos)

---

## 🎯 Visión General

HappyDonuts sigue una **arquitectura de capas** moderna para React, separando claramente:

- **Presentación** (Componentes React)
- **Lógica de Negocio** (Servicios)
- **Datos** (localStorage o API)
- **Tipos** (TypeScript Interfaces)

Esta separación facilita:
- ✅ Mantenibilidad del código
- ✅ Testing
- ✅ Migración futura a backend
- ✅ Reutilización de componentes

---

## 📁 Estructura de Carpetas

```
happydonuts/
├── 📂 src/                          # Código fuente principal
│   ├── 📂 components/              # Componentes React
│   │   ├── 📂 layout/             # Componentes de layout
│   │   │   ├── AppSidebar.tsx     # Sidebar principal
│   │   │   └── MainLayout.tsx     # Layout principal (futuro)
│   │   │
│   │   ├── 📂 ui/                 # Componentes UI reutilizables
│   │   │   ├── button.tsx         # Botón
│   │   │   ├── dialog.tsx         # Modal/Dialog
│   │   │   ├── table.tsx          # Tabla
│   │   │   ├── input.tsx          # Input
│   │   │   └── ...                # Otros componentes UI
│   │   │
│   │   └── 📂 shared/             # Componentes compartidos
│   │       └── ImageWithFallback.tsx  # Imagen con fallback
│   │
│   ├── 📂 pages/                   # Páginas/Vistas del sistema
│   │   ├── 📂 auth/               # Autenticación
│   │   │   └── Login.tsx          # Página de login
│   │   │
│   │   ├── 📂 dashboard/          # Dashboard
│   │   │   └── Dashboard.tsx      # Vista principal
│   │   │
│   │   ├── 📂 ventas/             # Módulo de Ventas
│   │   │   ├── Comprobantes.tsx   # Lista de comprobantes
│   │   │   └── NuevoComprobante.tsx  # Crear comprobante
│   │   │
│   │   ├── 📂 inventario/         # Módulo de Inventario
│   │   │   ├── Productos.tsx      # Lista de productos
│   │   │   ├── Categorias.tsx     # Gestión de categorías
│   │   │   ├── NotasEntrada.tsx   # Notas de entrada
│   │   │   ├── NuevaNotaEntrada.tsx
│   │   │   ├── NotasSalida.tsx    # Notas de salida
│   │   │   └── NuevaNotaSalida.tsx
│   │   │
│   │   ├── 📂 compras/            # Módulo de Compras
│   │   │   ├── Compras.tsx        # Lista de compras
│   │   │   └── NuevaCompra.tsx    # Nueva orden de compra
│   │   │
│   │   ├── 📂 clientes-proveedores/  # Clientes y Proveedores
│   │   │   └── ClientesProveedores.tsx
│   │   │
│   │   ├── 📂 promociones/        # Módulo de Promociones
│   │   │   ├── Promociones.tsx    # Lista de promociones
│   │   │   └── NuevaPromocion.tsx # Crear promoción
│   │   │
│   │   ├── 📂 caja/               # Módulo de Caja
│   │   │   ├── AperturaCaja.tsx   # Abrir caja
│   │   │   ├── CierreCaja.tsx     # Cerrar caja
│   │   │   ├── MovimientosCaja.tsx  # Ver movimientos
│   │   │   ├── RegistrarEgreso.tsx  # Registrar egreso
│   │   │   └── HistorialCierres.tsx # Historial
│   │   │
│   │   ├── 📂 configuracion/      # Módulo de Configuración
│   │   │   ├── DatosEmpresa.tsx   # Datos de la empresa
│   │   │   ├── Usuarios.tsx       # Gestión de usuarios
│   │   │   └── Locales.tsx        # Gestión de locales
│   │   │
│   │   └── 📂 soporte/            # Soporte
│   │       └── Soporte.tsx        # Página de soporte
│   │
│   ├── 📂 services/                # 🔥 Capa de Servicios
│   │   ├── 📂 api/                # Servicios API (Backend Ready)
│   │   │   ├── index.ts           # Export central
│   │   │   ├── productos.service.ts    # API de productos
│   │   │   ├── ventas.service.ts       # API de ventas (futuro)
│   │   │   ├── inventario.service.ts   # API de inventario (futuro)
│   │   │   ├── compras.service.ts      # API de compras (futuro)
│   │   │   ├── clientes.service.ts     # API de clientes (futuro)
│   │   │   ├── promociones.service.ts  # API de promociones (futuro)
│   │   │   ├── caja.service.ts         # API de caja (futuro)
│   │   │   └── configuracion.service.ts # API de config (futuro)
│   │   │
│   │   └── 📂 storage/            # Almacenamiento local
│   │       └── localStorage.service.ts  # Servicio de localStorage
│   │
│   ├── 📂 types/                   # TypeScript Types & Interfaces
│   │   ├── index.ts               # Export central de tipos
│   │   ├── auth.types.ts          # Tipos de autenticación
│   │   ├── ventas.types.ts        # Tipos de ventas
│   │   ├── inventario.types.ts    # Tipos de inventario
│   │   ├── compras.types.ts       # Tipos de compras
│   │   ├── clientes.types.ts      # Tipos de clientes
│   │   ├── promociones.types.ts   # Tipos de promociones
│   │   ├── caja.types.ts          # Tipos de caja
│   │   └── configuracion.types.ts # Tipos de configuración
│   │
│   ├── 📂 config/                  # 🔥 Configuración
│   │   ├── app.config.ts          # Configuración general de la app
│   │   ├── api.config.ts          # Configuración de API/Backend
│   │   └── constants.ts           # Constantes del sistema
│   │
│   ├── 📂 hooks/                   # Custom React Hooks
│   │   ├── useAuth.ts             # Hook de autenticación (futuro)
│   │   ├── useCaja.ts             # Hook de caja (futuro)
│   │   └── useLocalStorage.ts     # Hook de localStorage (futuro)
│   │
│   ├── 📂 utils/                   # Funciones Utilitarias
│   │   ├── formatters.ts          # Formateadores (futuro)
│   │   ├── validators.ts          # Validaciones (futuro)
│   │   └── helpers.ts             # Helpers generales (futuro)
│   │
│   ├── 📂 styles/                  # Estilos
│   │   └── globals.css            # Estilos globales (Tailwind)
│   │
│   ├── App.tsx                     # Componente principal
│   └── main.tsx                    # Punto de entrada (si aplica)
│
├── 📂 docs/                         # 📚 Documentación
│   ├── SETUP.md                    # Guía de instalación
│   ├── ESTRUCTURA.md               # Este archivo
│   ├── BACKEND-INTEGRATION.md      # Guía de integración con backend
│   └── API-REFERENCE.md            # Referencia de API
│
├── 📂 scripts/                      # Scripts de utilidad
│   ├── setup.sh                    # Script de setup (Linux/Mac)
│   └── setup.bat                   # Script de setup (Windows)
│
├── 📂 public/                       # Archivos estáticos
│   └── favicon.ico                 # Favicon
│
├── 📄 .env.example                  # Variables de entorno de ejemplo
├── 📄 .gitignore                    # Archivos ignorados por Git
├── 📄 package.json                  # Dependencias y scripts
├── 📄 tsconfig.json                 # Configuración de TypeScript
├── 📄 vite.config.ts                # Configuración de Vite
└── 📄 README.md                     # Readme principal
```

---

## 🏛️ Capas de la Arquitectura

### 1. **Capa de Presentación** (`/src/pages` y `/src/components`)

**Responsabilidad**: Renderizar UI y manejar interacciones del usuario

**Componentes**:
- `/src/pages/*`: Páginas completas (vistas principales)
- `/src/components/ui/*`: Componentes UI reutilizables
- `/src/components/layout/*`: Layouts de la aplicación
- `/src/components/shared/*`: Componentes compartidos

**Ejemplo**: `Productos.tsx`
```typescript
// ✅ CORRECTO: Usa servicios, no accede directamente a localStorage
import { productosAPI } from '@/services/api';

export function Productos() {
  const [productos, setProductos] = useState([]);
  
  useEffect(() => {
    productosAPI.getAll().then(setProductos);
  }, []);
  
  // ... renderiza UI
}
```

---

### 2. **Capa de Servicios** (`/src/services`)

**Responsabilidad**: Lógica de negocio y acceso a datos

#### a) Servicios API (`/src/services/api/`)

**Propósito**: Abstracción de la capa de datos (localStorage o API REST)

**Características**:
- ✅ Preparados para cambiar entre localStorage y API
- ✅ Retornan Promises (async/await)
- ✅ Manejo de errores centralizado

**Ejemplo**: `productos.service.ts`
```typescript
export const productosAPI = {
  async getAll(): Promise<Producto[]> {
    if (API_CONFIG.useLocalStorage) {
      return Promise.resolve(localStorageProductos.getAll());
    }
    // 🔌 Cuando conectes backend, descomenta:
    // const response = await fetch(`${API_URL}/productos`);
    // return response.json();
  },
  // ...
};
```

#### b) Servicio de Storage (`/src/services/storage/`)

**Propósito**: Manejo de localStorage

**Características**:
- ✅ Encapsula toda la lógica de localStorage
- ✅ Provee funciones tipo CRUD
- ✅ Mantiene compatibilidad con código anterior

**Ejemplo**: `localStorage.service.ts`
```typescript
export const productosService = {
  getAll: (): Producto[] => {
    const data = localStorage.getItem('productos');
    return data ? JSON.parse(data) : [];
  },
  save: (productos: Producto[]) => {
    localStorage.setItem('productos', JSON.stringify(productos));
  },
  // ...
};
```

---

### 3. **Capa de Tipos** (`/src/types`)

**Responsabilidad**: Definiciones de tipos TypeScript

**Características**:
- ✅ Un archivo por dominio (ventas, inventario, etc.)
- ✅ Export centralizado en `index.ts`
- ✅ Reutilizables en toda la app

**Ejemplo**: `inventario.types.ts`
```typescript
export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  estado: 'Disponible' | 'No Disponible';
}
```

---

### 4. **Capa de Configuración** (`/src/config`)

**Responsabilidad**: Configuración centralizada

**Archivos**:
- `app.config.ts`: Configuración general
- `api.config.ts`: Configuración de API/Backend
- `constants.ts`: Constantes del sistema

**Ejemplo**: `api.config.ts`
```typescript
export const API_CONFIG = {
  useLocalStorage: true,  // 🔄 Cambiar a false para usar backend
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  endpoints: {
    productos: '/inventario/productos',
    // ...
  },
};
```

---

### 5. **Capa de Utilidades** (`/src/utils`, `/src/hooks`)

**Responsabilidad**: Funciones auxiliares y hooks personalizados

**Ejemplos** (futuro):
- `formatters.ts`: Formatear fechas, moneda, etc.
- `validators.ts`: Validaciones de formularios
- `useAuth.ts`: Hook personalizado para autenticación

---

## 🔄 Flujo de Datos

### Flujo Normal (localStorage)

```
Usuario Interactúa
    ↓
Componente React (pages/)
    ↓
Servicio API (services/api/)
    ↓
Servicio Storage (services/storage/)
    ↓
localStorage del Navegador
```

### Flujo Futuro (Backend API)

```
Usuario Interactúa
    ↓
Componente React (pages/)
    ↓
Servicio API (services/api/)
    ↓
HTTP Request al Backend
    ↓
Base de Datos
```

**Nota**: Solo cambias `useLocalStorage` en `api.config.ts` y el flujo cambia automáticamente.

---

## 📝 Convenciones de Código

### Nombres de Archivos

- **Componentes React**: PascalCase (`Productos.tsx`)
- **Servicios**: camelCase + `.service.ts` (`productos.service.ts`)
- **Tipos**: camelCase + `.types.ts` (`ventas.types.ts`)
- **Hooks**: camelCase + `use` prefix (`useAuth.ts`)
- **Utilidades**: camelCase (` formatters.ts`)

### Imports

**Usa path aliases** para importar:

```typescript
// ✅ CORRECTO
import { Producto } from '@/types';
import { productosAPI } from '@/services/api';
import { Button } from '@/components/ui/button';

// ❌ INCORRECTO
import { Producto } from '../../types/inventario.types';
import { productosAPI } from '../../services/api/productos.service';
```

### Estructura de Componentes

```typescript
// 1. Imports
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { productosAPI } from '@/services/api';
import type { Producto } from '@/types';

// 2. Types (si son específicos del componente)
interface ProductosProps {
  // ...
}

// 3. Componente
export function Productos({ }: ProductosProps) {
  // 3.1 Estados
  const [productos, setProductos] = useState<Producto[]>([]);
  
  // 3.2 Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 3.3 Handlers
  const handleDelete = (id: number) => {
    // ...
  };
  
  // 3.4 Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## 🔌 Preparación para Backend

El sistema está diseñado para facilitar la migración a backend:

### Cambios Necesarios

1. **Configurar URL del backend** en `.env`:
   ```bash
   VITE_API_URL=http://localhost:3000/api
   ```

2. **Cambiar modo** en `api.config.ts`:
   ```typescript
   useLocalStorage: false
   ```

3. **Implementar backend** con los endpoints definidos en `api.config.ts`

4. **¡Listo!** Los componentes no necesitan cambios.

Ver detalles en **[BACKEND-INTEGRATION.md](BACKEND-INTEGRATION.md)**

---

## 📦 Módulos del Sistema

### Módulo de Ventas
- **Archivos**: `/src/pages/ventas/*`
- **Servicios**: `ventas.service.ts` (futuro)
- **Tipos**: `ventas.types.ts`

### Módulo de Inventario
- **Archivos**: `/src/pages/inventario/*`
- **Servicios**: `productos.service.ts`, `inventario.service.ts` (futuro)
- **Tipos**: `inventario.types.ts`

### Módulo de Compras
- **Archivos**: `/src/pages/compras/*`
- **Servicios**: `compras.service.ts` (futuro)
- **Tipos**: `compras.types.ts`

### Módulo de Caja
- **Archivos**: `/src/pages/caja/*`
- **Servicios**: `caja.service.ts` (futuro)
- **Tipos**: `caja.types.ts`

---

## 🎯 Ventajas de Esta Estructura

1. **Escalabilidad**: Fácil agregar nuevas funcionalidades
2. **Mantenibilidad**: Código organizado y fácil de encontrar
3. **Testing**: Servicios y componentes fáciles de testear
4. **Migración**: Cambio a backend sin tocar componentes
5. **Reutilización**: Componentes y servicios reutilizables
6. **TypeScript**: Tipado fuerte en toda la aplicación

---

## 🚀 Próximos Pasos

1. Familiarízate con `/src/types` para entender los modelos de datos
2. Revisa `/src/services/storage/localStorage.service.ts` para ver la lógica actual
3. Explora `/src/pages` para ver cómo se usan los servicios
4. Lee **[BACKEND-INTEGRATION.md](BACKEND-INTEGRATION.md)** si planeas conectar un backend

---

**¿Preguntas?** Consulta el resto de la documentación o revisa el código fuente.
