import { createLogger, format, transports } from 'winston';
import path from 'path';

// Configuração do logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'sgst-backend' },
  transports: [
    // Arquivo para erros
    new transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'error.log'), 
      level: 'error' 
    }),
    // Arquivo para todos os logs
    new transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'combined.log') 
    })
  ]
});

// Se não estivermos em produção, também log para o console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

// Tipos para logging estruturado
export interface LogContext {
  userId?: string;
  operation?: string;
  resource?: string;
  resourceId?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

// Funções de logging estruturado
export const Logger = {
  info: (message: string, context?: LogContext) => {
    logger.info(message, context);
  },
  
  warn: (message: string, context?: LogContext) => {
    logger.warn(message, context);
  },
  
  error: (message: string, error?: Error, context?: LogContext) => {
    logger.error(message, {
      ...context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    });
  },
  
  debug: (message: string, context?: LogContext) => {
    logger.debug(message, context);
  },
  
  // Log específico para operações de storage
  storage: {
    operation: (operation: string, resource: string, resourceId?: string, metadata?: Record<string, any>) => {
      logger.info(`Storage operation: ${operation}`, {
        operation,
        resource,
        resourceId,
        metadata
      });
    },
    
    success: (operation: string, resource: string, resourceId?: string, duration?: number) => {
      logger.info(`Storage operation successful: ${operation}`, {
        operation,
        resource,
        resourceId,
        duration,
        status: 'success'
      });
    },
    
    error: (operation: string, resource: string, error: Error, resourceId?: string) => {
      logger.error(`Storage operation failed: ${operation}`, {
        operation,
        resource,
        resourceId,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        status: 'error'
      });
    }
  },
  
  // Log específico para validações
  validation: {
    failed: (field: string, value: any, rule: string, resource?: string) => {
      logger.warn(`Validation failed: ${field}`, {
        operation: 'validation',
        field,
        value,
        rule,
        resource,
        status: 'validation_failed'
      });
    },
    
    success: (resource: string, fields: string[]) => {
      logger.debug(`Validation successful: ${resource}`, {
        operation: 'validation',
        resource,
        fields,
        status: 'validation_success'
      });
    }
  }
};

export default Logger;