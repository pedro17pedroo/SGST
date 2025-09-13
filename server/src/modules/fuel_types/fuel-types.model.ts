import { db } from '../../../database/db';
import { sql, eq, desc, count, like, and, or, asc } from 'drizzle-orm';
import { fuelTypes } from '@shared/schema';
import type { FuelType, InsertFuelType, UpdateFuelType } from '@shared/schema';

// Interface para filtros de tipos de combustível
export interface FuelTypeFilters {
  search?: string;
  unit?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'unit' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Interface para resposta com paginação
export interface FuelTypesWithPagination {
  fuelTypes: FuelType[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class FuelTypesModel {
  /**
   * Buscar todos os tipos de combustível com filtros e paginação
   */
  async getFuelTypes(
    page: number = 1,
    limit: number = 10,
    filters: FuelTypeFilters = {}
  ): Promise<FuelTypesWithPagination> {
    const offset = (page - 1) * limit;
    const { search, unit, isActive, sortBy = 'name', sortOrder = 'asc' } = filters;

    // Construir condições WHERE
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          like(fuelTypes.name, `%${search}%`),
          like(fuelTypes.description, `%${search}%`)
        )
      );
    }

    if (unit) {
      whereConditions.push(eq(fuelTypes.unit, unit));
    }

    if (typeof isActive === 'boolean') {
      whereConditions.push(eq(fuelTypes.isActive, isActive));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Definir ordenação
    let orderByColumn;
    switch (sortBy) {
      case 'name':
        orderByColumn = fuelTypes.name;
        break;
      case 'unit':
        orderByColumn = fuelTypes.unit;
        break;
      case 'created_at':
        orderByColumn = fuelTypes.createdAt;
        break;
      default:
        orderByColumn = fuelTypes.name;
    }
    
    const orderBy = sortOrder === 'desc' ? desc(orderByColumn) : asc(orderByColumn);

    // Buscar dados com paginação
    const [data, totalCountResult] = await Promise.all([
      db.select()
        .from(fuelTypes)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db.select({ count: count() })
        .from(fuelTypes)
        .where(whereClause)
    ]);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      fuelTypes: data,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }

  /**
   * Buscar tipo de combustível por ID
   */
  async getFuelTypeById(id: string): Promise<FuelType | null> {
    const result = await db.select()
      .from(fuelTypes)
      .where(eq(fuelTypes.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  /**
   * Criar novo tipo de combustível
   */
  async createFuelType(fuelTypeData: InsertFuelType): Promise<FuelType> {
    await db.insert(fuelTypes)
      .values(fuelTypeData);
    
    // Buscar o registro criado pelo nome (que deve ser único)
    const result = await db.select()
      .from(fuelTypes)
      .where(eq(fuelTypes.name, fuelTypeData.name))
      .limit(1);
    
    if (!result[0]) {
      throw new Error('Erro ao criar tipo de combustível');
    }
    
    return result[0];
  }

  /**
   * Atualizar tipo de combustível
   */
  async updateFuelType(id: string, fuelTypeData: UpdateFuelType): Promise<FuelType | null> {
    await db.update(fuelTypes)
      .set({ ...fuelTypeData, updatedAt: new Date() })
      .where(eq(fuelTypes.id, id));
    
    // Buscar o registro atualizado
    const result = await db.select()
      .from(fuelTypes)
      .where(eq(fuelTypes.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  /**
   * Excluir tipo de combustível
   */
  async deleteFuelType(id: string): Promise<boolean> {
    try {
      await db.delete(fuelTypes)
        .where(eq(fuelTypes.id, id));
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir tipo de combustível:', error);
      return false;
    }
  }

  /**
   * Buscar tipos de combustível ativos
   */
  async getActiveFuelTypes(): Promise<FuelType[]> {
    return await db.select()
      .from(fuelTypes)
      .where(eq(fuelTypes.isActive, true))
      .orderBy(asc(fuelTypes.name));
  }

  /**
   * Verificar se nome é único
   */
  async isNameUnique(name: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(fuelTypes.name, name)];
    
    if (excludeId) {
      conditions.push(sql`${fuelTypes.id} != ${excludeId}`);
    }

    const result = await db.select({ count: count() })
      .from(fuelTypes)
      .where(and(...conditions));
    
    return (result[0]?.count || 0) === 0;
  }

  /**
   * Buscar unidades únicas
   */
  async getUnits(): Promise<string[]> {
    const result = await db.selectDistinct({ unit: fuelTypes.unit })
      .from(fuelTypes)
      .where(and(
        sql`${fuelTypes.unit} IS NOT NULL`,
        sql`${fuelTypes.unit} != ''`
      ))
      .orderBy(asc(fuelTypes.unit));
    
    return result.map(r => r.unit).filter(Boolean);
  }
}