#!/usr/bin/env node

/**
 * Script de teste automatizado para o ambiente de staging
 * Executa uma série de verificações para garantir que o ambiente está funcionando corretamente
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`, exists ? 'green' : 'red');
  return exists;
}

function checkEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    log(`❌ Arquivo de ambiente não encontrado: ${envPath}`, 'red');
    return false;
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'VITE_APP_ENV',
    'VITE_APP_NAME',
    'VITE_APP_VERSION',
    'VITE_APP_DEBUG'
  ];
  
  const missingVars = requiredVars.filter(varName => 
    !content.includes(`${varName}=`)
  );
  
  if (missingVars.length > 0) {
    log(`❌ Variáveis obrigatórias ausentes em ${envPath}: ${missingVars.join(', ')}`, 'red');
    return false;
  }
  
  log(`✅ Arquivo de ambiente válido: ${envPath}`, 'green');
  return true;
}

function runCommand(command, description) {
  try {
    log(`🔄 Executando: ${description}`, 'blue');
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 30000 
    });
    log(`✅ ${description} - Sucesso`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} - Falhou: ${error.message}`, 'red');
    return false;
  }
}

async function testStagingServer() {
  return new Promise((resolve) => {
    log('🔄 Testando servidor de staging...', 'blue');
    
    const server = spawn('npm', ['run', 'staging'], {
      stdio: 'pipe',
      shell: true
    });
    
    let serverReady = false;
    const timeout = setTimeout(() => {
      if (!serverReady) {
        server.kill();
        log('❌ Timeout ao iniciar servidor de staging', 'red');
        resolve(false);
      }
    }, 15000);
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:   http://localhost:5174/')) {
        serverReady = true;
        clearTimeout(timeout);
        
        // Aguardar um pouco para garantir que o servidor está estável
        setTimeout(() => {
          server.kill();
          log('✅ Servidor de staging iniciado com sucesso', 'green');
          resolve(true);
        }, 2000);
      }
    });
    
    server.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('Error') || error.includes('error')) {
        clearTimeout(timeout);
        server.kill();
        log(`❌ Erro no servidor de staging: ${error}`, 'red');
        resolve(false);
      }
    });
  });
}

async function main() {
  log('🚀 Iniciando testes do ambiente de staging...', 'cyan');
  log('=' * 50, 'cyan');
  
  let allTestsPassed = true;
  
  // 1. Verificar arquivos de configuração
  log('\n📁 Verificando arquivos de configuração...', 'yellow');
  const configFiles = [
    { path: '.env.development', desc: 'Configuração de desenvolvimento' },
    { path: '.env.staging', desc: 'Configuração de staging' },
    { path: '.env.production', desc: 'Configuração de produção' },
    { path: 'vite.config.ts', desc: 'Configuração do Vite' },
    { path: 'src/lib/env-config.ts', desc: 'Configuração de ambiente' },
    { path: 'src/components/ui/environment-indicator.tsx', desc: 'Indicador de ambiente' },
  ];
  
  configFiles.forEach(({ path: filePath, desc }) => {
    if (!checkFile(filePath, desc)) {
      allTestsPassed = false;
    }
  });
  
  // 2. Verificar variáveis de ambiente
  log('\n🔧 Verificando variáveis de ambiente...', 'yellow');
  ['.env.development', '.env.staging', '.env.production'].forEach(envFile => {
    if (!checkEnvFile(envFile)) {
      allTestsPassed = false;
    }
  });
  
  // 3. Verificar scripts do package.json
  log('\n📦 Verificando scripts do package.json...', 'yellow');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = [
    'staging',
    'build:staging',
    'preview:staging',
    'test:staging'
  ];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      log(`✅ Script '${script}' encontrado`, 'green');
    } else {
      log(`❌ Script '${script}' não encontrado`, 'red');
      allTestsPassed = false;
    }
  });
  
  // 4. Testar build de staging
  log('\n🔨 Testando build de staging...', 'yellow');
  if (!runCommand('npm run build:staging', 'Build de staging')) {
    allTestsPassed = false;
  }
  
  // 5. Verificar se o build foi criado
  if (checkFile('dist-staging', 'Diretório de build de staging')) {
    log('✅ Build de staging criado com sucesso', 'green');
  } else {
    log('❌ Build de staging não foi criado', 'red');
    allTestsPassed = false;
  }
  
  // 6. Testar servidor de staging
  log('\n🌐 Testando servidor de staging...', 'yellow');
  const serverTest = await testStagingServer();
  if (!serverTest) {
    allTestsPassed = false;
  }
  
  // 7. Verificar estrutura de arquivos
  log('\n📂 Verificando estrutura de arquivos...', 'yellow');
  const requiredDirs = [
    'src/lib',
    'src/components/ui',
    'src/store',
    'src/types'
  ];
  
  requiredDirs.forEach(dir => {
    if (!checkFile(dir, `Diretório ${dir}`)) {
      allTestsPassed = false;
    }
  });
  
  // Resultado final
  log('\n' + '=' * 50, 'cyan');
  if (allTestsPassed) {
    log('🎉 Todos os testes passaram! Ambiente de staging está pronto.', 'green');
    log('\n📋 Próximos passos:', 'cyan');
    log('1. Configure as chaves de API de teste', 'blue');
    log('2. Execute: npm run staging', 'blue');
    log('3. Acesse: http://localhost:5174', 'blue');
    log('4. Execute testes manuais conforme STAGING.md', 'blue');
    process.exit(0);
  } else {
    log('❌ Alguns testes falharam. Verifique os erros acima.', 'red');
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    log(`❌ Erro inesperado: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main, checkFile, checkEnvFile, runCommand };