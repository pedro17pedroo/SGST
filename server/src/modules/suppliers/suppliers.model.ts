import { db } from "../../../database/db";
import { sql, eq, desc, count, like, and, or, asc } from "drizzle-orm";
import { suppliers } from "@shared/schema";
import type { Supplier, InsertSupplier } from "@shared/schema";

// Definição da tabela suppliers usando SQL raw para evitar conflitos de tipagem
const SUPPLIERS_TABLE = 'suppliers';

// Interface para filtros de fornecedores
export interface SupplierFilters {
  search?: string;
  email?: string;
  phone?: string;
  sortBy?: 'name' | 'email' | 'phone' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Interface para resposta com paginação
export interface SuppliersWithPagination {
  suppliers: Supplier[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class SuppliersModel {
  async getSuppliersWithFilters(
    page: number = 1,
    limit: number = 10,
    filters: SupplierFilters = {}
  ): Promise<SuppliersWithPagination> {
    try {
      const offset = (page - 1) * limit;
      
      // Build where conditions using Drizzle ORM
      const whereConditions = [];
      
      if (filters.search) {
        whereConditions.push(
          or(
            like(suppliers.name, `%${filters.search}%`),
            like(suppliers.email, `%${filters.search}%`)
          )
        );
      }
      
      if (filters.email) {
        whereConditions.push(like(suppliers.email, `%${filters.email}%`));
      }
      
      if (filters.phone) {
        whereConditions.push(like(suppliers.phone, `%${filters.phone}%`));
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Build order by
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';
      
      let orderByClause;
      switch (sortBy) {
        case 'name':
          orderByClause = sortOrder === 'asc' ? asc(suppliers.name) : desc(suppliers.name);
          break;
        case 'email':
          orderByClause = sortOrder === 'asc' ? asc(suppliers.email) : desc(suppliers.email);
          break;
        case 'phone':
          orderByClause = sortOrder === 'asc' ? asc(suppliers.phone) : desc(suppliers.phone);
          break;
        default:
          orderByClause = sortOrder === 'asc' ? asc(suppliers.createdAt) : desc(suppliers.createdAt);
      }

      // Get total count
      const countResult = await db
        .select({ count: count() })
        .from(suppliers)
        .where(whereClause);
      
      const totalCount = countResult[0]?.count || 0;

      // Get suppliers data
      const suppliersData = await db
        .select()
        .from(suppliers)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);

      const totalPages = Math.ceil(totalCount / limit);
      
      return {
        suppliers: suppliersData.map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          address: row.address,
          createdAt: row.createdAt
        })),
        totalCount,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      };
    } catch (error) {
      console.error('Error fetching suppliers with filters:', error);
      throw new Error('Failed to fetch suppliers');
    }
  }

  async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      const result = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, id))
        .limit(1);
      
      if (!result || result.length === 0) {
        return null;
      }
      
      const supplier = result[0];
      return {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        createdAt: supplier.createdAt
      };
    } catch (error) {
      console.error('Error fetching supplier by ID:', error);
      throw new Error('Failed to fetch supplier');
    }
  }

  async createSupplier(data: InsertSupplier): Promise<Supplier> {
    try {
      await db
        .insert(suppliers)
        .values({
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null
        });
      
      // Get the most recently created supplier by this name
      const createdSupplier = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.name, data.name))
        .orderBy(desc(suppliers.createdAt))
        .limit(1);
      
      if (!createdSupplier || createdSupplier.length === 0) {
        throw new Error('Failed to retrieve created supplier');
      }
      
      const supplier = createdSupplier[0];
      return {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        createdAt: supplier.createdAt
      };
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw new Error('Failed to create supplier');
    }
  }

  async updateSupplier(id: string, data: Partial<InsertSupplier>): Promise<Supplier | null> {
    try {
      const updateData: Partial<InsertSupplier> = {};
      
      if (data.name !== undefined) {
        updateData.name = data.name;
      }
      if (data.email !== undefined) {
        updateData.email = data.email;
      }
      if (data.phone !== undefined) {
        updateData.phone = data.phone;
      }
      if (data.address !== undefined) {
        updateData.address = data.address;
      }
      
      if (Object.keys(updateData).length === 0) {
        return this.getSupplierById(id);
      }
      
      await db
        .update(suppliers)
        .set(updateData)
        .where(eq(suppliers.id, id));
      
      // Return the updated supplier
      return this.getSupplierById(id);
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw new Error('Failed to update supplier');
    }
  }

  async deleteSupplier(id: string): Promise<Supplier | null> {
    try {
      // Get the supplier before deleting
      const supplierToDelete = await this.getSupplierById(id);
      
      if (!supplierToDelete) {
        return null;
      }
      
      await db
        .delete(suppliers)
        .where(eq(suppliers.id, id));
      
      return supplierToDelete;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw new Error('Failed to delete supplier');
    }
  }
}