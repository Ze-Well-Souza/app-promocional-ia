# Scripts de Execução - App Promocional IA

Este documento descreve os scripts e comandos disponíveis para facilitar o desenvolvimento e execução do App Promocional IA.

## 📁 Arquivos Criados

### 1. `run_staging.bat` (Windows)
Script em lote para Windows que facilita a execução do ambiente de staging.

**Como usar:**
```bash
# No Windows (Command Prompt ou PowerShell)
.\run_staging.bat
```

**O que o script faz:**
- ✅ Verifica se Node.js e npm estão instalados
- 📁 Navega para o diretório `shadcn-ui`
- 📦 Instala dependências automaticamente (se necessário)
- 🚀 Inicia o servidor de staging na porta 5174
- 🎯 Fornece feedback visual durante todo o processo

### 2. `run_staging.sh` (Linux/Mac)
Script shell para sistemas Unix que oferece a mesma funcionalidade com output colorido.

**Como usar:**
```bash
# No Linux/Mac
# Primeiro, torne o script executável:
chmod +x run_staging.sh

# Depois execute:
./run_staging.sh
```

**Recursos adicionais:**
- 🌈 Output colorido para melhor legibilidade
- 🛡️ Tratamento robusto de erros
- 🎯 Logs informativos com códigos de cor
- ⚡ Detecção automática de Ctrl+C

### 3. `Makefile` (Multiplataforma)
Makefile simplificado que oferece comandos rápidos para todas as operações do projeto.

## 🚀 Comandos Make Disponíveis

### Comandos Principais
```bash
# Mostrar ajuda
make help

# Setup inicial do projeto
make setup

# Instalar dependências
make install

# Servidor de desenvolvimento (porta 5173)
make dev

# Servidor de staging (porta 5174)
make staging

# Build de produção
make build

# Preview do build
make preview
```

### Comandos de Manutenção
```bash
# Verificar dependências do sistema
make check-deps

# Executar testes
make test

# Linting do código
make lint

# Formatação do código
make format

# Limpeza de arquivos temporários
make clean

# Reinstalar dependências
make reinstall

# Status do projeto
make status
```

## 🎯 Casos de Uso Comuns

### Primeiro Setup
```bash
# Opção 1: Usando Make (recomendado)
make setup

# Opção 2: Usando script direto
# Windows:
.\run_staging.bat

# Linux/Mac:
./run_staging.sh
```

### Desenvolvimento Diário
```bash
# Para desenvolvimento
make dev

# Para testes/staging
make staging
```

### Resolução de Problemas
```bash
# Verificar status
make status

# Reinstalar tudo
make reinstall

# Limpar cache
make clean
```

## 🔧 Requisitos do Sistema

- **Node.js** (versão 16 ou superior)
- **npm** (incluído com Node.js)
- **Make** (opcional, para usar comandos make)

### Instalação do Node.js
- **Windows/Mac/Linux:** [https://nodejs.org/](https://nodejs.org/)

### Instalação do Make
- **Windows:** 
  - Via Chocolatey: `choco install make`
  - Via Scoop: `scoop install make`
  - Via Git Bash (incluído com Git)
- **Mac:** `brew install make` (via Homebrew)
- **Linux:** Geralmente já incluído, ou `sudo apt install make`

## 🌐 Portas Utilizadas

- **Desenvolvimento:** `http://localhost:5173/`
- **Staging:** `http://localhost:5174/`
- **Preview:** `http://localhost:4173/`

## 📝 Notas Importantes

1. **Windows:** Use `run_staging.bat` ou comandos `make` no PowerShell
2. **Linux/Mac:** Use `run_staging.sh` ou comandos `make` no terminal
3. **Multiplataforma:** Os comandos `make` funcionam em todos os sistemas
4. **Dependências:** Todos os scripts verificam automaticamente as dependências
5. **Erros:** Logs detalhados são fornecidos em caso de problemas

## 🆘 Solução de Problemas

### Erro: "Node.js não encontrado"
```bash
# Verifique se Node.js está instalado
node --version
npm --version

# Se não estiver, baixe em: https://nodejs.org/
```

### Erro: "make: command not found"
```bash
# Use os scripts alternativos:
# Windows:
.\run_staging.bat

# Linux/Mac:
./run_staging.sh
```

### Erro: "Permission denied" (Linux/Mac)
```bash
# Torne o script executável:
chmod +x run_staging.sh
```

### Problemas com Dependências
```bash
# Reinstale tudo:
make reinstall

# Ou manualmente:
cd shadcn-ui
rm -rf node_modules package-lock.json
npm install
```

---

**💡 Dica:** Para uma experiência mais rápida, use `make staging` após o setup inicial!