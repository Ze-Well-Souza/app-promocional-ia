import { useCallback } from 'react';
import { useContentStore } from '@/store/content-store';
import { LoadingOperation, DetailedLoadingStates } from '@/types';

interface UseDetailedLoadingReturn {
  // State
  loadingStates: DetailedLoadingStates;
  currentOperation: LoadingOperation;
  isLoading: (category: keyof DetailedLoadingStates) => boolean;
  getProgress: (category: keyof DetailedLoadingStates) => number;
  getMessage: (category: keyof DetailedLoadingStates) => string;
  
  // Actions
  startOperation: (operation: LoadingOperation, category: keyof DetailedLoadingStates) => void;
  updateProgress: (category: keyof DetailedLoadingStates, progress: number, message?: string) => void;
  completeOperation: (category: keyof DetailedLoadingStates) => void;
  resetLoadingStates: () => void;
  
  // Utilities
  withLoading: <T extends any[]>(
    category: keyof DetailedLoadingStates,
    operation: LoadingOperation,
    asyncFn: (...args: T) => Promise<any>
  ) => (...args: T) => Promise<any>;
  
  simulateProgress: (
    category: keyof DetailedLoadingStates,
    duration?: number,
    steps?: number
  ) => Promise<void>;
}

export const useDetailedLoading = (): UseDetailedLoadingReturn => {
  const {
    loadingStates,
    currentOperation,
    startOperation,
    updateProgress,
    completeOperation,
    resetLoadingStates
  } = useContentStore();
  
  const isLoading = useCallback((category: keyof DetailedLoadingStates) => {
    return loadingStates[category].operation !== 'idle';
  }, [loadingStates]);
  
  const getProgress = useCallback((category: keyof DetailedLoadingStates) => {
    return loadingStates[category].progress;
  }, [loadingStates]);
  
  const getMessage = useCallback((category: keyof DetailedLoadingStates) => {
    return loadingStates[category].message;
  }, [loadingStates]);
  
  const withLoading = useCallback(<T extends any[]>(
    category: keyof DetailedLoadingStates,
    operation: LoadingOperation,
    asyncFn: (...args: T) => Promise<any>
  ) => {
    return async (...args: T) => {
      try {
        startOperation(operation, category);
        
        const result = await asyncFn(...args);
        
        completeOperation(category);
        return result;
      } catch (error) {
        updateProgress(category, 0, 'Erro na operação');
        setTimeout(() => completeOperation(category), 1000);
        throw error;
      }
    };
  }, [startOperation, updateProgress, completeOperation]);
  
  const simulateProgress = useCallback(async (
    category: keyof DetailedLoadingStates,
    duration: number = 3000,
    steps: number = 10
  ) => {
    const stepDuration = duration / steps;
    const progressIncrement = 100 / steps;
    
    for (let i = 0; i <= steps; i++) {
      const progress = Math.min(100, i * progressIncrement);
      updateProgress(category, progress);
      
      if (i < steps) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
    }
  }, [updateProgress]);
  
  return {
    // State
    loadingStates,
    currentOperation,
    isLoading,
    getProgress,
    getMessage,
    
    // Actions
    startOperation,
    updateProgress,
    completeOperation,
    resetLoadingStates,
    
    // Utilities
    withLoading,
    simulateProgress
  };
};

export default useDetailedLoading;