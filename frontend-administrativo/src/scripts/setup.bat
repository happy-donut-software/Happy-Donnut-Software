@echo off
REM HappyDonuts - Script de Instalación Automática
REM Windows

echo ================================================
echo   HappyDonuts - Sistema Administrativo
echo   Script de Instalación Automática
echo ================================================
echo.

REM Verificar Node.js
echo Verificando requisitos del sistema...
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado
    echo Por favor instala Node.js 18 o superior desde https://nodejs.org
    pause
    exit /b 1
)

node -v
echo [OK] Node.js instalado
echo.

REM Verificar npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm no esta instalado
    pause
    exit /b 1
)

npm -v
echo [OK] npm instalado
echo.

REM Limpiar instalación previa
if exist "node_modules" (
    echo [INFO] Detectados node_modules previos. Limpiando...
    rmdir /s /q node_modules
    echo [OK] Limpieza completada
    echo.
)

REM Instalar dependencias
echo Instalando dependencias...
echo Esto puede tomar 2-5 minutos...
echo.

call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Error al instalar dependencias
    pause
    exit /b 1
)

echo.
echo [OK] Dependencias instaladas correctamente
echo.

REM Configurar variables de entorno
if not exist ".env" (
    echo Configurando variables de entorno...
    copy .env.example .env >nul
    echo [OK] Archivo .env creado
) else (
    echo [INFO] Archivo .env ya existe (no se modifico)
)
echo.

REM Información final
echo ================================================
echo   Instalacion completada exitosamente!
echo ================================================
echo.
echo Proximos pasos:
echo.
echo   1. Inicia el servidor de desarrollo:
echo      npm run dev
echo.
echo   2. Abre tu navegador en:
echo      http://localhost:3000
echo.
echo   3. Inicia sesion con:
echo      Usuario: admin
echo      Contraseña: admin123
echo.
echo Documentacion:
echo   - README.md - Vision general
echo   - docs\SETUP.md - Guia detallada
echo   - docs\ESTRUCTURA.md - Arquitectura
echo.

set /p respuesta="Iniciar servidor ahora? (S/N): "
if /i "%respuesta%"=="S" (
    echo.
    echo Iniciando servidor de desarrollo...
    echo.
    npm run dev
) else (
    echo.
    echo Para iniciar manualmente, ejecuta: npm run dev
    echo.
    pause
)
