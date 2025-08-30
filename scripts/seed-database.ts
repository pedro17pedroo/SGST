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
  console.log('🌱 Starting database seeding for Angola Beverages Company...');

  try {
    // Clear existing data (in reverse dependency order)
    console.log('🧹 Clearing existing data...');
    await db.delete(schema.barcodeScans);
    await db.delete(schema.notificationPreferences);
    await db.delete(schema.alerts);
    await db.delete(schema.returnItems);
    await db.delete(schema.returns);
    await db.delete(schema.inventoryCountItems);
    await db.delete(schema.inventoryCounts);
    await db.delete(schema.shipments);
    await db.delete(schema.orderItems);
    await db.delete(schema.orders);
    await db.delete(schema.pickingListItems);
    await db.delete(schema.pickingLists);
    await db.delete(schema.stockMovements);
    await db.delete(schema.productLocations);
    await db.delete(schema.inventory);
    await db.delete(schema.products);
    await db.delete(schema.categories);
    await db.delete(schema.suppliers);
    await db.delete(schema.warehouses);
    await db.delete(schema.users);

    // 1. Users (funcionários da empresa de bebidas angolana)
    console.log('👥 Creating users for Angola Beverages...');
    const users = await db.insert(schema.users).values([
      {
        username: 'antonio.ferreira',
        email: 'antonio.ferreira@angolabebidas.ao',
        password: '$2b$12$6i4oVYj/jDgJfhQ3UoSjEegzV6LXKebGpq3z9m6Y9lBQeWb6BXyNq', // Hash for: admin123
        role: 'admin',
        isActive: true
      },
      {
        username: 'mariana.eduardo',
        email: 'mariana.eduardo@angolabebidas.ao',
        password: '$2b$12$65PV.ZplJKONv8p.MaAuJOlXsjZI4tGoCNfLD5jEhScZruahi2S5O', // Hash for: manager123
        role: 'manager',
        isActive: true
      },
      {
        username: 'ricardo.santos',
        email: 'ricardo.santos@angolabebidas.ao',
        password: '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', // Hash for: operator123
        role: 'operator',
        isActive: true
      },
      {
        username: 'lucia.miguel',
        email: 'lucia.miguel@angolabebidas.ao',
        password: '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', // Hash for: operator123
        role: 'operator',
        isActive: true
      },
      {
        username: 'paulo.campos',
        email: 'paulo.campos@angolabebidas.ao',
        password: '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', // Hash for: operator123
        role: 'operator',
        isActive: true
      },
      {
        username: 'isabel.machado',
        email: 'isabel.machado@angolabebidas.ao',
        password: '$2b$12$65PV.ZplJKONv8p.MaAuJOlXsjZI4tGoCNfLD5jEhScZruahi2S5O', // Hash for: manager123
        role: 'manager',
        isActive: true
      }
    ]).returning();

    // 2. Categories (categorias de produtos de bebidas)
    console.log('🥤 Creating beverage categories...');
    const categories = await db.insert(schema.categories).values([
      {
        name: 'Refrigerantes',
        description: 'Coca-Cola, Pepsi, Fanta, Sprite e outras bebidas gaseificadas'
      },
      {
        name: 'Cervejas',
        description: 'Cuca, Eka, Nocal, Heineken e outras cervejas produzidas localmente'
      },
      {
        name: 'Águas',
        description: 'Água mineral natural, água com gás e água aromatizada'
      },
      {
        name: 'Sumos Naturais',
        description: 'Sumos de frutas tropicais, néctares e bebidas de fruta'
      },
      {
        name: 'Bebidas Energéticas',
        description: 'Red Bull, Monster, bebidas isotónicas e energéticas'
      },
      {
        name: 'Vinhos e Licores',
        description: 'Vinhos nacionais, licores tradicionais e bebidas alcoólicas premium'
      },
      {
        name: 'Matérias-Primas',
        description: 'Concentrados, açúcar, CO2, rótulos e materiais de produção'
      },
      {
        name: 'Embalagens',
        description: 'Garrafas de vidro, latas de alumínio, tampas e material de embalagem'
      }
    ]).returning();

    // 3. Suppliers (fornecedores para a indústria de bebidas angolana)
    console.log('🏭 Creating beverage suppliers...');
    const suppliers = await db.insert(schema.suppliers).values([
      {
        name: 'Coca-Cola Angola Lda',
        email: 'comercial@coca-cola.ao',
        phone: '+244 222 334 567',
        address: 'Rua Amílcar Cabral, 15, Maianga, Luanda'
      },
      {
        name: 'Empresa de Cervejas de Angola (ECA)',
        email: 'vendas@eca.ao',
        phone: '+244 222 445 789',
        address: 'Estrada de Catete, Km 30, Luanda'
      },
      {
        name: 'Refriango - Indústrias Alimentares',
        email: 'geral@refriango.ao',
        phone: '+244 222 556 890',
        address: 'Zona Industrial de Viana, Lote 123, Luanda'
      },
      {
        name: 'Águas do Cuanza',
        email: 'comercial@aguascuanza.ao',
        phone: '+244 222 667 901',
        address: 'Dondo, Província do Cuanza Norte'
      },
      {
        name: 'Sumol + Compal Angola',
        email: 'info@sumolcompal.ao',
        phone: '+244 222 778 012',
        address: 'Belas Business Park, Talatona, Luanda'
      },
      {
        name: 'Owens-Illinois Angola',
        email: 'vendas@o-i.ao',
        phone: '+244 222 889 123',
        address: 'Zona Industrial do Cazenga, Luanda'
      },
      {
        name: 'Cerealis Angola',
        email: 'comercial@cerealis.ao',
        phone: '+244 222 990 234',
        address: 'Catumbela, Província de Benguela'
      },
      {
        name: 'Açucareira de Angola',
        email: 'vendas@acucareira.ao',
        phone: '+244 272 445 678',
        address: 'Caxito, Província de Bengo'
      }
    ]).returning();

    // 4. Warehouses (armazéns em diferentes províncias angolanas)
    console.log('🏢 Creating beverage warehouses...');
    const warehouses = await db.insert(schema.warehouses).values([
      {
        name: 'Centro de Distribuição Luanda',
        address: 'Zona Industrial de Viana, Luanda',
        isActive: true
      },
      {
        name: 'Armazém Regional Huambo',
        address: 'Estrada Nacional EN230, Huambo',
        isActive: true
      },
      {
        name: 'Depósito Benguela',
        address: 'Porto do Lobito, Terminal de Carga, Benguela',
        isActive: true
      },
      {
        name: 'Filial Lubango',
        address: 'Bairro Comercial, Avenida 4 de Fevereiro, Lubango',
        isActive: true
      },
      {
        name: 'Armazém Cabinda',
        address: 'Zona Comercial de Cabinda, Cabinda',
        isActive: true
      },
      {
        name: 'Centro Logístico Malanje',
        address: 'Estrada Nacional EN220, Malanje',
        isActive: true
      }
    ]).returning();

    // 5. Products (produtos da indústria de bebidas)
    console.log('🥤 Creating beverage products...');
    const products = await db.insert(schema.products).values([
      // Refrigerantes
      {
        name: 'Coca-Cola Original 330ml',
        description: 'Refrigerante de cola original em lata de 330ml',
        sku: 'REF-COCA-001',
        barcode: '5449000000996',
        price: '180.00',
        weight: '0.350',
        dimensions: { length: 6, width: 6, height: 12 },
        categoryId: categories.find(c => c.name === 'Refrigerantes')?.id,
        supplierId: suppliers.find(s => s.name === 'Coca-Cola Angola Lda')?.id,
        minStockLevel: 5000,
        isActive: true
      },
      {
        name: 'Fanta Laranja 350ml',
        description: 'Refrigerante de laranja em garrafa de vidro 350ml',
        sku: 'REF-FANT-002',
        barcode: '5449000054227',
        price: '200.00',
        weight: '0.580',
        dimensions: { length: 7, width: 7, height: 20 },
        categoryId: categories.find(c => c.name === 'Refrigerantes')?.id,
        supplierId: suppliers.find(s => s.name === 'Coca-Cola Angola Lda')?.id,
        minStockLevel: 3000,
        isActive: true
      },
      {
        name: 'Sprite Zero 500ml',
        description: 'Refrigerante de lima-limão sem açúcar em garrafa PET',
        sku: 'REF-SPRT-003',
        barcode: '5449000131836',
        price: '250.00',
        weight: '0.530',
        dimensions: { length: 8, width: 8, height: 22 },
        categoryId: categories.find(c => c.name === 'Refrigerantes')?.id,
        supplierId: suppliers.find(s => s.name === 'Coca-Cola Angola Lda')?.id,
        minStockLevel: 2500,
        isActive: true
      },
      // Cervejas
      {
        name: 'Cerveja Cuca 330ml',
        description: 'Cerveja lager premium angolana em garrafa long neck',
        sku: 'CER-CUCA-004',
        barcode: '6789012345001',
        price: '300.00',
        weight: '0.550',
        dimensions: { length: 7, width: 7, height: 25 },
        categoryId: categories.find(c => c.name === 'Cervejas')?.id,
        supplierId: suppliers.find(s => s.name === 'Empresa de Cervejas de Angola (ECA)')?.id,
        minStockLevel: 4000,
        isActive: true
      },
      {
        name: 'Cerveja Eka 350ml',
        description: 'Cerveja clara angolana em lata de alumínio',
        sku: 'CER-EKA-005',
        barcode: '6789012345002',
        price: '280.00',
        weight: '0.370',
        dimensions: { length: 6, width: 6, height: 12 },
        categoryId: categories.find(c => c.name === 'Cervejas')?.id,
        supplierId: suppliers.find(s => s.name === 'Empresa de Cervejas de Angola (ECA)')?.id,
        minStockLevel: 3500,
        isActive: true
      },
      {
        name: 'Cerveja Nocal 600ml',
        description: 'Cerveja especial angolana em garrafa retornável',
        sku: 'CER-NOCA-006',
        barcode: '6789012345003',
        price: '450.00',
        weight: '0.820',
        dimensions: { length: 8, width: 8, height: 28 },
        categoryId: categories.find(c => c.name === 'Cervejas')?.id,
        supplierId: suppliers.find(s => s.name === 'Empresa de Cervejas de Angola (ECA)')?.id,
        minStockLevel: 2000,
        isActive: true
      },
      // Águas
      {
        name: 'Água Cuanza Natural 500ml',
        description: 'Água mineral natural das nascentes do Cuanza',
        sku: 'AGU-CUAN-007',
        barcode: '7890123456001',
        price: '120.00',
        weight: '0.520',
        dimensions: { length: 7, width: 7, height: 20 },
        categoryId: categories.find(c => c.name === 'Águas')?.id,
        supplierId: suppliers.find(s => s.name === 'Águas do Cuanza')?.id,
        minStockLevel: 6000,
        isActive: true
      },
      {
        name: 'Água Cuanza com Gás 330ml',
        description: 'Água mineral com gás natural em garrafa de vidro',
        sku: 'AGU-CGAS-008',
        barcode: '7890123456002',
        price: '150.00',
        weight: '0.580',
        dimensions: { length: 6, width: 6, height: 18 },
        categoryId: categories.find(c => c.name === 'Águas')?.id,
        supplierId: suppliers.find(s => s.name === 'Águas do Cuanza')?.id,
        minStockLevel: 4000,
        isActive: true
      },
      {
        name: 'Água Aromatizada Manga 400ml',
        description: 'Água natural aromatizada com manga tropical',
        sku: 'AGU-MANG-009',
        barcode: '7890123456003',
        price: '180.00',
        weight: '0.420',
        dimensions: { length: 7, width: 7, height: 19 },
        categoryId: categories.find(c => c.name === 'Águas')?.id,
        supplierId: suppliers.find(s => s.name === 'Águas do Cuanza')?.id,
        minStockLevel: 2500,
        isActive: true
      },
      // Sumos Naturais
      {
        name: 'Sumo de Maracujá Compal 200ml',
        description: 'Néctar de maracujá 100% natural em embalagem Tetra Pak',
        sku: 'SUM-MARA-010',
        barcode: '8901234567001',
        price: '220.00',
        weight: '0.210',
        dimensions: { length: 5, width: 4, height: 14 },
        categoryId: categories.find(c => c.name === 'Sumos Naturais')?.id,
        supplierId: suppliers.find(s => s.name === 'Sumol + Compal Angola')?.id,
        minStockLevel: 3000,
        isActive: true
      },
      {
        name: 'Sumo de Goiaba 1L',
        description: 'Sumo natural de goiaba em garrafa de vidro',
        sku: 'SUM-GOIB-011',
        barcode: '8901234567002',
        price: '450.00',
        weight: '1.150',
        dimensions: { length: 9, width: 9, height: 32 },
        categoryId: categories.find(c => c.name === 'Sumos Naturais')?.id,
        supplierId: suppliers.find(s => s.name === 'Refriango - Indústrias Alimentares')?.id,
        minStockLevel: 1500,
        isActive: true
      },
      {
        name: 'Sumol Ananás 250ml',
        description: 'Refrigerante de ananás com polpa natural',
        sku: 'SUM-ANAN-012',
        barcode: '8901234567003',
        price: '200.00',
        weight: '0.270',
        dimensions: { length: 6, width: 6, height: 15 },
        categoryId: categories.find(c => c.name === 'Sumos Naturais')?.id,
        supplierId: suppliers.find(s => s.name === 'Sumol + Compal Angola')?.id,
        minStockLevel: 2800,
        isActive: true
      },
      // Bebidas Energéticas
      {
        name: 'Red Bull Energy 250ml',
        description: 'Bebida energética original Red Bull em lata',
        sku: 'ENE-REDB-013',
        barcode: '9012345678001',
        price: '800.00',
        weight: '0.270',
        dimensions: { length: 5, width: 5, height: 17 },
        categoryId: categories.find(c => c.name === 'Bebidas Energéticas')?.id,
        supplierId: suppliers.find(s => s.name === 'Refriango - Indústrias Alimentares')?.id,
        minStockLevel: 1000,
        isActive: true
      },
      {
        name: 'Bebida Isotónica Angola Sport 500ml',
        description: 'Bebida isotónica sabor tropical para desportistas',
        sku: 'ENE-SPRT-014',
        barcode: '9012345678002',
        price: '350.00',
        weight: '0.520',
        dimensions: { length: 7, width: 7, height: 21 },
        categoryId: categories.find(c => c.name === 'Bebidas Energéticas')?.id,
        supplierId: suppliers.find(s => s.name === 'Refriango - Indústrias Alimentares')?.id,
        minStockLevel: 1500,
        isActive: true
      },
      // Vinhos e Licores
      {
        name: 'Vinho Tinto Calulo 750ml',
        description: 'Vinho tinto seco produzido na região do Calulo',
        sku: 'VIN-CALU-015',
        barcode: '0123456789001',
        price: '2500.00',
        weight: '1.200',
        dimensions: { length: 8, width: 8, height: 32 },
        categoryId: categories.find(c => c.name === 'Vinhos e Licores')?.id,
        supplierId: suppliers.find(s => s.name === 'Cerealis Angola')?.id,
        minStockLevel: 500,
        isActive: true
      },
      {
        name: 'Licor de Mucua 700ml',
        description: 'Licor tradicional angolano de fruto do embondeiro',
        sku: 'LIC-MUCU-016',
        barcode: '0123456789002',
        price: '1800.00',
        weight: '1.050',
        dimensions: { length: 8, width: 8, height: 30 },
        categoryId: categories.find(c => c.name === 'Vinhos e Licores')?.id,
        supplierId: suppliers.find(s => s.name === 'Cerealis Angola')?.id,
        minStockLevel: 300,
        isActive: true
      },
      // Matérias-Primas
      {
        name: 'Concentrado Cola 25L',
        description: 'Concentrado para produção de refrigerante de cola',
        sku: 'MAT-CONC-017',
        barcode: '1234567890001',
        price: '15000.00',
        weight: '28.000',
        dimensions: { length: 40, width: 30, height: 35 },
        categoryId: categories.find(c => c.name === 'Matérias-Primas')?.id,
        supplierId: suppliers.find(s => s.name === 'Coca-Cola Angola Lda')?.id,
        minStockLevel: 50,
        isActive: true
      },
      {
        name: 'Açúcar Cristal 50kg',
        description: 'Açúcar refinado para produção de bebidas',
        sku: 'MAT-ACUC-018',
        barcode: '1234567890002',
        price: '8500.00',
        weight: '50.000',
        dimensions: { length: 80, width: 50, height: 15 },
        categoryId: categories.find(c => c.name === 'Matérias-Primas')?.id,
        supplierId: suppliers.find(s => s.name === 'Açucareira de Angola')?.id,
        minStockLevel: 200,
        isActive: true
      },
      {
        name: 'CO2 Alimentar Cilindro 20kg',
        description: 'Dióxido de carbono grau alimentar para gaseificação',
        sku: 'MAT-CO2-019',
        barcode: '1234567890003',
        price: '4500.00',
        weight: '65.000',
        dimensions: { length: 25, width: 25, height: 150 },
        categoryId: categories.find(c => c.name === 'Matérias-Primas')?.id,
        supplierId: suppliers.find(s => s.name === 'Refriango - Indústrias Alimentares')?.id,
        minStockLevel: 30,
        isActive: true
      },
      // Embalagens
      {
        name: 'Garrafa Vidro 330ml (caixa 24un)',
        description: 'Garrafas de vidro transparente para cerveja',
        sku: 'EMB-GAR-020',
        barcode: '2345678901001',
        price: '1200.00',
        weight: '12.000',
        dimensions: { length: 30, width: 20, height: 25 },
        categoryId: categories.find(c => c.name === 'Embalagens')?.id,
        supplierId: suppliers.find(s => s.name === 'Owens-Illinois Angola')?.id,
        minStockLevel: 1000,
        isActive: true
      },
      {
        name: 'Lata Alumínio 350ml (caixa 100un)',
        description: 'Latas de alumínio para refrigerantes e cervejas',
        sku: 'EMB-LAT-021',
        barcode: '2345678901002',
        price: '8500.00',
        weight: '15.000',
        dimensions: { length: 40, width: 30, height: 30 },
        categoryId: categories.find(c => c.name === 'Embalagens')?.id,
        supplierId: suppliers.find(s => s.name === 'Owens-Illinois Angola')?.id,
        minStockLevel: 500,
        isActive: true
      },
      {
        name: 'Rótulos Papel (rolo 5000un)',
        description: 'Rótulos auto-adesivos para garrafas de vidro',
        sku: 'EMB-ROT-022',
        barcode: '2345678901003',
        price: '2200.00',
        weight: '8.500',
        dimensions: { length: 50, width: 30, height: 30 },
        categoryId: categories.find(c => c.name === 'Embalagens')?.id,
        supplierId: suppliers.find(s => s.name === 'Owens-Illinois Angola')?.id,
        minStockLevel: 200,
        isActive: true
      },
      {
        name: 'Tampas Coroa (caixa 1000un)',
        description: 'Tampas coroa metálicas para garrafas de cerveja',
        sku: 'EMB-TAM-023',
        barcode: '2345678901004',
        price: '1800.00',
        weight: '5.000',
        dimensions: { length: 25, width: 20, height: 15 },
        categoryId: categories.find(c => c.name === 'Embalagens')?.id,
        supplierId: suppliers.find(s => s.name === 'Owens-Illinois Angola')?.id,
        minStockLevel: 300,
        isActive: true
      }
    ]).returning();

    // 6. Inventory (depends on products and warehouses)
    console.log('📊 Creating inventory records...');
    const inventoryRecords: any[] = [];
    for (const product of products) {
      for (const warehouse of warehouses) {
        // Different stock levels based on product type and warehouse location
        let baseQuantity = 100;
        if (product.name.includes('Coca-Cola') || product.name.includes('Cerveja')) {
          baseQuantity = 500;
        } else if (product.name.includes('Água') || product.name.includes('Sumo')) {
          baseQuantity = 300;
        } else if (product.name.includes('Matérias-Primas') || product.name.includes('Concentrado')) {
          baseQuantity = 50;
        }
        
        // Luanda warehouse has higher stock
        if (warehouse.name.includes('Luanda')) {
          baseQuantity *= 3;
        }
        
        const quantity = Math.floor(Math.random() * baseQuantity) + baseQuantity;
        inventoryRecords.push({
          productId: product.id,
          warehouseId: warehouse.id,
          quantity,
          reservedQuantity: Math.floor(quantity * 0.15) // 15% reserved
        });
      }
    }
    await db.insert(schema.inventory).values(inventoryRecords);

    // 7. Product Locations (depends on products and warehouses)
    console.log('📍 Creating product locations...');
    const productLocations: any[] = [];
    const zones = ['A', 'B', 'C', 'D'];
    const shelves = ['01', '02', '03', '04', '05', '06', '07', '08'];
    const bins = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

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
    const stockMovements: any[] = [];
    const movementTypes = ['in', 'out', 'transfer', 'adjustment'];
    const reasons = [
      'Receção de fornecedor nacional',
      'Entrega a cliente Luanda',
      'Transferência para filial Huambo',
      'Ajuste após inventário',
      'Produto danificado em transporte',
      'Devolução de cliente',
      'Distribuição para supermercados',
      'Abastecimento de bares e restaurantes',
      'Exportação para SADC',
      'Consumo interno para degustação'
    ];

    for (let i = 0; i < 80; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const type = movementTypes[Math.floor(Math.random() * movementTypes.length)];
      
      let quantity = Math.floor(Math.random() * 50) + 1;
      if (product.name.includes('Caixa') || product.name.includes('caixa')) {
        quantity = Math.floor(Math.random() * 10) + 1; // Smaller quantities for boxes
      }
      
      stockMovements.push({
        productId: product.id,
        warehouseId: warehouse.id,
        type,
        quantity,
        reference: `MOV${String(i + 1).padStart(4, '0')}`,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        userId: user.id
      });
    }
    await db.insert(schema.stockMovements).values(stockMovements);

    // 9. Orders (encomendas da operação de bebidas)
    console.log('📋 Creating beverage orders...');
    const orders = await db.insert(schema.orders).values([
      {
        orderNumber: 'BEB-ORD-2025-001',
        type: 'purchase',
        status: 'completed',
        supplierId: suppliers.find(s => s.name === 'Coca-Cola Angola Lda')?.id,
        totalAmount: '2500000.00',
        notes: 'Encomenda mensal de refrigerantes para temporada alta',
        userId: users[1].id
      },
      {
        orderNumber: 'BEB-ORD-2025-002',
        type: 'sale',
        status: 'pending',
        customerName: 'Supermercados Kero',
        customerEmail: 'compras@kero.ao',
        customerPhone: '+244 222 445 789',
        customerAddress: 'Avenida Lenine, Ingombota, Luanda',
        totalAmount: '1800000.00',
        notes: 'Fornecimento semanal para todas as lojas Kero',
        userId: users[0].id
      },
      {
        orderNumber: 'BEB-ORD-2025-003',
        type: 'purchase',
        status: 'processing',
        supplierId: suppliers.find(s => s.name === 'Empresa de Cervejas de Angola (ECA)')?.id,
        totalAmount: '3200000.00',
        notes: 'Stock de cervejas para festivais de Carnaval',
        userId: users[2].id
      },
      {
        orderNumber: 'BEB-ORD-2025-004',
        type: 'sale',
        status: 'completed',
        customerName: 'Distribuidora Benguela',
        customerEmail: 'geral@distbenguela.ao',
        customerPhone: '+244 272 334 567',
        customerAddress: 'Rua da Independência, Benguela',
        totalAmount: '950000.00',
        notes: 'Distribuição regional para província de Benguela',
        userId: users[1].id
      },
      {
        orderNumber: 'BEB-ORD-2025-005',
        type: 'purchase',
        status: 'pending',
        supplierId: suppliers.find(s => s.name === 'Açucareira de Angola')?.id,
        totalAmount: '850000.00',
        notes: 'Matéria-prima para produção do 1º trimestre',
        userId: users[3].id
      },
      {
        orderNumber: 'BEB-ORD-2025-006',
        type: 'sale',
        status: 'processing',
        customerName: 'Hotel Presidente',
        customerEmail: 'compras@presidente.ao',
        customerPhone: '+244 222 330 031',
        customerAddress: 'Largo 17 de Setembro, Luanda',
        totalAmount: '450000.00',
        notes: 'Fornecimento de bebidas para eventos corporativos',
        userId: users[4].id
      }
    ]).returning();

    // 10. Order Items (itens das encomendas de bebidas)
    console.log('🛒 Creating order items...');
    const orderItems: any[] = [];
    
    // Items for order 1 (Coca-Cola Purchase)
    orderItems.push({
      orderId: orders[0].id,
      productId: products.find(p => p.sku === 'REF-COCA-001')?.id!,
      quantity: 5000,
      unitPrice: '180.00',
      totalPrice: '900000.00'
    });
    orderItems.push({
      orderId: orders[0].id,
      productId: products.find(p => p.sku === 'REF-FANT-002')?.id!,
      quantity: 3000,
      unitPrice: '200.00',
      totalPrice: '600000.00'
    });
    orderItems.push({
      orderId: orders[0].id,
      productId: products.find(p => p.sku === 'REF-SPRT-003')?.id!,
      quantity: 4000,
      unitPrice: '250.00',
      totalPrice: '1000000.00'
    });

    // Items for order 2 (Kero Sale)
    orderItems.push({
      orderId: orders[1].id,
      productId: products.find(p => p.sku === 'CER-CUCA-004')?.id!,
      quantity: 2000,
      unitPrice: '300.00',
      totalPrice: '600000.00'
    });
    orderItems.push({
      orderId: orders[1].id,
      productId: products.find(p => p.sku === 'AGU-CUAN-007')?.id!,
      quantity: 3000,
      unitPrice: '120.00',
      totalPrice: '360000.00'
    });
    orderItems.push({
      orderId: orders[1].id,
      productId: products.find(p => p.sku === 'SUM-MARA-010')?.id!,
      quantity: 3000,
      unitPrice: '220.00',
      totalPrice: '660000.00'
    });
    orderItems.push({
      orderId: orders[1].id,
      productId: products.find(p => p.sku === 'REF-COCA-001')?.id!,
      quantity: 1000,
      unitPrice: '180.00',
      totalPrice: '180000.00'
    });

    // Items for order 3 (ECA Purchase)
    orderItems.push({
      orderId: orders[2].id,
      productId: products.find(p => p.sku === 'CER-CUCA-004')?.id!,
      quantity: 6000,
      unitPrice: '300.00',
      totalPrice: '1800000.00'
    });
    orderItems.push({
      orderId: orders[2].id,
      productId: products.find(p => p.sku === 'CER-EKA-005')?.id!,
      quantity: 5000,
      unitPrice: '280.00',
      totalPrice: '1400000.00'
    });

    // Items for order 4 (Benguela Sale)
    orderItems.push({
      orderId: orders[3].id,
      productId: products.find(p => p.sku === 'AGU-CUAN-007')?.id!,
      quantity: 4000,
      unitPrice: '120.00',
      totalPrice: '480000.00'
    });
    orderItems.push({
      orderId: orders[3].id,
      productId: products.find(p => p.sku === 'SUM-GOIB-011')?.id!,
      quantity: 1000,
      unitPrice: '450.00',
      totalPrice: '450000.00'
    });
    orderItems.push({
      orderId: orders[3].id,
      productId: products.find(p => p.sku === 'VIN-CALU-015')?.id!,
      quantity: 8,
      unitPrice: '2500.00',
      totalPrice: '20000.00'
    });

    // Items for order 5 (Sugar Purchase)
    orderItems.push({
      orderId: orders[4].id,
      productId: products.find(p => p.sku === 'MAT-ACUC-018')?.id!,
      quantity: 100,
      unitPrice: '8500.00',
      totalPrice: '850000.00'
    });

    // Items for order 6 (Hotel Sale)
    orderItems.push({
      orderId: orders[5].id,
      productId: products.find(p => p.sku === 'VIN-CALU-015')?.id!,
      quantity: 50,
      unitPrice: '2500.00',
      totalPrice: '125000.00'
    });
    orderItems.push({
      orderId: orders[5].id,
      productId: products.find(p => p.sku === 'AGU-CGAS-008')?.id!,
      quantity: 1000,
      unitPrice: '150.00',
      totalPrice: '150000.00'
    });
    orderItems.push({
      orderId: orders[5].id,
      productId: products.find(p => p.sku === 'ENE-REDB-013')?.id!,
      quantity: 200,
      unitPrice: '800.00',
      totalPrice: '160000.00'
    });
    orderItems.push({
      orderId: orders[5].id,
      productId: products.find(p => p.sku === 'LIC-MUCU-016')?.id!,
      quantity: 5,
      unitPrice: '1800.00',
      totalPrice: '9000.00'
    });

    await db.insert(schema.orderItems).values(orderItems);

    // 11. Shipments (depends on orders and users)
    console.log('🚚 Creating shipments...');
    await db.insert(schema.shipments).values([
      {
        shipmentNumber: 'ENV-2025-001',
        orderId: orders[0].id,
        status: 'delivered',
        carrier: 'Transportes Macon',
        trackingNumber: 'MAC2025001',
        shippingAddress: 'Centro de Distribuição Luanda, Viana',
        estimatedDelivery: new Date('2025-01-15'),
        actualDelivery: new Date('2025-01-14'),
        userId: users[2].id
      },
      {
        shipmentNumber: 'ENV-2025-002',
        orderId: orders[3].id,
        status: 'delivered',
        carrier: 'Trans-Benguela',
        trackingNumber: 'TBG2025002',
        shippingAddress: 'Distribuidora Benguela, Rua da Independência',
        estimatedDelivery: new Date('2025-01-20'),
        actualDelivery: new Date('2025-01-19'),
        userId: users[3].id
      },
      {
        shipmentNumber: 'ENV-2025-003',
        orderId: orders[2].id,
        status: 'in_transit',
        carrier: 'Logística Central',
        trackingNumber: 'LOG2025003',
        shippingAddress: 'Centro de Distribuição Luanda, Viana',
        estimatedDelivery: new Date('2025-01-25'),
        userId: users[1].id
      },
      {
        shipmentNumber: 'ENV-2025-004',
        orderId: orders[5].id,
        status: 'preparing',
        carrier: 'Express Luanda',
        trackingNumber: 'EXP2025004',
        shippingAddress: 'Hotel Presidente, Largo 17 de Setembro',
        estimatedDelivery: new Date('2025-01-27'),
        userId: users[4].id
      }
    ]);

    // 12. Inventory Counts (depends on warehouses and users)
    console.log('📝 Creating inventory counts...');
    const inventoryCounts = await db.insert(schema.inventoryCounts).values([
      {
        countNumber: 'INV-2025-001',
        type: 'cycle',
        status: 'completed',
        warehouseId: warehouses[0].id,
        scheduledDate: new Date('2025-01-10'),
        completedDate: new Date('2025-01-10'),
        userId: users[1].id,
        notes: 'Inventário mensal de refrigerantes e cervejas'
      },
      {
        countNumber: 'INV-2025-002',
        type: 'spot',
        status: 'in_progress',
        warehouseId: warehouses[1].id,
        scheduledDate: new Date('2025-01-20'),
        userId: users[2].id,
        notes: 'Verificação de discrepâncias em águas minerais'
      },
      {
        countNumber: 'INV-2025-003',
        type: 'full',
        status: 'pending',
        warehouseId: warehouses[2].id,
        scheduledDate: new Date('2025-01-30'),
        userId: users[3].id,
        notes: 'Inventário anual completo filial Benguela'
      }
    ]).returning();

    // 13. Inventory Count Items (depends on inventory counts and products)
    console.log('📊 Creating inventory count items...');
    const countItems: any[] = [];
    
    // Items for first count (completed)
    for (let i = 0; i < 8; i++) {
      const product = products[i]; // First 8 products (beverages)
      const expectedQty = Math.floor(Math.random() * 200) + 50;
      const countedQty = expectedQty + Math.floor(Math.random() * 10) - 5; // Small variance
      
      countItems.push({
        countId: inventoryCounts[0].id,
        productId: product.id,
        expectedQuantity: expectedQty,
        countedQuantity: countedQty,
        variance: countedQty - expectedQty,
        reconciled: true,
        countedByUserId: users[3].id,
        countedAt: new Date('2025-01-10')
      });
    }

    // Items for second count (in progress)
    for (let i = 6; i < 9; i++) { // Water products
      const product = products[i];
      const expectedQty = Math.floor(Math.random() * 150) + 30;
      
      countItems.push({
        countId: inventoryCounts[1].id,
        productId: product.id,
        expectedQuantity: expectedQty,
        countedQuantity: null, // Not counted yet
        variance: null,
        reconciled: false,
        countedByUserId: null,
        countedAt: null
      });
    }

    await db.insert(schema.inventoryCountItems).values(countItems);

    // 14. Returns (depends on orders, suppliers, and users)
    console.log('🔄 Creating returns...');
    const returns = await db.insert(schema.returns).values([
      {
        returnNumber: 'DEV-2025-001',
        type: 'customer',
        status: 'completed',
        originalOrderId: orders[1].id,
        customerId: 'KERO-001',
        reason: 'damaged',
        condition: 'damaged',
        totalAmount: '1800.00',
        refundMethod: 'credit',
        notes: 'Garrafas partidas durante transporte',
        userId: users[2].id,
        processedBy: users[1].id,
        processedAt: new Date('2025-01-12')
      },
      {
        returnNumber: 'DEV-2025-002',
        type: 'supplier',
        status: 'approved',
        supplierId: suppliers.find(s => s.name === 'Empresa de Cervejas de Angola (ECA)')?.id,
        reason: 'defective',
        condition: 'defective',
        totalAmount: '8400.00',
        refundMethod: 'exchange',
        notes: 'Lote de cervejas com sabor alterado',
        userId: users[3].id,
        approvedBy: users[1].id,
        approvedAt: new Date('2025-01-18')
      },
      {
        returnNumber: 'DEV-2025-003',
        type: 'internal',
        status: 'pending',
        reason: 'excess',
        condition: 'new',
        totalAmount: '4500.00',
        refundMethod: 'store_credit',
        notes: 'Excesso de stock promocional não vendido',
        userId: users[4].id
      }
    ]).returning();

    // 15. Return Items (depends on returns and products)
    console.log('📦 Creating return items...');
    await db.insert(schema.returnItems).values([
      {
        returnId: returns[0].id,
        productId: products.find(p => p.sku === 'REF-FANT-002')?.id!,
        quantity: 9,
        reason: 'damaged',
        condition: 'damaged',
        unitPrice: '200.00',
        refundAmount: '1800.00',
        restockable: false,
        restocked: false,
        warehouseId: warehouses[0].id,
        qualityNotes: 'Garrafas de vidro partidas, não reaproveitáveis'
      },
      {
        returnId: returns[1].id,
        productId: products.find(p => p.sku === 'CER-EKA-005')?.id!,
        quantity: 30,
        reason: 'defective',
        condition: 'defective',
        unitPrice: '280.00',
        refundAmount: '8400.00',
        restockable: false,
        restocked: false,
        warehouseId: warehouses[0].id,
        qualityNotes: 'Lote com sabor metálico, possível contaminação'
      },
      {
        returnId: returns[2].id,
        productId: products.find(p => p.sku === 'ENE-REDB-013')?.id!,
        quantity: 5,
        reason: 'excess',
        condition: 'new',
        unitPrice: '800.00',
        refundAmount: '4000.00',
        restockable: true,
        restocked: false,
        warehouseId: warehouses[0].id,
        qualityNotes: 'Produto em perfeitas condições'
      },
      {
        returnId: returns[2].id,
        productId: products.find(p => p.sku === 'SUM-ANAN-012')?.id!,
        quantity: 2,
        reason: 'excess',
        condition: 'new',
        unitPrice: '250.00',
        refundAmount: '500.00',
        restockable: true,
        restocked: false,
        warehouseId: warehouses[0].id,
        qualityNotes: 'Produto em perfeitas condições'
      }
    ]);

    // 16. Alerts (depends on users)
    console.log('🚨 Creating alerts...');
    await db.insert(schema.alerts).values([
      {
        type: 'low_stock',
        priority: 'high',
        title: 'Stock Baixo - Cerveja Cuca',
        message: 'O produto CER-CUCA-004 está abaixo do nível mínimo de stock no Centro de Distribuição Luanda.',
        status: 'active',
        entityType: 'product',
        entityId: products.find(p => p.sku === 'CER-CUCA-004')?.id,
        userId: users[1].id
      },
      {
        type: 'reorder_point',
        priority: 'medium',
        title: 'Ponto de Reposição - Água Cuanza',
        message: 'É necessário fazer nova encomenda de Água Cuanza Natural 500ml.',
        status: 'acknowledged',
        entityType: 'product',
        entityId: products.find(p => p.sku === 'AGU-CUAN-007')?.id,
        userId: users[0].id,
        acknowledgedBy: users[1].id,
        acknowledgedAt: new Date()
      },
      {
        type: 'quality',
        priority: 'critical',
        title: 'Alerta de Qualidade - Lote EKA',
        message: 'Detetado problema de qualidade no lote L2025001 da Cerveja Eka. Retirar do mercado imediatamente.',
        status: 'active',
        entityType: 'product',
        entityId: products.find(p => p.sku === 'CER-EKA-005')?.id,
        userId: users[0].id
      },
      {
        type: 'expiry',
        priority: 'medium',
        title: 'Prazo de Validade - Sumo Goiaba',
        message: 'Alguns produtos de Sumo de Goiaba estão próximos do prazo de validade (30 dias).',
        status: 'active',
        entityType: 'product',
        entityId: products.find(p => p.sku === 'SUM-GOIB-011')?.id,
        userId: users[2].id
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
    const notificationPrefs: any[] = [];
    const alertTypes = ['low_stock', 'reorder_point', 'system', 'quality', 'expiry'];
    const channels = ['email', 'in_app', 'sms'];

    for (const user of users) {
      for (const alertType of alertTypes) {
        for (const channel of channels) {
          // Managers get more notifications
          const enableChance = (user.role === 'manager' || user.role === 'admin') ? 0.8 : 0.5;
          notificationPrefs.push({
            userId: user.id,
            alertType,
            channel,
            enabled: Math.random() < enableChance,
            threshold: { value: alertType === 'low_stock' ? 20 : 10 }
          });
        }
      }
    }
    await db.insert(schema.notificationPreferences).values(notificationPrefs);

    // 18. Barcode Scans (depends on products, warehouses, users, and locations)
    console.log('📱 Creating barcode scans...');
    const barcodeScans: any[] = [];
    const scanPurposes = ['inventory', 'picking', 'receiving', 'shipping'];
    const scanLocations = [
      'Zona A - Refrigerantes',
      'Zona B - Cervejas',
      'Zona C - Águas e Sumos',
      'Zona D - Matérias-Primas',
      'Dock de Recebimento',
      'Dock de Expedição'
    ];
    
    for (let i = 0; i < 60; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const purpose = scanPurposes[Math.floor(Math.random() * scanPurposes.length)];
      const location = scanLocations[Math.floor(Math.random() * scanLocations.length)];
      
      barcodeScans.push({
        scannedCode: product.barcode || `SCAN${String(i + 1).padStart(6, '0')}`,
        scanType: Math.random() > 0.1 ? 'barcode' : 'qr', // 90% barcode, 10% QR
        productId: product.id,
        warehouseId: warehouse.id,
        scanPurpose: purpose,
        userId: user.id,
        metadata: {
          deviceId: `HONEYWELL_${Math.floor(Math.random() * 8) + 1}`,
          location: `${warehouse.name} - ${location}`,
          temperature: Math.floor(Math.random() * 10) + 18, // 18-27°C
          scanTime: new Date().toISOString()
        }
      });
    }
    await db.insert(schema.barcodeScans).values(barcodeScans);

    console.log('✅ Database seeding completed successfully for Angola Beverages!');
    console.log(`
🥤 Summary - Angola Beverages Company:
- ${users.length} utilizadores criados (equipa de bebidas)
- ${categories.length} categorias criadas (refrigerantes, cervejas, águas, etc.)
- ${suppliers.length} fornecedores criados (Coca-Cola, ECA, Refriango, etc.)
- ${warehouses.length} armazéns criados (Luanda, Huambo, Benguela, etc.)
- ${products.length} produtos criados (bebidas e matérias-primas angolanas)
- ${inventoryRecords.length} registos de inventário criados
- ${productLocations.length} localizações de produtos criadas
- ${stockMovements.length} movimentos de stock criados
- ${orders.length} encomendas criadas
- ${orderItems.length} itens de encomenda criados
- 4 envios criados
- ${inventoryCounts.length} contagens de inventário criadas
- ${countItems.length} itens de contagem criados
- ${returns.length} devoluções criadas
- 4 itens de devolução criados
- 5 alertas criados
- ${notificationPrefs.length} preferências de notificação criadas
- ${barcodeScans.length} leituras de código de barras criadas

🇦🇴 Dados específicos para Angola:
- Empresas reais do mercado angolano
- Produtos típicos consumidos em Angola
- Localizações geográficas reais
- Fornecedores da indústria de bebidas local
- Preços em Kwanzas (AOA)
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
    console.log('🎉 Seeding process completed for Angola Beverages!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });

export { seedDatabase };