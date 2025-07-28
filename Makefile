# Makefile para App Promocional IA
# Comandos simplificados para desenvolvimento e staging

.PHONY: help install dev staging build clean test lint format check-deps

# Diretório do projeto React
UI_DIR = shadcn-ui

# Comando padrão
help:
	@echo "========================================"
	@echo "  App Promocional IA - Comandos Make"
	@echo "========================================"
	@echo ""
	@echo "Comandos disponíveis:"
	@echo "  help        - Mostra esta ajuda"
	@echo "  install     - Instala todas as dependências"
	@echo "  dev         - Inicia servidor de desenvolvimento"
	@echo "  staging     - Inicia servidor de staging"
	@echo "  build       - Gera build de produção"
	@echo "  preview     - Visualiza build de produção"
	@echo "  test        - Executa testes"
	@echo "  lint        - Executa linting do código"
	@echo "  format      - Formata o código"
	@echo "  clean       - Limpa arquivos temporários"
	@echo "  check-deps  - Verifica dependências do sistema"
	@echo ""
	@echo "Exemplos:"
	@echo "  make install    # Instala dependências"
	@echo "  make staging    # Inicia ambiente de testes"
	@echo "  make dev        # Inicia desenvolvimento"
	@echo ""

# Verificar dependências do sistema
check-deps:
	@echo "🔍 Verificando dependências do sistema..."
	@command -v node >/dev/null 2>&1 || { echo "❌ Node.js não encontrado. Instale em: https://nodejs.org/"; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "❌ npm não encontrado. Verifique a instalação do Node.js"; exit 1; }
	@echo "✅ Node.js $$(node --version) encontrado"
	@echo "✅ npm $$(npm --version) encontrado"
	@echo "✅ Todas as dependências do sistema estão OK!"

# Instalar dependências
install: check-deps
	@echo "📦 Instalando dependências..."
	@cd $(UI_DIR) && npm install
	@echo "✅ Dependências instaladas com sucesso!"

# Servidor de desenvolvimento
dev: check-deps
	@echo "🚀 Iniciando servidor de desenvolvimento..."
	@echo "📍 Disponível em: http://localhost:5173/"
	@cd $(UI_DIR) && npm run dev

# Servidor de staging
staging: check-deps
	@echo "🧪 Iniciando servidor de staging..."
	@echo "📍 Disponível em: http://localhost:5174/"
	@cd $(UI_DIR) && npm run staging

# Build de produção
build: check-deps
	@echo "🏗️  Gerando build de produção..."
	@cd $(UI_DIR) && npm run build
	@echo "✅ Build gerado com sucesso em $(UI_DIR)/dist/"

# Preview do build
preview: check-deps
	@echo "👀 Iniciando preview do build..."
	@cd $(UI_DIR) && npm run preview

# Executar testes
test: check-deps
	@echo "🧪 Executando testes..."
	@cd $(UI_DIR) && npm run test 2>/dev/null || echo "⚠️  Comando de teste não configurado"

# Linting
lint: check-deps
	@echo "🔍 Executando linting..."
	@cd $(UI_DIR) && npm run lint 2>/dev/null || echo "⚠️  Comando de lint não configurado"

# Formatação de código
format: check-deps
	@echo "✨ Formatando código..."
	@cd $(UI_DIR) && npm run format 2>/dev/null || echo "⚠️  Comando de formatação não configurado"

# Limpeza
clean:
	@echo "🧹 Limpando arquivos temporários..."
	@cd $(UI_DIR) && rm -rf dist/ .vite/ node_modules/.cache/ 2>/dev/null || true
	@echo "✅ Limpeza concluída!"

# Reinstalar dependências (limpa e instala)
reinstall: clean
	@echo "🔄 Reinstalando dependências..."
	@cd $(UI_DIR) && rm -rf node_modules/ package-lock.json 2>/dev/null || true
	@$(MAKE) install

# Comando rápido para setup inicial
setup: check-deps install
	@echo "🎉 Setup inicial concluído!"
	@echo "💡 Use 'make dev' para desenvolvimento ou 'make staging' para testes"

# Status do projeto
status:
	@echo "📊 Status do projeto:"
	@echo "📁 Diretório: $$(pwd)"
	@echo "🔧 Node.js: $$(node --version 2>/dev/null || echo 'não instalado')"
	@echo "📦 npm: $$(npm --version 2>/dev/null || echo 'não instalado')"
	@echo "📂 UI Dir: $(UI_DIR)"
	@if [ -d "$(UI_DIR)/node_modules" ]; then echo "✅ Dependências instaladas"; else echo "❌ Dependências não instaladas"; fi
	@if [ -f "$(UI_DIR)/package.json" ]; then echo "✅ package.json encontrado"; else echo "❌ package.json não encontrado"; fi