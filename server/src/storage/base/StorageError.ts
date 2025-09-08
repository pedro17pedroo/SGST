/**
 * Sistema padronizado de tratamento de erros para módulos de storage
 */

/**
 * Tipos de erro específicos do storage
 */
export enum StorageErrorType {
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  CONSTRAINT_ERROR = 'CONSTRAINT_ERROR'
}

/**
 * Classe base para erros de storage
 */
export class StorageError extends Error {
  public readonly type: StorageErrorType;
  public readonly code: string;
  public readonly details?: any;
  public readonly originalError?: Error;

  constructor(
    message: string,
    type: StorageErrorType,
    code: string,
    details?: any,
    originalError?: Error
  ) {
    super(message);
    this.name = 'StorageError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.originalError = originalError;

    // Manter stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }
  }

  /**
   * Converte o erro para um objeto JSON
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      code: this.code,
      details: this.details,
      stack: this.stack
    };
  }
}

/**
 * Erros específicos para diferentes situações
 */
export class NotFoundError extends StorageError {
  constructor(resource: string, id?: string, details?: any) {
    const message = id 
      ? `${resource} com ID '${id}' não encontrado`
      : `${resource} não encontrado`;
    super(message, StorageErrorType.NOT_FOUND, 'RESOURCE_NOT_FOUND', details);
  }
}

export class ValidationError extends StorageError {
  constructor(message: string, field?: string, details?: any) {
    super(message, StorageErrorType.VALIDATION_ERROR, 'VALIDATION_FAILED', {
      field,
      ...details
    });
  }
}

export class DuplicateError extends StorageError {
  constructor(resource: string, field: string, value: string, details?: any) {
    const message = `${resource} com ${field} '${value}' já existe`;
    super(message, StorageErrorType.DUPLICATE_ERROR, 'DUPLICATE_RESOURCE', {
      field,
      value,
      ...details
    });
  }
}

export class DatabaseError extends StorageError {
  constructor(message: string, originalError?: Error, details?: any) {
    super(message, StorageErrorType.DATABASE_ERROR, 'DATABASE_OPERATION_FAILED', details, originalError);
  }
}

export class ConstraintError extends StorageError {
  constructor(message: string, constraint: string, details?: any) {
    super(message, StorageErrorType.CONSTRAINT_ERROR, 'CONSTRAINT_VIOLATION', {
      constraint,
      ...details
    });
  }
}

/**
 * Utilitários para tratamento de erros
 */
export class ErrorHandler {
  /**
   * Trata erros de banco de dados e os converte em StorageError apropriado
   */
  static handleDatabaseError(error: any, context: string): StorageError {
    console.error(`Erro de banco de dados em ${context}:`, error);

    // Erro de chave duplicada (MySQL)
    if (error.code === 'ER_DUP_ENTRY') {
      const match = error.message.match(/Duplicate entry '(.+)' for key '(.+)'/);
      if (match) {
        return new DuplicateError(context, match[2], match[1]);
      }
      return new DuplicateError(context, 'unknown', 'unknown');
    }

    // Erro de constraint de chave estrangeira
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return new ConstraintError(
        `Referência inválida em ${context}`,
        'foreign_key',
        { originalError: error.message }
      );
    }

    // Erro de constraint de chave estrangeira (delete)
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return new ConstraintError(
        `Não é possível deletar: registro está sendo referenciado`,
        'foreign_key_constraint',
        { originalError: error.message }
      );
    }

    // Erro genérico de banco de dados
    return new DatabaseError(
      `Erro de banco de dados em ${context}: ${error.message}`,
      error
    );
  }

  /**
   * Wrapper para executar operações de banco com tratamento de erro
   */
  static async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw ErrorHandler.handleDatabaseError(error, context);
    }
  }

  /**
   * Valida se um resultado existe, senão lança NotFoundError
   */
  static validateExists<T>(result: T | null | undefined, resource: string, id?: string): T {
    if (!result) {
      throw new NotFoundError(resource, id);
    }
    return result;
  }

  /**
   * Valida parâmetros obrigatórios
   */
  static validateRequired(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new ValidationError(`Campo '${fieldName}' é obrigatório`, fieldName);
    }
  }

  /**
   * Valida formato de ID
   */
  static validateId(id: string, fieldName: string = 'id'): void {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new ValidationError(`ID inválido`, fieldName, { value: id });
    }
  }
}

/**
 * Decorator para tratamento automático de erros em métodos de storage
 */
export function handleStorageErrors(context: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await method.apply(this, args);
      } catch (error) {
        if (error instanceof StorageError) {
          throw error;
        }
        throw ErrorHandler.handleDatabaseError(error, `${context}.${propertyName}`);
      }
    };

    return descriptor;
  };
}