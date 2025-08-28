import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Initialize database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Users (base table - no dependencies)
    console.log('👥 Creating users...');
    const users = await db.insert(schema.users).values([
      {
        username: 'admin',
        email: 'admin@stocksystem.com',
        password: '$2a$10$hash', // In production, use proper password hashing
        role: 'admin',
        isActive: true
      },
      {
        username: 'manager',
        email: 'manager@stocksystem.com',
        password: '$2a$10$hash',
        role: 'manager',
        isActive: true
      },
      {
        username: 'operator1',
        email: 'operator1@stocksystem.com',
        password: '$2a$10$hash',
        role: 'operator',
        isActive: true
      },
      {
        username: 'operator2',
        email: 'operator2@stocksystem.com',
        password: '$2a$10$hash',
        role: 'operator',
        isActive: true
      }
    ]).returning();

    // 2. Categories (base table - no dependencies)
    console.log('📦 Creating categories...');
    const categories = await db.insert(schema.categories).values([
      {
        name: 'Eletrônicos',
        description: 'Produtos eletrônicos e gadgets'
      },
      {
        name: 'Roupas',
        description: 'Vestuário e acessórios'
      },
      {
        name: 'Casa e Jardim',
        description: 'Produtos para casa e jardinagem'
      },
      {
        name: 'Livros',
        description: 'Livros e material educativo'
      },
      {
        name: 'Esportes',
        description: 'Equipamentos e roupas esportivas'
      }
    ]).returning();

    // 3. Suppliers (base table - no dependencies)
    console.log('🏭 Creating suppliers...');
    const suppliers = await db.insert(schema.suppliers).values([
      {
        name: 'TechSupply Lda',
        email: 'fornecedor@techsupply.pt',
        phone: '+351 21 123 4567',
        address: 'Rua da Tecnologia, 123, Lisboa'
      },
      {
        name: 'ModaStyle Portugal',
        email: 'comercial@modastyle.pt',
        phone: '+351 22 987 6543',
        address: 'Avenida da Moda, 456, Porto'
      },
      {
        name: 'CasaConforto',
        email: 'vendas@casaconforto.pt',
        phone: '+351 21 555 7890',
        address: 'Estrada das Casas, 789, Sintra'
      },
      {
        name: 'LivrosPortugal',
        email: 'editora@livrosportugal.pt',
        phone: '+351 21 333 2222',
        address: 'Rua dos Livros, 321, Coimbra'
      }
    ]).returning();

    // 4. Warehouses (base table - no dependencies)
    console.log('🏢 Creating warehouses...');
    const warehouses = await db.insert(schema.warehouses).values([
      {
        name: 'Armazém Principal Lisboa',
        address: 'Zona Industrial de Lisboa, Lote 10',
        isActive: true
      },
      {
        name: 'Armazém Norte Porto',
        address: 'Parque Industrial do Porto, Pavilhão 5',
        isActive: true
      },
      {
        name: 'Armazém Sul Faro',
        address: 'Zona Logística de Faro, Secção B',
        isActive: true
      }
    ]).returning();

    // 5. Products (depends on categories and suppliers)
    console.log('📱 Creating products...');
    const products = await db.insert(schema.products).values([
      // Electronics
      {
        name: 'Smartphone Samsung Galaxy',
        description: 'Smartphone Android com 128GB de armazenamento',
        sku: 'TECH-SM-001',
        barcode: '1234567890123',
        price: '699.99',
        weight: '0.180',
        dimensions: { length: 15.8, width: 7.4, height: 0.79 },
        categoryId: categories.find(c => c.name === 'Eletrônicos')?.id,
        supplierId: suppliers.find(s => s.name === 'TechSupply Lda')?.id,
        minStockLevel: 10,
        isActive: true
      },
      {
        name: 'Laptop Dell Inspiron',
        description: 'Laptop para uso profissional com 16GB RAM',
        sku: 'TECH-LAP-002',
        barcode: '2345678901234',
        price: '899.99',
        weight: '2.100',
        dimensions: { length: 35.6, width: 25.1, height: 2.3 },
        categoryId: categories.find(c => c.name === 'Eletrônicos')?.id,
        supplierId: suppliers.find(s => s.name === 'TechSupply Lda')?.id,
        minStockLevel: 5,
        isActive: true
      },
      // Clothing
      {
        name: 'T-Shirt Básica Algodão',
        description: 'T-shirt 100% algodão, várias cores disponíveis',
        sku: 'CLOTH-TS-003',
        barcode: '3456789012345',
        price: '19.99',
        weight: '0.200',
        dimensions: { length: 30, width: 25, height: 2 },
        categoryId: categories.find(c => c.name === 'Roupas')?.id,
        supplierId: suppliers.find(s => s.name === 'ModaStyle Portugal')?.id,
        minStockLevel: 50,
        isActive: true
      },
      {
        name: 'Calças Jeans Clássicas',
        description: 'Calças jeans azuis, corte regular',
        sku: 'CLOTH-JE-004',
        barcode: '4567890123456',
        price: '59.99',
        weight: '0.650',
        dimensions: { length: 40, width: 35, height: 5 },
        categoryId: categories.find(c => c.name === 'Roupas')?.id,
        supplierId: suppliers.find(s => s.name === 'ModaStyle Portugal')?.id,
        minStockLevel: 25,
        isActive: true
      },
      // Home & Garden
      {
        name: 'Conjunto de Panelas Inox',
        description: 'Conjunto de 5 panelas em aço inoxidável',
        sku: 'HOME-PAN-005',
        barcode: '5678901234567',
        price: '129.99',
        weight: '3.500',
        dimensions: { length: 35, width: 25, height: 20 },
        categoryId: categories.find(c => c.name === 'Casa e Jardim')?.id,
        supplierId: suppliers.find(s => s.name === 'CasaConforto')?.id,
        minStockLevel: 10,
        isActive: true
      },
      // Books
      {
        name: 'Livro: História de Portugal',
        description: 'Livro sobre a história completa de Portugal',
        sku: 'BOOK-HIS-006',
        barcode: '6789012345678',
        price: '24.99',
        weight: '0.450',
        dimensions: { length: 23, width: 15, height: 3 },
        categoryId: categories.find(c => c.name === 'Livros')?.id,
        supplierId: suppliers.find(s => s.name === 'LivrosPortugal')?.id,
        minStockLevel: 20,
        isActive: true
      }
    ]).returning();

    // 6. Inventory (depends on products and warehouses)
    console.log('📊 Creating inventory records...');
    const inventoryRecords = [];
    for (const product of products) {
      for (const warehouse of warehouses) {
        const quantity = Math.floor(Math.random() * 100) + 10; // Random quantity between 10-109
        inventoryRecords.push({
          productId: product.id,
          warehouseId: warehouse.id,
          quantity,
          reservedQuantity: Math.floor(quantity * 0.1) // 10% reserved
        });
      }
    }
    await db.insert(schema.inventory).values(inventoryRecords);

    // 7. Product Locations (depends on products and warehouses)
    console.log('📍 Creating product locations...');
    const productLocations = [];
    const zones = ['A', 'B', 'C'];
    const shelves = ['01', '02', '03', '04', '05'];
    const bins = ['01', '02', '03', '04', '05', '06', '07', '08'];

    for (const product of products) {
      for (const warehouse of warehouses) {
        const zone = zones[Math.floor(Math.random() * zones.length)];
        const shelf = shelves[Math.floor(Math.random() * shelves.length)];
        const bin = bins[Math.floor(Math.random() * bins.length)];
        
        productLocations.push({
          productId: product.id,
          warehouseId: warehouse.id,
          zone,
          shelf: `${zone}${shelf}`,
          bin: `${zone}${shelf}-${bin}`,
          scannedByUserId: users[Math.floor(Math.random() * users.length)].id
        });
      }
    }
    await db.insert(schema.productLocations).values(productLocations);

    // 8. Stock Movements (depends on products, warehouses, and users)
    console.log('📈 Creating stock movements...');
    const stockMovements = [];
    const movementTypes = ['in', 'out', 'transfer', 'adjustment'];
    const reasons = [
      'Receção de fornecedor',
      'Venda a cliente',
      'Transferência entre armazéns',
      'Ajuste de inventário',
      'Produto danificado',
      'Devolução de cliente'
    ];

    for (let i = 0; i < 50; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const type = movementTypes[Math.floor(Math.random() * movementTypes.length)];
      
      stockMovements.push({
        productId: product.id,
        warehouseId: warehouse.id,
        type,
        quantity: Math.floor(Math.random() * 20) + 1,
        reference: `REF${String(i + 1).padStart(4, '0')}`,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        userId: user.id
      });
    }
    await db.insert(schema.stockMovements).values(stockMovements);

    // 9. Orders (depends on suppliers and users)
    console.log('📋 Creating orders...');
    const orders = await db.insert(schema.orders).values([
      {
        orderNumber: 'ORD-2024-001',
        type: 'sale',
        status: 'completed',
        customerName: 'João Silva',
        customerEmail: 'joao@email.com',
        customerPhone: '+351 91 123 4567',
        customerAddress: 'Rua das Flores, 123, Lisboa',
        totalAmount: '159.98',
        notes: 'Entrega urgente',
        userId: users[0].id
      },
      {
        orderNumber: 'ORD-2024-002',
        type: 'purchase',
        status: 'pending',
        supplierId: suppliers[0].id,
        totalAmount: '2500.00',
        notes: 'Encomenda mensal de eletrônicos',
        userId: users[1].id
      },
      {
        orderNumber: 'ORD-2024-003',
        type: 'sale',
        status: 'processing',
        customerName: 'Maria Santos',
        customerEmail: 'maria@email.com',
        customerPhone: '+351 92 987 6543',
        customerAddress: 'Avenida Central, 456, Porto',
        totalAmount: '79.99',
        userId: users[2].id
      }
    ]).returning();

    // 10. Order Items (depends on orders and products)
    console.log('🛒 Creating order items...');
    const orderItems = [];
    
    // Items for order 1
    orderItems.push({
      orderId: orders[0].id,
      productId: products.find(p => p.sku === 'CLOTH-TS-003')?.id!,
      quantity: 2,
      unitPrice: '19.99',
      totalPrice: '39.98'
    });
    orderItems.push({
      orderId: orders[0].id,
      productId: products.find(p => p.sku === 'CLOTH-JE-004')?.id!,
      quantity: 2,
      unitPrice: '59.99',
      totalPrice: '119.98'
    });

    // Items for order 2
    orderItems.push({
      orderId: orders[1].id,
      productId: products.find(p => p.sku === 'TECH-SM-001')?.id!,
      quantity: 5,
      unitPrice: '699.99',
      totalPrice: '3499.95'
    });

    // Items for order 3
    orderItems.push({
      orderId: orders[2].id,
      productId: products.find(p => p.sku === 'BOOK-HIS-006')?.id!,
      quantity: 3,
      unitPrice: '24.99',
      totalPrice: '74.97'
    });

    await db.insert(schema.orderItems).values(orderItems);

    // 11. Shipments (depends on orders and users)
    console.log('🚚 Creating shipments...');
    await db.insert(schema.shipments).values([
      {
        shipmentNumber: 'SHIP-2024-001',
        orderId: orders[0].id,
        status: 'delivered',
        carrier: 'CTT Expresso',
        trackingNumber: 'CT123456789PT',
        shippingAddress: 'Rua das Flores, 123, Lisboa',
        estimatedDelivery: new Date('2024-01-15'),
        actualDelivery: new Date('2024-01-14'),
        userId: users[2].id
      },
      {
        shipmentNumber: 'SHIP-2024-002',
        orderId: orders[2].id,
        status: 'in_transit',
        carrier: 'DPD Portugal',
        trackingNumber: 'DP987654321PT',
        shippingAddress: 'Avenida Central, 456, Porto',
        estimatedDelivery: new Date('2024-01-20'),
        userId: users[3].id
      }
    ]);

    // 12. Inventory Counts (depends on warehouses and users)
    console.log('📝 Creating inventory counts...');
    const inventoryCounts = await db.insert(schema.inventoryCounts).values([
      {
        countNumber: 'CNT-2024-001',
        type: 'cycle',
        status: 'completed',
        warehouseId: warehouses[0].id,
        scheduledDate: new Date('2024-01-10'),
        completedDate: new Date('2024-01-10'),
        userId: users[1].id,
        notes: 'Contagem mensal de rotina'
      },
      {
        countNumber: 'CNT-2024-002',
        type: 'spot',
        status: 'in_progress',
        warehouseId: warehouses[1].id,
        scheduledDate: new Date('2024-01-15'),
        userId: users[2].id,
        notes: 'Verificação de discrepâncias'
      }
    ]).returning();

    // 13. Inventory Count Items (depends on inventory counts and products)
    console.log('📊 Creating inventory count items...');
    const countItems = [];
    
    // Items for first count
    for (let i = 0; i < 3; i++) {
      const product = products[i];
      const expectedQty = Math.floor(Math.random() * 50) + 10;
      const countedQty = expectedQty + Math.floor(Math.random() * 5) - 2; // Some variance
      
      countItems.push({
        countId: inventoryCounts[0].id,
        productId: product.id,
        expectedQuantity: expectedQty,
        countedQuantity: countedQty,
        variance: countedQty - expectedQty,
        reconciled: true,
        countedByUserId: users[3].id,
        countedAt: new Date('2024-01-10')
      });
    }

    await db.insert(schema.inventoryCountItems).values(countItems);

    // 14. Returns (depends on orders, suppliers, and users)
    console.log('🔄 Creating returns...');
    const returns = await db.insert(schema.returns).values([
      {
        returnNumber: 'RET-2024-001',
        type: 'customer',
        status: 'completed',
        originalOrderId: orders[0].id,
        customerId: 'CUST-001',
        reason: 'wrong_size',
        condition: 'new',
        totalAmount: '19.99',
        refundMethod: 'store_credit',
        notes: 'Cliente trocou tamanho da t-shirt',
        userId: users[2].id,
        processedBy: users[1].id,
        processedAt: new Date('2024-01-12')
      }
    ]).returning();

    // 15. Return Items (depends on returns and products)
    console.log('📦 Creating return items...');
    await db.insert(schema.returnItems).values([
      {
        returnId: returns[0].id,
        productId: products.find(p => p.sku === 'CLOTH-TS-003')?.id!,
        quantity: 1,
        reason: 'wrong_size',
        condition: 'new',
        unitPrice: '19.99',
        refundAmount: '19.99',
        restockable: true,
        restocked: true,
        warehouseId: warehouses[0].id,
        qualityNotes: 'Produto em perfeito estado'
      }
    ]);

    // 16. Alerts (depends on users)
    console.log('🚨 Creating alerts...');
    await db.insert(schema.alerts).values([
      {
        type: 'low_stock',
        priority: 'high',
        title: 'Stock Baixo - Smartphone Samsung',
        message: 'O produto TECH-SM-001 está abaixo do nível mínimo de stock no Armazém Principal.',
        status: 'active',
        entityType: 'product',
        entityId: products.find(p => p.sku === 'TECH-SM-001')?.id,
        userId: users[1].id
      },
      {
        type: 'reorder_point',
        priority: 'medium',
        title: 'Ponto de Reposição - Laptops',
        message: 'É necessário fazer nova encomenda de laptops Dell Inspiron.',
        status: 'acknowledged',
        entityType: 'product',
        entityId: products.find(p => p.sku === 'TECH-LAP-002')?.id,
        userId: users[0].id,
        acknowledgedBy: users[1].id,
        acknowledgedAt: new Date()
      },
      {
        type: 'system',
        priority: 'low',
        title: 'Backup Concluído',
        message: 'O backup diário da base de dados foi concluído com sucesso.',
        status: 'resolved',
        userId: users[0].id,
        resolvedBy: users[0].id,
        resolvedAt: new Date()
      }
    ]);

    // 17. Notification Preferences (depends on users)
    console.log('🔔 Creating notification preferences...');
    const notificationPrefs = [];
    const alertTypes = ['low_stock', 'reorder_point', 'system', 'quality'];
    const channels = ['email', 'in_app'];

    for (const user of users) {
      for (const alertType of alertTypes) {
        for (const channel of channels) {
          notificationPrefs.push({
            userId: user.id,
            alertType,
            channel,
            enabled: Math.random() > 0.3, // 70% chance of being enabled
            threshold: { value: 10 }
          });
        }
      }
    }
    await db.insert(schema.notificationPreferences).values(notificationPrefs);

    // 18. Barcode Scans (depends on products, warehouses, users, and locations)
    console.log('📱 Creating barcode scans...');
    const barcodeScans = [];
    const scanPurposes = ['inventory', 'picking', 'receiving', 'shipping'];
    
    for (let i = 0; i < 30; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const purpose = scanPurposes[Math.floor(Math.random() * scanPurposes.length)];
      
      barcodeScans.push({
        scannedCode: product.barcode || `SCAN${String(i + 1).padStart(6, '0')}`,
        scanType: 'barcode',
        productId: product.id,
        warehouseId: warehouse.id,
        scanPurpose: purpose,
        userId: user.id,
        metadata: {
          deviceId: `SCANNER_${Math.floor(Math.random() * 5) + 1}`,
          location: `${warehouse.name} - Zona A`
        }
      });
    }
    await db.insert(schema.barcodeScans).values(barcodeScans);

    console.log('✅ Database seeding completed successfully!');
    console.log(`
📊 Summary:
- ${users.length} users created
- ${categories.length} categories created
- ${suppliers.length} suppliers created
- ${warehouses.length} warehouses created
- ${products.length} products created
- ${inventoryRecords.length} inventory records created
- ${productLocations.length} product locations created
- ${stockMovements.length} stock movements created
- ${orders.length} orders created
- ${orderItems.length} order items created
- 2 shipments created
- ${inventoryCounts.length} inventory counts created
- ${countItems.length} count items created
- ${returns.length} returns created
- 1 return item created
- 3 alerts created
- ${notificationPrefs.length} notification preferences created
- ${barcodeScans.length} barcode scans created
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeding function
seedDatabase()
  .then(() => {
    console.log('🎉 Seeding process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });

export { seedDatabase };