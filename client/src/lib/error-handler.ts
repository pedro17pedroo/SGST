/**
 * Utilitário centralizado para tratamento de erros
 * Este arquivo padroniza o tratamento de erros em toda a aplicação,
 * incluindo mensagens de erro, logging e notificações.
 */

import { toast } from '@/hooks/use-toast';
import { getApiConfig } from '@/config/api';

// Tipos de erro padronizados
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  statusCode?: number;
  timestamp: Date;
}

// Códigos de erro padronizados
export const ERROR_CODES = {
  // Erros de rede
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  
  // Erros de autenticação
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Erros de validação
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Erros de negócio
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  
  // Erros do servidor
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // Erros genéricos
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Mensagens de erro padronizadas em português
const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.NETWORK_ERROR]: 'Erro de conexão. Verifique sua internet.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Tempo limite excedido. Tente novamente.',
  [ERROR_CODES.CONNECTION_ERROR]: 'Não foi possível conectar ao servidor.',
  
  [ERROR_CODES.UNAUTHORIZED]: 'Acesso não autorizado. Faça login novamente.',
  [ERROR_CODES.FORBIDDEN]: 'Você não tem permissão para esta ação.',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Sua sessão expirou. Faça login novamente.',
  
  [ERROR_CODES.VALIDATION_ERROR]: 'Dados inválidos. Verifique os campos.',
  [ERROR_CODES.REQUIRED_FIELD]: 'Campo obrigatório não preenchido.',
  [ERROR_CODES.INVALID_FORMAT]: 'Formato inválido.',
  
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Recurso não encontrado.',
  [ERROR_CODES.DUPLICATE_RESOURCE]: 'Recurso já existe.',
  [ERROR_CODES.INSUFFICIENT_STOCK]: 'Estoque insuficiente.',
  [ERROR_CODES.OPERATION_NOT_ALLOWED]: 'Operação não permitida.',
  
  [ERROR_CODES.SERVER_ERROR]: 'Erro interno do servidor.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Serviço temporariamente indisponível.',
  [ERROR_CODES.DATABASE_ERROR]: 'Erro na base de dados.',
  
  [ERROR_CODES.UNKNOWN_ERROR]: 'Ocorreu um erro inesperado.',
};

// Função para mapear códigos de status HTTP para códigos de erro
function mapHttpStatusToErrorCode(status: number): string {
  switch (status) {
    case 400:
      return ERROR_CODES.VALIDATION_ERROR;
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.RESOURCE_NOT_FOUND;
    case 409:
      return ERROR_CODES.DUPLICATE_RESOURCE;
    case 422:
      return ERROR_CODES.VALIDATION_ERROR;
    case 500:
      return ERROR_CODES.SERVER_ERROR;
    case 502:
    case 503:
      return ERROR_CODES.SERVICE_UNAVAILABLE;
    case 504:
      return ERROR_CODES.TIMEOUT_ERROR;
    default:
      return ERROR_CODES.UNKNOWN_ERROR;
  }
}

// Função para extrair informações de erro de diferentes tipos
export function parseError(error: unknown): AppError {
  const timestamp = new Date();
  
  // Se já é um AppError, retornar como está
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return error as AppError;
  }
  
  // Se é um Error padrão do JavaScript
  if (error instanceof Error) {
    // Verificar se é erro de rede
    if (error.name === 'AbortError') {
      return {
        code: ERROR_CODES.TIMEOUT_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR],
        details: error.message,
        timestamp,
      };
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        code: ERROR_CODES.NETWORK_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
        details: error.message,
        timestamp,
      };
    }
    
    // Tentar extrair código de status da mensagem
    const statusMatch = error.message.match(/status[:\s]*(\d+)/i);
    if (statusMatch) {
      const statusCode = parseInt(statusMatch[1]);
      const errorCode = mapHttpStatusToErrorCode(statusCode);
      
      return {
        code: errorCode,
        message: ERROR_MESSAGES[errorCode] || error.message,
        details: error.message,
        statusCode,
        timestamp,
      };
    }
    
    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: error.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
      details: error.stack,
      timestamp,
    };
  }
  
  // Se é um objeto com propriedades de erro
  if (error && typeof error === 'object') {
    const errorObj = error as any;
    
    // Verificar se tem status code
    if (errorObj.status || errorObj.statusCode) {
      const statusCode = errorObj.status || errorObj.statusCode;
      const errorCode = mapHttpStatusToErrorCode(statusCode);
      
      return {
        code: errorCode,
        message: errorObj.message || ERROR_MESSAGES[errorCode],
        details: errorObj,
        statusCode,
        timestamp,
      };
    }
    
    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: errorObj.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
      details: errorObj,
      timestamp,
    };
  }
  
  // Se é uma string
  if (typeof error === 'string') {
    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: error || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
      timestamp,
    };
  }
  
  // Fallback para tipos desconhecidos
  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    details: error,
    timestamp,
  };
}

// Função para log de erros (apenas em desenvolvimento)
export function logError(error: AppError, context?: string) {
  const config = getApiConfig();
  
  if (config.enableLogging) {
    console.group(`🚨 Erro${context ? ` em ${context}` : ''}`);
    console.error('Código:', error.code);
    console.error('Mensagem:', error.message);
    if (error.statusCode) {
      console.error('Status:', error.statusCode);
    }
    if (error.details) {
      console.error('Detalhes:', error.details);
    }
    console.error('Timestamp:', error.timestamp.toISOString());
    console.groupEnd();
  }
}

// Função para exibir toast de erro
export function showErrorToast(error: AppError, customTitle?: string) {
  toast({
    title: customTitle || 'Erro',
    description: error.message,
    variant: 'destructive',
  });
}

// Função para exibir toast de sucesso
export function showSuccessToast(message: string, title = 'Sucesso') {
  toast({
    title,
    description: message,
    variant: 'default',
  });
}

// Função principal para tratamento de erros
export function handleError(
  error: unknown,
  options: {
    context?: string;
    showToast?: boolean;
    customTitle?: string;
    logError?: boolean;
  } = {}
): AppError {
  const {
    context,
    showToast = true,
    customTitle,
    logError: shouldLog = true,
  } = options;
  
  const parsedError = parseError(error);
  
  // Log do erro
  if (shouldLog) {
    logError(parsedError, context);
  }
  
  // Exibir toast se solicitado
  if (showToast) {
    showErrorToast(parsedError, customTitle);
  }
  
  return parsedError;
}

// Função para verificar se um erro deve ser retentado
export function shouldRetryError(error: AppError): boolean {
  // Não tentar novamente para erros 4xx (exceto 408 e 429)
  if (error.statusCode) {
    if (error.statusCode >= 400 && error.statusCode < 500) {
      return error.statusCode === 408 || error.statusCode === 429;
    }
  }
  
  // Tentar novamente para erros de rede e servidor
  const retryableCodes = [
    ERROR_CODES.NETWORK_ERROR,
    ERROR_CODES.TIMEOUT_ERROR,
    ERROR_CODES.CONNECTION_ERROR,
    ERROR_CODES.SERVER_ERROR,
    ERROR_CODES.SERVICE_UNAVAILABLE,
  ] as const;
  
  return retryableCodes.includes(error.code as typeof retryableCodes[number]);
}

// Função para criar mensagens de sucesso contextuais
export function createSuccessMessage(
  action: string,
  resource: string,
  resourceName?: string
): string {
  const actionMap: Record<string, string> = {
    create: 'criado',
    update: 'atualizado',
    delete: 'eliminado',
    activate: 'ativado',
    deactivate: 'desativado',
    send: 'enviado',
    complete: 'concluído',
    cancel: 'cancelado',
  };
  
  const actionText = actionMap[action] || action;
  const name = resourceName ? ` ${resourceName}` : '';
  
  return `${resource}${name} foi ${actionText} com sucesso.`;
}

// Função para criar títulos de erro contextuais
export function createErrorTitle(action: string, resource: string): string {
  const actionMap: Record<string, string> = {
    create: 'criar',
    update: 'atualizar',
    delete: 'eliminar',
    activate: 'ativar',
    deactivate: 'desativar',
    send: 'enviar',
    complete: 'concluir',
    cancel: 'cancelar',
    fetch: 'carregar',
    load: 'carregar',
  };
  
  const actionText = actionMap[action] || action;
  
  return `Erro ao ${actionText} ${resource.toLowerCase()}`;
}