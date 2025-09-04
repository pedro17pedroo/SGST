import { db } from './database/db.js';
import { sql } from 'drizzle-orm';

async function checkDatabase() {
  try {
    console.log('Verificando dados no banco...');
    
    // Verificar suppliers
    const suppliersCount = await db.execute(sql`SELECT COUNT(*) as count FROM suppliers`);
    console.log('Suppliers count:', suppliersCount[0]);
    
    // Verificar users
    const usersCount = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    console.log('Users count:', usersCount[0]);
    
    // Verificar orders com supplier_id
    const ordersWithSupplier = await db.execute(sql`SELECT COUNT(*) as count FROM orders WHERE supplier_id IS NOT NULL`);
    console.log('Orders with supplier_id:', ordersWithSupplier[0]);
    
    // Verificar orders com user_id
    const ordersWithUser = await db.execute(sql`SELECT COUNT(*) as count FROM orders WHERE user_id IS NOT NULL`);
    console.log('Orders with user_id:', ordersWithUser[0]);
    
    // Verificar algumas orders específicas
    const sampleOrders = await db.execute(sql`SELECT id, order_number, supplier_id, user_id FROM orders LIMIT 3`);
    console.log('Sample orders:', sampleOrders);
    
    // Verificar alguns suppliers
    const sampleSuppliers = await db.execute(sql`SELECT id, name FROM suppliers LIMIT 3`);
    console.log('Sample suppliers:', sampleSuppliers);
    
    // Verificar alguns users
    const sampleUsers = await db.execute(sql`SELECT id, username FROM users LIMIT 3`);
    console.log('Sample users:', sampleUsers);
    
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

checkDatabase();