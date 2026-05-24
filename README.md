# 🍩 Sistema Administrativo HappyDonuts

Sistema completo de gestión para donaterías desarrollado con React, TypeScript y Tailwind CSS.

## 📚 Documentación Completa

Este proyecto incluye documentación detallada en español para facilitar el desarrollo y la integración con el backend:

### 📘 [Guía de Instalación](./GUIA_INSTALACION.md)
**¿Nuevo en el proyecto? Empieza aquí.**
- Instalación paso a paso
- Requisitos del sistema
- Explicación de la estructura del proyecto
- Cómo ejecutar en local

### 📗 [Guía de Migración a Backend](./GUIA_MIGRACION_BACKEND.md)
**Para integrar el frontend con tu backend.**
- Proceso completo de migración
- Cambiar de localStorage a API
- Ejemplos de código
- Manejo de errores y autenticación
- Checklist de migración

### 📕 [Endpoints del Backend](./ENDPOINTS_BACKEND.md)
**Para el equipo de backend.**
- Todos los endpoints necesarios
- Request/Response de cada uno
- Validaciones requeridas
- Códigos de estado HTTP
- Datos de prueba

---

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
pnpm install
```

### 2. Ejecutar en desarrollo
```bash
pnpm dev
```

### 3. Abrir en el navegador
```
http://localhost:5173
```

**Credenciales de prueba:**
- Usuario: `admin`
- Contraseña: `admin123`

---

## 📦 Módulos del Sistema

- ✅ **Ventas** - Punto de venta y gestión de comprobantes
- ✅ **Inventario** - Control de productos e insumos
- ✅ **Clientes** - Registro y gestión de clientes
- ✅ **Promociones** - Creación de paquetes promocionales
- ✅ **Caja** - Apertura, cierre y movimientos de caja
- ✅ **Usuarios** - Control de acceso por roles

---

## 🔧 Configuración Backend

### **Actualmente:** LocalStorage (Navegador)
Los datos se guardan en el navegador. No necesita backend para funcionar.

### **Para migrar a Backend:**

1. Editar `/src/app/config/api.config.ts`:
```typescript
export const API_CONFIG = {
  USE_BACKEND: true,  // ← Cambiar a true
  API_BASE_URL: 'http://localhost:3000/api',  // ← URL de tu backend
  // ...
};
```

2. Ver guía completa: [GUIA_MIGRACION_BACKEND.md](./GUIA_MIGRACION_BACKEND.md)

---

## 🛠️ Stack Tecnológico

- **React 18.3.1** - Framework de UI
- **TypeScript 5.6.2** - Tipado estático
- **Vite 6.3.5** - Build tool
- **Tailwind CSS 4.1.12** - Estilos
- **Radix UI** - Componentes primitivos
- **shadcn/ui** - Componentes reutilizables
- **pnpm** - Gestor de paquetes

---

## 📁 Estructura del Proyecto

```
/src/app/
├── components/
│   ├── views/              # Páginas del sistema
│   └── ui/                 # Componentes reutilizables
├── services/               # 🆕 Servicios API y localStorage
│   ├── api.ts              # Cliente HTTP
│   └── localStorage.ts     # Almacenamiento local
├── config/                 # 🆕 Configuración
│   └── api.config.ts       # Config de backend
└── lib/
    ├── storage.ts          # Sistema actual
    └── storageNew.ts       # 🆕 Capa de abstracción
```

---

## 👥 Para el Equipo

### **Frontend:**
1. Lee [GUIA_INSTALACION.md](./GUIA_INSTALACION.md)
2. Familiarízate con la estructura de carpetas
3. Cuando el backend esté listo, lee [GUIA_MIGRACION_BACKEND.md](./GUIA_MIGRACION_BACKEND.md)

### **Backend:**
1. Lee [ENDPOINTS_BACKEND.md](./ENDPOINTS_BACKEND.md)
2. Implementa los endpoints listados
3. Configura CORS para permitir peticiones del frontend
4. Implementa autenticación JWT
5. Avisa al equipo frontend cuando esté listo

---

## 📝 Scripts Disponibles

```bash
pnpm dev       # Desarrollo con hot reload
pnpm build     # Compilar para producción
pnpm preview   # Vista previa del build
```

---

## 🤝 Contribución

Este es un proyecto privado para HappyDonuts. Para dudas o soporte, contacta al equipo de desarrollo.

---

## 📄 Licencia

Propietario: HappyDonuts  
Todos los derechos reservados.

---

**Última actualización:** Mayo 2026  
**Versión:** 1.0.0
