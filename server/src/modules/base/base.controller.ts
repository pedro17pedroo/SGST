import { Request, Response } from 'express';
import { z } from 'zod';

/**
 * Interface para resposta padronizada da API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Interface para parâmetros de paginação
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Schema de validação para paginação
 */
export const paginationSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10)
}).refine(data => {
  return data.page >= 1 && data.limit >= 1 && data.limit <= 10000;
}, {
  message: "Page deve ser >= 1 e limit deve estar entre 1 e 10000"
});

/**
 * Classe base abstrata para controllers
 * Fornece métodos comuns para tratamento de erros, validação e respostas padronizadas
 */
export abstract class BaseController {
  /**
   * Método para enviar resposta de sucesso padronizada
   */
  protected sendSuccess<T>(
    res: Response, 
    data: T, 
    message: string = 'Operação realizada com sucesso',
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Método para enviar resposta de sucesso com paginação
   */
  protected sendSuccessWithPagination<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message: string = 'Dados carregados com sucesso'
  ): Response {
    const response: ApiResponse<T[]> = {
      success: true,
      message,
      data,
      pagination: {
        ...pagination,
        hasNextPage: pagination.page < pagination.totalPages,
        hasPreviousPage: pagination.page > 1
      }
    };
    return res.status(200).json(response);
  }

  /**
   * Método para enviar resposta de erro padronizada
   */
  protected sendError(
    res: Response,
    message: string,
    error?: string,
    statusCode: number = 500
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Método para tratar erros de validação do Zod
   */
  protected handleValidationError(res: Response, error: z.ZodError): Response {
    const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    return this.sendError(res, 'Dados inválidos', errorMessages, 400);
  }

  /**
   * Método para validar parâmetros de paginação
   */
  protected validatePagination(req: Request): PaginationParams {
    const result = paginationSchema.safeParse(req.query);
    if (!result.success) {
      throw new Error('Parâmetros de paginação inválidos');
    }
    return result.data;
  }

  /**
   * Método para tratar erros de forma consistente
   */
  protected handleError(res: Response, error: unknown, defaultMessage: string): Response {
    console.error(`${defaultMessage}:`, error);
    
    if (error instanceof z.ZodError) {
      return this.handleValidationError(res, error);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return this.sendError(res, defaultMessage, errorMessage);
  }

  /**
   * Método para validar ID nos parâmetros da URL
   */
  protected validateId(req: Request, paramName: string = 'id'): string {
    const id = req.params[paramName];
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error(`${paramName} é obrigatório e deve ser uma string válida`);
    }
    return id.trim();
  }

  /**
   * Método para validar dados do corpo da requisição com schema Zod
   */
  protected validateBody<T>(req: Request, schema: z.ZodSchema<T>): T {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  }

  /**
   * Método para verificar se um recurso existe
   */
  protected ensureResourceExists<T>(resource: T | null | undefined, resourceName: string): T {
    if (!resource) {
      throw new Error(`${resourceName} não encontrado`);
    }
    return resource;
  }
}