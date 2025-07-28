import { useState, useEffect, useCallback, useRef } from 'react';
import { APIService } from '@/lib/api-services';
import { AIProvider } from '@/types';
import { useContentStore } from '@/store/content-store';

interface ValidationState {
  isValidating: boolean;
  isValid: boolean | null;
  lastValidated: Date | null;
  error: string | null;
}

interface UseApiKeyValidationReturn {
  validationStates: Record<AIProvider, ValidationState>;
  validateKey: (provider: AIProvider, key: string, immediate?: boolean) => Promise<boolean>;
  validateAllKeys: () => Promise<void>;
  clearValidation: (provider: AIProvider) => void;
  isAnyValidating: boolean;
}

const VALIDATION_DEBOUNCE_MS = 1000; // 1 segundo de debounce
const VALIDATION_CACHE_MS = 5 * 60 * 1000; // Cache por 5 minutos

export function useApiKeyValidation(): UseApiKeyValidationReturn {
  const apiService = new APIService();
  const { apiKeys } = useContentStore();
  
  const [validationStates, setValidationStates] = useState<Record<AIProvider, ValidationState>>(() => {
    const initialState: Record<AIProvider, ValidationState> = {} as any;
    const providers: AIProvider[] = ['openai', 'claude', 'gemini', 'grook', 'deepseek'];
    
    providers.forEach(provider => {
      initialState[provider] = {
        isValidating: false,
        isValid: null,
        lastValidated: null,
        error: null
      };
    });
    
    return initialState;
  });
  
  // Refs para controlar debounce e cache
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const validationCache = useRef<Record<string, { isValid: boolean; timestamp: number }>>({});
  
  // Função para limpar timer de debounce
  const clearDebounceTimer = useCallback((provider: AIProvider) => {
    const timerId = debounceTimers.current[provider];
    if (timerId) {
      clearTimeout(timerId);
      delete debounceTimers.current[provider];
    }
  }, []);
  
  // Função para verificar cache
  const getCachedValidation = useCallback((provider: AIProvider, key: string): boolean | null => {
    const cacheKey = `${provider}:${key}`;
    const cached = validationCache.current[cacheKey];
    
    if (cached && (Date.now() - cached.timestamp) < VALIDATION_CACHE_MS) {
      return cached.isValid;
    }
    
    return null;
  }, []);
  
  // Função para salvar no cache
  const setCachedValidation = useCallback((provider: AIProvider, key: string, isValid: boolean) => {
    const cacheKey = `${provider}:${key}`;
    validationCache.current[cacheKey] = {
      isValid,
      timestamp: Date.now()
    };
  }, []);
  
  // Função principal de validação
  const validateKey = useCallback(async (
    provider: AIProvider, 
    key: string, 
    immediate: boolean = false
  ): Promise<boolean> => {
    // Verificar se a chave está vazia
    if (!key || key.trim() === '') {
      setValidationStates(prev => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          isValidating: false,
          isValid: null,
          error: null
        }
      }));
      return false;
    }
    
    // Verificar cache primeiro
    const cachedResult = getCachedValidation(provider, key);
    if (cachedResult !== null && !immediate) {
      setValidationStates(prev => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          isValidating: false,
          isValid: cachedResult,
          error: null,
          lastValidated: new Date()
        }
      }));
      return cachedResult;
    }
    
    // Limpar timer anterior se existir
    clearDebounceTimer(provider);
    
    // Função de validação real
    const performValidation = async (): Promise<boolean> => {
      setValidationStates(prev => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          isValidating: true,
          error: null
        }
      }));
      
      try {
        const isValid = await apiService.validateAPIKey(provider, key);
        
        // Salvar no cache
        setCachedValidation(provider, key, isValid);
        
        setValidationStates(prev => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            isValidating: false,
            isValid,
            lastValidated: new Date(),
            error: null
          }
        }));
        
        return isValid;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro na validação';
        
        setValidationStates(prev => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            isValidating: false,
            isValid: false,
            error: errorMessage,
            lastValidated: new Date()
          }
        }));
        
        return false;
      }
    };
    
    // Se for imediato, executar agora
    if (immediate) {
      return await performValidation();
    }
    
    // Caso contrário, usar debounce
    return new Promise((resolve) => {
      debounceTimers.current[provider] = setTimeout(async () => {
        const result = await performValidation();
        resolve(result);
      }, VALIDATION_DEBOUNCE_MS);
    });
  }, [apiService, getCachedValidation, setCachedValidation, clearDebounceTimer]);
  
  // Função para validar todas as chaves
  const validateAllKeys = useCallback(async () => {
    const providers: AIProvider[] = ['openai', 'claude', 'gemini', 'grook', 'deepseek'];
    
    const validationPromises = providers.map(async (provider) => {
      const key = apiKeys[provider];
      if (key && key.trim() !== '') {
        return validateKey(provider, key, true);
      }
      return false;
    });
    
    await Promise.all(validationPromises);
  }, [apiKeys, validateKey]);
  
  // Função para limpar validação
  const clearValidation = useCallback((provider: AIProvider) => {
    clearDebounceTimer(provider);
    
    setValidationStates(prev => ({
      ...prev,
      [provider]: {
        isValidating: false,
        isValid: null,
        lastValidated: null,
        error: null
      }
    }));
  }, [clearDebounceTimer]);
  
  // Computed: verificar se alguma validação está em andamento
  const isAnyValidating = Object.values(validationStates).some(state => state.isValidating);
  
  // Validar chaves automaticamente quando elas mudarem
  useEffect(() => {
    const providers: AIProvider[] = ['openai', 'claude', 'gemini', 'grook', 'deepseek'];
    
    providers.forEach(provider => {
      const key = apiKeys[provider];
      if (key && key.trim() !== '') {
        // Validar com debounce quando a chave mudar
        validateKey(provider, key, false);
      } else {
        // Limpar validação se a chave estiver vazia
        clearValidation(provider);
      }
    });
  }, [apiKeys, validateKey, clearValidation]);
  
  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      // Limpar todos os timers
      Object.values(debounceTimers.current).forEach(timer => {
        clearTimeout(timer);
      });
      debounceTimers.current = {};
    };
  }, []);
  
  return {
    validationStates,
    validateKey,
    validateAllKeys,
    clearValidation,
    isAnyValidating
  };
}