# 📘 Guía de Instalación - Sistema HappyDonuts

## 🎯 Descripción del Proyecto

**HappyDonuts** es un sistema administrativo completo para gestión de donaterías desarrollado con React, TypeScript y Tailwind CSS. Incluye módulos para:

- ✅ **Ventas** - Punto de venta y gestión de comprobantes
- ✅ **Inventario** - Control de productos e insumos
- ✅ **Clientes** - Registro y gestión de clientes
- ✅ **Promociones** - Creación de paquetes promocionales
- ✅ **Caja** - Apertura, cierre y movimientos de caja
- ✅ **Usuarios** - Control de acceso por roles (Administrador/Empleado)

---

## 🌟 Funcionalidades Destacadas

### **Módulo de Clientes**
- 📝 Registro completo de clientes con DNI o RUC
- 📊 **Contador automático de compras** - El sistema rastrea cuántas veces ha comprado cada cliente
- 🔍 Búsqueda rápida por nombre o número de documento
- ✅ Estados activo/inactivo para gestión eficiente
- 📅 Fecha de registro automática

### **Módulo de Ventas (Nuevo Comprobante)**
- 🛒 Punto de venta completo con búsqueda inteligente de productos
- 🎁 Soporte para promociones/combos con precio fijo
- 💰 **Cálculo automático de vuelto** - Para pagos en efectivo, muestra el vuelto en tiempo real
- 📦 Validación de stock en tiempo real para evitar sobreventa
- 📋 Generación automática de notas de salida
- 🔄 Actualización automática de stock e insumos
- 💳 Múltiples métodos de pago (Efectivo, Tarjeta, Yape, Plin)

### **Módulo de Inventario**
- 📦 Gestión de productos preparados y no preparados
- 🧪 Recetas de productos con consumo automático de insumos
- 📊 Alertas de stock mínimo
- 📥 Notas de entrada para registrar compras
- 📤 Notas de salida automáticas en cada venta

### **Módulo de Caja**
- 🔓 Apertura de caja diaria con monto inicial
- 💵 Registro de ingresos y egresos
- 📊 Movimientos del día en tiempo real
- 🔒 Cierre de caja con cuadre automático
- 📈 Historial completo de cierres

---

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **React 18.3.1** - Librería para interfaces de usuario
- **TypeScript 5.6.2** - JavaScript con tipos estáticos
- **Vite 6.3.5** - Herramienta de desarrollo rápida
- **Tailwind CSS 4.1.12** - Framework de CSS utility-first

### **Componentes UI**
- **Radix UI** - Componentes primitivos accesibles
- **shadcn/ui** - Biblioteca de componentes reutilizables
- **lucide-react** - Iconos modernos
- **sonner** - Sistema de notificaciones toast

### **Utilidades**
- **date-fns** - Manejo de fechas
- **react-hook-form** - Formularios con validación
- **zod** - Validación de esquemas

### **Gestor de Paquetes**
- **pnpm** - Gestor de paquetes eficiente

---

## 📁 Estructura del Proyecto

```
/workspaces/default/code/
│
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── views/              # Páginas/Vistas principales
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── NuevoComprobante.tsx
│   │   │   │   ├── Productos.tsx
│   │   │   │   ├── Insumos.tsx
│   │   │   │   ├── Clientes.tsx
│   │   │   │   ├── Promociones.tsx
│   │   │   │   ├── NotasEntrada.tsx
│   │   │   │   ├── NotasSalida.tsx
│   │   │   │   ├── AperturaCaja.tsx
│   │   │   │   ├── CierreCaja.tsx
│   │   │   │   └── ... (más vistas)
│   │   │   │
│   │   │   ├── ui/                 # Componentes reutilizables (shadcn/ui)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   └── ... (más componentes)
│   │   │   │
│   │   │   └── AppSidebar.tsx      # Menú lateral de navegación
│   │   │
│   │   ├── lib/
│   │   │   ├── storage.ts          # 🔴 ACTUAL - Sistema de almacenamiento localStorage
│   │   │   └── storageNew.ts       # 🆕 NUEVO - Capa de abstracción (localStorage o API)
│   │   │
│   │   ├── services/               # 🆕 NUEVA CARPETA
│   │   │   ├── api.ts              # Cliente HTTP para backend
│   │   │   └── localStorage.ts     # Servicio de almacenamiento local
│   │   │
│   │   ├── config/                 # 🆕 NUEVA CARPETA
│   │   │   └── api.config.ts       # Configuración de API y ambientes
│   │   │
│   │   └── App.tsx                 # Componente raíz con routing
│   │
│   ├── styles/
│   │   ├── fonts.css               # Fuentes personalizadas
│   │   └── theme.css               # Variables CSS y temas
│   │
│   └── imports/                    # Assets importados de Figma
│
├── package.json                    # Dependencias y scripts
├── vite.config.ts                  # Configuración de Vite
├── tsconfig.json                   # Configuración de TypeScript
├── tailwind.config.js              # Configuración de Tailwind (si existe)
│
├── GUIA_INSTALACION.md            # 📘 Este archivo
├── GUIA_MIGRACION_BACKEND.md      # 📗 Guía para migrar a backend
└── ENDPOINTS_BACKEND.md           # 📕 Documentación de endpoints

```

---

## 💻 Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalado:

1. **Node.js** versión 18 o superior
   - Verifica: `node --version`
   - Descarga: https://nodejs.org/

2. **pnpm** (gestor de paquetes)
   - Verifica: `pnpm --version`
   - Instalar globalmente: `npm install -g pnpm`

3. **Git** (opcional, para clonar repositorio)
   - Verifica: `git --version`
   - Descarga: https://git-scm.com/

---

## 🚀 Instalación Paso a Paso

### **1. Clonar o Descargar el Proyecto**

Si usas Git:
```bash
git clone <URL_DEL_REPOSITORIO>
cd code
```

Si descargaste un ZIP:
```bash
# Extrae el archivo y navega a la carpeta
cd code
```

---

### **2. Instalar Dependencias**

Ejecuta el siguiente comando en la raíz del proyecto:

```bash
pnpm install
```

Este comando descargará e instalará todas las dependencias necesarias listadas en `package.json`.

**Tiempo estimado:** 2-5 minutos (dependiendo de tu conexión a internet)

---

### **3. Verificar la Instalación**

Una vez completada la instalación, verifica que todo esté correcto:

```bash
ls node_modules
dir node_modules
```

Deberías ver una carpeta con múltiples paquetes instalados.

---

### **4. Ejecutar el Proyecto en Desarrollo**

**⚠️ IMPORTANTE:** Este proyecto está configurado para Figma Make, por lo que el servidor de desarrollo podría estar ya corriendo automáticamente.

Para un proyecto Vite estándar, ejecutarías:

```bash
pnpm dev
```

Deberías ver algo como:

```
VITE v6.3.5  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

---

### **5. Abrir en el Navegador**

Visita la URL que aparece en la terminal (normalmente `http://localhost:5173`)

**Credenciales de prueba:**
- Usuario: `admin`
- Contraseña: `admin123`

---

## 📦 Scripts Disponibles

En el archivo `package.json` se definen los siguientes scripts:

```json
{
  "scripts": {
    "dev": "vite",              // Iniciar servidor de desarrollo
    "build": "vite build",      // Compilar para producción
    "preview": "vite preview",  // Vista previa del build
    "lint": "eslint .",         // Verificar código (si está configurado)
  }
}
```

### **Uso de los Scripts**

```bash
# Desarrollo (con hot reload)
pnpm dev

# Compilar para producción
pnpm build

# Vista previa del build
pnpm preview
```

---

## 🔧 Configuración Inicial del Sistema

### **Estado Actual: LocalStorage**

Por defecto, el sistema usa **localStorage** del navegador para almacenar datos. Esto significa:

- ✅ No necesita backend para funcionar
- ✅ Los datos se guardan en el navegador
- ⚠️ Los datos se pierden si limpias el caché del navegador
- ⚠️ Los datos NO se comparten entre dispositivos

### **Cambiar a Backend API**

Si tu equipo de backend ya tiene la API lista, puedes cambiar la configuración:

1. Abre el archivo: `/src/app/config/api.config.ts`

2. Cambia `USE_BACKEND` a `true`:

```typescript
export const API_CONFIG = {
  USE_BACKEND: true,  // ← Cambiar de false a true
  API_BASE_URL: 'http://localhost:3000/api', // ← URL de tu backend
  TIMEOUT: 30000,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};
```

3. Actualiza la `API_BASE_URL` con la URL de tu servidor backend.

**Para más detalles, consulta:** `GUIA_MIGRACION_BACKEND.md`

---

## 🗂️ Explicación de Carpetas Clave

### **`/src/app/components/views/`**
Contiene todas las páginas/vistas del sistema. Cada archivo representa una pantalla completa:
- `Dashboard.tsx` → Panel principal con estadísticas
- `NuevoComprobante.tsx` → Punto de venta
- `Productos.tsx` → Gestión de productos
- `Clientes.tsx` → Gestión de clientes
- etc.

### **`/src/app/components/ui/`**
Componentes reutilizables de interfaz basados en **shadcn/ui**:
- `button.tsx` → Botones con variantes
- `card.tsx` → Tarjetas de contenido
- `table.tsx` → Tablas de datos
- `dialog.tsx` → Diálogos modales
- etc.

### **`/src/app/lib/storage.ts`** (ACTUAL)
Sistema de almacenamiento actual que usa **localStorage**.

### **`/src/app/lib/storageNew.ts`** (NUEVO)
Capa de abstracción que decide automáticamente entre localStorage o API backend.

### **`/src/app/services/api.ts`** (NUEVO)
Cliente HTTP para comunicarse con el backend. Contiene todas las funciones de API.

### **`/src/app/services/localStorage.ts`** (NUEVO)
Toda la lógica de almacenamiento local movida a un archivo separado.

### **`/src/app/config/api.config.ts`** (NUEVO)
Configuración centralizada para cambiar entre localStorage y backend.

---

## 🐛 Solución de Problemas Comunes

### **Error: "Cannot find module 'pnpm'"**
**Solución:** Instala pnpm globalmente
```bash
npm install -g pnpm
```

### **Error: "Port 5173 already in use"**
**Solución:** Cambia el puerto en `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 3000, // Cambiar a otro puerto
  },
});
```

### **Error: "localStorage is not defined"**
**Solución:** Este error ocurre en entornos sin navegador. Asegúrate de estar ejecutando el proyecto en un navegador.

### **Los datos se pierden al refrescar**
**Solución:** Esto puede ocurrir si:
1. El navegador está en modo incógnito
2. Las cookies/storage están bloqueadas
3. Hay un error al guardar en localStorage

Revisa la consola del navegador (F12) para ver errores.

---

## 📚 Recursos Adicionales

- **React Docs:** https://react.dev/
- **TypeScript Docs:** https://www.typescriptlang.org/docs/
- **Vite Docs:** https://vite.dev/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com/
- **Radix UI:** https://www.radix-ui.com/

---

## 🤝 Equipo de Desarrollo

Para dudas o soporte, contacta a:

- **Frontend:** [Tu nombre/equipo]
- **Backend:** [Equipo de backend]

---

## 📝 Próximos Pasos

1. ✅ Instalar el proyecto (completado)
2. 🔄 Familiarizarte con la estructura del código
3. 📖 Leer `GUIA_MIGRACION_BACKEND.md` para entender cómo migrar a backend
4. 📖 Leer `ENDPOINTS_BACKEND.md` para conocer los endpoints necesarios
5. 🚀 ¡Empezar a desarrollar!

---

**Última actualización:** Mayo 2026  
**Versión del documento:** 1.0
