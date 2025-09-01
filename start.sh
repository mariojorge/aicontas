#!/bin/bash

echo "🚀 Iniciando Finance Control..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale npm primeiro."
    exit 1
fi

echo "✅ Node.js e npm encontrados"
echo ""

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install --silent

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do backend"
    exit 1
fi

echo "✅ Dependências do backend instaladas"
echo ""

# Inicializar banco de dados
echo "🗄️ Inicializando banco de dados..."
npm run init-db

if [ $? -ne 0 ]; then
    echo "❌ Erro ao inicializar banco de dados"
    exit 1
fi

echo "✅ Banco de dados inicializado com dados de exemplo"
echo ""

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
cd ../frontend
npm install --silent

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do frontend"
    exit 1
fi

echo "✅ Dependências do frontend instaladas"
echo ""

# Instruções para executar
echo "🎉 Configuração concluída com sucesso!"
echo ""
echo "Para iniciar a aplicação, execute os comandos abaixo em terminais separados:"
echo ""
echo "📊 Backend (Terminal 1):"
echo "  cd backend && npm run dev"
echo ""
echo "🎨 Frontend (Terminal 2):"
echo "  cd frontend && npm run dev"
echo ""
echo "🌐 A aplicação estará disponível em:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend API: http://localhost:3001"
echo ""
echo "📱 A aplicação é totalmente responsiva e funciona em dispositivos móveis!"