import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Activity } from 'lucide-react';
import { DetailedLoading } from './detailed-loading';
import { useContentStore } from '@/store/content-store';
import { DetailedLoadingStates } from '@/types';
import { cn } from '@/lib/utils';

interface LoadingPanelProps {
  className?: string;
  showInactive?: boolean;
  collapsible?: boolean;
}

const OPERATION_TITLES: Record<keyof DetailedLoadingStates, string> = {
  textGeneration: 'Geração de Texto',
  imageGeneration: 'Geração de Imagem',
  urlScraping: 'Extração de URL',
  contentSaving: 'Salvando Conteúdo',
  keyValidation: 'Validação de Chave'
};

export const LoadingPanel: React.FC<LoadingPanelProps> = ({
  className,
  showInactive = false,
  collapsible = true
}) => {
  const { loadingStates, currentOperation, resetLoadingStates } = useContentStore();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  // Count active operations
  const activeOperations = Object.values(loadingStates).filter(
    state => state.operation !== 'idle'
  ).length;
  
  // Filter operations to show
  const operationsToShow = Object.entries(loadingStates).filter(([_, state]) => 
    showInactive || state.operation !== 'idle'
  );
  
  // Don't render if no operations to show
  if (operationsToShow.length === 0 && !showInactive) {
    return null;
  }
  
  const hasActiveOperations = activeOperations > 0;
  
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className={cn(
              'h-4 w-4',
              hasActiveOperations ? 'text-blue-500 animate-pulse' : 'text-gray-400'
            )} />
            <CardTitle className="text-base">
              Status das Operações
            </CardTitle>
            {hasActiveOperations && (
              <Badge variant="secondary" className="text-xs">
                {activeOperations} ativa{activeOperations !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {hasActiveOperations && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetLoadingStates}
                className="h-8 w-8 p-0"
                title="Limpar todos os estados"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 px-2 text-xs"
              >
                {isCollapsed ? 'Expandir' : 'Recolher'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {operationsToShow.map(([key, state]) => (
              <DetailedLoading
                key={key}
                loadingState={state}
                title={OPERATION_TITLES[key as keyof DetailedLoadingStates]}
                compact
              />
            ))}
            
            {operationsToShow.length === 0 && showInactive && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Nenhuma operação em andamento
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default LoadingPanel;