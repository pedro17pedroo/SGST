import { db } from '../../db';
import { customers, type Customer, type InsertCustomer } from '../../../shared/schema';
import { eq, and, or, ilike, desc, sql, count } from 'drizzle-orm';

export class CustomerModel {
  static async getCustomers(): Promise<Customer[]> {
    const results = await db.select().from(customers).orderBy(desc(customers.createdAt));
    return results;
  }

  static async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id));
    return result[0];
  }

  static async getCustomerByNumber(customerNumber: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.customerNumber, customerNumber));
    return result[0];
  }

  static async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.email, email));
    return result[0];
  }

  static async searchCustomers(query: string): Promise<Customer[]> {
    const results = await db.select()
      .from(customers)
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
          ilike(customers.phone, `%${query}%`),
          ilike(customers.customerNumber, `%${query}%`)
        )
      )
      .orderBy(desc(customers.createdAt));
    
    return results;
  }

  static async getActiveCustomers(): Promise<Customer[]> {
    const results = await db.select()
      .from(customers)
      .where(eq(customers.isActive, true))
      .orderBy(desc(customers.createdAt));
    
    return results;
  }

  static async createCustomer(customer: InsertCustomer): Promise<Customer> {
    // Gerar número do cliente automaticamente se não fornecido
    if (!customer.customerNumber) {
      const nextNumber = await this.getNextCustomerNumber();
      customer.customerNumber = nextNumber;
    }

    const [newCustomer] = await db.insert(customers).values({
      ...customer,
      updatedAt: new Date()
    }).returning();
    
    return newCustomer;
  }

  static async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db.update(customers)
      .set({
        ...customer,
        updatedAt: new Date()
      })
      .where(eq(customers.id, id))
      .returning();
    
    return updatedCustomer;
  }

  static async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  static async deactivateCustomer(id: string): Promise<Customer> {
    const [deactivatedCustomer] = await db.update(customers)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(customers.id, id))
      .returning();
    
    return deactivatedCustomer;
  }

  static async activateCustomer(id: string): Promise<Customer> {
    const [activatedCustomer] = await db.update(customers)
      .set({ 
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(customers.id, id))
      .returning();
    
    return activatedCustomer;
  }

  static async getCustomerStats() {
    const totalCustomers = await db.select({ count: count() }).from(customers);
    const activeCustomers = await db.select({ count: count() }).from(customers).where(eq(customers.isActive, true));
    const inactiveCustomers = await db.select({ count: count() }).from(customers).where(eq(customers.isActive, false));
    
    // Clientes por tipo
    const individualCustomers = await db.select({ count: count() }).from(customers).where(eq(customers.customerType, 'individual'));
    const companyCustomers = await db.select({ count: count() }).from(customers).where(eq(customers.customerType, 'company'));

    return {
      total: totalCustomers[0].count,
      active: activeCustomers[0].count,
      inactive: inactiveCustomers[0].count,
      individual: individualCustomers[0].count,
      company: companyCustomers[0].count
    };
  }

  static async getTopCustomers(limit = 10) {
    // This would require joining with orders table to get purchase amounts
    // For now, return most recent customers
    const results = await db.select()
      .from(customers)
      .where(eq(customers.isActive, true))
      .orderBy(desc(customers.createdAt))
      .limit(limit);
    
    return results;
  }

  private static async getNextCustomerNumber(): Promise<string> {
    const result = await db.select({
      lastNumber: sql<string>`COALESCE(MAX(CAST(SUBSTRING(${customers.customerNumber} FROM '^CL([0-9]+)$') AS INTEGER)), 0)`
    }).from(customers);
    
    const nextNumber = (parseInt(result[0].lastNumber || '0') + 1).toString().padStart(6, '0');
    return `CL${nextNumber}`;
  }

  static async checkCustomerNumberExists(customerNumber: string): Promise<boolean> {
    const result = await db.select({ count: count() })
      .from(customers)
      .where(eq(customers.customerNumber, customerNumber));
    
    return result[0].count > 0;
  }

  static async checkEmailExists(email: string, excludeId?: string): Promise<boolean> {
    if (excludeId) {
      const result = await db.select({ count: count() })
        .from(customers)
        .where(and(eq(customers.email, email), sql`${customers.id} != ${excludeId}`));
      return result[0].count > 0;
    } else {
      const result = await db.select({ count: count() })
        .from(customers)
        .where(eq(customers.email, email));
      return result[0].count > 0;
    }
  }
}