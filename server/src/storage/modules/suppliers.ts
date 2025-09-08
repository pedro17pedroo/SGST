import { db } from "../../../database/db";
import { eq } from "drizzle-orm";
import { suppliers, type Supplier, type InsertSupplier } from "../../../../shared/schema";

export class SupplierStorage {
  /**
   * Buscar todos os fornecedores
   */
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const result = await db.select().from(suppliers);
      return result as Supplier[];
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return [];
    }
  }

  /**
   * Buscar fornecedor por ID
   */
  async getSupplier(id: string): Promise<Supplier | null> {
    try {
      const result = await db.select().from(suppliers).where(eq(suppliers.id, id));
      return (result[0] as Supplier) || null;
    } catch (error) {
      console.error('Erro ao buscar fornecedor:', error);
      return null;
    }
  }

  /**
   * Buscar fornecedor por nome
   */
  async getSupplierByName(name: string): Promise<Supplier | null> {
    try {
      const result = await db.select().from(suppliers).where(eq(suppliers.name, name));
      return (result[0] as Supplier) || null;
    } catch (error) {
      console.error('Erro ao buscar fornecedor por nome:', error);
      return null;
    }
  }

  /**
   * Buscar fornecedor por email
   */
  async getSupplierByEmail(email: string): Promise<Supplier | null> {
    try {
      const result = await db.select().from(suppliers).where(eq(suppliers.email, email));
      return (result[0] as Supplier) || null;
    } catch (error) {
      console.error('Erro ao buscar fornecedor por email:', error);
      return null;
    }
  }

  /**
   * Criar novo fornecedor
   */
  async createSupplier(data: InsertSupplier): Promise<Supplier> {
    try {
      await db.insert(suppliers).values(data);
      // Como o ID é gerado automaticamente pelo UUID(), vamos buscar pelo nome que deve ser único
      const result = await db.select().from(suppliers).where(eq(suppliers.name, data.name));
      return result[0] as Supplier;
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      throw new Error('Falha ao criar fornecedor');
    }
  }

  /**
   * Atualizar fornecedor
   */
  async updateSupplier(id: string, data: Partial<InsertSupplier>): Promise<Supplier | null> {
    try {
      await db.update(suppliers)
        .set(data)
        .where(eq(suppliers.id, id));
      const result = await db.select().from(suppliers).where(eq(suppliers.id, id));
      return (result[0] as Supplier) || null;
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      throw new Error('Falha ao atualizar fornecedor');
    }
  }

  /**
   * Eliminar fornecedor
   */
  async deleteSupplier(id: string): Promise<void> {
    try {
      await db.delete(suppliers).where(eq(suppliers.id, id));
    } catch (error) {
      console.error('Erro ao eliminar fornecedor:', error);
      throw new Error('Falha ao eliminar fornecedor');
    }
  }

  /**
   * Verificar se fornecedor existe
   */
  async supplierExists(id: string): Promise<boolean> {
    try {
      const result = await db.select({ id: suppliers.id }).from(suppliers).where(eq(suppliers.id, id));
      return result.length > 0;
    } catch (error) {
      console.error('Erro ao verificar existência do fornecedor:', error);
      return false;
    }
  }
}