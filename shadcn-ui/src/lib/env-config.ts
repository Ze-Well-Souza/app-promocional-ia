// Configurações de ambiente centralizadas

export interface EnvConfig {
  env: 'development' | 'staging' | 'production';
  appName: string;
  version: string;
  debug: boolean;
  apiTimeout: number;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  apiBaseUrl: string;
  mockApi: boolean;
  enableDevtools: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  rateLimitRequests?: number;
  rateLimitWindow?: number;
  testMode: boolean;
  enableTestData: boolean;
}

// Função para obter configurações baseadas no ambiente
export function getEnvConfig(): EnvConfig {
  const env = import.meta.env.VITE_APP_ENV || 'development';
  
  const config: EnvConfig = {
    env: env as EnvConfig['env'],
    appName: import.meta.env.VITE_APP_NAME || 'App Promocional IA',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    debug: import.meta.env.VITE_APP_DEBUG === 'true',
    apiTimeout: parseInt(import.meta.env.VITE_APP_API_TIMEOUT || '30000'),
    enableAnalytics: import.meta.env.VITE_APP_ENABLE_ANALYTICS === 'true',
    enableErrorReporting: import.meta.env.VITE_APP_ENABLE_ERROR_REPORTING === 'true',
    apiBaseUrl: import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:3000/api',
    mockApi: import.meta.env.VITE_APP_MOCK_API === 'true',
    enableDevtools: import.meta.env.VITE_APP_ENABLE_DEVTOOLS === 'true',
    logLevel: (import.meta.env.VITE_APP_LOG_LEVEL || 'info') as EnvConfig['logLevel'],
    rateLimitRequests: parseInt(import.meta.env.VITE_APP_RATE_LIMIT_REQUESTS || '100'),
    rateLimitWindow: parseInt(import.meta.env.VITE_APP_RATE_LIMIT_WINDOW || '60000'),
    testMode: import.meta.env.VITE_APP_TEST_MODE === 'true',
    enableTestData: import.meta.env.VITE_APP_ENABLE_TEST_DATA === 'true',
  };

  return config;
}

// Configuração global
export const envConfig = getEnvConfig();

// Utilitários para verificar ambiente
export const isDevelopment = () => envConfig.env === 'development';
export const isStaging = () => envConfig.env === 'staging';
export const isProduction = () => envConfig.env === 'production';
export const isDebugMode = () => envConfig.debug;

// Logger baseado no ambiente
export const logger = {
  debug: (...args: any[]) => {
    if (envConfig.logLevel === 'debug' && envConfig.debug) {
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (['debug', 'info'].includes(envConfig.logLevel)) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (['debug', 'info', 'warn'].includes(envConfig.logLevel)) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};

// Função para exibir informações do ambiente no console
export const logEnvironmentInfo = () => {
  if (envConfig.debug) {
    logger.info('Environment Configuration:', {
      env: envConfig.env,
      appName: envConfig.appName,
      version: envConfig.version,
      debug: envConfig.debug,
      mockApi: envConfig.mockApi,
      testMode: envConfig.testMode,
    });
  }
};

// Configurações específicas para testes
export const getTestConfig = () => {
  if (!envConfig.testMode) {
    throw new Error('Test configuration only available in test mode');
  }
  
  return {
    mockApiKeys: {
      openai: 'sk-test-openai-key',
      claude: 'sk-ant-test-claude-key',
      gemini: 'test-gemini-key',
      grook: 'test-grook-key',
      deepseek: 'test-deepseek-key',
    },
    testData: {
      sampleProduct: {
        name: 'Produto de Teste',
        description: 'Descrição de teste para o produto',
        price: 99.99,
      },
    },
  };
};