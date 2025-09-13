import { db } from '../../../database/db';
import { sql, eq, desc, count, like, and, or, asc } from 'drizzle-orm';
import { vehicleTypes } from '@shared/schema';
import type { VehicleType, InsertVehicleType, UpdateVehicleType } from '@shared/schema';

// Interface para filtros de tipos de veículo
export interface VehicleTypeFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'category' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Interface para resposta com paginação
export interface VehicleTypesWithPagination {
  vehicleTypes: VehicleType[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class VehicleTypesModel {
  /**
   * Buscar todos os tipos de veículo com filtros e paginação
   */
  async getVehicleTypes(
    page: number = 1,
    limit: number = 10,
    filters: VehicleTypeFilters = {}
  ): Promise<VehicleTypesWithPagination> {
    const offset = (page - 1) * limit;
    const { search, category, isActive, sortBy = 'name', sortOrder = 'asc' } = filters;

    // Construir condições WHERE
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          like(vehicleTypes.name, `%${search}%`),
          like(vehicleTypes.description, `%${search}%`)
        )
      );
    }

    if (category) {
      whereConditions.push(eq(vehicleTypes.category, category));
    }

    if (typeof isActive === 'boolean') {
      whereConditions.push(eq(vehicleTypes.isActive, isActive));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Definir ordenação
    let orderByColumn;
    switch (sortBy) {
      case 'name':
        orderByColumn = vehicleTypes.name;
        break;
      case 'category':
        orderByColumn = vehicleTypes.category;
        break;
      case 'created_at':
        orderByColumn = vehicleTypes.createdAt;
        break;
      default:
        orderByColumn = vehicleTypes.name;
    }
    
    const orderBy = sortOrder === 'desc' ? desc(orderByColumn) : asc(orderByColumn);

    // Buscar dados com paginação
    const [data, totalCountResult] = await Promise.all([
      db.select()
        .from(vehicleTypes)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db.select({ count: count() })
        .from(vehicleTypes)
        .where(whereClause)
    ]);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      vehicleTypes: data,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }

  /**
   * Buscar tipo de veículo por ID
   */
  async getVehicleTypeById(id: string): Promise<VehicleType | null> {
    const result = await db.select()
      .from(vehicleTypes)
      .where(eq(vehicleTypes.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  /**
   * Criar novo tipo de veículo
   */
  async createVehicleType(vehicleTypeData: InsertVehicleType): Promise<VehicleType> {
    await db.insert(vehicleTypes)
      .values(vehicleTypeData);
    
    // Buscar o registro criado pelo nome (que deve ser único)
    const result = await db.select()
      .from(vehicleTypes)
      .where(eq(vehicleTypes.name, vehicleTypeData.name))
      .limit(1);
    
    if (!result[0]) {
      throw new Error('Erro ao criar tipo de veículo');
    }
    
    return result[0];
  }

  /**
   * Atualizar tipo de veículo
   */
  async updateVehicleType(id: string, vehicleTypeData: UpdateVehicleType): Promise<VehicleType | null> {
    await db.update(vehicleTypes)
      .set({ ...vehicleTypeData, updatedAt: new Date() })
      .where(eq(vehicleTypes.id, id));
    
    // Buscar o registro atualizado
    const result = await db.select()
      .from(vehicleTypes)
      .where(eq(vehicleTypes.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  /**
   * Excluir tipo de veículo
   */
  async deleteVehicleType(id: string): Promise<boolean> {
    try {
      await db.delete(vehicleTypes)
        .where(eq(vehicleTypes.id, id));
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir tipo de veículo:', error);
      return false;
    }
  }

  /**
   * Buscar tipos de veículo ativos
   */
  async getActiveVehicleTypes(): Promise<VehicleType[]> {
    return await db.select()
      .from(vehicleTypes)
      .where(eq(vehicleTypes.isActive, true))
      .orderBy(asc(vehicleTypes.name));
  }

  /**
   * Verificar se nome é único
   */
  async isNameUnique(name: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(vehicleTypes.name, name)];
    
    if (excludeId) {
      conditions.push(sql`${vehicleTypes.id} != ${excludeId}`);
    }

    const result = await db.select({ count: count() })
      .from(vehicleTypes)
      .where(and(...conditions));
    
    return (result[0]?.count || 0) === 0;
  }

  /**
   * Buscar categorias únicas
   */
  async getCategories(): Promise<string[]> {
    const result = await db.selectDistinct({ category: vehicleTypes.category })
      .from(vehicleTypes)
      .where(and(
        sql`${vehicleTypes.category} IS NOT NULL`,
        sql`${vehicleTypes.category} != ''`
      ))
      .orderBy(asc(vehicleTypes.category));
    
    return result.map(r => r.category).filter(Boolean);
  }
}