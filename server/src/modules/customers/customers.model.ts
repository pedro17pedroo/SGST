import { db } from '../../../database/db';
import { customers, type Customer, type InsertCustomer } from '@shared/schema';
import { eq, and, or, like, desc, sql, count } from 'drizzle-orm';

export class CustomerModel {
  static async getCustomers(): Promise<Customer[]> {
    const results = await db.select().from(customers).orderBy(desc(customers.createdAt));
    return results as Customer[];
  }

  static async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id));
    return result[0] as Customer | undefined;
  }

  static async getCustomerByNumber(customerNumber: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.customerNumber, customerNumber));
    return result[0] as Customer | undefined;
  }

  static async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.email, email));
    return result[0] as Customer | undefined;
  }

  static async searchCustomers(query: string): Promise<Customer[]> {
    const results = await db.select()
      .from(customers)
      .where(
        or(
          like(customers.name, `%${query}%`),
          like(customers.email, `%${query}%`),
          like(customers.phone, `%${query}%`),
          like(customers.customerNumber, `%${query}%`)
        )
      )
      .orderBy(desc(customers.createdAt));
    
    return results as Customer[];
  }

  static async getActiveCustomers(): Promise<Customer[]> {
    const results = await db.select()
      .from(customers)
      .where(eq(customers.isActive, true))
      .orderBy(desc(customers.createdAt));
    
    return results as Customer[];
  }

  static async createCustomer(customer: InsertCustomer): Promise<Customer> {
    // Gerar número do cliente automaticamente
    const nextNumber = await this.getNextCustomerNumber();

    await db.insert(customers).values({
      ...customer,
      customerNumber: nextNumber,
      updatedAt: new Date()
    });
    
    const newCustomer = await db.select().from(customers).orderBy(desc(customers.createdAt)).limit(1);
    return newCustomer[0] as Customer;
  }

  static async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    await db.update(customers)
      .set({
        ...customer,
        updatedAt: new Date()
      })
      .where(eq(customers.id, id));
    
    const updatedCustomer = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return updatedCustomer[0] as Customer;
  }

  static async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  static async deactivateCustomer(id: string): Promise<Customer> {
    await db.update(customers)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(customers.id, id));
    
    const deactivatedCustomer = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return deactivatedCustomer[0] as Customer;
  }

  static async activateCustomer(id: string): Promise<Customer> {
    await db.update(customers)
      .set({ 
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(customers.id, id));
    
    const activatedCustomer = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return activatedCustomer[0] as Customer;
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

  static async getTopCustomers(limit = 10): Promise<Customer[]> {
    // This would require joining with orders table to get purchase amounts
    // For now, return most recent customers
    const results = await db.select()
      .from(customers)
      .where(eq(customers.isActive, true))
      .orderBy(desc(customers.createdAt))
      .limit(limit);
    
    return results as Customer[];
  }

  private static async getNextCustomerNumber(): Promise<string> {
    // Buscar todos os clientes para processar os números localmente
    const result = await db.select({
      customerNumber: customers.customerNumber
    }).from(customers);
    
    // Extrair os números e encontrar o maior
    let maxNumber = 0;
    for (const customer of result) {
      // Verificar se o número segue o padrão CL + dígitos
      const match = customer.customerNumber.match(/^CL(\d+)$/);
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    }
    
    // Gerar o próximo número
    const nextNumber = (maxNumber + 1).toString().padStart(6, '0');
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