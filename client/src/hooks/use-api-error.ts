/**
 * Hook personalizado para tratamento padronizado de erros da API
 * Este hook centraliza a lógica de tratamento de erros para todos os hooks da API.
 */

import { useCallback } from 'react';
import { 
  handleError, 
  parseError, 
  shouldRetryError, 
  showSuccessToast,
  createSuccessMessage,
  createErrorTitle,
  type AppError 
} from '@/lib/error-handler';

interface UseApiErrorOptions {
  context?: string;
  showToast?: boolean;
  logError?: boolean;
}

interface UseApiErrorResult {
  handleError: (error: unknown, customTitle?: string) => AppError;
  handleSuccess: (message: string, title?: string) => void;
  shouldRetry: (error: unknown) => boolean;
  createSuccessMsg: (action: string, resource: string, resourceName?: string) => string;
  createErrorTitle: (action: string, resource: string) => string;
}

/**
 * Hook para tratamento padronizado de erros da API
 * 
 * @param options - Opções de configuração
 * @returns Funções utilitárias para tratamento de erros e sucessos
 */
export function useApiError(options: UseApiErrorOptions = {}): UseApiErrorResult {
  const {
    context,
    showToast = true,
    logError = true,
  } = options;

  // Função para tratar erros
  const handleErrorCallback = useCallback(
    (error: unknown, customTitle?: string): AppError => {
      return handleError(error, {
        context,
        showToast,
        customTitle,
        logError,
      });
    },
    [context, showToast, logError]
  );

  // Função para tratar sucessos
  const handleSuccess = useCallback(
    (message: string, title = 'Sucesso') => {
      if (showToast) {
        showSuccessToast(message, title);
      }
    },
    [showToast]
  );

  // Função para verificar se deve tentar novamente
  const shouldRetry = useCallback((error: unknown): boolean => {
    const parsedError = parseError(error);
    return shouldRetryError(parsedError);
  }, []);

  return {
    handleError: handleErrorCallback,
    handleSuccess,
    shouldRetry,
    createSuccessMsg: createSuccessMessage,
    createErrorTitle,
  };
}

/**
 * Hook específico para operações de mutação (create, update, delete)
 * Inclui configurações otimizadas para operações que modificam dados
 */
export function useApiMutationError(context: string) {
  return useApiError({
    context,
    showToast: true,
    logError: true,
  });
}

/**
 * Hook específico para operações de query (fetch, list)
 * Inclui configurações otimizadas para operações de leitura
 */
export function useApiQueryError(context: string) {
  return useApiError({
    context,
    showToast: false, // Não mostrar toast para erros de query por padrão
    logError: true,
  });
}

/**
 * Função utilitária para criar configuração de retry personalizada
 * baseada no tipo de erro
 */
export function createRetryConfig(maxRetries = 3) {
  return {
    retry: (failureCount: number, error: unknown) => {
      // Não exceder o máximo de tentativas
      if (failureCount >= maxRetries) {
        return false;
      }
      
      // Verificar se o erro deve ser retentado
      const parsedError = parseError(error);
      return shouldRetryError(parsedError);
    },
    retryDelay: (attemptIndex: number) => {
      // Delay exponencial com jitter
      const baseDelay = 1000;
      const maxDelay = 30000;
      const exponentialDelay = baseDelay * Math.pow(2, attemptIndex);
      const jitter = Math.random() * 0.1 * exponentialDelay;
      
      return Math.min(exponentialDelay + jitter, maxDelay);
    },
  };
}