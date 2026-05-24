#!/bin/bash

# HappyDonuts - Script de Instalación Automática
# Linux / macOS

echo "🍩 ================================================"
echo "🍩  HappyDonuts - Sistema Administrativo"
echo "🍩  Script de Instalación Automática"
echo "🍩 ================================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar comando
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ Error: $1 no está instalado${NC}"
        echo "Por favor instala $1 antes de continuar."
        exit 1
    fi
}

# Paso 1: Verificar Node.js
echo "📋 Verificando requisitos del sistema..."
echo ""

check_command node
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js instalado: $NODE_VERSION${NC}"

# Verificar versión de Node (debe ser >= 18)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo -e "${RED}❌ Error: Se requiere Node.js 18 o superior${NC}"
    echo "Tu versión: $NODE_VERSION"
    exit 1
fi

# Paso 2: Verificar npm
check_command npm
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm instalado: $NPM_VERSION${NC}"
echo ""

# Paso 3: Limpiar instalación previa (si existe)
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Detectados node_modules previos. Limpiando...${NC}"
    rm -rf node_modules
    echo -e "${GREEN}✅ Limpieza completada${NC}"
    echo ""
fi

# Paso 4: Instalar dependencias
echo "📦 Instalando dependencias..."
echo "⏳ Esto puede tomar 2-5 minutos..."
echo ""

npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al instalar dependencias${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Dependencias instaladas correctamente${NC}"
echo ""

# Paso 5: Configurar variables de entorno
if [ ! -f ".env" ]; then
    echo "⚙️  Configurando variables de entorno..."
    cp .env.example .env
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
else
    echo -e "${YELLOW}⚠️  Archivo .env ya existe (no se modificó)${NC}"
fi
echo ""

# Paso 6: Verificar archivos críticos
echo "🔍 Verificando archivos del proyecto..."

CRITICAL_FILES=(
    "package.json"
    "vite.config.ts"
    "tsconfig.json"
    "src/App.tsx"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file (FALTA)${NC}"
    fi
done
echo ""

# Paso 7: Información final
echo "🎉 ================================================"
echo "🎉  Instalación completada exitosamente!"
echo "🎉 ================================================"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "  1. Inicia el servidor de desarrollo:"
echo -e "     ${GREEN}npm run dev${NC}"
echo ""
echo "  2. Abre tu navegador en:"
echo -e "     ${GREEN}http://localhost:3000${NC}"
echo ""
echo "  3. Inicia sesión con:"
echo "     👤 Usuario: admin"
echo "     🔑 Contraseña: admin123"
echo ""
echo "📚 Documentación:"
echo "   - README.md - Visión general"
echo "   - docs/SETUP.md - Guía detallada"
echo "   - docs/ESTRUCTURA.md - Arquitectura"
echo ""
echo "¿Iniciar servidor ahora? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Iniciando servidor de desarrollo..."
    echo ""
    npm run dev
else
    echo ""
    echo "Para iniciar manualmente, ejecuta: npm run dev"
    echo ""
fi
