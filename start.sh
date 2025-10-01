#!/bin/bash

echo "🐳 Vacation Manager - Docker Setup"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado!"
    echo "Por favor, instale o Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker não está rodando!"
    echo "Por favor, inicie o Docker Desktop e tente novamente."
    exit 1
fi

echo "✅ Docker está instalado e rodando"
echo ""

# Check if ports are available
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Porta 5000 está em uso!"
    echo "Deseja encerrar o processo? (s/n)"
    read -r response
    if [[ "$response" =~ ^[Ss]$ ]]; then
        lsof -ti:5000 | xargs kill -9
        echo "✅ Processo na porta 5000 encerrado"
    fi
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Porta 3000 está em uso!"
    echo "Deseja encerrar o processo? (s/n)"
    read -r response
    if [[ "$response" =~ ^[Ss]$ ]]; then
        lsof -ti:3000 | xargs kill -9
        echo "✅ Processo na porta 3000 encerrado"
    fi
fi

echo ""
echo "🚀 Iniciando containers..."
echo ""

# Build and start containers
docker-compose up --build

# This will run when user stops with Ctrl+C
echo ""
echo "👋 Encerrando aplicação..."
echo "Para reiniciar, execute: ./start.sh"
echo "Para limpar dados: docker-compose down -v"
