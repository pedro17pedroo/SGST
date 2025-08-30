import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Initialize database connection
const client = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});
const db = drizzle(client, { schema });

async function seedBasicDatabase() {
  console.log('🌱 SEED BÁSICO - Populando tabelas essenciais do SGST Angola...');

  try {
    // Clear existing data in correct order (all tables including advanced ones)
    console.log('🧹 Limpando dados existentes...');
    
    // Advanced tables first
    try { await db.delete(schema.optimizationJobs); } catch {}
    try { await db.delete(schema.slottingRules); } catch {}
    try { await db.delete(schema.productAffinity); } catch {}
    try { await db.delete(schema.slottingAnalytics); } catch {}
    try { await db.delete(schema.fraudDetection); } catch {}
    try { await db.delete(schema.wormStorage); } catch {}
    try { await db.delete(schema.auditTrail); } catch {}
    try { await db.delete(schema.realTimeVisualization); } catch {}
    try { await db.delete(schema.digitalTwinSimulations); } catch {}
    try { await db.delete(schema.warehouseLayout); } catch {}
    try { await db.delete(schema.warehouseZones); } catch {}
    try { await db.delete(schema.mlModels); } catch {}
    try { await db.delete(schema.pickingVelocity); } catch {}
    try { await db.delete(schema.replenishmentTasks); } catch {}
    try { await db.delete(schema.demandForecasts); } catch {}
    try { await db.delete(schema.replenishmentRules); } catch {}
    try { await db.delete(schema.palletItems); } catch {}
    try { await db.delete(schema.ssccPallets); } catch {}
    try { await db.delete(schema.putawayTasks); } catch {}
    try { await db.delete(schema.putawayRules); } catch {}
    try { await db.delete(schema.cvCountingResults); } catch {}
    try { await db.delete(schema.receivingReceiptItems); } catch {}
    try { await db.delete(schema.receivingReceipts); } catch {}
    try { await db.delete(schema.asnLineItems); } catch {}
    try { await db.delete(schema.asn); } catch {}
    
    // Basic tables
    await db.delete(schema.barcodeScans);
    await db.delete(schema.notificationPreferences);
    await db.delete(schema.alerts);
    await db.delete(schema.returnItems);
    await db.delete(schema.returns);
    await db.delete(schema.inventoryCountItems);
    await db.delete(schema.inventoryCounts);
    await db.delete(schema.pickingListItems);
    await db.delete(schema.pickingLists);
    await db.delete(schema.shipments);
    await db.delete(schema.orderItems);
    await db.delete(schema.orders);
    await db.delete(schema.stockMovements);
    await db.delete(schema.productLocations);
    await db.delete(schema.inventory);
    await db.delete(schema.products);
    await db.delete(schema.categories);
    await db.delete(schema.suppliers);
    await db.delete(schema.warehouses);
    await db.delete(schema.users);

    // 1. Users - Funcionários da empresa angolana
    console.log('👥 Criando utilizadores...');
    const users = await db.insert(schema.users).values([
      {
        username: 'antonio.admin',
        email: 'antonio.ferreira@sgst.ao',
        password: '$2b$12$6i4oVYj/jDgJfhQ3UoSjEegzV6LXKebGpq3z9m6Y9lBQeWb6BXyNq', // admin123
        role: 'admin',
        isActive: true
      },
      {
        username: 'mariana.manager',
        email: 'mariana.eduardo@sgst.ao',
        password: '$2b$12$65PV.ZplJKONv8p.MaAuJOlXsjZI4tGoCNfLD5jEhScZruahi2S5O', // manager123
        role: 'manager',
        isActive: true
      },
      {
        username: 'ricardo.operator',
        email: 'ricardo.santos@sgst.ao',
        password: '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', // operator123
        role: 'operator',
        isActive: true
      },
      {
        username: 'lucia.picker',
        email: 'lucia.miguel@sgst.ao',
        password: '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', // operator123
        role: 'operator',
        isActive: true
      },
      {
        username: 'paulo.receiver',
        email: 'paulo.campos@sgst.ao',
        password: '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', // operator123
        role: 'operator',
        isActive: true
      },
      {
        username: 'carlos.quality',
        email: 'carlos.silva@sgst.ao',
        password: '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', // operator123
        role: 'operator',
        isActive: true
      }
    ]).returning();

    // 2. Categories - Categorias de produtos para Angola
    console.log('📦 Criando categorias de produtos...');
    const categories = await db.insert(schema.categories).values([
      {
        name: 'Produtos Alimentares',
        description: 'Fuba de milho, óleo, açúcar, arroz, feijão e outros alimentos básicos'
      },
      {
        name: 'Bebidas',
        description: 'Cerveja Cuca, refrigerantes, águas minerais e sumos naturais'
      },
      {
        name: 'Produtos de Higiene',
        description: 'Sabão, detergentes, produtos de limpeza e higiene pessoal'
      },
      {
        name: 'Produtos Farmacêuticos',
        description: 'Medicamentos, vitaminas e produtos de saúde'
      },
      {
        name: 'Materiais de Construção',
        description: 'Cimento, ferros, tintas e materiais de construção'
      },
      {
        name: 'Têxteis e Vestuário',
        description: 'Roupas, tecidos e acessórios de vestuário'
      },
      {
        name: 'Produtos Eletrónicos',
        description: 'Telemóveis, computadores e equipamentos eletrónicos'
      }
    ]).returning();

    // 3. Suppliers - Fornecedores angolanos
    console.log('🏭 Criando fornecedores...');
    const suppliers = await db.insert(schema.suppliers).values([
      {
        name: 'Empresa de Cervejas de Angola (ECA)',
        email: 'comercial@eca.ao',
        phone: '+244 222 445 789',
        address: 'Estrada de Catete, Km 30, Luanda'
      },
      {
        name: 'Refriango - Indústrias Alimentares',
        email: 'vendas@refriango.ao',
        phone: '+244 222 556 890',
        address: 'Zona Industrial de Viana, Lote 123, Luanda'
      },
      {
        name: 'Alimenta Angola Lda',
        email: 'geral@alimentaangola.ao',
        phone: '+244 222 778 012',
        address: 'Belas Business Park, Talatona, Luanda'
      },
      {
        name: 'Nova Cimangola',
        email: 'vendas@novacimangola.ao',
        phone: '+244 222 889 123',
        address: 'Zona Industrial do Cazenga, Luanda'
      },
      {
        name: 'Farmácia Central de Angola',
        email: 'distribuidora@farmaciacentral.ao',
        phone: '+244 272 445 678',
        address: 'Caxito, Província de Bengo'
      }
    ]).returning();

    // 4. Warehouses - Armazéns por todo Angola
    console.log('🏢 Criando armazéns...');
    const warehouses = await db.insert(schema.warehouses).values([
      {
        name: 'Centro Logístico Luanda Norte',
        address: 'Zona Industrial de Viana, Luanda',
        isActive: true
      },
      {
        name: 'Armazém Regional Huambo',
        address: 'Estrada Nacional EN230, Huambo',
        isActive: true
      },
      {
        name: 'Terminal Portuário Benguela',
        address: 'Porto do Lobito, Terminal de Carga, Benguela',
        isActive: true
      },
      {
        name: 'Centro Distribuição Lubango',
        address: 'Bairro Comercial, Avenida 4 de Fevereiro, Lubango',
        isActive: true
      }
    ]).returning();

    // 5. Products - Produtos diversos para mercado angolano
    console.log('🥫 Criando produtos...');
    const products = await db.insert(schema.products).values([
      // Produtos Alimentares
      {
        name: 'Fuba de Milho Funge 1kg',
        description: 'Fuba de milho fino para preparação de funge tradicional',
        sku: 'ALI-FUBA-001',
        barcode: '6201234567001',
        price: '450.00',
        weight: '1.000',
        dimensions: { length: 20, width: 15, height: 8 },
        categoryId: categories.find(c => c.name === 'Produtos Alimentares')?.id,
        supplierId: suppliers.find(s => s.name === 'Alimenta Angola Lda')?.id,
        minStockLevel: 1000,
        isActive: true
      },
      {
        name: 'Óleo Girassol Leve 900ml',
        description: 'Óleo de girassol refinado para culinária',
        sku: 'ALI-OLEO-002',
        barcode: '6201234567002',
        price: '850.00',
        weight: '0.920',
        dimensions: { length: 8, width: 8, height: 25 },
        categoryId: categories.find(c => c.name === 'Produtos Alimentares')?.id,
        supplierId: suppliers.find(s => s.name === 'Refriango - Indústrias Alimentares')?.id,
        minStockLevel: 2000,
        isActive: true
      },
      {
        name: 'Açúcar Cristal Doce 1kg',
        description: 'Açúcar cristal refinado premium',
        sku: 'ALI-ACUC-003',
        barcode: '6201234567003',
        price: '380.00',
        weight: '1.000',
        dimensions: { length: 15, width: 10, height: 12 },
        categoryId: categories.find(c => c.name === 'Produtos Alimentares')?.id,
        supplierId: suppliers.find(s => s.name === 'Alimenta Angola Lda')?.id,
        minStockLevel: 1500,
        isActive: true
      },
      
      // Bebidas
      {
        name: 'Cerveja Cuca 330ml',
        description: 'Cerveja lager premium angolana',
        sku: 'BEB-CUCA-005',
        barcode: '6789012345001',
        price: '350.00',
        weight: '0.550',
        dimensions: { length: 7, width: 7, height: 25 },
        categoryId: categories.find(c => c.name === 'Bebidas')?.id,
        supplierId: suppliers.find(s => s.name === 'Empresa de Cervejas de Angola (ECA)')?.id,
        minStockLevel: 5000,
        isActive: true
      },
      {
        name: 'Refrigerante Guaraná 350ml',
        description: 'Refrigerante de guaraná nacional',
        sku: 'BEB-GUAR-006',
        barcode: '6789012345002',
        price: '200.00',
        weight: '0.370',
        dimensions: { length: 6, width: 6, height: 20 },
        categoryId: categories.find(c => c.name === 'Bebidas')?.id,
        supplierId: suppliers.find(s => s.name === 'Refriango - Indústrias Alimentares')?.id,
        minStockLevel: 3000,
        isActive: true
      },
      
      // Produtos de Higiene
      {
        name: 'Sabão em Pó Limpa Tudo 1kg',
        description: 'Detergente em pó para roupas multiuso',
        sku: 'HIG-SABA-008',
        barcode: '7890123456001',
        price: '680.00',
        weight: '1.000',
        dimensions: { length: 25, width: 15, height: 20 },
        categoryId: categories.find(c => c.name === 'Produtos de Higiene')?.id,
        supplierId: suppliers.find(s => s.name === 'Refriango - Indústrias Alimentares')?.id,
        minStockLevel: 1200,
        isActive: true
      },
      
      // Produtos Farmacêuticos
      {
        name: 'Paracetamol 500mg (20 comp)',
        description: 'Analgésico e antipirético para dores e febre',
        sku: 'FAR-PARA-010',
        barcode: '8901234567001',
        price: '320.00',
        weight: '0.050',
        dimensions: { length: 8, width: 6, height: 2 },
        categoryId: categories.find(c => c.name === 'Produtos Farmacêuticos')?.id,
        supplierId: suppliers.find(s => s.name === 'Farmácia Central de Angola')?.id,
        minStockLevel: 1000,
        isActive: true
      },
      
      // Materiais de Construção
      {
        name: 'Cimento Portland 50kg',
        description: 'Cimento portland comum tipo CP-I para construção',
        sku: 'CON-CIME-012',
        barcode: '9012345678001',
        price: '4500.00',
        weight: '50.000',
        dimensions: { length: 80, width: 50, height: 10 },
        categoryId: categories.find(c => c.name === 'Materiais de Construção')?.id,
        supplierId: suppliers.find(s => s.name === 'Nova Cimangola')?.id,
        minStockLevel: 1000,
        isActive: true
      },
      
      // Produtos Eletrónicos
      {
        name: 'Smartphone Android Basic 32GB',
        description: 'Smartphone Android entrada com 32GB memória',
        sku: 'ELE-SMAR-016',
        barcode: '1234567890001',
        price: '45000.00',
        weight: '0.180',
        dimensions: { length: 15, width: 7, height: 1 },
        categoryId: categories.find(c => c.name === 'Produtos Eletrónicos')?.id,
        supplierId: suppliers.find(s => s.name === 'Refriango - Indústrias Alimentares')?.id,
        minStockLevel: 100,
        isActive: true
      }
    ]).returning();

    // 6. Inventory Records
    console.log('📊 Criando registos de inventário...');
    const inventoryRecords: any[] = [];
    for (const product of products) {
      for (const warehouse of warehouses) {
        let baseQuantity = 50;
        
        // Adjust quantities based on product type
        if (product.name.includes('Cerveja') || product.name.includes('Refrigerante')) {
          baseQuantity = 800;
        } else if (product.name.includes('Fuba') || product.name.includes('Açúcar')) {
          baseQuantity = 600;
        } else if (product.name.includes('Cimento')) {
          baseQuantity = 30;
        } else if (product.name.includes('Smartphone')) {
          baseQuantity = 15;
        }
        
        // Luanda warehouse has more stock
        if (warehouse.name.includes('Luanda')) {
          baseQuantity *= 2.5;
        }
        
        const quantity = Math.floor(Math.random() * baseQuantity) + Math.floor(baseQuantity * 0.5);
        inventoryRecords.push({
          productId: product.id,
          warehouseId: warehouse.id,
          quantity,
          reservedQuantity: Math.floor(quantity * 0.12) // 12% reserved
        });
      }
    }
    await db.insert(schema.inventory).values(inventoryRecords);

    // 7. Product Locations
    console.log('📍 Criando localizações de produtos...');
    const productLocations: any[] = [];
    const zones = ['A', 'B', 'C', 'D'];
    const shelves = ['01', '02', '03', '04', '05', '06', '07', '08'];
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
          scannedByUserId: users[Math.floor(Math.random() * users.length)].id,
          lastScanned: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
      }
    }
    await db.insert(schema.productLocations).values(productLocations);

    // 8. Stock Movements
    console.log('📈 Criando movimentos de stock...');
    const stockMovements: any[] = [];
    const movementTypes = ['in', 'out', 'transfer', 'adjustment'];
    const reasons = [
      'Receção de fornecedor',
      'Venda a cliente de Luanda',
      'Transferência para Huambo',
      'Ajuste após contagem',
      'Distribuição para lojas',
      'Abastecimento grossista'
    ];

    for (let i = 0; i < 50; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const type = movementTypes[Math.floor(Math.random() * movementTypes.length)];
      
      let quantity = Math.floor(Math.random() * 100) + 1;
      if (product.name.includes('Smartphone') || product.name.includes('Cimento')) {
        quantity = Math.floor(Math.random() * 10) + 1;
      }
      
      stockMovements.push({
        productId: product.id,
        warehouseId: warehouse.id,
        type,
        quantity: type === 'out' ? -quantity : quantity,
        reference: `REF-${Date.now()}-${i}`,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        userId: user.id,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }
    await db.insert(schema.stockMovements).values(stockMovements);

    // 9. Orders
    console.log('🛍️ Criando encomendas...');
    const orders = await db.insert(schema.orders).values([
      {
        orderNumber: 'ORD-2025-0001',
        type: 'sale',
        status: 'completed',
        customerName: 'Supermercado Nosso Super',
        customerEmail: 'compras@nossosuper.ao',
        customerPhone: '+244 222 123 456',
        customerAddress: 'Rua da Missão, 15, Ingombota, Luanda',
        totalAmount: '125800.00',
        notes: 'Entrega urgente para reposição de stock',
        userId: users[0].id,
        createdAt: new Date('2025-01-15T10:30:00Z')
      },
      {
        orderNumber: 'ORD-2025-0002',
        type: 'sale',
        status: 'shipped',
        customerName: 'Mercearia Central Huambo',
        customerEmail: 'geral@merceariacentral.ao',
        customerPhone: '+244 241 234 567',
        customerAddress: 'Avenida Norton de Matos, 45, Huambo',
        totalAmount: '87500.00',
        notes: 'Cliente preferencial - desconto aplicado',
        userId: users[1].id,
        createdAt: new Date('2025-01-20T14:15:00Z')
      },
      {
        orderNumber: 'ORD-2025-0003',
        type: 'purchase',
        status: 'pending',
        supplierId: suppliers[0].id,
        totalAmount: '456000.00',
        notes: 'Encomenda mensal de cervejas Cuca',
        userId: users[0].id,
        createdAt: new Date('2025-01-25T09:00:00Z')
      }
    ]).returning();

    // 10. Order Items
    console.log('📦 Criando itens de encomenda...');
    await db.insert(schema.orderItems).values([
      {
        orderId: orders[0].id,
        productId: products.find(p => p.name.includes('Fuba'))?.id || products[0].id,
        quantity: 50,
        unitPrice: '450.00',
        totalPrice: '22500.00'
      },
      {
        orderId: orders[0].id,
        productId: products.find(p => p.name.includes('Cerveja'))?.id || products[1].id,
        quantity: 200,
        unitPrice: '350.00',
        totalPrice: '70000.00'
      },
      {
        orderId: orders[1].id,
        productId: products.find(p => p.name.includes('Açúcar'))?.id || products[2].id,
        quantity: 100,
        unitPrice: '380.00',
        totalPrice: '38000.00'
      }
    ]);

    // 11. Shipments
    console.log('🚛 Criando envios...');
    await db.insert(schema.shipments).values([
      {
        shipmentNumber: 'SHIP-2025-001',
        orderId: orders[0].id,
        status: 'delivered',
        carrier: 'Transangol Express',
        trackingNumber: 'TEX-2025-001234',
        shippingAddress: 'Rua da Missão, 15, Ingombota, Luanda',
        estimatedDelivery: new Date('2025-01-17T14:00:00Z'),
        actualDelivery: new Date('2025-01-17T13:45:00Z'),
        userId: users[0].id,
        createdAt: new Date('2025-01-16T10:00:00Z')
      }
    ]);

    // 12. Alerts
    console.log('🚨 Criando alertas...');
    await db.insert(schema.alerts).values([
      {
        type: 'low_stock',
        priority: 'high',
        title: 'Stock Baixo - Cerveja Cuca',
        message: 'Stock de Cerveja Cuca abaixo do nível mínimo no armazém de Luanda',
        status: 'active',
        entityType: 'product',
        entityId: products.find(p => p.name.includes('Cerveja'))?.id || products[0].id,
        userId: users[0].id,
        metadata: { current_stock: 450, min_level: 500, warehouse: 'Luanda Norte' }
      },
      {
        type: 'quality',
        priority: 'medium',
        title: 'Produtos Próximos do Vencimento',
        message: 'Lote de medicamentos com vencimento em 30 dias',
        status: 'active',
        entityType: 'product',
        entityId: products.find(p => p.name.includes('Paracetamol'))?.id || products[1].id,
        userId: users[0].id,
        metadata: { expiry_date: '2025-03-15', lot_number: 'LOT-2024-456' }
      }
    ]);

    console.log('✅ SEED BÁSICO concluído com sucesso!');
    console.log(`
🎉 RESUMO DO SEED BÁSICO:

✅ ${users.length} Utilizadores criados
✅ ${categories.length} Categorias de produtos criadas  
✅ ${suppliers.length} Fornecedores angolanos criados
✅ ${warehouses.length} Armazéns criados
✅ ${products.length} Produtos diversos criados
✅ ${inventoryRecords.length} Registos de inventário criados
✅ ${productLocations.length} Localizações de produtos criadas
✅ ${stockMovements.length} Movimentos de stock criados
✅ ${orders.length} Encomendas criadas
✅ Itens de encomenda, envios e alertas criados

🚀 SISTEMA BÁSICO PRONTO PARA TESTE!
    `);

  } catch (error) {
    console.error('❌ Erro durante o seed básico:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Execute the seed function
seedBasicDatabase()
  .then(() => {
    console.log('🎉 Seed básico concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed básico falhou:', error);
    process.exit(1);
  });

export { seedBasicDatabase };