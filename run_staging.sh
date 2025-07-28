#!/bin/bash
# Script para executar o ambiente de staging do App Promocional IA
# Autor: Sistema de IA
# Data: $(date)

set -e  # Parar execução em caso de erro

echo "========================================"
echo "  App Promocional IA - Ambiente Staging"
echo "========================================"
echo

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    log_error "Node.js não encontrado. Por favor, instale o Node.js primeiro."
    log_info "Download: https://nodejs.org/"
    exit 1
fi

# Verificar se o npm está disponível
if ! command -v npm &> /dev/null; then
    log_error "npm não encontrado. Verifique a instalação do Node.js."
    exit 1
fi

log_success "Node.js $(node --version) e npm $(npm --version) encontrados."

# Obter diretório do script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

log_info "Navegando para o diretório shadcn-ui..."
cd "$SCRIPT_DIR/shadcn-ui"

if [ ! -f "package.json" ]; then
    log_error "Arquivo package.json não encontrado no diretório shadcn-ui."
    log_error "Verifique se você está no diretório correto do projeto."
    exit 1
fi

log_info "Verificando dependências..."
if [ ! -d "node_modules" ]; then
    log_info "Instalando dependências do projeto..."
    npm install
    log_success "Dependências instaladas com sucesso."
else
    log_info "Dependências já instaladas."
fi

echo
log_info "Iniciando servidor de staging..."
log_info "O servidor estará disponível em: http://localhost:5174/"
log_warning "Pressione Ctrl+C para parar o servidor."
echo

# Capturar Ctrl+C para limpeza
trap 'echo; log_info "Servidor de staging encerrado."; exit 0' INT

npm run staging

log_info "Servidor de staging encerrado."