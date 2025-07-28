import React from 'react';
import { Badge } from '@/components/ui/badge';
import { envConfig, isDevelopment, isStaging, isProduction } from '@/lib/env-config';
import { AlertTriangle, TestTube, Rocket } from 'lucide-react';

interface EnvironmentIndicatorProps {
  className?: string;
  showVersion?: boolean;
}

export function EnvironmentIndicator({ className = '', showVersion = false }: EnvironmentIndicatorProps) {
  // Não mostrar em produção
  if (isProduction()) {
    return null;
  }

  const getEnvironmentConfig = () => {
    if (isDevelopment()) {
      return {
        label: 'DEV',
        variant: 'secondary' as const,
        icon: AlertTriangle,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      };
    }
    
    if (isStaging()) {
      return {
        label: 'STAGING',
        variant: 'outline' as const,
        icon: TestTube,
        className: 'bg-blue-100 text-blue-800 border-blue-300',
      };
    }

    return {
      label: 'PROD',
      variant: 'default' as const,
      icon: Rocket,
      className: 'bg-green-100 text-green-800 border-green-300',
    };
  };

  const config = getEnvironmentConfig();
  const Icon = config.icon;

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <Badge 
        variant={config.variant}
        className={`${config.className} flex items-center gap-1 px-2 py-1 text-xs font-semibold shadow-lg`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
        {showVersion && (
          <span className="ml-1 opacity-75">v{envConfig.version}</span>
        )}
      </Badge>
      
      {envConfig.debug && (
        <div className="mt-1 text-xs text-gray-500 bg-white/90 px-2 py-1 rounded shadow">
          Debug Mode
        </div>
      )}
    </div>
  );
}

// Componente para mostrar informações detalhadas do ambiente (apenas em dev/staging)
export function EnvironmentInfo() {
  if (isProduction()) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-xs">
      <details className="bg-white/95 backdrop-blur-sm border rounded-lg shadow-lg">
        <summary className="px-3 py-2 text-xs font-medium cursor-pointer hover:bg-gray-50">
          Environment Info
        </summary>
        <div className="px-3 py-2 text-xs space-y-1 border-t">
          <div><strong>Environment:</strong> {envConfig.env}</div>
          <div><strong>Version:</strong> {envConfig.version}</div>
          <div><strong>Debug:</strong> {envConfig.debug ? 'On' : 'Off'}</div>
          <div><strong>Mock API:</strong> {envConfig.mockApi ? 'On' : 'Off'}</div>
          <div><strong>Test Mode:</strong> {envConfig.testMode ? 'On' : 'Off'}</div>
          <div><strong>Log Level:</strong> {envConfig.logLevel}</div>
        </div>
      </details>
    </div>
  );
}