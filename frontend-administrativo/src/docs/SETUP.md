# 📖 Guía de Instalación y Configuración - HappyDonuts

Esta guía te llevará paso a paso por la instalación y configuración del sistema HappyDonuts en tu máquina local.

---

## 📋 Tabla de Contenidos

1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Instalación](#instalación)
3. [Configuración](#configuración)
4. [Ejecución](#ejecución)
5. [Verificación](#verificación)
6. [Solución de Problemas](#solución-de-problemas)

---

## 💻 Requisitos del Sistema

### Requisitos Obligatorios

- **Node.js**: Versión 18.0.0 o superior
- **npm**: Versión 9.0.0 o superior
- **Sistema Operativo**: Windows, macOS o Linux
- **Navegador**: Chrome, Firefox, Safari o Edge (versiones recientes)

### Requisitos Recomendados

- **RAM**: Mínimo 4GB (8GB recomendado)
- **Espacio en Disco**: 500MB libres
- **Editor de Código**: VS Code (opcional pero recomendado)

### Verificar Requisitos

```bash
# Verificar versión de Node.js
node --version
# Debe mostrar: v18.x.x o superior

# Verificar versión de npm
npm --version
# Debe mostrar: 9.x.x o superior
```

---

## 🚀 Instalación

### Opción 1: Instalación Automática (Recomendada)

#### Linux / macOS

```bash
# 1. Navega a la carpeta del proyecto
cd happydonuts

# 2. Da permisos de ejecución al script
chmod +x scripts/setup.sh

# 3. Ejecuta el script
./scripts/setup.sh
```

#### Windows

```batch
REM 1. Navega a la carpeta del proyecto
cd happydonuts

REM 2. Ejecuta el script
scripts\setup.bat
```

El script automáticamente:
- ✅ Verificará los requisitos
- ✅ Instalará las dependencias
- ✅ Configurará el entorno
- ✅ Iniciará el servidor de desarrollo

---

### Opción 2: Instalación Manual

#### Paso 1: Clonar o Descomprimir el Proyecto

Si tienes el proyecto en un ZIP:
```bash
# Descomprime el archivo
unzip happydonuts.zip
cd happydonuts
```

#### Paso 2: Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias del `package.json`. El proceso puede tomar 2-5 minutos dependiendo de tu conexión.

#### Paso 3: Configurar Variables de Entorno (Opcional)

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env si es necesario
nano .env  # o usa tu editor preferido
```

Por defecto, no necesitas modificar nada. El sistema funcionará con localStorage.

---

## ⚙️ Configuración

### Configuración Básica (localStorage)

El sistema viene preconfigurado para funcionar con **localStorage** (sin necesidad de backend). Esta es la configuración por defecto y no requiere cambios.

**Archivo**: `src/config/api.config.ts`

```typescript
export const API_CONFIG = {
  useLocalStorage: true,  // ✅ Modo localStorage activado
  // ...
};
```

### Configuración Avanzada (Backend API)

Si en el futuro deseas conectar un backend:

1. **Edita `.env`**:
   ```bash
   VITE_API_URL=http://localhost:3000/api
   ```

2. **Edita `src/config/api.config.ts`**:
   ```typescript
   export const API_CONFIG = {
     useLocalStorage: false,  // Cambiar a false
     // ...
   };
   ```

Ver más detalles en **[BACKEND-INTEGRATION.md](BACKEND-INTEGRATION.md)**

---

## 🏃 Ejecución

### Iniciar Servidor de Desarrollo

```bash
npm run dev
```

**Salida esperada:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
  ➜  press h to show help
```

### Acceder al Sistema

1. Abre tu navegador
2. Ve a: **http://localhost:3000**
3. Verás la pantalla de login

### Credenciales de Acceso

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

**Empleado:**
- Usuario: `empleado`
- Contraseña: `emp123`

---

## ✅ Verificación

### Verificar que Todo Funciona

1. **Login Exitoso**
   - Inicia sesión con usuario `admin`
   - Deberías ver el Dashboard

2. **Navegar por Módulos**
   - Haz clic en el menú lateral
   - Prueba acceder a "Ventas" → "Comprobantes"
   - Prueba acceder a "Inventario" → "Productos"

3. **Crear un Registro de Prueba**
   - Ve a "Inventario" → "Productos"
   - Haz clic en "Nuevo Producto"
   - Rellena el formulario y guarda
   - Verifica que aparece en la tabla

4. **Verificar Persistencia**
   - Recarga la página (F5)
   - Los datos deberían mantenerse
   - Esto confirma que localStorage funciona

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Build
npm run build            # Crear build de producción
npm run preview          # Previsualizar build

# Verificación
npm run type-check       # Verificar tipos TypeScript
npm run lint             # Ejecutar linter

# Mantenimiento
npm run clean            # Limpiar node_modules y build
npm run reset            # Limpiar y reinstalar todo
```

---

## 🐛 Solución de Problemas

### Problema: "Cannot find module"

**Causa**: Dependencias no instaladas correctamente

**Solución**:
```bash
rm -rf node_modules
npm install
```

---

### Problema: "Port 3000 already in use"

**Causa**: El puerto 3000 está ocupado

**Solución**:
```bash
# Opción 1: Usar otro puerto
PORT=3001 npm run dev

# Opción 2: Matar el proceso en el puerto 3000
# Linux/Mac
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

### Problema: "localStorage is not defined"

**Causa**: Estás ejecutando en un entorno sin soporte de navegador

**Solución**: Asegúrate de ejecutar en el navegador, no en Node.js

---

### Problema: Estilos no se cargan

**Causa**: Tailwind CSS no está compilando

**Solución**:
```bash
# 1. Detén el servidor (Ctrl+C)
# 2. Limpia la caché
rm -rf .vite node_modules/.cache
# 3. Reinstala
npm install
# 4. Reinicia
npm run dev
```

---

### Problema: TypeScript Errors

**Causa**: Errores de tipado

**Solución**:
```bash
# Verificar errores
npm run type-check

# Si hay errores en node_modules
rm -rf node_modules
npm install
```

---

### Problema: "Module not found: Can't resolve '@/...'"

**Causa**: Path aliases no configurados

**Solución**: Verifica que `tsconfig.json` tiene:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Y que `vite.config.ts` tiene:
```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## 🔄 Actualización del Sistema

Si recibes una nueva versión del sistema:

```bash
# 1. Hacer backup de tus datos (si usas localStorage)
# Exporta los datos desde el navegador o haz backup del localStorage

# 2. Actualizar archivos
# Reemplaza los archivos del proyecto con la nueva versión

# 3. Reinstalar dependencias
rm -rf node_modules
npm install

# 4. Reiniciar
npm run dev
```

---

## 📊 Verificación de Performance

El sistema debería:

- ✅ Cargar en menos de 2 segundos
- ✅ Responder instantáneamente a clicks
- ✅ No mostrar errores en la consola del navegador
- ✅ Mantener los datos después de recargar

---

## 🆘 Obtener Ayuda

Si los problemas persisten:

1. **Revisa la Consola del Navegador**: F12 → Console (busca errores en rojo)
2. **Revisa la Terminal**: Busca errores en la terminal donde ejecutaste `npm run dev`
3. **Verifica los Archivos de Logs**: Si existen logs, revísalos
4. **Consulta la Documentación**: Lee [ESTRUCTURA.md](ESTRUCTURA.md) para entender mejor el proyecto

---

## ✨ Próximos Pasos

Una vez que el sistema esté funcionando:

1. 📖 Lee **[ESTRUCTURA.md](ESTRUCTURA.md)** para entender la arquitectura
2. 🔌 Si planeas conectar un backend, lee **[BACKEND-INTEGRATION.md](BACKEND-INTEGRATION.md)**
3. 📡 Para desarrollar, consulta **[API-REFERENCE.md](API-REFERENCE.md)**

---

**¡Listo!** Ahora deberías tener HappyDonuts funcionando en tu máquina local. 🎉
