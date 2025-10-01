@echo off
echo ====================================
echo  Vacation Manager - Docker Setup
echo ====================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker nao esta instalado!
    echo Por favor, instale o Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker nao esta rodando!
    echo Por favor, inicie o Docker Desktop e tente novamente.
    pause
    exit /b 1
)

echo [OK] Docker esta instalado e rodando
echo.

echo Iniciando containers...
echo.

REM Build and start containers
docker-compose up --build

echo.
echo Encerrando aplicacao...
echo Para reiniciar, execute: start.bat
echo Para limpar dados: docker-compose down -v
pause
