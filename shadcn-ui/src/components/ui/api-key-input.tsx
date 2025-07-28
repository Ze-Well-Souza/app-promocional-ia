import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Clock,
  Zap,
  Wifi,
  WifiOff,
  Shield,
  ShieldCheck
} from 'lucide-react';
import { AIProvider } from '@/types';
import { useApiKeyValidation } from '@/hooks/use-api-key-validation';
import { useContentStore } from '@/store/content-store';
import { cn } from '@/lib/utils';

interface ApiKeyInputProps {
  provider: AIProvider;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean | null) => void;
  className?: string;
  showValidationBadge?: boolean;
  autoValidate?: boolean;
}

const PROVIDER_COLORS: Record<AIProvider, string> = {
  openai: 'bg-green-500',
  claude: 'bg-orange-500',
  gemini: 'bg-blue-500',
  grook: 'bg-purple-500',
  deepseek: 'bg-red-500'
};

const PROVIDER_PATTERNS: Record<AIProvider, RegExp> = {
  openai: /^sk-[a-zA-Z0-9]{48,}$/,
  claude: /^sk-ant-[a-zA-Z0-9-]{95,}$/,
  gemini: /^[a-zA-Z0-9_-]{39}$/,
  grook: /^xai-[a-zA-Z0-9]{64,}$/,
  deepseek: /^sk-[a-zA-Z0-9]{48,}$/
};

// Estilos CSS para animação da barra de progresso
const progressStyles = `
  @keyframes progress {
    0% { width: 0%; }
    50% { width: 70%; }
    100% { width: 100%; }
  }
`;

export function ApiKeyInput({
  provider,
  label,
  placeholder,
  value,
  onChange,
  onValidationChange,
  className,
  showValidationBadge = true,
  autoValidate = true
}: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const { validationStates, validateKey, clearValidation } = useApiKeyValidation();
  const { setAPIKey } = useContentStore();
  
  const validationState = validationStates[provider];
  const isValidating = validationState.isValidating;
  const isValid = validationState.isValid;
  const error = validationState.error;
  const lastValidated = validationState.lastValidated;
  
  // Verificar se a chave segue o padrão básico
  const hasValidPattern = localValue ? PROVIDER_PATTERNS[provider]?.test(localValue) : null;
  
  // Sincronizar valor local com prop
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Notificar mudanças de validação
  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);
  
  // Função para lidar com mudanças no input
  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
    
    // Se a chave foi limpa, limpar validação
    if (!newValue.trim()) {
      clearValidation(provider);
    }
    // Se auto-validação está habilitada e a chave tem padrão válido
    else if (autoValidate && PROVIDER_PATTERNS[provider]?.test(newValue)) {
      validateKey(provider, newValue, false);
    }
  };
  
  // Função para validação manual
  const handleManualValidation = async () => {
    if (localValue.trim()) {
      await validateKey(provider, localValue, true);
    }
  };
  
  // Função para salvar chave
  const handleSaveKey = async () => {
    if (localValue.trim() && isValid) {
      await setAPIKey(provider, localValue);
    }
  };
  
  // Determinar status visual
  const getInputStatus = () => {
    if (!localValue.trim()) return 'default';
    if (isValidating) return 'validating';
    if (isValid === true) return 'valid';
    if (isValid === false) return 'invalid';
    if (hasValidPattern === false) return 'pattern-invalid';
    return 'default';
  };
  
  const inputStatus = getInputStatus();
  
  // Classes CSS baseadas no status
  const getInputClasses = () => {
    const baseClasses = 'font-mono text-sm transition-all duration-200';
    
    switch (inputStatus) {
      case 'validating':
        return cn(baseClasses, 'border-blue-300 bg-blue-50/50 focus:border-blue-500');
      case 'valid':
        return cn(baseClasses, 'border-green-300 bg-green-50/50 focus:border-green-500');
      case 'invalid':
        return cn(baseClasses, 'border-red-300 bg-red-50/50 focus:border-red-500');
      case 'pattern-invalid':
        return cn(baseClasses, 'border-orange-300 bg-orange-50/50 focus:border-orange-500');
      default:
        return cn(baseClasses, 'bg-white/80 border-gray-200 focus:border-gray-400');
    }
  };
  
  // Função para formatar tempo desde última validação
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s atrás`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h atrás`;
  };
  
  return (
    <>
      <style>{progressStyles}</style>
      <div className={cn('space-y-3', className)}>
      {/* Header com label e status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor={`api-key-${provider}`} className="text-sm font-semibold">
            {label}
          </Label>
          <div className={cn('w-2 h-2 rounded-full', PROVIDER_COLORS[provider])} />
        </div>
        
        {/* Status badges */}
        <div className="flex items-center gap-2">
          {isValidating && (
            <Badge variant="secondary" className="text-xs animate-pulse">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Validando...
            </Badge>
          )}
          
          {isValid === true && showValidationBadge && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600 transition-all duration-200">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Válida
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-semibold">✅ Chave Validada</p>
                    <p className="text-xs text-gray-500">Validada {lastValidated ? getTimeAgo(lastValidated) : ''}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {isValid === false && showValidationBadge && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="destructive" className="text-xs transition-all duration-200">
                    <Shield className="w-3 h-3 mr-1" />
                    Inválida
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs">
                    <p className="font-semibold text-red-600">❌ Validação Falhou</p>
                    <p className="text-xs mt-1">{error || 'Chave de API inválida'}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {hasValidPattern === false && isValid === null && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-300 transition-all duration-200">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Formato inválido
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div>
                    <p className="font-semibold text-orange-600">⚠️ Formato Incorreto</p>
                    <p className="text-xs mt-1">Verifique se a chave segue o padrão correto</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {hasValidPattern === true && isValid === null && !isValidating && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-300 transition-all duration-200">
                    <Wifi className="w-3 h-3 mr-1" />
                    Pronta
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div>
                    <p className="font-semibold text-blue-600">🔄 Pronta para Validação</p>
                    <p className="text-xs mt-1">Formato correto - clique para validar</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {/* Input com botões */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            id={`api-key-${provider}`}
            type={showKey ? 'text' : 'password'}
            placeholder={placeholder || `Chave de API do ${label}`}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className={getInputClasses()}
          />
          
          {/* Botão de mostrar/ocultar */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? (
              <EyeOff className="w-3 h-3" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
          </Button>
        </div>
        
        {/* Botão de validação manual */}
        {localValue.trim() && !autoValidate && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleManualValidation}
                  disabled={isValidating}
                  className="px-3"
                >
                  {isValidating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Validar chave manualmente</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Botão de salvar */}
        {localValue.trim() && isValid === true && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveKey}
                  className="px-3 bg-green-500 hover:bg-green-600"
                >
                  <Zap className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Salvar chave válida</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {/* Barra de progresso durante validação */}
      {isValidating && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{width: '100%', animation: 'progress 2s ease-in-out infinite'}}></div>
          </div>
          <div className="text-xs text-gray-500 text-center">
            Conectando com {label}...
          </div>
        </div>
      )}
      
      {/* Informações adicionais */}
      {localValue.trim() && !isValidating && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {hasValidPattern === true && (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Formato correto
              </span>
            )}
            {hasValidPattern === false && (
              <span className="text-orange-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Formato incorreto
              </span>
            )}
          </div>
          
          {lastValidated && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Validada {getTimeAgo(lastValidated)}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Mensagem de erro detalhada */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
          <strong>Erro:</strong> {error}
        </div>
      )}
      </div>
    </>
  );
}