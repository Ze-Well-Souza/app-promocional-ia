import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { LoadingState, LoadingOperation } from '@/types';
import { cn } from '@/lib/utils';

interface DetailedLoadingProps {
  loadingState: LoadingState;
  title: string;
  className?: string;
  compact?: boolean;
}

const getOperationIcon = (operation: LoadingOperation) => {
  switch (operation) {
    case 'idle':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'validating_key':
    case 'generating_text':
    case 'generating_image':
    case 'scraping_url':
    case 'saving_content':
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  }
};

const getOperationColor = (operation: LoadingOperation) => {
  switch (operation) {
    case 'idle':
      return 'bg-green-500';
    case 'validating_key':
      return 'bg-blue-500';
    case 'generating_text':
      return 'bg-purple-500';
    case 'generating_image':
      return 'bg-pink-500';
    case 'scraping_url':
      return 'bg-orange-500';
    case 'saving_content':
      return 'bg-indigo-500';
    default:
      return 'bg-gray-500';
  }
};

const formatTimeRemaining = (startTime: number | null, estimatedDuration: number, progress: number) => {
  if (!startTime || progress === 0) return null;
  
  const elapsed = Date.now() - startTime;
  const totalEstimated = estimatedDuration;
  const remaining = Math.max(0, totalEstimated - elapsed);
  
  if (remaining < 1000) return 'Quase pronto...';
  
  const seconds = Math.ceil(remaining / 1000);
  return `~${seconds}s restantes`;
};

export const DetailedLoading: React.FC<DetailedLoadingProps> = ({
  loadingState,
  title,
  className,
  compact = false
}) => {
  const { operation, progress, message, startTime, estimatedDuration } = loadingState;
  
  const isActive = operation !== 'idle';
  const timeRemaining = formatTimeRemaining(startTime, estimatedDuration, progress);
  
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {getOperationIcon(operation)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-sm">
            <span className="truncate">{title}</span>
            {isActive && (
              <Badge variant="secondary" className="text-xs">
                {progress}%
              </Badge>
            )}
          </div>
          {isActive && (
            <div className="mt-1">
              <Progress 
                value={progress} 
                className="h-1" 
                indicatorClassName={getOperationColor(operation)}
              />
              {message && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getOperationIcon(operation)}
            <h3 className="font-medium">{title}</h3>
          </div>
          {isActive && (
            <Badge variant="secondary">
              {progress}%
            </Badge>
          )}
        </div>
        
        {isActive && (
          <>
            <Progress 
              value={progress} 
              className="mb-3" 
              indicatorClassName={getOperationColor(operation)}
            />
            
            <div className="space-y-1">
              {message && (
                <p className="text-sm text-muted-foreground">
                  {message}
                </p>
              )}
              
              {timeRemaining && (
                <p className="text-xs text-muted-foreground">
                  {timeRemaining}
                </p>
              )}
            </div>
          </>
        )}
        
        {operation === 'idle' && (
          <p className="text-sm text-muted-foreground">
            Pronto
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DetailedLoading;