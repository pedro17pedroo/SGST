import { db } from "../../database/db";
import { eq, desc, sql, SQL, like, and, or, asc, count } from "drizzle-orm";
import type { MySqlTable } from "drizzle-orm/mysql-core";
import type { MySqlColumn } from "drizzle-orm/mysql-core";
import { randomUUID } from 'crypto';

/**
 * Utilitário básico para buscar o último registro
 */
export async function getLastInserted<T>(
  table: MySqlTable,
  idField: MySqlColumn
): Promise<T | null> {
  const result = await db.select().from(table)
    .orderBy(desc(idField))
    .limit(1);
  return result[0] as T || null;
}

/**
 * Utility function to handle MySQL-compatible updates without .returning()
 * Returns the updated record by fetching it after the update
 */
export async function updateAndReturn<T>(
  table: MySqlTable,
  id: string,
  updateData: Record<string, unknown>,
  idField: MySqlColumn
): Promise<T | null> {
  await db.update(table).set(updateData).where(eq(idField, id));
  const result = await db.select().from(table).where(eq(idField, id)).limit(1);
  return result[0] as T || null;
}

/**
 * Utility function to create a record and return it
 * This replaces the pattern of insert + returning for MySQL compatibility
 */
export async function insertAndReturn<T>(
  table: MySqlTable,
  insertData: Record<string, unknown>,
  idField: MySqlColumn,
  id: string
): Promise<T | null> {
  await db.insert(table).values(insertData);
  const result = await db.select().from(table).where(eq(idField, id)).limit(1);
  return result[0] as T || null;
}

/**
 * Utility function to safely delete a record
 */
export async function safeDelete(
  table: MySqlTable,
  id: string,
  idField: MySqlColumn
): Promise<void> {
  await db.delete(table).where(eq(idField, id));
}

/**
 * Utility function to check if a record exists
 */
export async function recordExists(
  table: MySqlTable,
  condition: SQL
): Promise<boolean> {
  const result = await db.select({ count: sql`count(*)` }).from(table).where(condition);
  return Number(result[0].count) > 0;
}

/**
 * Utility function to get a single record by condition
 */
export async function getSingleRecord<T>(
  table: MySqlTable,
  condition: SQL
): Promise<T | null> {
  const result = await db.select().from(table).where(condition).limit(1);
  return result[0] as T || null;
}

/**
 * Utilitário básico para buscar múltiplos registros
 */
export async function getMultipleRecords<T>(
  table: MySqlTable
): Promise<T[]> {
  const result = await db.select().from(table);
  return result as T[];
}

/**
 * Padrão CRUD genérico para operações básicas
 */
export class CRUDOperations<T, InsertT> {
  constructor(
    private table: MySqlTable,
    private idField: MySqlColumn,
    private nameField?: MySqlColumn
  ) {}

  /**
   * Buscar todos os registros
   */
  async findAll(): Promise<T[]> {
    const result = await db.select().from(this.table);
    return result as T[];
  }

  /**
   * Buscar registro por ID
   */
  async findById(id: string): Promise<T | null> {
    const result = await db.select().from(this.table)
      .where(eq(this.idField, id))
      .limit(1);
    return (result[0] as T) || null;
  }

  /**
   * Buscar registro por nome (se nameField estiver definido)
   */
  async findByName(name: string): Promise<T | null> {
    if (!this.nameField) {
      throw new Error('Campo de nome não definido para esta tabela');
    }
    
    const result = await db.select().from(this.table)
      .where(eq(this.nameField, name))
      .limit(1);
    return (result[0] as T) || null;
  }

  /**
   * Criar novo registro
   */
  async create(data: InsertT & { id?: string }): Promise<T | null> {
    const id = data.id || randomUUID();
    const insertData = {
      ...data,
      id,
      createdAt: new Date()
    };
    
    await db.insert(this.table).values(insertData);
    return this.findById(id);
  }

  /**
   * Atualizar registro existente
   */
  async update(id: string, data: Partial<InsertT>): Promise<T | null> {
    if (Object.keys(data).length === 0) {
      return this.findById(id);
    }
    
    await db.update(this.table)
      .set(data)
      .where(eq(this.idField, id));
    
    return this.findById(id);
  }

  /**
   * Deletar registro
   */
  async delete(id: string): Promise<void> {
    await db.delete(this.table)
      .where(eq(this.idField, id));
  }

  /**
   * Busca com paginação
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    orderBy?: MySqlColumn
  ): Promise<{ data: T[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    
    // Contar total de registros
    const totalResult = await db.select({ count: count() })
      .from(this.table);
    const total = Number(totalResult[0].count);
    
    // Buscar dados paginados
    const data = await db.select().from(this.table)
      .limit(limit)
      .offset(offset) as T[];
    
    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
}

/**
 * Utilitário básico para busca de texto
 */
export async function searchInFields<T>(
  table: MySqlTable,
  searchTerm: string,
  fields: MySqlColumn[]
): Promise<T[]> {
  const searchConditions = fields.map(field => 
    like(field, `%${searchTerm}%`)
  );
  
  const result = await db.select().from(table)
    .where(or(...searchConditions));
  
  return result as T[];
}

/**
 * Utilitário para validação de dados
 */
export class DataValidator {
  static validateRequired(value: any, fieldName: string): void {
    if (value === undefined || value === null || value === '') {
      throw new Error(`Campo obrigatório: ${fieldName}`);
    }
  }

  static validateId(id: string): void {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('ID inválido');
    }
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePositiveNumber(value: number, fieldName: string): void {
    if (typeof value !== 'number' || value <= 0) {
      throw new Error(`${fieldName} deve ser um número positivo`);
    }
  }

  static sanitizeString(value: string): string {
    return value.trim().replace(/[<>"'&]/g, '');
  }
}

/**
 * Utilitário básico para contagem de registros
 */
export class StorageUtils {
  static async countRecords(
    table: MySqlTable
  ): Promise<number> {
    const result = await db.select({ count: count() }).from(table);
    return Number(result[0].count);
  }

  static generateId(): string {
    return randomUUID();
  }

  static formatTimestamp(date: Date): string {
    return date.toISOString();
  }
}