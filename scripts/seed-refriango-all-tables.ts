import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, sql } from 'drizzle-orm';
import * as schema from '../shared/schema';

const client = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});
const db = drizzle(client, { schema });

async function seedCompleteRefriango() {
  console.log('🥤 SEED REFRIANGO COMPLETO - Populando TODAS as tabelas...');

  try {
    // ===== LIMPAR TUDO EM ORDEM CORRETA =====
    console.log('🧹 Limpando dados existentes...');
    const tables = [
      'optimization_jobs', 'ml_models', 'slotting_rules', 'product_affinity', 'slotting_analytics',
      'fraud_detection', 'worm_storage', 'audit_trail', 'real_time_visualization',
      'digital_twin_simulations', 'warehouse_layout', 'warehouse_zones', 'picking_velocity',
      'replenishment_tasks', 'demand_forecasts', 'replenishment_rules', 'pallet_items',
      'sscc_pallets', 'putaway_tasks', 'putaway_rules', 'cv_counting_results',
      'receiving_receipt_items', 'receiving_receipts', 'asn_line_items', 'asn',
      'barcode_scans', 'notification_preferences', 'alerts', 'return_items', 'returns',
      'inventory_count_items', 'inventory_counts', 'picking_list_items', 'picking_lists',
      'shipments', 'order_items', 'orders', 'stock_movements', 'product_locations',
      'inventory', 'products', 'categories', 'suppliers', 'warehouses', 'users'
    ];

    for (const table of tables) {
      try {
        await db.execute({ sql: `DELETE FROM ${table}` });
      } catch (e) {
        console.log(`⚠️ Tabela ${table} não encontrada ou já vazia`);
      }
    }

    // ===== 1. USERS =====
    console.log('👥 Criando utilizadores Refriango...');
    const users = await db.insert(schema.users).values([
      { username: 'miguel.diretor', email: 'miguel.almeida@refriango.com', password: '$2b$12$6i4oVYj/jDgJfhQ3UoSjEegzV6LXKebGpq3z9m6Y9lBQeWb6BXyNq', role: 'admin', isActive: true },
      { username: 'ana.operacoes', email: 'ana.silva@refriango.com', password: '$2b$12$65PV.ZplJKONv8p.MaAuJOlXsjZI4tGoCNfLD5jEhScZruahi2S5O', role: 'manager', isActive: true },
      { username: 'carlos.logistica', email: 'carlos.fernandes@refriango.com', password: '$2b$12$65PV.ZplJKONv8p.MaAuJOlXsjZI4tGoCNfLD5jEhScZruahi2S5O', role: 'manager', isActive: true },
      { username: 'patricia.qualidade', email: 'patricia.santos@refriango.com', password: '$2b$12$65PV.ZplJKONv8p.MaAuJOlXsjZI4tGoCNfLD5jEhScZruahi2S5O', role: 'manager', isActive: true },
      { username: 'joao.armazem', email: 'joao.costa@refriango.com', password: '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', role: 'operator', isActive: true },
      { username: 'maria.picking', email: 'maria.rodrigues@refriango.com', password: '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', role: 'operator', isActive: true },
      { username: 'antonio.recepcao', email: 'antonio.pereira@refriango.com', password: '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', role: 'operator', isActive: true },
      { username: 'isabel.controlo', email: 'isabel.martins@refriango.com', password: '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', role: 'operator', isActive: true }
    ]).returning();

    // ===== 2. CATEGORIES =====
    console.log('📦 Criando categorias...');
    const categories = await db.insert(schema.categories).values([
      { name: 'Refrigerantes', description: 'Refrigerantes das marcas Blue, Turbo, Speed e outras' },
      { name: 'Águas', description: 'Águas minerais da marca Pura e outras águas' },
      { name: 'Sumos Naturais', description: 'Sumos das marcas Nutry e Tutti com frutas tropicais' },
      { name: 'Cervejas', description: 'Cervejas da marca Tigra e outras cervejas premium' },
      { name: 'Cidras e Outros', description: 'Cidras da marca Jade e outras bebidas especiais' },
      { name: 'Bebidas Energéticas', description: 'Bebidas energéticas e isotónicas das marcas Refriango' },
      { name: 'Matérias-Primas', description: 'Concentrados, açúcar, CO2 e ingredientes para produção' },
      { name: 'Embalagens', description: 'Garrafas, latas, rótulos e materiais de embalagem' }
    ]).returning();

    // ===== 3. SUPPLIERS =====
    console.log('🏭 Criando fornecedores...');
    const suppliers = await db.insert(schema.suppliers).values([
      { name: 'Refriango - Produção Interna', email: 'producao@refriango.com', phone: '+244 222 123 456', address: 'Zona Industrial de Viana, Luanda' },
      { name: 'Owens-Illinois Angola - Embalagens', email: 'vendas@o-i.ao', phone: '+244 222 234 567', address: 'Zona Industrial do Cazenga, Luanda' },
      { name: 'Açucareira de Angola', email: 'comercial@acucareira.ao', phone: '+244 222 345 678', address: 'Caxito, Província de Bengo' },
      { name: 'Concentrados Tropicais Lda', email: 'vendas@concentrados.ao', phone: '+244 222 456 789', address: 'Benguela, Terminal Industrial' },
      { name: 'Gases Industriais Angola', email: 'co2@gases.ao', phone: '+244 222 567 890', address: 'Luanda, Zona de Manutenção Industrial' },
      { name: 'Frutas Tropicais Do Congo Lda', email: 'exportacao@frutastropicais.cd', phone: '+243 123 456 789', address: 'Kinshasa, República Democrática do Congo' }
    ]).returning();

    // ===== 4. WAREHOUSES =====
    console.log('🏢 Criando centros de distribuição...');
    const warehouses = await db.insert(schema.warehouses).values([
      { name: 'Centro Produção e Distribuição Luanda', address: 'Zona Industrial de Viana, Lote 85-90, Luanda', isActive: true },
      { name: 'Centro Regional Huambo', address: 'Estrada Nacional EN230, Km 15, Huambo', isActive: true },
      { name: 'Terminal Benguela-Lobito', address: 'Porto do Lobito, Terminal de Bebidas, Benguela', isActive: true },
      { name: 'Centro Distribuição Lubango', address: 'Bairro Industrial da Humpata, Lubango', isActive: true },
      { name: 'Armazém Regional Cabinda', address: 'Zona Industrial de Cabinda, Cabinda', isActive: true },
      { name: 'Depósito RDC Kinshasa', address: 'Zone Industrielle de Limete, Kinshasa, RDC', isActive: true }
    ]).returning();

    // ===== 5. PRODUCTS =====
    console.log('🥤 Criando produtos Refriango...');
    const products = await db.insert(schema.products).values([
      // BLUE
      { name: 'Blue Cola Original 330ml', description: 'Refrigerante de cola marca Blue - líder de mercado em Angola', sku: 'BLUE-COLA-001', barcode: '6201234567001', price: '200.00', weight: '0.350', dimensions: { length: 6, width: 6, height: 12 }, categoryId: categories[0].id, supplierId: suppliers[0].id, minStockLevel: 10000, isActive: true },
      { name: 'Blue Cola Zero 500ml', description: 'Refrigerante Blue Cola sem açúcar em garrafa PET', sku: 'BLUE-ZERO-002', barcode: '6201234567002', price: '250.00', weight: '0.530', dimensions: { length: 8, width: 8, height: 22 }, categoryId: categories[0].id, supplierId: suppliers[0].id, minStockLevel: 8000, isActive: true },
      { name: 'Blue Laranja 350ml', description: 'Refrigerante sabor laranja marca Blue', sku: 'BLUE-LARA-003', barcode: '6201234567003', price: '180.00', weight: '0.370', dimensions: { length: 6, width: 6, height: 15 }, categoryId: categories[0].id, supplierId: suppliers[0].id, minStockLevel: 7000, isActive: true },
      // PURA
      { name: 'Pura Natural 500ml', description: 'Água mineral natural marca Pura', sku: 'PURA-NAT-004', barcode: '6201234567004', price: '120.00', weight: '0.520', dimensions: { length: 7, width: 7, height: 20 }, categoryId: categories[1].id, supplierId: suppliers[0].id, minStockLevel: 15000, isActive: true },
      { name: 'Pura com Gás 330ml', description: 'Água mineral com gás marca Pura', sku: 'PURA-GAS-005', barcode: '6201234567005', price: '150.00', weight: '0.350', dimensions: { length: 6, width: 6, height: 18 }, categoryId: categories[1].id, supplierId: suppliers[0].id, minStockLevel: 12000, isActive: true },
      // NUTRY/TUTTI
      { name: 'Nutry Maracujá 200ml', description: 'Sumo de maracujá marca Nutry em embalagem Tetra Pak', sku: 'NUTRY-MAR-007', barcode: '6201234567007', price: '220.00', weight: '0.210', dimensions: { length: 5, width: 4, height: 14 }, categoryId: categories[2].id, supplierId: suppliers[0].id, minStockLevel: 6000, isActive: true },
      { name: 'Tutti Goiaba 250ml', description: 'Sumo de goiaba marca Tutti com polpa natural', sku: 'TUTTI-GOI-009', barcode: '6201234567009', price: '200.00', weight: '0.270', dimensions: { length: 6, width: 6, height: 15 }, categoryId: categories[2].id, supplierId: suppliers[0].id, minStockLevel: 4000, isActive: true },
      // TIGRA
      { name: 'Tigra Original 330ml', description: 'Cerveja lager marca Tigra em garrafa long neck', sku: 'TIGRA-ORI-011', barcode: '6201234567011', price: '350.00', weight: '0.550', dimensions: { length: 7, width: 7, height: 25 }, categoryId: categories[3].id, supplierId: suppliers[0].id, minStockLevel: 5000, isActive: true },
      { name: 'Tigra Premium 500ml', description: 'Cerveja premium marca Tigra em lata especial', sku: 'TIGRA-PRE-012', barcode: '6201234567012', price: '450.00', weight: '0.520', dimensions: { length: 7, width: 7, height: 16 }, categoryId: categories[3].id, supplierId: suppliers[0].id, minStockLevel: 3000, isActive: true },
      // JADE
      { name: 'Jade Cidra Original 330ml', description: 'Cidra de maçã marca Jade em garrafa de vidro', sku: 'JADE-CID-013', barcode: '6201234567013', price: '380.00', weight: '0.580', dimensions: { length: 7, width: 7, height: 25 }, categoryId: categories[4].id, supplierId: suppliers[0].id, minStockLevel: 2000, isActive: true },
      // ENERGÉTICAS
      { name: 'Welwitschia Energy 250ml', description: 'Bebida energética premium marca Welwitschia', sku: 'WELW-ENE-014', barcode: '6201234567014', price: '800.00', weight: '0.270', dimensions: { length: 5, width: 5, height: 17 }, categoryId: categories[5].id, supplierId: suppliers[0].id, minStockLevel: 1500, isActive: true },
      { name: 'Turbo Energy Classic 350ml', description: 'Bebida energética marca Turbo em lata', sku: 'TURBO-CLA-015', barcode: '6201234567015', price: '600.00', weight: '0.370', dimensions: { length: 6, width: 6, height: 15 }, categoryId: categories[5].id, supplierId: suppliers[0].id, minStockLevel: 2500, isActive: true },
      { name: 'Speed Isotónico 500ml', description: 'Bebida isotónica marca Speed sabor tropical', sku: 'SPEED-ISO-016', barcode: '6201234567016', price: '350.00', weight: '0.520', dimensions: { length: 7, width: 7, height: 21 }, categoryId: categories[5].id, supplierId: suppliers[0].id, minStockLevel: 3000, isActive: true },
      // MATÉRIAS-PRIMAS
      { name: 'Concentrado Cola Blue 25L', description: 'Concentrado para produção de refrigerante Blue Cola', sku: 'MAT-CONC-017', barcode: '6201234567017', price: '25000.00', weight: '28.000', dimensions: { length: 40, width: 30, height: 35 }, categoryId: categories[6].id, supplierId: suppliers[3].id, minStockLevel: 100, isActive: true },
      { name: 'Açúcar Refinado 50kg', description: 'Açúcar cristal refinado para produção de bebidas', sku: 'MAT-ACUC-018', barcode: '6201234567018', price: '12000.00', weight: '50.000', dimensions: { length: 80, width: 50, height: 15 }, categoryId: categories[6].id, supplierId: suppliers[2].id, minStockLevel: 500, isActive: true },
      { name: 'CO2 Alimentar 20kg', description: 'Dióxido de carbono grau alimentar para gaseificação', sku: 'MAT-CO2-019', barcode: '6201234567019', price: '8500.00', weight: '65.000', dimensions: { length: 25, width: 25, height: 150 }, categoryId: categories[6].id, supplierId: suppliers[4].id, minStockLevel: 50, isActive: true },
      // EMBALAGENS
      { name: 'Garrafa Vidro 330ml (cx 24un)', description: 'Garrafas de vidro transparente para cervejas e cidras', sku: 'EMB-GAR-020', barcode: '6201234567020', price: '2400.00', weight: '12.000', dimensions: { length: 30, width: 20, height: 25 }, categoryId: categories[7].id, supplierId: suppliers[1].id, minStockLevel: 2000, isActive: true },
      { name: 'Lata Alumínio 350ml (cx 50un)', description: 'Latas de alumínio para refrigerantes e energéticos', sku: 'EMB-LAT-021', barcode: '6201234567021', price: '4500.00', weight: '8.000', dimensions: { length: 35, width: 25, height: 25 }, categoryId: categories[7].id, supplierId: suppliers[1].id, minStockLevel: 1000, isActive: true }
    ]).returning();

    // ===== 6. INVENTORY =====
    console.log('📊 Criando inventário...');
    const inventory: any[] = [];
    for (const product of products) {
      for (const warehouse of warehouses) {
        let baseQty = 200;
        if (product.name.includes('Blue Cola Original')) baseQty = 2000;
        else if (product.name.includes('Pura Natural')) baseQty = 1500;
        else if (product.name.includes('Tigra') || product.name.includes('Jade')) baseQty = 800;
        else if (product.name.includes('Concentrado') || product.name.includes('Açúcar')) baseQty = 50;
        
        if (warehouse.name.includes('Luanda')) baseQty *= 2.5;
        
        const qty = Math.floor(Math.random() * baseQty) + baseQty;
        inventory.push({
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: qty,
          reservedQuantity: Math.floor(qty * 0.10)
        });
      }
    }
    await db.insert(schema.inventory).values(inventory);

    // ===== 7. PRODUCT LOCATIONS =====
    console.log('📍 Criando localizações...');
    const productLocations: any[] = [];
    const zones = ['A', 'B', 'C', 'D', 'E'];
    for (const product of products) {
      for (const warehouse of warehouses) {
        const zone = zones[Math.floor(Math.random() * zones.length)];
        const shelf = String(Math.floor(Math.random() * 10) + 1).padStart(2, '0');
        const bin = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        
        productLocations.push({
          productId: product.id,
          warehouseId: warehouse.id,
          zone,
          shelf: `${zone}${shelf}`,
          bin: `${zone}${shelf}-${bin}`,
          lastScanned: new Date(),
          scannedByUserId: users[Math.floor(Math.random() * users.length)].id
        });
      }
    }
    await db.insert(schema.productLocations).values(productLocations);

    // ===== 8. STOCK MOVEMENTS =====
    console.log('📈 Criando movimentos de stock...');
    const stockMovements: any[] = [];
    const movementTypes = ['in', 'out', 'transfer', 'adjustment'];
    const reasons = ['Receção produção', 'Venda grossista', 'Transferência filial', 'Ajuste inventário', 'Exportação RDC'];
    
    for (let i = 0; i < 150; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const type = movementTypes[Math.floor(Math.random() * movementTypes.length)];
      
      let qty = Math.floor(Math.random() * 100) + 10;
      if (product.name.includes('Blue Cola Original')) qty *= 5;
      
      stockMovements.push({
        productId: product.id,
        warehouseId: warehouse.id,
        type,
        quantity: type === 'out' ? -qty : qty,
        reference: `REF-${Date.now()}-${i}`,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        userId: user.id
      });
    }
    await db.insert(schema.stockMovements).values(stockMovements);

    // ===== 9. ORDERS =====
    console.log('🛍️ Criando encomendas...');
    const orders = await db.insert(schema.orders).values([
      { orderNumber: 'REF-VND-2025-001', type: 'sale', status: 'processing', customerName: 'Shoprite Angola', customerEmail: 'fornecedores@shoprite.ao', customerPhone: '+244 222 640 100', customerAddress: 'Av. 4 de Fevereiro, Maianga, Luanda', totalAmount: '125000.00', notes: 'Encomenda semanal para rede Shoprite', userId: users[1].id },
      { orderNumber: 'REF-VND-2025-002', type: 'sale', status: 'shipped', customerName: 'Jumbo Belas Shopping', customerEmail: 'compras@jumbo.ao', customerPhone: '+244 222 123 789', customerAddress: 'Belas Shopping, Talatona, Luanda', totalAmount: '89500.00', notes: 'Reposição semanal', userId: users[2].id },
      { orderNumber: 'REF-VND-2025-003', type: 'sale', status: 'pending', customerName: 'Distribuidora Central Huambo', customerEmail: 'pedidos@distcentral.ao', customerPhone: '+244 241 234 567', customerAddress: 'Rua Comercial 15, Centro, Huambo', totalAmount: '67800.00', notes: 'Distribuição para interior', userId: users[2].id },
      { orderNumber: 'REF-COM-2025-001', type: 'purchase', status: 'confirmed', supplierId: suppliers[3].id, totalAmount: '450000.00', notes: 'Compra mensal de concentrados', userId: users[0].id }
    ]).returning();

    // ===== 10. ORDER ITEMS =====
    console.log('📦 Criando itens de encomenda...');
    await db.insert(schema.orderItems).values([
      { orderId: orders[0].id, productId: products[0].id, quantity: 200, unitPrice: '200.00', totalPrice: '40000.00' },
      { orderId: orders[0].id, productId: products[3].id, quantity: 300, unitPrice: '120.00', totalPrice: '36000.00' },
      { orderId: orders[0].id, productId: products[8].id, quantity: 100, unitPrice: '350.00', totalPrice: '35000.00' },
      { orderId: orders[1].id, productId: products[0].id, quantity: 150, unitPrice: '200.00', totalPrice: '30000.00' },
      { orderId: orders[1].id, productId: products[2].id, quantity: 120, unitPrice: '180.00', totalPrice: '21600.00' },
      { orderId: orders[2].id, productId: products[0].id, quantity: 100, unitPrice: '200.00', totalPrice: '20000.00' },
      { orderId: orders[3].id, productId: products[14].id, quantity: 18, unitPrice: '25000.00', totalPrice: '450000.00' }
    ]);

    // ===== 11. SHIPMENTS =====
    console.log('🚛 Criando envios...');
    const shipments = await db.insert(schema.shipments).values([
      { shipmentNumber: 'SHIP-REF-001', orderId: orders[1].id, status: 'delivered', carrier: 'Transangol Expresso', trackingNumber: 'TRA20250830001', shippingAddress: 'Belas Shopping, Talatona, Luanda', actualDelivery: new Date(), userId: users[2].id },
      { shipmentNumber: 'SHIP-REF-002', orderId: orders[0].id, status: 'in_transit', carrier: 'Refriango Transport', trackingNumber: 'REF20250830002', shippingAddress: 'Av. 4 de Fevereiro, Maianga, Luanda', estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000), userId: users[2].id }
    ]).returning();

    // ===== 12. ALERTS =====
    console.log('🚨 Criando alertas...');
    await db.insert(schema.alerts).values([
      { type: 'low_stock', priority: 'high', title: 'Stock Baixo - Blue Cola Original', message: 'Blue Cola Original está abaixo do nível mínimo no armazém Huambo', status: 'active', entityType: 'product', entityId: products[0].id, userId: users[1].id },
      { type: 'reorder_point', priority: 'medium', title: 'Ponto de Reabastecimento', message: 'Concentrado Cola Blue atingiu ponto de reabastecimento', status: 'active', entityType: 'product', entityId: products[14].id, userId: users[0].id }
    ]);

    // ===== 13. RETURNS =====
    console.log('↩️ Criando devoluções...');
    const returns = await db.insert(schema.returns).values([
      { returnNumber: 'RET-REF-001', type: 'customer', status: 'pending', originalOrderId: orders[1].id, customerId: 'JUMBO-001', reason: 'damaged', condition: 'damaged', totalAmount: '4000.00', refundMethod: 'credit', notes: 'Garrafas danificadas durante transporte', userId: users[3].id }
    ]).returning();

    await db.insert(schema.returnItems).values([
      { returnId: returns[0].id, productId: products[0].id, originalOrderItemId: (await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orders[1].id)).limit(1))[0].id, quantity: 20, reason: 'damaged', condition: 'damaged', unitPrice: '200.00', refundAmount: '4000.00', restockable: false, restocked: false, warehouseId: warehouses[0].id, qualityNotes: 'Garrafas rachadas' }
    ]);

    // ===== 14. BARCODE SCANS =====
    console.log('📱 Criando scans...');
    const barcodeScans: any[] = [];
    for (let i = 0; i < 80; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const location = productLocations.find(pl => pl.productId === product.id && pl.warehouseId === warehouse.id);
      
      barcodeScans.push({
        scannedCode: product.barcode || `SCAN-${Date.now()}-${i}`,
        scanType: 'barcode',
        productId: product.id,
        warehouseId: warehouse.id,
        locationId: location?.id,
        scanPurpose: ['inventory', 'picking', 'receiving'][Math.floor(Math.random() * 3)],
        userId: user.id,
        metadata: { device: 'Motorola TC20', battery: '85%' }
      });
    }
    await db.insert(schema.barcodeScans).values(barcodeScans);

    // ===== 15. NOTIFICATION PREFERENCES =====
    console.log('🔔 Criando preferências...');
    const notificationPrefs: any[] = [];
    for (const user of users) {
      const alertTypes = ['low_stock', 'reorder_point', 'quality', 'system'];
      const channels = ['email', 'in_app'];
      for (const alertType of alertTypes) {
        for (const channel of channels) {
          notificationPrefs.push({
            userId: user.id,
            alertType,
            channel,
            enabled: true
          });
        }
      }
    }
    await db.insert(schema.notificationPreferences).values(notificationPrefs);

    // ===== 16. INVENTORY COUNTS =====
    console.log('📊 Criando contagens...');
    const inventoryCounts = await db.insert(schema.inventoryCounts).values([
      { countNumber: 'INV-REF-2025-001', type: 'cycle', status: 'completed', warehouseId: warehouses[0].id, scheduledDate: new Date(), completedDate: new Date(), userId: users[3].id, notes: 'Contagem cíclica semanal' },
      { countNumber: 'INV-REF-2025-002', type: 'spot', status: 'in_progress', warehouseId: warehouses[1].id, scheduledDate: new Date(), userId: users[7].id, notes: 'Verificação específica' }
    ]).returning();

    const countItems: any[] = [];
    for (const count of inventoryCounts) {
      for (const product of products.slice(0, 8)) {
        const expectedQty = Math.floor(Math.random() * 500) + 100;
        const countedQty = count.status === 'completed' ? expectedQty + Math.floor(Math.random() * 10) - 5 : null;
        
        countItems.push({
          countId: count.id,
          productId: product.id,
          expectedQuantity: expectedQty,
          countedQuantity: countedQty,
          variance: countedQty ? countedQty - expectedQty : null,
          reconciled: count.status === 'completed',
          countedByUserId: count.status === 'completed' ? users.find(u => u.role === 'operator')?.id : null,
          countedAt: count.status === 'completed' ? new Date() : null
        });
      }
    }
    await db.insert(schema.inventoryCountItems).values(countItems);

    // ===== 17. PICKING LISTS =====
    console.log('📝 Criando picking lists...');
    const pickingLists = await db.insert(schema.pickingLists).values([
      { pickNumber: 'PICK-REF-001', orderId: orders[0].id, warehouseId: warehouses[0].id, status: 'in_progress', priority: 'high', assignedTo: users[5].id, type: 'order', scheduledDate: new Date(), startedAt: new Date(), estimatedTime: 45, notes: 'Picking urgente Shoprite', userId: users[1].id },
      { pickNumber: 'PICK-REF-002', orderId: orders[2].id, warehouseId: warehouses[1].id, status: 'pending', priority: 'medium', assignedTo: users[4].id, type: 'order', scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), estimatedTime: 60, notes: 'Picking Huambo', userId: users[2].id }
    ]).returning();

    const pickingItems: any[] = [];
    for (const pickingList of pickingLists) {
      const relatedOrderItems = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, pickingList.orderId));
      for (const orderItem of relatedOrderItems) {
        const location = productLocations.find(pl => pl.productId === orderItem.productId && pl.warehouseId === pickingList.warehouseId);
        pickingItems.push({
          pickingListId: pickingList.id,
          productId: orderItem.productId,
          locationId: location?.id,
          quantityToPick: orderItem.quantity,
          quantityPicked: pickingList.status === 'in_progress' ? Math.floor(orderItem.quantity * 0.7) : 0,
          status: pickingList.status === 'in_progress' ? 'partial' : 'pending',
          pickedBy: pickingList.status === 'in_progress' ? pickingList.assignedTo : null,
          pickedAt: pickingList.status === 'in_progress' ? new Date() : null
        });
      }
    }
    await db.insert(schema.pickingListItems).values(pickingItems);

    // ===== TABELAS AVANÇADAS =====

    // ===== 18. ASN =====
    console.log('📋 Criando ASN...');
    const asns = await db.insert(schema.asn).values([
      { asnNumber: 'ASN-REF-2025-001', supplierId: suppliers[3].id, warehouseId: warehouses[0].id, poNumber: 'PO-2025-MAT-001', status: 'pending', transportMode: 'truck', carrier: 'Transangol Carga', trackingNumber: 'TCA-2025-001', estimatedArrival: new Date(Date.now() + 48 * 60 * 60 * 1000), totalWeight: '1400.000', totalVolume: '28.000', notes: 'Entrega mensal concentrados', userId: users[6].id },
      { asnNumber: 'ASN-REF-2025-002', supplierId: suppliers[1].id, warehouseId: warehouses[0].id, poNumber: 'PO-2025-EMB-001', status: 'arrived', transportMode: 'truck', carrier: 'Owens Transport', trackingNumber: 'OWE-2025-001', actualArrival: new Date(), totalWeight: '2500.000', totalVolume: '45.000', notes: 'Embalagens latas 350ml', userId: users[6].id }
    ]).returning();

    await db.insert(schema.asnLineItems).values([
      { asnId: asns[0].id, productId: products[14].id, expectedQuantity: 50, unitOfMeasure: 'EA', lotNumber: 'LOT-CONC-202501', expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), packaging: 'pallet', expectedWeight: '1400.000', expectedDimensions: { length: 120, width: 80, height: 140 }, notes: 'Pallet completo' },
      { asnId: asns[1].id, productId: products[17].id, expectedQuantity: 100, unitOfMeasure: 'CX', lotNumber: 'LOT-LAT-202501', packaging: 'box', expectedWeight: '800.000', expectedDimensions: { length: 70, width: 50, height: 50 }, notes: 'Latas 350ml' }
    ]);

    // ===== 19. RECEIVING RECEIPTS =====
    console.log('📥 Criando receções...');
    const receivingReceipts = await db.insert(schema.receivingReceipts).values([
      { receiptNumber: 'REC-REF-001', asnId: asns[1].id, warehouseId: warehouses[0].id, status: 'completed', receivingMethod: 'barcode', totalExpected: 100, totalReceived: 98, discrepancies: 2, damageReported: false, receivedBy: users[6].id, supervisorApproval: users[3].id, startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), completedAt: new Date(), notes: 'Receção latas - 2 caixas danificadas' },
      { receiptNumber: 'REC-REF-002', asnId: asns[0].id, warehouseId: warehouses[0].id, status: 'receiving', receivingMethod: 'computer_vision', totalExpected: 50, totalReceived: 25, discrepancies: 0, damageReported: false, receivedBy: users[6].id, startedAt: new Date(), notes: 'Receção concentrados - em progresso' }
    ]).returning();

    await db.insert(schema.receivingReceiptItems).values([
      { receiptId: receivingReceipts[0].id, productId: products[17].id, expectedQuantity: 100, receivedQuantity: 98, variance: -2, varianceReason: 'damage', condition: 'good', lotNumber: 'LOT-LAT-202501', actualWeight: '784.000', locationId: productLocations[0].id, qualityNotes: '2 caixas com amolgadelas' },
      { receiptId: receivingReceipts[1].id, productId: products[14].id, expectedQuantity: 25, receivedQuantity: 25, variance: 0, condition: 'good', lotNumber: 'LOT-CONC-202501', actualWeight: '700.000', locationId: productLocations[1].id, qualityNotes: 'Perfeito estado' }
    ]);

    // ===== 20. CV COUNTING RESULTS =====
    console.log('🔍 Criando Computer Vision...');
    await db.insert(schema.cvCountingResults).values([
      { sessionId: 'CV-SESSION-001', imageUrl: '/cv-images/blue-cola-count-001.jpg', productId: products[0].id, detectedCount: 245, confidence: '0.9150', algorithm: 'yolo_v8', boundingBoxes: [{ x: 10, y: 15, width: 50, height: 60 }], dimensions: { length: 30, width: 20, height: 25 }, weight: '85.750', damage: { detected: false, confidence: 0.95 }, manualVerification: true, manualCount: 248, verifiedBy: users[3].id, status: 'verified', metadata: { camera: 'Intel RealSense', lighting: 'optimal' }, processingTime: 1250 },
      { sessionId: 'CV-SESSION-002', imageUrl: '/cv-images/pura-water-count-001.jpg', productId: products[3].id, detectedCount: 180, confidence: '0.8750', algorithm: 'yolo_v8', boundingBoxes: [{ x: 5, y: 10, width: 40, height: 50 }], dimensions: { length: 28, width: 18, height: 20 }, weight: '93.600', damage: { detected: false, confidence: 0.98 }, manualVerification: false, status: 'pending', metadata: { camera: 'Intel RealSense', lighting: 'good' }, processingTime: 980 }
    ]);

    // ===== 21. PUTAWAY RULES =====
    console.log('📍 Criando regras putaway...');
    const putawayRules = await db.insert(schema.putawayRules).values([
      { name: 'Produtos Refrigerados - Zona A', priority: 1, warehouseId: warehouses[0].id, productCriteria: { categories: ['Refrigerantes', 'Cervejas'] }, locationCriteria: { zone: 'A', temperature: 'controlled' }, strategy: 'closest_empty', crossDockEligible: true, crossDockCriteria: { velocity: 'high', orderFrequency: 'daily' }, maxCapacityUtilization: '0.8500', isActive: true, userId: users[1].id },
      { name: 'Matérias-Primas - Zona Segura', priority: 2, warehouseId: warehouses[0].id, productCriteria: { categories: ['Matérias-Primas'] }, locationCriteria: { zone: 'D', securityLevel: 'high' }, strategy: 'fixed', crossDockEligible: false, maxCapacityUtilization: '0.7000', isActive: true, userId: users[0].id }
    ]).returning();

    // ===== 22. PUTAWAY TASKS =====
    console.log('📦 Criando tarefas putaway...');
    const putawayTasks = await db.insert(schema.putawayTasks).values([
      { taskNumber: 'PUT-REF-001', receiptItemId: (await db.select().from(schema.receivingReceiptItems).limit(1))[0].id, productId: products[17].id, warehouseId: warehouses[0].id, quantity: 98, suggestedLocationId: productLocations[0].id, actualLocationId: productLocations[0].id, ruleApplied: putawayRules[0].id, status: 'completed', priority: 'high', assignedTo: users[4].id, isCrossDock: false, startedAt: new Date(Date.now() - 60 * 60 * 1000), completedAt: new Date(), travelDistance: '45.50', estimatedTime: 15, actualTime: 12, notes: 'Colocação zona A', userId: users[6].id },
      { taskNumber: 'PUT-REF-002', receiptItemId: (await db.select().from(schema.receivingReceiptItems).limit(1).offset(1))[0].id, productId: products[14].id, warehouseId: warehouses[0].id, quantity: 25, suggestedLocationId: productLocations[1].id, ruleApplied: putawayRules[1].id, status: 'pending', priority: 'medium', assignedTo: users[4].id, isCrossDock: false, travelDistance: '120.00', estimatedTime: 25, notes: 'Zona segura matérias-primas', userId: users[6].id }
    ]).returning();

    // ===== 23. SSCC PALLETS =====
    console.log('📦 Criando pallets SSCC...');
    const pallets = await db.insert(schema.ssccPallets).values([
      { ssccCode: '120425000000000001', palletType: 'euro', status: 'completed', warehouseId: warehouses[0].id, locationId: productLocations[0].id, maxWeight: '1000.000', maxHeight: '180.00', currentWeight: '450.500', currentHeight: '120.00', itemCount: 48, mixedProducts: false, palletLabel: { title: 'Blue Cola Original', barcode: 'PLT-001' }, userId: users[6].id },
      { ssccCode: '120425000000000002', palletType: 'standard', status: 'building', warehouseId: warehouses[0].id, maxWeight: '800.000', maxHeight: '200.00', currentWeight: '120.000', currentHeight: '40.00', itemCount: 12, mixedProducts: true, palletLabel: { title: 'Mixed Refriango', barcode: 'PLT-002' }, userId: users[6].id }
    ]).returning();

    await db.insert(schema.palletItems).values([
      { palletId: pallets[0].id, productId: products[0].id, quantity: 48, lotNumber: 'LOT-BLUE-20250830', expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), weight: '16.800', dimensions: { length: 30, width: 20, height: 25 }, position: { x: 0, y: 0, z: 0 }, addedBy: users[6].id },
      { palletId: pallets[1].id, productId: products[3].id, quantity: 12, lotNumber: 'LOT-PURA-20250830', expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), weight: '6.240', dimensions: { length: 21, width: 14, height: 20 }, position: { x: 0, y: 1, z: 0 }, addedBy: users[6].id }
    ]);

    // ===== 24. REPLENISHMENT RULES =====
    console.log('🔄 Criando regras reabastecimento...');
    const replenishmentRules: any[] = [];
    for (const product of products.slice(0, 12)) {
      const location = productLocations.find(pl => pl.productId === product.id);
      if (location) {
        replenishmentRules.push({
          name: `Regra ${product.name}`,
          productId: product.id,
          warehouseId: location.warehouseId,
          locationId: location.id,
          strategy: 'demand_based',
          minLevel: Math.floor((product.minStockLevel || 100) * 0.2),
          maxLevel: product.minStockLevel || 100,
          reorderPoint: Math.floor((product.minStockLevel || 100) * 0.3),
          replenishQuantity: Math.floor((product.minStockLevel || 100) * 0.5),
          leadTimeDays: 2,
          safetyStock: Math.floor((product.minStockLevel || 100) * 0.1),
          abcClassification: product.name.includes('Blue Cola Original') ? 'A' : product.name.includes('Pura Natural') ? 'A' : 'B',
          velocityCategory: product.name.includes('Blue Cola Original') ? 'fast' : 'medium',
          seasonalFactor: '1.0000',
          isActive: true,
          userId: users[1].id
        });
      }
    }
    await db.insert(schema.replenishmentRules).values(replenishmentRules);

    // ===== 25. REPLENISHMENT TASKS =====
    console.log('🔄 Criando tarefas reabastecimento...');
    const replenishmentTasks: any[] = [];
    for (let i = 0; i < Math.min(5, replenishmentRules.length); i++) {
      const rule = replenishmentRules[i];
      const locations = productLocations.filter(pl => pl.productId === rule.productId);
      
      if (locations.length >= 2) {
        const fromLocation = locations[0];
        const toLocation = locations[1];
        
        replenishmentTasks.push({
          taskNumber: `REPL-REF-00${i + 1}`,
          productId: rule.productId,
          warehouseId: rule.warehouseId,
          fromLocationId: fromLocation.id,
          toLocationId: toLocation.id,
          ruleId: rule.id,
          triggerReason: 'min_level',
          quantityRequired: rule.replenishQuantity,
          quantityAvailable: rule.replenishQuantity,
          quantityToMove: rule.replenishQuantity,
          quantityMoved: i < 2 ? rule.replenishQuantity : 0,
          priority: 'medium',
          status: i < 2 ? 'completed' : 'pending',
          assignedTo: users[4].id,
          urgencyScore: (Math.random() * 5 + 3).toFixed(2),
          estimatedStockout: new Date(Date.now() + (7 + i) * 24 * 60 * 60 * 1000),
          scheduledFor: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
          startedAt: i < 2 ? new Date(Date.now() - (120 - i * 60) * 60 * 1000) : null,
          completedAt: i < 2 ? new Date() : null,
          notes: `Reabastecimento ${i < 2 ? 'concluído' : 'agendado'}`,
          userId: users[1].id
        });
      }
    }
    if (replenishmentTasks.length > 0) {
      await db.insert(schema.replenishmentTasks).values(replenishmentTasks);
    }

    // ===== 26. DEMAND FORECASTS =====
    console.log('📈 Criando previsões demanda...');
    const demandForecasts: any[] = [];
    for (const product of products.slice(0, 10)) {
      for (const warehouse of warehouses) {
        demandForecasts.push({
          productId: product.id,
          warehouseId: warehouse.id,
          forecastDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          forecastPeriod: 'weekly',
          predictedDemand: (Math.floor(Math.random() * 500) + 100).toString(),
          confidence: (0.75 + Math.random() * 0.2).toFixed(4),
          modelVersion: '2.1.0',
          algorithm: 'lstm',
          features: { seasonality: true, promotions: true, weather: false },
          metadata: { training_samples: 1000, accuracy: 0.85 }
        });
      }
    }
    await db.insert(schema.demandForecasts).values(demandForecasts);

    // ===== 27. PICKING VELOCITY =====
    console.log('⚡ Criando velocidades picking...');
    const pickingVelocity: any[] = [];
    for (const product of products.slice(0, 8)) {
      for (const warehouse of warehouses) {
        const location = productLocations.find(pl => pl.productId === product.id && pl.warehouseId === warehouse.id);
        if (location) {
          pickingVelocity.push({
            productId: product.id,
            warehouseId: warehouse.id,
            locationId: location.id,
            date: new Date(),
            period: 'daily',
            totalPicked: Math.floor(Math.random() * 200) + 50,
            pickingEvents: Math.floor(Math.random() * 50) + 10,
            averagePickTime: (Math.random() * 30 + 10).toFixed(2),
            peakHour: Math.floor(Math.random() * 8) + 9,
            velocityScore: (Math.random() * 10).toFixed(4),
            abcClass: product.name.includes('Blue Cola Original') ? 'A' : product.name.includes('Pura') ? 'A' : 'B',
            trendDirection: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)]
          });
        }
      }
    }
    await db.insert(schema.pickingVelocity).values(pickingVelocity);

    // ===== 28. WAREHOUSE ZONES =====
    console.log('🏗️ Criando zonas armazém...');
    const warehouseZones: any[] = [];
    for (const warehouse of warehouses) {
      const zoneTypes = ['receiving', 'storage', 'picking', 'shipping', 'staging'];
      for (let i = 0; i < zoneTypes.length; i++) {
        warehouseZones.push({
          warehouseId: warehouse.id,
          name: `Zona ${zoneTypes[i].toUpperCase()}`,
          type: zoneTypes[i],
          coordinates: { x: i * 50, y: 0, width: 40, height: 30, z: 0, floor: 1 },
          capacity: { maxItems: 1000, maxWeight: 50000, maxVolume: 500 },
          currentUtilization: { items: Math.floor(Math.random() * 800) + 100, weight: Math.floor(Math.random() * 40000) + 5000, volume: Math.floor(Math.random() * 400) + 50, percentage: Math.floor(Math.random() * 80) + 10 },
          isActive: true
        });
      }
    }
    await db.insert(schema.warehouseZones).values(warehouseZones);

    // ===== 29. WAREHOUSE LAYOUT =====
    console.log('🗺️ Criando layouts armazém...');
    const warehouseLayouts: any[] = [];
    for (const warehouse of warehouses) {
      warehouseLayouts.push({
        warehouseId: warehouse.id,
        name: `Layout ${warehouse.name}`,
        version: '1.0',
        layoutData: {
          dimensions: { width: 200, height: 150, floors: 1 },
          zones: [
            { id: 'A', type: 'picking', x: 0, y: 0, width: 80, height: 60 },
            { id: 'B', type: 'storage', x: 80, y: 0, width: 120, height: 100 },
            { id: 'C', type: 'receiving', x: 0, y: 60, width: 50, height: 45 },
            { id: 'D', type: 'shipping', x: 50, y: 60, width: 50, height: 45 }
          ],
          aisles: [
            { id: 'A1', startX: 10, startY: 10, endX: 70, endY: 10, width: 3 },
            { id: 'A2', startX: 10, startY: 30, endX: 70, endY: 30, width: 3 }
          ]
        },
        isActive: true,
        createdBy: users[1].id
      });
    }
    await db.insert(schema.warehouseLayout).values(warehouseLayouts);

    // ===== 30. DIGITAL TWIN SIMULATIONS =====
    console.log('🎮 Criando simulações Digital Twin...');
    await db.insert(schema.digitalTwinSimulations).values([
      { warehouseId: warehouses[0].id, name: 'Simulação Otimização Picking Blue Cola', type: 'picking_optimization', parameters: { product_categories: ['Refrigerantes'], optimization_target: 'time' }, results: { time_saved: 25, efficiency_gain: 15, route_optimization: 'completed' }, status: 'completed', startedAt: new Date(Date.now() - 60 * 60 * 1000), completedAt: new Date(), createdBy: users[1].id },
      { warehouseId: warehouses[0].id, name: 'Análise Capacidade Zona Picking', type: 'capacity_planning', parameters: { zone: 'picking', forecast_period: '30_days' }, results: { current_utilization: 78, projected_utilization: 85, recommendations: ['add_shelves', 'optimize_layout'] }, status: 'completed', startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 30 * 60 * 1000), createdBy: users[1].id }
    ]);

    // ===== 31. SLOTTING ANALYTICS =====
    console.log('🎯 Criando análises slotting...');
    const slottingAnalytics: any[] = [];
    for (const product of products.slice(0, 12)) {
      const location = productLocations.find(pl => pl.productId === product.id);
      if (location) {
        slottingAnalytics.push({
          productId: product.id,
          warehouseId: location.warehouseId,
          currentLocation: `${location.zone}${location.shelf}-${location.bin}`,
          recommendedLocation: 'A01-01',
          rotationFrequency: product.name.includes('Blue Cola Original') ? '15.5000' : '8.2500',
          pickingDistance: (Math.random() * 100 + 20).toFixed(2),
          affinityScore: (Math.random() * 5).toFixed(2),
          seasonalityFactor: (0.8 + Math.random() * 0.4).toFixed(2),
          improvementPotential: (Math.random() * 30 + 5).toFixed(2),
          status: 'pending'
        });
      }
    }
    await db.insert(schema.slottingAnalytics).values(slottingAnalytics);

    // ===== 32. PRODUCT AFFINITY =====
    console.log('🔗 Criando afinidades produtos...');
    await db.insert(schema.productAffinity).values([
      { productA: products[0].id, productB: products[3].id, affinityScore: '4.25', coOccurrenceCount: 150, confidence: '0.89' },
      { productA: products[0].id, productB: products[8].id, affinityScore: '3.80', coOccurrenceCount: 98, confidence: '0.76' },
      { productA: products[3].id, productB: products[4].id, affinityScore: '4.10', coOccurrenceCount: 75, confidence: '0.82' }
    ]);

    // ===== 33. SLOTTING RULES =====
    console.log('📏 Criando regras slotting...');
    await db.insert(schema.slottingRules).values([
      { warehouseId: warehouses[0].id, ruleName: 'Produtos A - Zona Picking Rápida', conditions: { abc_class: 'A', velocity: 'high' }, actions: { zone: 'A', shelf_height: 'eye_level' }, priority: 1, isActive: true },
      { warehouseId: warehouses[0].id, ruleName: 'Produtos Pesados - Chão', conditions: { weight_min: 20 }, actions: { zone: 'B', shelf_height: 'ground' }, priority: 2, isActive: true }
    ]);

    // ===== 34. ML MODELS =====
    console.log('🤖 Criando modelos ML...');
    await db.insert(schema.mlModels).values([
      { modelName: 'Refriango Demand Forecast V2.1', modelType: 'demand_forecast', version: '2.1.0', parameters: { algorithm: 'lstm', layers: 3, neurons: 64 }, trainingData: { samples: 50000, features: 15, accuracy: 0.87 }, accuracy: '0.8700', status: 'deployed', deployedAt: new Date() },
      { modelName: 'Slotting Optimization Refriango', modelType: 'slotting_optimization', version: '1.5.0', parameters: { algorithm: 'genetic', generations: 100, population: 50 }, trainingData: { historical_picks: 25000, efficiency_metrics: true }, accuracy: '0.9200', status: 'ready' },
      { modelName: 'Affinity Analysis Model', modelType: 'affinity_analysis', version: '1.0.0', parameters: { min_support: 0.1, confidence_threshold: 0.7 }, trainingData: { transactions: 15000, products: 50 }, accuracy: '0.8500', status: 'training' }
    ]);

    // ===== 35. OPTIMIZATION JOBS =====
    console.log('⚙️ Criando jobs otimização...');
    await db.insert(schema.optimizationJobs).values([
      { jobType: 'weekly_slotting_optimization', warehouseId: warehouses[0].id, parameters: { products: 'all', criteria: 'picking_efficiency' }, results: { improvements: 25, relocations: 12, efficiency_gain: '18%' }, status: 'completed', startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 30 * 60 * 1000), executionTime: 7500, improvementMetrics: { distance_saved: '45m per pick', time_saved: '15 seconds' }, createdBy: users[1].id },
      { jobType: 'inventory_rebalancing', warehouseId: warehouses[0].id, parameters: { threshold: 'auto', target: 'space_optimization' }, status: 'running', startedAt: new Date(Date.now() - 30 * 60 * 1000), createdBy: users[1].id }
    ]);

    // ===== 36. AUDIT TRAIL =====
    console.log('📋 Criando audit trail...');
    await db.insert(schema.auditTrail).values([
      { tableName: 'products', recordId: products[0].id, operation: 'CREATE', newValues: { name: products[0].name, sku: products[0].sku }, userId: users[0].id, ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 Refriango System', checksum: 'a1b2c3d4e5f6789012345678901234567890abcd', previousHash: null, signature: 'digital_signature_data', wormStored: true },
      { tableName: 'inventory', recordId: inventory[0].productId, operation: 'UPDATE', oldValues: { quantity: 1000 }, newValues: { quantity: 1200 }, userId: users[4].id, ipAddress: '192.168.1.101', userAgent: 'Mozilla/5.0 Refriango Mobile', checksum: 'b2c3d4e5f6789012345678901234567890abcde', previousHash: 'a1b2c3d4e5f6789012345678901234567890abcd', signature: 'digital_signature_data_2', wormStored: true }
    ]);

    // ===== 37. WORM STORAGE =====
    console.log('🔒 Criando WORM storage...');
    const auditRecords = await db.select().from(schema.auditTrail);
    const wormStorageRecords: any[] = [];
    for (const audit of auditRecords) {
      wormStorageRecords.push({
        auditId: audit.id,
        dataHash: audit.checksum,
        encryptedData: `encrypted_${audit.checksum}_data`,
        accessCount: Math.floor(Math.random() * 5),
        firstAccess: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        lastAccess: new Date(),
        retention: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years
        immutable: true
      });
    }
    await db.insert(schema.wormStorage).values(wormStorageRecords);

    // ===== 38. FRAUD DETECTION =====
    console.log('🛡️ Criando detecção fraude...');
    await db.insert(schema.fraudDetection).values([
      { alertType: 'unusual_movement_pattern', severity: 'medium', description: 'Movimento de stock fora do padrão normal detectado no armazém Luanda', entityType: 'stock_movement', entityId: stockMovements[0]?.productId || products[0].id, riskScore: '6.75', evidenceData: { pattern: 'off_hours_activity', user: 'system_detected', timestamp: new Date() }, status: 'investigating', investigatedBy: users[3].id },
      { alertType: 'inventory_discrepancy', severity: 'high', description: 'Discrepância significativa na contagem vs sistema para Blue Cola Original', entityType: 'inventory_count', entityId: inventoryCounts[0].id, riskScore: '8.25', evidenceData: { expected: 1000, counted: 750, variance: -250 }, status: 'pending' }
    ]);

    // ===== 39. REAL TIME VISUALIZATION =====
    console.log('📊 Criando visualização tempo real...');
    const realTimeViz: any[] = [];
    for (let i = 0; i < 20; i++) {
      const entityTypes = ['worker', 'equipment', 'product', 'order'];
      const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
      let entityId = 'ENTITY-' + i;
      
      if (entityType === 'worker') entityId = users[Math.floor(Math.random() * users.length)].id;
      else if (entityType === 'product') entityId = products[Math.floor(Math.random() * products.length)].id;
      else if (entityType === 'order') entityId = orders[Math.floor(Math.random() * orders.length)].id;
      
      realTimeViz.push({
        warehouseId: warehouses[Math.floor(Math.random() * warehouses.length)].id,
        entityType,
        entityId,
        position: { 
          x: Math.floor(Math.random() * 200), 
          y: Math.floor(Math.random() * 150), 
          z: 0, 
          floor: 1, 
          zone: zones[Math.floor(Math.random() * zones.length)] 
        },
        status: ['active', 'idle', 'moving', 'processing'][Math.floor(Math.random() * 4)],
        metadata: { 
          last_update: new Date(), 
          accuracy: Math.random() * 0.5 + 0.5,
          signal_strength: Math.floor(Math.random() * 100) + 1
        },
        timestamp: new Date()
      });
    }
    await db.insert(schema.realTimeVisualization).values(realTimeViz);

    console.log('✅ SEED COMPLETO FINALIZADO!');
    console.log('🎉 TODAS AS TABELAS REFRIANGO POPULADAS COM SUCESSO!');
    
    // Verificação final
    const finalCounts = await db.execute(sql`
      SELECT 'users' as tabela, COUNT(*) as registos FROM users
      UNION ALL SELECT 'products', COUNT(*) FROM products  
      UNION ALL SELECT 'inventory', COUNT(*) FROM inventory
      UNION ALL SELECT 'warehouse_zones', COUNT(*) FROM warehouse_zones
      UNION ALL SELECT 'audit_trail', COUNT(*) FROM audit_trail
      UNION ALL SELECT 'ml_models', COUNT(*) FROM ml_models
      UNION ALL SELECT 'optimization_jobs', COUNT(*) FROM optimization_jobs
      ORDER BY tabela
    `);
    
    console.log('📊 Verificação final:', finalCounts);

  } catch (error) {
    console.error('❌ Erro durante seed completo:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seedCompleteRefriango().catch(console.error);