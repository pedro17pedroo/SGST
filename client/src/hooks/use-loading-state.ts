import { useState, useCallback, useRef, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  data: any;
}

interface UseLoadingStateOptions {
  initialLoading?: boolean;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

interface UseLoadingStateReturn {
  isLoading: boolean;
  error: Error | null;
  data: any;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setData: (data: any) => void;
  reset: () => void;
  execute: <T>(asyncFn: () => Promise<T>) => Promise<T | null>;
  retry: () => void;
  canRetry: boolean;
}

/**
 * Hook personalizado para gerenciar estados de loading de forma consistente
 */
export function useLoadingState(options: UseLoadingStateOptions = {}): UseLoadingStateReturn {
  const {
    initialLoading = false,
    timeout = 30000, // 30 segundos
    retryAttempts = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    error: null,
    data: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const lastAsyncFn = useRef<(() => Promise<any>) | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const setData = useCallback((data: any) => {
    setState(prev => ({ ...prev, data, error: null, isLoading: false }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: null,
    });
    setRetryCount(0);
    lastAsyncFn.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const execute = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
    lastAsyncFn.current = asyncFn;
    setLoading(true);
    setState(prev => ({ ...prev, error: null }));

    // Configurar timeout
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        setError(new Error('Operação expirou. Tente novamente.'));
      }, timeout);
    }

    try {
      const result = await asyncFn();
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      setData(result);
      setRetryCount(0);
      return result;
    } catch (error) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      const errorObj = error instanceof Error ? error : new Error('Erro desconhecido');
      setError(errorObj);
      return null;
    }
  }, [timeout, setLoading, setError, setData]);

  const retry = useCallback(async () => {
    if (!lastAsyncFn.current || retryCount >= retryAttempts) {
      return;
    }

    setRetryCount(prev => prev + 1);
    
    // Delay antes de tentar novamente
    if (retryDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
    }

    await execute(lastAsyncFn.current);
  }, [execute, retryCount, retryAttempts, retryDelay]);

  const canRetry = lastAsyncFn.current !== null && retryCount < retryAttempts;

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading: state.isLoading,
    error: state.error,
    data: state.data,
    setLoading,
    setError,
    setData,
    reset,
    execute,
    retry,
    canRetry,
  };
}

/**
 * Hook para múltiplos estados de loading
 */
export function useMultipleLoadingStates<T extends Record<string, any>>(keys: (keyof T)[]) {
  const [loadingStates, setLoadingStates] = useState<Record<keyof T, boolean>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<keyof T, boolean>)
  );

  const setLoading = useCallback((key: keyof T, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  }, []);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);
  const isAllLoading = Object.values(loadingStates).every(Boolean);

  const resetAll = useCallback(() => {
    setLoadingStates(keys.reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<keyof T, boolean>));
  }, [keys]);

  return {
    loadingStates,
    setLoading,
    isAnyLoading,
    isAllLoading,
    resetAll,
  };
}

/**
 * Hook para loading com debounce
 */
export function useDebouncedLoading(delay: number = 300) {
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedLoading, setDebouncedLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (loading) {
      // Mostrar loading imediatamente se for true
      setDebouncedLoading(true);
    } else {
      // Debounce para esconder o loading
      timeoutRef.current = setTimeout(() => {
        setDebouncedLoading(false);
      }, delay);
    }
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    debouncedLoading,
    setLoading,
  };
}

/**
 * Hook para loading sequencial (steps)
 */
export function useSequentialLoading(steps: string[]) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setCurrentStep(0);
    setCompletedSteps(new Set());
  }, []);

  const nextStep = useCallback(() => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsLoading(false);
    }
  }, [currentStep, steps.length]);

  const skipToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  }, [steps.length]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setCurrentStep(0);
    setCompletedSteps(new Set());
  }, []);

  const progress = completedSteps.size / steps.length * 100;
  const currentStepName = steps[currentStep];
  const isComplete = completedSteps.size === steps.length;

  return {
    isLoading,
    currentStep,
    currentStepName,
    completedSteps: Array.from(completedSteps),
    progress,
    isComplete,
    startLoading,
    nextStep,
    skipToStep,
    reset,
  };
}

/**
 * Hook para loading com cache
 */
export function useCachedLoading<T>(_key: string, asyncFn: () => Promise<T>, ttl: number = 300000) {
  const [state, setState] = useState<{
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    lastFetch: number | null;
  }>({ data: null, isLoading: false, error: null, lastFetch: null });

  const isStale = useCallback(() => {
    if (!state.lastFetch) return true;
    return Date.now() - state.lastFetch > ttl;
  }, [state.lastFetch, ttl]);

  const execute = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && state.data && !isStale()) {
      return state.data;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await asyncFn();
      setState({
        data: result,
        isLoading: false,
        error: null,
        lastFetch: Date.now(),
      });
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Erro desconhecido');
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorObj,
      }));
      return null;
    }
  }, [asyncFn, state.data, isStale]);

  const refresh = useCallback(() => execute(true), [execute]);

  const clear = useCallback(() => {
    setState({ data: null, isLoading: false, error: null, lastFetch: null });
  }, []);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    isStale: isStale(),
    execute,
    refresh,
    clear,
  };
}