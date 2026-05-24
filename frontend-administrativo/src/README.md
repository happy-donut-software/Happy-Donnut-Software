# 🍩 HappyDonuts - Sistema Administrativo

<div align="center">

![HappyDonuts](https://img.shields.io/badge/HappyDonuts-Sistema%20Administrativo-orange?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

Sistema web administrativo local para gestión empresarial de ventas de donas y frapes

[Características](#características) • [Instalación](#instalación-rápida) • [Documentación](#documentación) • [Estructura](#estructura-del-proyecto)

</div>

---

## 📋 Descripción

**HappyDonuts** es un sistema completo de gestión empresarial diseñado específicamente para un negocio de ventas de donas y frapes. El sistema implementa control completo de:

- ✅ Ventas y Comprobantes (Boletas)
- ✅ Inventario (Productos e Insumos)
- ✅ Control de Stock (Notas de Entrada/Salida)
- ✅ Compras y Proveedores
- ✅ Promociones
- ✅ Caja (Apertura, Cierre, Movimientos)
- ✅ Clientes y Proveedores
- ✅ Configuración del Sistema
- ✅ Gestión de Usuarios y Roles

### 🎯 Características Principales

- **Régimen RUS**: Sistema adaptado al régimen tributario RUS de Perú
- **Solo Boletas**: Generación de boletas de venta sin IGV
- **Métodos de Pago**: Efectivo, Yape y Plin
- **Control de Stock Completo**: Trazabilidad mediante Notas de Entrada/Salida
- **Roles de Usuario**: Administrador y Empleado con permisos diferenciados
- **Interfaz Moderna**: Diseño con colores amarillo y naranja
- **100% Local**: Funciona completamente sin internet (localStorage)
- **Backend Ready**: Preparado para conectar con API REST en el futuro

---

## 🚀 Instalación Rápida

### Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Opción 1: Script Automático (Linux/Mac)

```bash
# Ejecutar script de setup
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Opción 2: Manual

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno (opcional)
cp .env.example .env

# 3. Iniciar servidor de desarrollo
npm run dev
```

El sistema estará disponible en: **http://localhost:3000**

---

## 👥 Usuarios por Defecto

### Administrador
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Acceso**: Completo a todos los módulos

### Empleado
- **Usuario**: `empleado`
- **Contraseña**: `emp123`
- **Acceso**: Caja, Ventas y Notas de Salida

---

## 📚 Documentación

### Guías Disponibles

- 📖 **[SETUP.md](docs/SETUP.md)** - Guía detallada de instalación y configuración
- 🏗️ **[ESTRUCTURA.md](docs/ESTRUCTURA.md)** - Explicación de la arquitectura del proyecto
- 🔌 **[BACKEND-INTEGRATION.md](docs/BACKEND-INTEGRATION.md)** - Cómo conectar con un backend
- 📡 **[API-REFERENCE.md](docs/API-REFERENCE.md)** - Referencia de servicios y endpoints

---

## 📁 Estructura del Proyecto

```
happydonuts/
├── src/                        # Código fuente
│   ├── components/            # Componentes React
│   │   ├── layout/           # Layouts (Sidebar, etc.)
│   │   ├── ui/               # Componentes UI reutilizables
│   │   └── shared/           # Componentes compartidos
│   ├── pages/                # Páginas/Vistas del sistema
│   │   ├── auth/             # Login
│   │   ├── dashboard/        # Dashboard principal
│   │   ├── ventas/           # Módulo de ventas
│   │   ├── inventario/       # Módulo de inventario
│   │   ├── compras/          # Módulo de compras
│   │   ├── caja/             # Módulo de caja
│   │   └── ...
│   ├── services/             # Servicios (API + Storage)
│   │   ├── api/              # Servicios API (Backend Ready)
│   │   └── storage/          # Servicio localStorage
│   ├── types/                # TypeScript Types
│   ├── config/               # Configuración
│   ├── hooks/                # React Hooks personalizados
│   ├── utils/                # Utilidades
│   └── styles/               # Estilos globales
├── docs/                     # Documentación
├── scripts/                  # Scripts de utilidad
├── public/                   # Archivos estáticos
└── ...
```

Ver detalles completos en **[ESTRUCTURA.md](docs/ESTRUCTURA.md)**

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Build
npm run build        # Genera build de producción
npm run preview      # Preview del build

# Utilidades
npm run type-check   # Verifica tipos TypeScript
npm run lint         # Ejecuta linter
npm run clean        # Limpia dependencias y build
npm run reset        # Limpia y reinstala todo
```

---

## 🔧 Configuración

### Variables de Entorno

El sistema usa variables de entorno para configuración. Copia `.env.example` a `.env` y ajusta según necesites:

```bash
# Modo actual: localStorage
VITE_API_URL=

# Para conectar con backend (futuro):
# VITE_API_URL=http://localhost:3000/api
```

### Modo localStorage vs API

El sistema puede funcionar en dos modos:

1. **localStorage** (Actual): Todos los datos se guardan localmente en el navegador
2. **API REST** (Futuro): Conectado a un backend

Para cambiar de modo, edita `src/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  useLocalStorage: true,  // Cambiar a false para usar API
  // ...
};
```

Ver guía completa en **[BACKEND-INTEGRATION.md](docs/BACKEND-INTEGRATION.md)**

---

## 🎨 Tecnologías

- **React 18.2** - Framework UI
- **TypeScript 5.2** - Tipado estático
- **Tailwind CSS 4.0** - Estilos
- **Vite 5** - Build tool
- **Radix UI** - Componentes accesibles
- **Lucide Icons** - Iconos
- **Sonner** - Notificaciones
- **React Hook Form** - Formularios

---

## 📦 Módulos del Sistema

### 🛒 Ventas
- Generación de comprobantes (Boletas)
- Historial de ventas
- Anulación de comprobantes

### 📦 Inventario
- Gestión de productos e insumos
- Categorías
- Notas de Entrada (Stock IN)
- Notas de Salida (Stock OUT)

### 🛍️ Compras
- Órdenes de compra
- Gestión de proveedores
- Recepción de mercadería

### 👥 Clientes y Proveedores
- Registro de clientes
- Registro de proveedores
- Gestión de documentos (RUC/DNI)

### 🎁 Promociones
- Creación de combos
- Precios especiales
- Activación/Desactivación

### 💰 Caja
- Apertura de caja
- Registro de movimientos
- Cierre y arqueo
- Historial de cierres

### ⚙️ Configuración
- Datos de empresa
- Gestión de usuarios
- Locales

---

## 🔐 Seguridad

- Autenticación por usuario/contraseña
- Control de roles (Administrador/Empleado)
- Validación de permisos por módulo
- Datos locales (no requiere conexión)

---

## 🚀 Roadmap

- [ ] Integración con backend API REST
- [ ] Conexión a base de datos
- [ ] Reportes avanzados
- [ ] Exportación a Excel/PDF
- [ ] Modo offline con sincronización
- [ ] App móvil (React Native)

---

## 📞 Soporte

Para soporte y preguntas, consulta la sección **Soporte** dentro del sistema o revisa la documentación en la carpeta `/docs`.

---

## 📄 Licencia

Este proyecto es de uso privado para HappyDonuts.

---

<div align="center">

**Hecho con ❤️ para HappyDonuts** 🍩

</div>
