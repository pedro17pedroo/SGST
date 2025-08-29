import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';

// Initialize database connection
const client = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});
const db = drizzle(client, { schema });

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Users (funcionários da empresa petrolífera angolana)
    console.log('👥 Creating users...');
    const users = await db.insert(schema.users).values([
      {
        username: 'alberto.mendes',
        email: 'alberto.mendes@petrolangola.ao',
        password: '$2b$12$6i4oVYj/jDgJfhQ3UoSjEegzV6LXKebGpq3z9m6Y9lBQeWb6BXyNq', // Hash for: admin123
        role: 'admin',
        isActive: true
      },
      {
        username: 'maria.santos',
        email: 'maria.santos@petrolangola.ao',
        password: '$2b$12$65PV.ZplJKONv8p.MaAuJOlXsjZI4tGoCNfLD5jEhScZruahi2S5O', // Hash for: manager123
        role: 'manager',
        isActive: true
      },
      {
        username: 'joao.pereira',
        email: 'joao.pereira@petrolangola.ao',
        password: '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', // Hash for: operator123
        role: 'operator',
        isActive: true
      },
      {
        username: 'ana.silva',
        email: 'ana.silva@petrolangola.ao',
        password: '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', // Hash for: operator123
        role: 'operator',
        isActive: true
      },
      {
        username: 'carlos.nunes',
        email: 'carlos.nunes@petrolangola.ao',
        password: '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', // Hash for: operator123
        role: 'operator',
        isActive: true
      },
      {
        username: 'fernanda.costa',
        email: 'fernanda.costa@petrolangola.ao',
        password: '$2b$12$65PV.ZplJKONv8p.MaAuJOlXsjZI4tGoCNfLD5jEhScZruahi2S5O', // Hash for: manager123
        role: 'manager',
        isActive: true
      }
    ]).returning();

    // 2. Categories (categorias de produtos petrolíferos)
    console.log('📦 Creating categories...');
    const categories = await db.insert(schema.categories).values([
      {
        name: 'Produtos Petrolíferos',
        description: 'Crude oil, gasóleo, gasolina, e outros derivados do petróleo'
      },
      {
        name: 'Equipamentos de Perfuração',
        description: 'Brocas, tubagens, válvulas e equipamentos para perfuração'
      },
      {
        name: 'Segurança e Proteção',
        description: 'EPIs, detectores de gás, equipamentos de segurança'
      },
      {
        name: 'Manutenção Industrial',
        description: 'Peças sobresselentes, ferramentas e materiais de manutenção'
      },
      {
        name: 'Químicos e Aditivos',
        description: 'Produtos químicos para tratamento e refino'
      },
      {
        name: 'Instrumentação',
        description: 'Medidores, sensores e equipamentos de controlo'
      }
    ]).returning();

    // 3. Suppliers (fornecedores para a indústria petrolífera angolana)
    console.log('🏭 Creating suppliers...');
    const suppliers = await db.insert(schema.suppliers).values([
      {
        name: 'Schlumberger Angola',
        email: 'comercial@slb.com.ao',
        phone: '+244 222 334 567',
        address: 'Rua Rainha Ginga, 387, Luanda'
      },
      {
        name: 'Halliburton Angola Lda',
        email: 'vendas@halliburton.ao',
        phone: '+244 222 445 789',
        address: 'Avenida 4 de Fevereiro, 123, Luanda'
      },
      {
        name: 'Baker Hughes Angola',
        email: 'info@bakerhughes.ao',
        phone: '+244 222 556 890',
        address: 'Zona Industrial de Viana, Lote 45, Luanda'
      },
      {
        name: 'Sonangol EP',
        email: 'fornecedores@sonangol.co.ao',
        phone: '+244 222 667 901',
        address: 'Rua 1º de Dezembro, 175, Luanda'
      },
      {
        name: 'Total Energies Angola',
        email: 'compras@totalenergies.ao',
        phone: '+244 222 778 012',
        address: 'Complexo Belas Business Park, Talatona, Luanda'
      },
      {
        name: 'Chevron Angola',
        email: 'procurement@chevron.ao',
        phone: '+244 222 889 123',
        address: 'Edifício Atlantico, Ilha de Luanda'
      }
    ]).returning();

    // 4. Warehouses (armazéns em diferentes províncias angolanas)
    console.log('🏢 Creating warehouses...');
    const warehouses = await db.insert(schema.warehouses).values([
      {
        name: 'Armazém Central Luanda',
        address: 'Porto de Luanda, Zona Industrial, Luanda',
        isActive: true
      },
      {
        name: 'Armazém Offshore Cabinda',
        address: 'Terminal Petrolífero de Cabinda, Malongo',
        isActive: true
      },
      {
        name: 'Armazém Soyo',
        address: 'Terminal GNL Angola, Soyo, Zaire',
        isActive: true
      },
      {
        name: 'Armazém Lobito',
        address: 'Porto do Lobito, Terminal de Combustíveis, Benguela',
        isActive: true
      },
      {
        name: 'Armazém Palanca',
        address: 'Refinaria de Luanda, Palanca, Luanda',
        isActive: true
      }
    ]).returning();

    // 5. Products (produtos da indústria petrolífera)
    console.log('🛢️ Creating products...');
    const products = await db.insert(schema.products).values([
      // Produtos Petrolíferos
      {
        name: 'Crude Oil Cabinda Light',
        description: 'Petróleo bruto leve de Cabinda, API 31°',
        sku: 'OIL-CRU-001',
        barcode: '7890123456789',
        price: '65.50',
        weight: '850.000',
        dimensions: { length: 200, width: 200, height: 200 },
        categoryId: categories.find(c => c.name === 'Produtos Petrolíferos')?.id,
        supplierId: suppliers.find(s => s.name === 'Sonangol EP')?.id,
        minStockLevel: 1000,
        isActive: true
      },
      {
        name: 'Gasóleo Marítimo MGO',
        description: 'Marine Gas Oil para embarcações offshore',
        sku: 'OIL-MGO-002',
        barcode: '8901234567890',
        price: '1.85',
        weight: '845.000',
        dimensions: { length: 100, width: 100, height: 100 },
        categoryId: categories.find(c => c.name === 'Produtos Petrolíferos')?.id,
        supplierId: suppliers.find(s => s.name === 'Total Energies Angola')?.id,
        minStockLevel: 5000,
        isActive: true
      },
      {
        name: 'Gás Natural Liquefeito',
        description: 'GNL para exportação, terminal Soyo',
        sku: 'GAS-GNL-003',
        barcode: '9012345678901',
        price: '0.45',
        weight: '425.000',
        dimensions: { length: 150, width: 150, height: 150 },
        categoryId: categories.find(c => c.name === 'Produtos Petrolíferos')?.id,
        supplierId: suppliers.find(s => s.name === 'Chevron Angola')?.id,
        minStockLevel: 10000,
        isActive: true
      },
      // Equipamentos de Perfuração
      {
        name: 'Broca PDC 8.5"',
        description: 'Broca de perfuração PDC diamante 8.5 polegadas',
        sku: 'DRILL-PDC-004',
        barcode: '0123456789012',
        price: '15000.00',
        weight: '45.000',
        dimensions: { length: 30, width: 30, height: 30 },
        categoryId: categories.find(c => c.name === 'Equipamentos de Perfuração')?.id,
        supplierId: suppliers.find(s => s.name === 'Baker Hughes Angola')?.id,
        minStockLevel: 5,
        isActive: true
      },
      {
        name: 'Tubagem de Revestimento 9 5/8"',
        description: 'Casing pipe de aço carbono para poços petrolíferos',
        sku: 'PIPE-CAS-005',
        barcode: '1234567890124',
        price: '850.00',
        weight: '125.000',
        dimensions: { length: 1200, width: 25, height: 25 },
        categoryId: categories.find(c => c.name === 'Equipamentos de Perfuração')?.id,
        supplierId: suppliers.find(s => s.name === 'Schlumberger Angola')?.id,
        minStockLevel: 50,
        isActive: true
      },
      {
        name: 'Válvula BOP 13 5/8"',
        description: 'Blowout Preventer para controlo de pressão',
        sku: 'VALVE-BOP-006',
        barcode: '2345678901235',
        price: '125000.00',
        weight: '2500.000',
        dimensions: { length: 150, width: 100, height: 80 },
        categoryId: categories.find(c => c.name === 'Equipamentos de Perfuração')?.id,
        supplierId: suppliers.find(s => s.name === 'Halliburton Angola Lda')?.id,
        minStockLevel: 2,
        isActive: true
      },
      // Segurança e Proteção
      {
        name: 'Detector de Gás H2S',
        description: 'Detector portátil de sulfureto de hidrogénio',
        sku: 'SAFE-H2S-007',
        barcode: '3456789012346',
        price: '1200.00',
        weight: '0.350',
        dimensions: { length: 15, width: 8, height: 5 },
        categoryId: categories.find(c => c.name === 'Segurança e Proteção')?.id,
        supplierId: suppliers.find(s => s.name === 'Baker Hughes Angola')?.id,
        minStockLevel: 25,
        isActive: true
      },
      {
        name: 'Fato de Proteção Química Tyvek',
        description: 'Fato integral de proteção química categoria III',
        sku: 'SAFE-TYV-008',
        barcode: '4567890123457',
        price: '45.00',
        weight: '0.650',
        dimensions: { length: 40, width: 30, height: 5 },
        categoryId: categories.find(c => c.name === 'Segurança e Proteção')?.id,
        supplierId: suppliers.find(s => s.name === 'Schlumberger Angola')?.id,
        minStockLevel: 100,
        isActive: true
      },
      // Manutenção Industrial
      {
        name: 'Bomba Centrífuga 500 GPM',
        description: 'Bomba centrífuga para transferência de crude',
        sku: 'PUMP-CEN-009',
        barcode: '5678901234568',
        price: '8500.00',
        weight: '185.000',
        dimensions: { length: 120, width: 60, height: 80 },
        categoryId: categories.find(c => c.name === 'Manutenção Industrial')?.id,
        supplierId: suppliers.find(s => s.name === 'Total Energies Angola')?.id,
        minStockLevel: 3,
        isActive: true
      },
      {
        name: 'Filtro Coalescente 10 Microns',
        description: 'Filtro separador água-óleo para refinaria',
        sku: 'FILT-COA-010',
        barcode: '6789012345679',
        price: '2200.00',
        weight: '25.000',
        dimensions: { length: 60, width: 30, height: 30 },
        categoryId: categories.find(c => c.name === 'Manutenção Industrial')?.id,
        supplierId: suppliers.find(s => s.name === 'Halliburton Angola Lda')?.id,
        minStockLevel: 10,
        isActive: true
      },
      // Químicos e Aditivos
      {
        name: 'Aditivo Anti-Espuma AFA-3',
        description: 'Aditivo anti-espuma para processamento de crude',
        sku: 'CHEM-AFA-011',
        barcode: '7890123456780',
        price: '85.00',
        weight: '25.000',
        dimensions: { length: 40, width: 30, height: 50 },
        categoryId: categories.find(c => c.name === 'Químicos e Aditivos')?.id,
        supplierId: suppliers.find(s => s.name === 'Baker Hughes Angola')?.id,
        minStockLevel: 50,
        isActive: true
      },
      {
        name: 'Inibidor de Corrosão CI-100',
        description: 'Inibidor de corrosão para tubagens offshore',
        sku: 'CHEM-CI-012',
        barcode: '8901234567891',
        price: '150.00',
        weight: '20.000',
        dimensions: { length: 35, width: 25, height: 45 },
        categoryId: categories.find(c => c.name === 'Químicos e Aditivos')?.id,
        supplierId: suppliers.find(s => s.name === 'Chevron Angola')?.id,
        minStockLevel: 30,
        isActive: true
      },
      // Instrumentação
      {
        name: 'Transmissor de Pressão 0-5000 PSI',
        description: 'Transmissor inteligente de pressão HART',
        sku: 'INST-PT-013',
        barcode: '9012345678902',
        price: '1850.00',
        weight: '2.500',
        dimensions: { length: 20, width: 15, height: 10 },
        categoryId: categories.find(c => c.name === 'Instrumentação')?.id,
        supplierId: suppliers.find(s => s.name === 'Schlumberger Angola')?.id,
        minStockLevel: 15,
        isActive: true
      },
      {
        name: 'Medidor de Fluxo Ultrassónico',
        description: 'Medidor de fluxo clamp-on para crude oil',
        sku: 'INST-UFM-014',
        barcode: '0123456789013',
        price: '12500.00',
        weight: '8.500',
        dimensions: { length: 35, width: 25, height: 20 },
        categoryId: categories.find(c => c.name === 'Instrumentação')?.id,
        supplierId: suppliers.find(s => s.name === 'Total Energies Angola')?.id,
        minStockLevel: 5,
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
      'Receção de fornecedor offshore',
      'Transferência para plataforma',
      'Consumo em operações de perfuração',
      'Ajuste de inventário após auditoria',
      'Material danificado em transporte marítimo',
      'Retorno de equipamento após manutenção',
      'Abastecimento de embarcação de apoio',
      'Entrega para refinaria'
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

    // 9. Orders (encomendas da operação petrolífera)
    console.log('📋 Creating orders...');
    const orders = await db.insert(schema.orders).values([
      {
        orderNumber: 'PET-ORD-2024-001',
        type: 'purchase',
        status: 'completed',
        supplierId: suppliers.find(s => s.name === 'Baker Hughes Angola')?.id,
        totalAmount: '1850000.00',
        notes: 'Equipamento urgente para plataforma Offshore Block 17',
        userId: users[1].id
      },
      {
        orderNumber: 'PET-ORD-2024-002',
        type: 'sale',
        status: 'pending',
        customerName: 'Refinaria de Luanda',
        customerEmail: 'compras@refinaria.sonangol.co.ao',
        customerPhone: '+244 222 445 789',
        customerAddress: 'Complexo de Palanca, Luanda',
        totalAmount: '2500000.00',
        notes: 'Fornecimento mensal de crude Cabinda Light',
        userId: users[0].id
      },
      {
        orderNumber: 'PET-ORD-2024-003',
        type: 'purchase',
        status: 'processing',
        supplierId: suppliers.find(s => s.name === 'Schlumberger Angola')?.id,
        totalAmount: '750000.00',
        notes: 'Instrumentação para terminal Soyo',
        userId: users[2].id
      },
      {
        orderNumber: 'PET-ORD-2024-004',
        type: 'sale',
        status: 'completed',
        customerName: 'Angola LNG',
        customerEmail: 'procurement@angolalng.com',
        customerPhone: '+244 222 667 890',
        customerAddress: 'Terminal GNL Soyo, Zaire',
        totalAmount: '12500000.00',
        notes: 'Fornecimento de GNL para exportação',
        userId: users[1].id
      }
    ]).returning();

    // 10. Order Items (itens das encomendas petrolíferas)
    console.log('🛒 Creating order items...');
    const orderItems = [];
    
    // Items for order 1 (Baker Hughes - Purchase)
    orderItems.push({
      orderId: orders[0].id,
      productId: products.find(p => p.sku === 'DRILL-PDC-004')?.id!,
      quantity: 12,
      unitPrice: '15000.00',
      totalPrice: '180000.00'
    });
    orderItems.push({
      orderId: orders[0].id,
      productId: products.find(p => p.sku === 'VALVE-BOP-006')?.id!,
      quantity: 1,
      unitPrice: '125000.00',
      totalPrice: '125000.00'
    });
    orderItems.push({
      orderId: orders[0].id,
      productId: products.find(p => p.sku === 'SAFE-H2S-007')?.id!,
      quantity: 50,
      unitPrice: '1200.00',
      totalPrice: '60000.00'
    });

    // Items for order 2 (Crude Oil Sale)
    orderItems.push({
      orderId: orders[1].id,
      productId: products.find(p => p.sku === 'OIL-CRU-001')?.id!,
      quantity: 38168, // aproximadamente 1000 barris
      unitPrice: '65.50',
      totalPrice: '2500000.00'
    });

    // Items for order 3 (Schlumberger Purchase)
    orderItems.push({
      orderId: orders[2].id,
      productId: products.find(p => p.sku === 'INST-PT-013')?.id!,
      quantity: 25,
      unitPrice: '1850.00',
      totalPrice: '46250.00'
    });
    orderItems.push({
      orderId: orders[2].id,
      productId: products.find(p => p.sku === 'PIPE-CAS-005')?.id!,
      quantity: 100,
      unitPrice: '850.00',
      totalPrice: '85000.00'
    });

    // Items for order 4 (Angola LNG Sale)
    orderItems.push({
      orderId: orders[3].id,
      productId: products.find(p => p.sku === 'GAS-GNL-003')?.id!,
      quantity: 27777778, // aproximadamente 12.5M USD worth
      unitPrice: '0.45',
      totalPrice: '12500000.00'
    });

    await db.insert(schema.orderItems).values(orderItems);

    // 11. Shipments (depends on orders and users)
    console.log('🚚 Creating shipments...');
    await db.insert(schema.shipments).values([
      {
        shipmentNumber: 'SHIP-2024-001',
        orderId: orders[0].id,
        status: 'delivered',
        carrier: 'Maersk Line Angola',
        trackingNumber: 'MAEU123456789AO',
        shippingAddress: 'Terminal Offshore Cabinda, Angola',
        estimatedDelivery: new Date('2024-01-15'),
        actualDelivery: new Date('2024-01-14'),
        userId: users[2].id
      },
      {
        shipmentNumber: 'SHIP-2024-002',
        orderId: orders[2].id,
        status: 'in_transit',
        carrier: 'MSC Angola',
        trackingNumber: 'MSCU987654321AO',
        shippingAddress: 'Porto de Luanda, Terminal de Cargas, Angola',
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
        productId: products.find(p => p.sku === 'SAFE-TYV-008')?.id!,
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
    await client.end();
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