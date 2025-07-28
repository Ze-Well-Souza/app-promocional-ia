@echo off
REM Script para executar o ambiente de staging do App Promocional IA
REM Autor: Sistema de IA

echo ========================================
echo  App Promocional IA - Ambiente Staging
echo ========================================
echo.

REM Verificar se estamos no diretorio correto
if not exist "shadcn-ui" (
    echo [ERRO] Diretorio shadcn-ui nao encontrado.
    echo Verifique se voce esta no diretorio raiz do projeto.
    pause
    exit /b 1
)

echo [INFO] Navegando para o diretorio shadcn-ui...
cd shadcn-ui

if not exist "package.json" (
    echo [ERRO] Arquivo package.json nao encontrado.
    echo Verifique se voce esta no diretorio correto do projeto.
    pause
    exit /b 1
)

echo [INFO] Verificando dependencias...
if not exist "node_modules" (
    echo [INFO] Instalando dependencias do projeto...
    npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias.
        pause
        exit /b 1
    )
    echo [INFO] Dependencias instaladas com sucesso!
) else (
    echo [INFO] Dependencias ja instaladas.
)

echo.
echo [INFO] Iniciando servidor de staging...
echo [INFO] O servidor estara disponivel em uma das seguintes portas:
echo [INFO] - http://localhost:5174/ (preferencial)
echo [INFO] - http://localhost:5175/ (alternativa)
echo [INFO] Pressione Ctrl+C para parar o servidor.
echo.

npm run staging

echo.
echo [INFO] Servidor de staging encerrado.
pause