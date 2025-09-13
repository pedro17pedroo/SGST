import { db } from '../../../database/db';
import { sql, eq, desc, count, like, and, or, asc } from 'drizzle-orm';
import { carriers } from '@shared/schema';
import type { Carrier, InsertCarrier, UpdateCarrier } from '@shared/schema';

// Interface para filtros de transportadoras
export interface CarrierFilters {
  search?: string;
  type?: 'internal' | 'external' | 'all';
  status?: 'active' | 'inactive' | 'all';
  isActive?: boolean;
  sortBy?: 'name' | 'code' | 'type' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Interface para resposta com paginação
export interface CarriersWithPagination {
  carriers: Carrier[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class CarriersModel {
  /**
   * Buscar todas as transportadoras com filtros e paginação
   */
  async getCarriers(
    page: number = 1,
    limit: number = 10,
    filters: CarrierFilters = {}
  ): Promise<CarriersWithPagination> {
    const offset = (page - 1) * limit;
    const { search, type, isActive, sortBy = 'name', sortOrder = 'asc' } = filters;

    // Construir condições WHERE
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          like(carriers.name, `%${search}%`),
          like(carriers.code, `%${search}%`),
          like(carriers.email, `%${search}%`)
        )
      );
    }

    if (type) {
      whereConditions.push(eq(carriers.type, type));
    }

    if (typeof isActive === 'boolean') {
      whereConditions.push(eq(carriers.isActive, isActive));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Definir ordenação
    let orderByClause;
    switch (sortBy) {
      case 'name':
        orderByClause = sortOrder === 'desc' ? desc(carriers.name) : asc(carriers.name);
        break;
      case 'code':
        orderByClause = sortOrder === 'desc' ? desc(carriers.code) : asc(carriers.code);
        break;
      case 'type':
        orderByClause = sortOrder === 'desc' ? desc(carriers.type) : asc(carriers.type);
        break;
      case 'created_at':
        orderByClause = sortOrder === 'desc' ? desc(carriers.createdAt) : asc(carriers.createdAt);
        break;
      default:
        orderByClause = asc(carriers.name);
    }

    // Buscar transportadoras
    const carriersResult = await db
      .select()
      .from(carriers)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Contar total de registros
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(carriers)
      .where(whereClause);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      carriers: carriersResult,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Buscar transportadora por ID
   */
  async getCarrierById(id: string): Promise<Carrier | null> {
    const [carrier] = await db
      .select()
      .from(carriers)
      .where(eq(carriers.id, id))
      .limit(1);

    return carrier || null;
  }

  /**
   * Buscar transportadora por código
   */
  async getCarrierByCode(code: string): Promise<Carrier | null> {
    const [carrier] = await db
      .select()
      .from(carriers)
      .where(eq(carriers.code, code))
      .limit(1);

    return carrier || null;
  }

  /**
   * Criar nova transportadora
   */
  async createCarrier(carrierData: InsertCarrier): Promise<Carrier> {
    const result = await db
      .insert(carriers)
      .values(carrierData);

    // Buscar a transportadora criada pelo código único
    const carrier = await this.getCarrierByCode(carrierData.code);
    if (!carrier) {
      throw new Error('Erro ao criar transportadora');
    }

    return carrier;
  }

  /**
   * Atualizar transportadora
   */
  async updateCarrier(id: string, carrierData: UpdateCarrier): Promise<Carrier | null> {
    await db
      .update(carriers)
      .set({ ...carrierData, updatedAt: new Date() })
      .where(eq(carriers.id, id));

    return this.getCarrierById(id);
  }

  /**
   * Deletar transportadora
   */
  async deleteCarrier(id: string): Promise<boolean> {
    try {
      await db
        .delete(carriers)
        .where(eq(carriers.id, id));
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verificar se código da transportadora já existe
   */
  async isCodeUnique(code: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(carriers.code, code)];
    
    if (excludeId) {
      conditions.push(sql`${carriers.id} != ${excludeId}`);
    }

    const [existing] = await db
      .select({ id: carriers.id })
      .from(carriers)
      .where(and(...conditions))
      .limit(1);

    return !existing;
  }

  /**
   * Buscar transportadoras ativas para seleção
   */
  async getActiveCarriers(): Promise<Carrier[]> {
    return await db
      .select()
      .from(carriers)
      .where(eq(carriers.isActive, true))
      .orderBy(asc(carriers.name));
  }

  /**
   * Criar transportadora interna padrão se não existir
   */
  async ensureInternalCarrier(): Promise<Carrier> {
    const internalCarrier = await db
      .select()
      .from(carriers)
      .where(and(
        eq(carriers.type, 'internal'),
        eq(carriers.isActive, true)
      ))
      .limit(1);

    if (internalCarrier.length > 0) {
      return internalCarrier[0];
    }

    // Criar transportadora interna
    const carrierData: InsertCarrier = {
      name: 'Transportadora Interna',
      code: 'INTERNAL',
      type: 'internal',
      isActive: true,
      notes: 'Transportadora interna da empresa para envios próprios'
    };

    return await this.createCarrier(carrierData);
  }
}