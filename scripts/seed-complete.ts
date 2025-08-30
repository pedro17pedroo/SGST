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

async function seedCompleteDatabase() {
  console.log('🌱 SEED COMPLETO - Populando TODAS as tabelas para o sistema SGST Angola...');

  try {
    // Clear ALL existing data in correct dependency order
    console.log('🧹 Limpando todos os dados existentes...');
    
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

    // ===== TABELAS BÁSICAS =====
    
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
        username: 'isabel.supervisor',
        email: 'isabel.machado@sgst.ao',
        password: '$2b$12$65PV.ZplJKONv8p.MaAuJOlXsjZI4tGoCNfLD5jEhScZruahi2S5O', // manager123
        role: 'manager',
        isActive: true
      },
      {
        username: 'carlos.quality',
        email: 'carlos.silva@sgst.ao',
        password: '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', // operator123
        role: 'operator',
        isActive: true
      },
      {
        username: 'ana.logistics',
        email: 'ana.fernandes@sgst.ao',
        password: '$2b$12$65PV.ZplJKONv8p.MaAuJOlXsjZI4tGoCNfLD5jEhScZruahi2S5O', // manager123
        role: 'manager',
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
      },
      {
        name: 'Produtos Agrícolas',
        description: 'Sementes, ferramentas agrícolas e equipamentos de agricultura'
      },
      {
        name: 'Combustíveis e Energia',
        description: 'Gasóleo, gasolina, baterias e equipamentos energéticos'
      },
      {
        name: 'Peças Automóveis',
        description: 'Peças de reposição, pneus e acessórios para veículos'
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
        name: 'Sovipe - Sociedade de Vinhos de Portugal',
        email: 'angola@sovipe.ao',
        phone: '+244 222 667 901',
        address: 'Rua Amílcar Cabral, 89, Maianga, Luanda'
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
        name: 'Textang - Têxteis de Angola',
        email: 'comercial@textang.ao',
        phone: '+244 222 990 234',
        address: 'Catumbela, Província de Benguela'
      },
      {
        name: 'Farmácia Central de Angola',
        email: 'distribuidora@farmaciacentral.ao',
        phone: '+244 272 445 678',
        address: 'Caxito, Província de Bengo'
      },
      {
        name: 'Sonangol Distribuidora',
        email: 'combustiveis@sonangol.co.ao',
        phone: '+244 222 640 100',
        address: 'Rua Rainha Ginga, 29-31, Luanda'
      },
      {
        name: 'TecnoPhone Angola',
        email: 'vendas@tecnophone.ao',
        phone: '+244 923 456 789',
        address: 'Rua do Samba, Ingombota, Luanda'
      },
      {
        name: 'AutoPeças Luanda',
        email: 'pecas@autopecasluanda.ao',
        phone: '+244 222 355 667',
        address: 'Estrada de Catete, Km 12, Luanda'
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
      },
      {
        name: 'Armazém Fronteiriço Cabinda',
        address: 'Zona Comercial de Cabinda, Cabinda',
        isActive: true
      },
      {
        name: 'Depósito Regional Malanje',
        address: 'Estrada Nacional EN220, Malanje',
        isActive: true
      },
      {
        name: 'Armazém Uíge',
        address: 'Centro Comercial do Uíge, Uíge',
        isActive: true
      },
      {
        name: 'Terminal Cuando Cubango',
        address: 'Estrada do Aeroporto, Menongue',
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
      {
        name: 'Arroz Agulhinha 5kg',
        description: 'Arroz agulhinha tipo 1 extra longo',
        sku: 'ALI-ARRO-004',
        barcode: '6201234567004',
        price: '2200.00',
        weight: '5.000',
        dimensions: { length: 40, width: 25, height: 8 },
        categoryId: categories.find(c => c.name === 'Produtos Alimentares')?.id,
        supplierId: suppliers.find(s => s.name === 'Alimenta Angola Lda')?.id,
        minStockLevel: 800,
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
      {
        name: 'Água Mineral Cuanza 500ml',
        description: 'Água mineral natural das nascentes do Cuanza',
        sku: 'BEB-AGUA-007',
        barcode: '6789012345003',
        price: '150.00',
        weight: '0.520',
        dimensions: { length: 7, width: 7, height: 20 },
        categoryId: categories.find(c => c.name === 'Bebidas')?.id,
        supplierId: suppliers.find(s => s.name === 'Refriango - Indústrias Alimentares')?.id,
        minStockLevel: 4000,
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
      {
        name: 'Pasta de Dentes CleanMax 100g',
        description: 'Pasta de dentes com flúor e menta',
        sku: 'HIG-PAST-009',
        barcode: '7890123456002',
        price: '420.00',
        weight: '0.120',
        dimensions: { length: 15, width: 4, height: 4 },
        categoryId: categories.find(c => c.name === 'Produtos de Higiene')?.id,
        supplierId: suppliers.find(s => s.name === 'Refriango - Indústrias Alimentares')?.id,
        minStockLevel: 2000,
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
      {
        name: 'Vitamina C 1000mg (30 comp)',
        description: 'Suplemento vitamínico para imunidade',
        sku: 'FAR-VITC-011',
        barcode: '8901234567002',
        price: '850.00',
        weight: '0.080',
        dimensions: { length: 10, width: 6, height: 6 },
        categoryId: categories.find(c => c.name === 'Produtos Farmacêuticos')?.id,
        supplierId: suppliers.find(s => s.name === 'Farmácia Central de Angola')?.id,
        minStockLevel: 500,
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
      {
        name: 'Tinta Latex Branca 3.6L',
        description: 'Tinta latex acrílica branca para interior e exterior',
        sku: 'CON-TINT-013',
        barcode: '9012345678002',
        price: '3200.00',
        weight: '4.200',
        dimensions: { length: 20, width: 20, height: 25 },
        categoryId: categories.find(c => c.name === 'Materiais de Construção')?.id,
        supplierId: suppliers.find(s => s.name === 'Nova Cimangola')?.id,
        minStockLevel: 300,
        isActive: true
      },
      
      // Têxteis e Vestuário
      {
        name: 'Camisa Social Masculina M',
        description: 'Camisa social 100% algodão tamanho médio',
        sku: 'TEX-CAMI-014',
        barcode: '0123456789001',
        price: '2800.00',
        weight: '0.300',
        dimensions: { length: 30, width: 25, height: 5 },
        categoryId: categories.find(c => c.name === 'Têxteis e Vestuário')?.id,
        supplierId: suppliers.find(s => s.name === 'Textang - Têxteis de Angola')?.id,
        minStockLevel: 200,
        isActive: true
      },
      {
        name: 'Tecido Capulana Tradicional 2m',
        description: 'Tecido tradicional angolano estampado',
        sku: 'TEX-CAPU-015',
        barcode: '0123456789002',
        price: '1500.00',
        weight: '0.400',
        dimensions: { length: 200, width: 110, height: 2 },
        categoryId: categories.find(c => c.name === 'Têxteis e Vestuário')?.id,
        supplierId: suppliers.find(s => s.name === 'Textang - Têxteis de Angola')?.id,
        minStockLevel: 500,
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
        supplierId: suppliers.find(s => s.name === 'TecnoPhone Angola')?.id,
        minStockLevel: 100,
        isActive: true
      },
      {
        name: 'Carregador Universal USB-C',
        description: 'Carregador universal USB-C 18W fast charge',
        sku: 'ELE-CARR-017',
        barcode: '1234567890002',
        price: '2500.00',
        weight: '0.150',
        dimensions: { length: 10, width: 5, height: 3 },
        categoryId: categories.find(c => c.name === 'Produtos Eletrónicos')?.id,
        supplierId: suppliers.find(s => s.name === 'TecnoPhone Angola')?.id,
        minStockLevel: 500,
        isActive: true
      },
      
      // Produtos Agrícolas
      {
        name: 'Sementes Milho Híbrido 1kg',
        description: 'Sementes de milho híbrido alta produtividade',
        sku: 'AGR-SEME-018',
        barcode: '2345678901001',
        price: '3500.00',
        weight: '1.000',
        dimensions: { length: 25, width: 15, height: 8 },
        categoryId: categories.find(c => c.name === 'Produtos Agrícolas')?.id,
        supplierId: suppliers.find(s => s.name === 'Alimenta Angola Lda')?.id,
        minStockLevel: 200,
        isActive: true
      },
      {
        name: 'Enxada Cabo Madeira',
        description: 'Enxada tradicional com cabo de madeira resistente',
        sku: 'AGR-ENXA-019',
        barcode: '2345678901002',
        price: '1800.00',
        weight: '1.200',
        dimensions: { length: 120, width: 20, height: 5 },
        categoryId: categories.find(c => c.name === 'Produtos Agrícolas')?.id,
        supplierId: suppliers.find(s => s.name === 'Nova Cimangola')?.id,
        minStockLevel: 100,
        isActive: true
      },
      
      // Combustíveis e Energia
      {
        name: 'Bateria Carro 60Ah',
        description: 'Bateria automotiva 12V 60Ah livre manutenção',
        sku: 'COM-BATE-020',
        barcode: '3456789012001',
        price: '18500.00',
        weight: '18.000',
        dimensions: { length: 24, width: 17, height: 19 },
        categoryId: categories.find(c => c.name === 'Combustíveis e Energia')?.id,
        supplierId: suppliers.find(s => s.name === 'Sonangol Distribuidora')?.id,
        minStockLevel: 50,
        isActive: true
      },
      
      // Peças Automóveis
      {
        name: 'Pneu 185/65 R15',
        description: 'Pneu radial 185/65 R15 para carros ligeiros',
        sku: 'AUT-PNEU-021',
        barcode: '4567890123001',
        price: '12500.00',
        weight: '8.500',
        dimensions: { length: 62, width: 62, height: 19 },
        categoryId: categories.find(c => c.name === 'Peças Automóveis')?.id,
        supplierId: suppliers.find(s => s.name === 'AutoPeças Luanda')?.id,
        minStockLevel: 80,
        isActive: true
      },
      {
        name: 'Óleo Motor 15W40 4L',
        description: 'Óleo lubrificante motor 15W40 semi-sintético',
        sku: 'AUT-OLEO-022',
        barcode: '4567890123002',
        price: '4200.00',
        weight: '4.200',
        dimensions: { length: 25, width: 18, height: 28 },
        categoryId: categories.find(c => c.name === 'Peças Automóveis')?.id,
        supplierId: suppliers.find(s => s.name === 'AutoPeças Luanda')?.id,
        minStockLevel: 200,
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
        } else if (product.name.includes('Água') || product.name.includes('Fuba')) {
          baseQuantity = 600;
        } else if (product.name.includes('Cimento') || product.name.includes('Pneu')) {
          baseQuantity = 30;
        } else if (product.name.includes('Smartphone') || product.name.includes('Bateria')) {
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
    const zones = ['A', 'B', 'C', 'D', 'E'];
    const shelves = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
    const bins = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

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
          lastScanned: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random scan within last week
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
      'Produto danificado',
      'Devolução de cliente',
      'Distribuição para lojas',
      'Abastecimento grossista',
      'Exportação SADC',
      'Uso interno'
    ];

    for (let i = 0; i < 120; i++) {
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
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random within last 30 days
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
      },
      {
        orderNumber: 'ORD-2025-0004',
        type: 'sale',
        status: 'processing',
        customerName: 'Farmácia Popular',
        customerEmail: 'compras@farmaciapopular.ao',
        customerPhone: '+244 222 345 678',
        customerAddress: 'Largo 1º de Maio, 8, Benguela',
        totalAmount: '23400.00',
        notes: 'Produtos farmacêuticos urgentes',
        userId: users[2].id,
        createdAt: new Date('2025-01-28T16:45:00Z')
      },
      {
        orderNumber: 'ORD-2025-0005',
        type: 'sale',
        status: 'completed',
        customerName: 'Construção & Cia',
        customerEmail: 'obras@construcaoecompanhia.ao',
        customerPhone: '+244 272 456 789',
        customerAddress: 'Zona Industrial, Lote 67, Malanje',
        totalAmount: '234000.00',
        notes: 'Material para obra de habitação social',
        userId: users[3].id,
        createdAt: new Date('2025-01-30T11:20:00Z')
      }
    ]).returning();

    // 10. Order Items
    console.log('📦 Criando itens de encomenda...');
    const orderItems: any[] = [
      // Order 1 items
      {
        orderId: orders[0].id,
        productId: products.find(p => p.name.includes('Fuba'))?.id || products[0].id,
        quantity: 50,
        unitPrice: '450.00',
        totalPrice: '22500.00'
      },
      {
        orderId: orders[0].id,
        productId: products.find(p => p.name.includes('Óleo'))?.id || products[1].id,
        quantity: 30,
        unitPrice: '850.00',
        totalPrice: '25500.00'
      },
      {
        orderId: orders[0].id,
        productId: products.find(p => p.name.includes('Cerveja'))?.id || products[2].id,
        quantity: 200,
        unitPrice: '350.00',
        totalPrice: '70000.00'
      },
      // Order 2 items
      {
        orderId: orders[1].id,
        productId: products.find(p => p.name.includes('Açúcar'))?.id || products[0].id,
        quantity: 100,
        unitPrice: '380.00',
        totalPrice: '38000.00'
      },
      {
        orderId: orders[1].id,
        productId: products.find(p => p.name.includes('Arroz'))?.id || products[1].id,
        quantity: 20,
        unitPrice: '2200.00',
        totalPrice: '44000.00'
      },
      // Order 4 items (Farmácia)
      {
        orderId: orders[3].id,
        productId: products.find(p => p.name.includes('Paracetamol'))?.id || products[0].id,
        quantity: 50,
        unitPrice: '320.00',
        totalPrice: '16000.00'
      },
      {
        orderId: orders[3].id,
        productId: products.find(p => p.name.includes('Vitamina'))?.id || products[1].id,
        quantity: 12,
        unitPrice: '850.00',
        totalPrice: '10200.00'
      }
    ];
    await db.insert(schema.orderItems).values(orderItems);

    // 11. Shipments
    console.log('🚛 Criando envios...');
    const shipments = await db.insert(schema.shipments).values([
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
      },
      {
        shipmentNumber: 'SHIP-2025-002',
        orderId: orders[1].id,
        status: 'in_transit',
        carrier: 'Logística Planalto',
        trackingNumber: 'LP-2025-005678',
        shippingAddress: 'Avenida Norton de Matos, 45, Huambo',
        estimatedDelivery: new Date('2025-02-02T16:00:00Z'),
        userId: users[1].id,
        createdAt: new Date('2025-01-22T11:30:00Z')
      }
    ]).returning();

    // 12. Alerts
    console.log('🚨 Criando alertas...');
    const alerts = await db.insert(schema.alerts).values([
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
        type: 'expiry',
        priority: 'medium',
        title: 'Produtos Próximos do Vencimento',
        message: 'Lote de medicamentos com vencimento em 30 dias',
        status: 'active',
        entityType: 'product',
        entityId: products.find(p => p.name.includes('Paracetamol'))?.id || products[1].id,
        userId: users[0].id,
        metadata: { expiry_date: '2025-03-15', lot_number: 'LOT-2024-456' }
      },
      {
        type: 'quality',
        priority: 'critical',
        title: 'Problema de Qualidade Detectado',
        message: 'Lote de fuba com possível contaminação - isolamento necessário',
        status: 'investigating',
        entityType: 'product',
        entityId: products.find(p => p.name.includes('Fuba'))?.id || products[2].id,
        userId: users[0].id,
        investigatedBy: users[6].id, // Carlos quality
        metadata: { lot_number: 'FUBA-2025-123', affected_quantity: 200 }
      }
    ]).returning();

    // 13. Notification Preferences
    console.log('🔔 Criando preferências de notificação...');
    const notificationPrefs: any[] = [];
    const alertTypes = ['low_stock', 'expiry', 'quality', 'system'];
    const channels = ['email', 'in_app'];
    
    for (const user of users) {
      for (const alertType of alertTypes) {
        for (const channel of channels) {
          notificationPrefs.push({
            userId: user.id,
            alertType,
            channel,
            enabled: Math.random() > 0.2 // 80% chance enabled
          });
        }
      }
    }
    await db.insert(schema.notificationPreferences).values(notificationPrefs);

    // 14. Inventory Counts
    console.log('📊 Criando contagens de inventário...');
    const inventoryCounts = await db.insert(schema.inventoryCounts).values([
      {
        countNumber: 'COUNT-2025-001',
        type: 'cycle',
        status: 'completed',
        warehouseId: warehouses[0].id,
        scheduledDate: new Date('2025-01-15T08:00:00Z'),
        completedDate: new Date('2025-01-15T17:30:00Z'),
        userId: users[2].id,
        notes: 'Contagem cíclica zona A - sem discrepâncias significativas'
      },
      {
        countNumber: 'COUNT-2025-002',
        type: 'spot',
        status: 'in_progress',
        warehouseId: warehouses[1].id,
        scheduledDate: new Date('2025-02-01T09:00:00Z'),
        userId: users[3].id,
        notes: 'Contagem específica após alerta de stock baixo'
      }
    ]).returning();

    // 15. Inventory Count Items
    console.log('📋 Criando itens de contagem...');
    const countItems: any[] = [];
    for (let i = 0; i < 10; i++) {
      const product = products[i];
      const expectedQty = Math.floor(Math.random() * 500) + 100;
      const countedQty = expectedQty + Math.floor(Math.random() * 21) - 10; // ±10 variance
      
      countItems.push({
        countId: inventoryCounts[0].id,
        productId: product.id,
        expectedQuantity: expectedQty,
        countedQuantity: countedQty,
        variance: countedQty - expectedQty,
        reconciled: Math.abs(countedQty - expectedQty) <= 5,
        countedByUserId: users[2].id,
        countedAt: new Date('2025-01-15T15:30:00Z')
      });
    }
    await db.insert(schema.inventoryCountItems).values(countItems);

    // 16. Picking Lists
    console.log('📝 Criando listas de picking...');
    const pickingLists = await db.insert(schema.pickingLists).values([
      {
        pickNumber: 'PICK-2025-001',
        orderId: orders[0].id,
        warehouseId: warehouses[0].id,
        status: 'completed',
        priority: 'high',
        assignedTo: users[3].id,
        type: 'order',
        scheduledDate: new Date('2025-01-16T08:00:00Z'),
        startedAt: new Date('2025-01-16T08:15:00Z'),
        completedAt: new Date('2025-01-16T09:45:00Z'),
        estimatedTime: 90,
        actualTime: 90,
        notes: 'Picking prioritário para cliente VIP',
        userId: users[0].id
      },
      {
        pickNumber: 'PICK-2025-002',
        orderId: orders[1].id,
        warehouseId: warehouses[1].id,
        status: 'in_progress',
        priority: 'medium',
        assignedTo: users[4].id,
        type: 'order',
        scheduledDate: new Date('2025-01-22T10:00:00Z'),
        startedAt: new Date('2025-01-22T10:30:00Z'),
        estimatedTime: 120,
        notes: 'Picking para Huambo - verificar embalagem extra',
        userId: users[1].id
      }
    ]).returning();

    // 17. Picking List Items
    console.log('📦 Criando itens de picking...');
    await db.insert(schema.pickingListItems).values([
      {
        pickingListId: pickingLists[0].id,
        productId: products.find(p => p.name.includes('Fuba'))?.id || products[0].id,
        locationId: productLocations[0].id,
        quantityToPick: 50,
        quantityPicked: 50,
        status: 'picked',
        pickedBy: users[3].id,
        pickedAt: new Date('2025-01-16T08:30:00Z'),
        notes: 'Produto em perfeitas condições'
      },
      {
        pickingListId: pickingLists[0].id,
        productId: products.find(p => p.name.includes('Cerveja'))?.id || products[1].id,
        locationId: productLocations[1].id,
        quantityToPick: 200,
        quantityPicked: 200,
        status: 'picked',
        pickedBy: users[3].id,
        pickedAt: new Date('2025-01-16T09:15:00Z'),
        notes: 'Verificada data de validade'
      }
    ]);

    // 18. Barcode Scans
    console.log('📱 Criando scans de código de barras...');
    const barcodeScans: any[] = [];
    for (let i = 0; i < 50; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const purposes = ['inventory', 'picking', 'receiving', 'shipping'];
      
      barcodeScans.push({
        scannedCode: product.barcode,
        scanType: 'barcode',
        productId: product.id,
        warehouseId: warehouse.id,
        scanPurpose: purposes[Math.floor(Math.random() * purposes.length)],
        userId: user.id,
        metadata: {
          device: `SCANNER-${Math.floor(Math.random() * 10) + 1}`,
          gps: { lat: -8.83, lng: 13.24 }, // Luanda coordinates
          quality: 'good'
        },
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random within last 24 hours
      });
    }
    await db.insert(schema.barcodeScans).values(barcodeScans);

    // 19. Returns
    console.log('↩️ Criando devoluções...');
    const returns = await db.insert(schema.returns).values([
      {
        returnNumber: 'RET-2025-001',
        type: 'customer',
        status: 'approved',
        originalOrderId: orders[0].id,
        customerId: 'CUST-NOSSOSUPER-001',
        reason: 'damaged',
        condition: 'damaged',
        totalAmount: '7000.00',
        refundMethod: 'credit',
        qualityInspection: {
          inspector: 'carlos.quality',
          result: 'approved',
          notes: 'Danos durante transporte confirmados'
        },
        notes: 'Produto danificado durante entrega - aprovada devolução',
        approvedBy: users[0].id,
        processedBy: users[6].id,
        userId: users[2].id,
        approvedAt: new Date('2025-01-18T14:00:00Z'),
        processedAt: new Date('2025-01-18T16:30:00Z')
      }
    ]).returning();

    // 20. Return Items
    console.log('📋 Criando itens de devolução...');
    await db.insert(schema.returnItems).values([
      {
        returnId: returns[0].id,
        productId: products.find(p => p.name.includes('Cerveja'))?.id || products[0].id,
        originalOrderItemId: orderItems[2] ? orderItems[2].id : undefined,
        quantity: 20,
        reason: 'damaged',
        condition: 'damaged',
        unitPrice: '350.00',
        refundAmount: '7000.00',
        restockable: false,
        restocked: false,
        warehouseId: warehouses[0].id,
        qualityNotes: 'Garrafas partidas durante transporte - descartar'
      }
    ]);

    console.log('✅ TABELAS BÁSICAS completadas!');

    // ===== FUNCIONALIDADES AVANÇADAS =====
    
    // 21. Advanced Shipment Notice (ASN)
    console.log('📋 Criando Advanced Shipment Notices (ASN)...');
    const asns = await db.insert(schema.asn).values([
      {
        asnNumber: 'ASN-2025-001',
        supplierId: suppliers.find(s => s.name?.includes('ECA'))?.id || suppliers[0].id,
        warehouseId: warehouses[0].id,
        poNumber: 'PO-ECA-2025-001',
        status: 'arrived',
        transportMode: 'truck',
        carrier: 'Transporte Rápido de Angola',
        trackingNumber: 'TRA-2025-001234',
        estimatedArrival: new Date('2025-02-15T14:00:00Z'),
        actualArrival: new Date('2025-02-15T13:45:00Z'),
        containerNumbers: ['CTR-2025-001', 'CTR-2025-002'],
        sealNumbers: ['SEAL-001', 'SEAL-002'],
        totalWeight: '25000.000',
        totalVolume: '45.500',
        documentUrl: '/docs/asn/ASN-2025-001.pdf',
        notes: 'Carregamento de bebidas para centro de distribuição',
        userId: users[0].id
      },
      {
        asnNumber: 'ASN-2025-002',
        supplierId: suppliers.find(s => s.name?.includes('Alimenta'))?.id || suppliers[1].id,
        warehouseId: warehouses[1].id,
        poNumber: 'PO-ALI-2025-002',
        status: 'receiving',
        transportMode: 'truck',
        carrier: 'Logística Kwanza',
        trackingNumber: 'LKW-2025-005678',
        estimatedArrival: new Date('2025-02-10T09:00:00Z'),
        actualArrival: new Date('2025-02-10T09:30:00Z'),
        containerNumbers: ['CTR-ALI-001'],
        sealNumbers: ['SEAL-ALI-001'],
        totalWeight: '18000.000',
        totalVolume: '32.000',
        documentUrl: '/docs/asn/ASN-2025-002.pdf',
        notes: 'Entrega de produtos alimentares para região centro',
        userId: users[1].id
      }
    ]).returning();

    // 22. ASN Line Items
    console.log('📝 Criando itens de ASN...');
    await db.insert(schema.asnLineItems).values([
      {
        asnId: asns[0].id,
        productId: products.find(p => p.name.includes('Cerveja'))?.id || products[0].id,
        expectedQuantity: 2000,
        unitOfMeasure: 'EA',
        lotNumber: 'LOT-CUCA-2025-001',
        expiryDate: new Date('2025-08-31'),
        palletId: 'PLT-CUCA-001',
        packaging: 'case',
        expectedWeight: '1100.000',
        expectedDimensions: {length: 40, width: 30, height: 25},
        notes: 'Garrafas 330ml em caixas de 24 unidades'
      },
      {
        asnId: asns[1].id,
        productId: products.find(p => p.name.includes('Fuba'))?.id || products[1].id,
        expectedQuantity: 1000,
        unitOfMeasure: 'EA',
        lotNumber: 'LOT-FUBA-2025-001',
        expiryDate: new Date('2025-12-31'),
        palletId: 'PLT-FUBA-001',
        packaging: 'bag',
        expectedWeight: '1000.000',
        expectedDimensions: {length: 30, width: 20, height: 15},
        notes: 'Sacos de 1kg em pallets de madeira'
      }
    ]);

    // 23. Receiving Receipts
    console.log('📥 Criando recibos de receção...');
    const receivingReceipts = await db.insert(schema.receivingReceipts).values([
      {
        receiptNumber: 'REC-2025-001',
        asnId: asns[0].id,
        status: 'completed',
        warehouseId: warehouses[0].id,
        receivingMethod: 'barcode',
        totalExpected: 2000,
        totalReceived: 1995,
        discrepancies: 5,
        damageReported: true,
        qualityInspection: {
          passed: true,
          inspector: 'carlos.quality',
          notes: 'Produtos em excelente estado'
        },
        receivedBy: users[4].id,
        receivedAt: new Date('2025-02-15T15:30:00Z'),
        completedAt: new Date('2025-02-15T16:30:00Z'),
        notes: 'Receção sem problemas - produtos armazenados zona A'
      }
    ]).returning();

    // 24. Receiving Receipt Items
    console.log('📦 Criando itens de receção...');
    const receivingReceiptItems = await db.insert(schema.receivingReceiptItems).values([
      {
        receiptId: receivingReceipts[0].id,
        asnLineItemId: (await db.select().from(schema.asnLineItems).where(eq(schema.asnLineItems.asnId, asns[0].id)))[0].id,
        productId: products.find(p => p.name.includes('Cerveja'))?.id || products[0].id,
        expectedQuantity: 2000,
        receivedQuantity: 1995,
        variance: -5,
        acceptedQuantity: 1995,
        rejectedQuantity: 0,
        damageQuantity: 5,
        qualityGrade: 'A',
        lotNumber: 'LOT-CUCA-2025-001',
        expiryDate: new Date('2025-08-31'),
        condition: 'good',
        notes: '5 garrafas com pequenos defeitos - descartadas'
      }
    ]).returning();

    // 25. Computer Vision Counting Results
    console.log('🔍 Criando resultados de visão computacional...');
    await db.insert(schema.cvCountingResults).values([
      {
        sessionId: 'CV-2025-001',
        imageUrl: '/cv/images/session-001-frame-001.jpg',
        videoUrl: '/cv/videos/session-001.mp4',
        productId: products.find(p => p.name.includes('Cimento'))?.id || products[0].id,
        detectedCount: 145,
        confidence: '0.9750',
        algorithm: 'yolo_v8',
        boundingBoxes: [
          {x: 120, y: 80, width: 200, height: 150, confidence: 0.98},
          {x: 350, y: 90, width: 190, height: 145, confidence: 0.97}
        ],
        dimensions: {length: 80, width: 50, height: 10},
        weight: '7250.000',
        damage: {detected: false, confidence: 0.99, regions: []},
        manualVerification: true,
        manualCount: 145,
        verifiedBy: users[6].id,
        status: 'verified',
        metadata: {
          camera: 'CAM-LUANDA-001',
          lighting: 'artificial',
          resolution: '4K',
          fps: 30
        },
        processingTime: 3247
      }
    ]);

    // 26. Putaway Rules
    console.log('📍 Criando regras de putaway...');
    const putawayRules = await db.insert(schema.putawayRules).values([
      {
        name: 'Regra Bebidas - Zona Refrigerada',
        priority: 1,
        warehouseId: warehouses[0].id,
        productCriteria: {categoryName: 'Bebidas', temperatureControl: true},
        locationCriteria: {zone: 'A', shelfType: 'cold', heightRange: {min: 0, max: 3}, accessibility: 'high'},
        strategy: 'abc_velocity',
        crossDockEligible: true,
        crossDockCriteria: {maxHours: 4, minQuantity: 500},
        maxCapacityUtilization: '0.8500',
        isActive: true,
        userId: users[0].id
      },
      {
        name: 'Regra Materiais Pesados - Zona Térrea',
        priority: 2,
        warehouseId: warehouses[0].id,
        productCriteria: {weight: {min: 10000}, categoryName: 'Materiais de Construção'},
        locationCriteria: {zone: 'D', shelfType: 'ground', heightRange: {min: 0, max: 1}, accessibility: 'forklift'},
        strategy: 'weight_based',
        crossDockEligible: false,
        maxCapacityUtilization: '0.9000',
        isActive: true,
        userId: users[0].id
      }
    ]).returning();

    // 27. Putaway Tasks
    console.log('📦 Criando tarefas de putaway...');
    await db.insert(schema.putawayTasks).values([
      {
        taskNumber: 'PUT-2025-001',
        receiptItemId: receivingReceiptItems[0].id,
        productId: products.find(p => p.name.includes('Cerveja'))?.id || products[0].id,
        warehouseId: warehouses[0].id,
        quantity: 1995,
        suggestedLocationId: productLocations[0].id,
        actualLocationId: productLocations[0].id,
        assignedTo: users[4].id,
        status: 'completed',
        priority: 'medium',
        estimatedTime: 45,
        actualTime: 40,
        completedAt: new Date('2025-02-15T16:30:00Z'),
        notes: 'Putaway concluído sem problemas',
        userId: users[4].id
      }
    ]);

    // 28. SSCC Pallets
    console.log('📦 Criando pallets SSCC...');
    const ssccPallets = await db.insert(schema.ssccPallets).values([
      {
        ssccCode: '100234567890123456',
        palletType: 'euro',
        status: 'completed',
        warehouseId: warehouses[0].id,
        locationId: productLocations[0].id,
        maxWeight: '1000.000',
        maxHeight: '200.00',
        currentWeight: '950.500',
        currentHeight: '190.00',
        itemCount: 40,
        mixedProducts: false,
        palletLabel: {
          sscc: '100234567890123456',
          content: 'Cerveja Cuca 330ml',
          quantity: 40,
          weight: '950.5kg',
          date: '2025-02-15'
        },
        completedAt: new Date('2025-02-15T17:00:00Z'),
        userId: users[4].id
      }
    ]).returning();

    // 29. Pallet Items
    console.log('📋 Criando itens de pallet...');
    await db.insert(schema.palletItems).values([
      {
        palletId: ssccPallets[0].id,
        productId: products.find(p => p.name.includes('Cerveja'))?.id || products[0].id,
        quantity: 960,
        lotNumber: 'LOT-CUCA-2025-001',
        expiryDate: new Date('2025-08-31'),
        weight: '528.000',
        stackOrder: 1,
        addedAt: new Date('2025-02-15T16:45:00Z')
      }
    ]);

    // 30. Replenishment Rules
    console.log('🔄 Criando regras de reabastecimento...');
    const replenishmentRules = await db.insert(schema.replenishmentRules).values([
      {
        name: 'Regra Cerveja Auto-Replenishment',
        productId: products.find(p => p.name.includes('Cerveja'))?.id || products[0].id,
        warehouseId: warehouses[0].id,
        locationId: productLocations[0].id,
        strategy: 'demand_based',
        minLevel: 200,
        maxLevel: 1000,
        reorderPoint: 400,
        replenishQuantity: 600,
        leadTimeDays: 3,
        safetyStock: 100,
        abcClassification: 'A',
        velocityCategory: 'fast',
        seasonalFactor: '1.1500',
        mlModelId: 'demand-forecast-v2.1',
        isActive: true,
        userId: users[0].id
      }
    ]).returning();

    // 31. Demand Forecasts
    console.log('📈 Criando previsões de demanda...');
    await db.insert(schema.demandForecasts).values([
      {
        productId: products.find(p => p.name.includes('Cerveja'))?.id || products[0].id,
        warehouseId: warehouses[0].id,
        forecastDate: new Date('2025-02-20'),
        forecastPeriod: 'daily',
        predictedDemand: '85.00',
        confidence: '0.8750',
        actualDemand: '82.00',
        accuracy: '0.9647',
        modelVersion: 'v2.1-lstm',
        algorithm: 'lstm',
        features: ['sales_history', 'seasonality', 'weather', 'events'],
        metadata: {temperature: 32, humidity: 70, special_events: ['Carnaval preparations']}
      }
    ]);

    // 32. Replenishment Tasks
    console.log('🔄 Criando tarefas de reabastecimento...');
    await db.insert(schema.replenishmentTasks).values([
      {
        taskNumber: 'REP-2025-001',
        productId: products.find(p => p.name.includes('Cerveja'))?.id || products[0].id,
        warehouseId: warehouses[0].id,
        fromLocationId: productLocations[1].id,
        toLocationId: productLocations[0].id,
        ruleId: replenishmentRules[0].id,
        triggerReason: 'below_reorder_point',
        quantityRequired: 600,
        quantityAvailable: 800,
        quantityToMove: 600,
        quantityMoved: 600,
        priority: 'medium',
        status: 'completed',
        assignedTo: users[4].id,
        completedAt: new Date('2025-02-16T11:30:00Z'),
        notes: 'Reabastecimento automático concluído',
        userId: users[4].id
      }
    ]);

    // 33. Picking Velocity
    console.log('⚡ Criando dados de velocidade de picking...');
    await db.insert(schema.pickingVelocity).values([
      {
        productId: products.find(p => p.name.includes('Cerveja'))?.id || products[0].id,
        warehouseId: warehouses[0].id,
        locationId: productLocations[0].id,
        date: new Date('2025-02-15'),
        period: 'daily',
        totalPicked: 1200,
        pickingEvents: 35,
        averagePickTime: '42.50',
        peakHour: 14,
        velocityScore: '92.5000',
        abcClass: 'A',
        trendDirection: 'up'
      }
    ]);

    // ===== DIGITAL TWIN OPERACIONAL =====
    
    // 34. Warehouse Zones
    console.log('🏗️ Criando zonas de armazém...');
    const warehouseZones = await db.insert(schema.warehouseZones).values([
      {
        warehouseId: warehouses[0].id,
        name: 'Zona A - Bebidas e Líquidos',
        type: 'picking',
        coordinates: {x: 0, y: 0, width: 50, height: 30, z: 0, floor: 1},
        capacity: {maxItems: 15000, maxWeight: 30000, maxVolume: 2000},
        currentUtilization: {items: 12500, weight: 25000, volume: 1650, percentage: 83},
        isActive: true
      },
      {
        warehouseId: warehouses[0].id,
        name: 'Zona B - Produtos Secos',
        type: 'storage',
        coordinates: {x: 50, y: 0, width: 40, height: 30, z: 0, floor: 1},
        capacity: {maxItems: 20000, maxWeight: 40000, maxVolume: 2500},
        currentUtilization: {items: 15000, weight: 30000, volume: 1875, percentage: 75},
        isActive: true
      },
      {
        warehouseId: warehouses[0].id,
        name: 'Zona C - Materiais Pesados',
        type: 'storage',
        coordinates: {x: 0, y: 30, width: 50, height: 25, z: 0, floor: 1},
        capacity: {maxItems: 5000, maxWeight: 100000, maxVolume: 3000},
        currentUtilization: {items: 3200, weight: 64000, volume: 1920, percentage: 64},
        isActive: true
      },
      {
        warehouseId: warehouses[0].id,
        name: 'Zona D - Receção/Expedição',
        type: 'staging',
        coordinates: {x: 50, y: 30, width: 40, height: 25, z: 0, floor: 1},
        capacity: {maxItems: 3000, maxWeight: 15000, maxVolume: 800},
        currentUtilization: {items: 450, weight: 2250, volume: 120, percentage: 15},
        isActive: true
      }
    ]).returning();

    // 35. Warehouse Layout
    console.log('📐 Criando layouts de armazém...');
    await db.insert(schema.warehouseLayout).values([
      {
        warehouseId: warehouses[0].id,
        name: 'Layout Principal Luanda Norte v4.1',
        version: '4.1',
        layoutData: {
          dimensions: {length: 120, width: 65, height: 12},
          zones: [
            {id: 'A', name: 'Bebidas', x: 0, y: 0, width: 50, height: 30, type: 'picking'},
            {id: 'B', name: 'Secos', x: 50, y: 0, width: 40, height: 30, type: 'storage'},
            {id: 'C', name: 'Pesados', x: 0, y: 30, width: 50, height: 25, type: 'storage'},
            {id: 'D', name: 'Staging', x: 50, y: 30, width: 40, height: 25, type: 'staging'}
          ],
          aisles: [
            {id: 'AISLE-MAIN', start: {x: 0, y: 27.5}, end: {x: 120, y: 27.5}, width: 5},
            {id: 'AISLE-1', start: {x: 48, y: 0}, end: {x: 48, y: 65}, width: 4},
            {id: 'AISLE-2', start: {x: 25, y: 0}, end: {x: 25, y: 30}, width: 3}
          ],
          equipment: [
            {id: 'FORKLIFT-1', type: 'forklift', zone: 'C', capacity: 2000},
            {id: 'SCANNER-STATION-1', type: 'scanner', zone: 'A'},
            {id: 'DOCK-1', type: 'loading_dock', zone: 'D'}
          ]
        },
        isActive: true,
        createdBy: users[0].id
      }
    ]);

    // 36. Digital Twin Simulations
    console.log('🎯 Criando simulações de digital twin...');
    await db.insert(schema.digitalTwinSimulations).values([
      {
        warehouseId: warehouses[0].id,
        name: 'Otimização Picking Zona A - Fevereiro',
        type: 'picking_optimization',
        parameters: {
          zone: 'A',
          products: ['BEB-CUCA-005', 'BEB-GUAR-006', 'BEB-AGUA-007'],
          optimization_target: 'travel_distance',
          constraints: {max_capacity: 0.85, min_accessibility: 0.7},
          simulation_duration: '24h',
          worker_count: 4
        },
        results: {
          current_efficiency: 78.2,
          optimized_efficiency: 91.5,
          improvement: 13.3,
          travel_distance_reduction: 28.7,
          picking_time_reduction: 22.1,
          recommended_changes: [
            'Mover Cerveja Cuca para A01-A06 (produtos mais frequentes)',
            'Reorganizar águas para A12-A18 (proximidade com refrigerantes)',
            'Criar zona expressa A19-A20 para produtos ABC'
          ]
        },
        status: 'completed',
        startedAt: new Date('2025-02-16T08:00:00Z'),
        completedAt: new Date('2025-02-16T08:52:00Z'),
        createdBy: users[0].id
      }
    ]);

    // 37. Real-time Visualization
    console.log('📡 Criando dados de visualização em tempo real...');
    await db.insert(schema.realTimeVisualization).values([
      {
        warehouseId: warehouses[0].id,
        entityType: 'worker',
        entityId: users[3].id,
        position: {x: 25.5, y: 15.2, z: 0, floor: 1, zone: 'A'},
        status: 'picking',
        metadata: {
          task: 'PICK-2025-003',
          efficiency: 94,
          items_picked: 23,
          device: 'SCANNER-007'
        }
      },
      {
        warehouseId: warehouses[0].id,
        entityType: 'equipment',
        entityId: 'FORKLIFT-001',
        position: {x: 75.8, y: 42.1, z: 0, floor: 1, zone: 'C'},
        status: 'moving',
        metadata: {
          operator: users[4].id,
          load_weight: 3500,
          battery_level: 67,
          destination: 'C-08-15'
        }
      },
      {
        warehouseId: warehouses[0].id,
        entityType: 'product',
        entityId: products[0].id,
        position: {x: 12.3, y: 8.7, z: 2.5, floor: 1, zone: 'A'},
        status: 'available',
        metadata: {
          quantity: 450,
          last_movement: '2025-02-16T10:30:00Z',
          temperature: 18.5
        }
      }
    ]);

    // ===== TRIPLE-LEDGER TRACEABILITY =====
    
    // 38. Audit Trail
    console.log('🔒 Criando registos de auditoria...');
    const auditTrail = await db.insert(schema.auditTrail).values([
      {
        tableName: 'inventory',
        recordId: products[0].id,
        operation: 'UPDATE',
        oldValues: {quantity: 1500, reservedQuantity: 180},
        newValues: {quantity: 1350, reservedQuantity: 162},
        userId: users[3].id,
        ipAddress: '10.0.1.15',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SGST/3.1.0',
        checksum: 'sha256:a1b2c3d4e5f6789012345678901234567890abcd1234567890abcdef12345678',
        previousHash: 'sha256:9876543210fedcba0987654321fedcba0987654321fedcba0987654321fedcba',
        signature: 'SIG_INVENTORY_UPDATE_2025021612345',
        wormStored: true,
        blockchainHash: 'bc_1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
      },
      {
        tableName: 'stock_movements',
        recordId: 'mov-' + Date.now(),
        operation: 'CREATE',
        oldValues: null,
        newValues: {
          productId: products[0].id,
          quantity: -150,
          type: 'out',
          reason: 'Venda para cliente'
        },
        userId: users[3].id,
        ipAddress: '10.0.1.15',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SGST/3.1.0',
        checksum: 'sha256:b2c3d4e5f6789012345678901234567890abcd1234567890abcdef123456789a',
        previousHash: 'sha256:a1b2c3d4e5f6789012345678901234567890abcd1234567890abcdef12345678',
        signature: 'SIG_MOVEMENT_CREATE_2025021612346',
        wormStored: true,
        blockchainHash: 'bc_2345678901bcdef1234567890abcdef1234567890abcdef1234567890abc123'
      }
    ]).returning();

    // 39. WORM Storage
    console.log('💾 Criando armazenamento WORM...');
    await db.insert(schema.wormStorage).values([
      {
        auditId: auditTrail[0].id,
        dataHash: 'sha256:a1b2c3d4e5f6789012345678901234567890abcd1234567890abcdef12345678',
        encryptedData: 'ENC_DATA_BASE64_ENCRYPTED_CONTENT_HERE_1234567890ABCDEF',
        accessCount: 0,
        retention: new Date('2032-02-16T12:00:00Z'), // 7 years retention
        immutable: true
      },
      {
        auditId: auditTrail[1].id,
        dataHash: 'sha256:b2c3d4e5f6789012345678901234567890abcd1234567890abcdef123456789a',
        encryptedData: 'ENC_DATA_BASE64_ENCRYPTED_CONTENT_HERE_2345678901BCDEF0',
        accessCount: 0,
        retention: new Date('2032-02-16T12:00:00Z'), // 7 years retention
        immutable: true
      }
    ]);

    // 40. Fraud Detection
    console.log('🚨 Criando alertas de detecção de fraude...');
    await db.insert(schema.fraudDetection).values([
      {
        alertType: 'suspicious_inventory_adjustment',
        severity: 'medium',
        description: 'Ajuste de inventário fora do horário normal (23:45) por utilizador não autorizado para operações noturnas',
        entityType: 'inventory',
        entityId: products[5].id,
        riskScore: '72.50',
        evidenceData: {
          timestamp: '2025-02-15T23:45:15Z',
          user: 'lucia.picker',
          normal_hours: '07:00-18:00',
          adjustment_amount: -85,
          ip_address: '10.0.1.99',
          user_agent: 'curl/7.68.0',
          location: 'outside_premises'
        },
        status: 'investigating',
        investigatedBy: users[0].id,
        resolution: 'Investigação em curso - contacto com operador'
      },
      {
        alertType: 'unusual_order_pattern',
        severity: 'low',
        description: 'Padrão de encomendas atípico - aumento súbito de 300% em produtos específicos',
        entityType: 'order',
        entityId: orders[0].id,
        riskScore: '45.20',
        evidenceData: {
          pattern: 'volume_spike',
          increase_percentage: 300,
          products_affected: ['BEB-CUCA-005'],
          historical_average: 50,
          current_order: 200
        },
        status: 'resolved',
        investigatedBy: users[1].id,
        resolution: 'Confirmado evento promocional - padrão normal'
      }
    ]);

    // ===== AUTO-SLOTTING INTELIGENTE =====
    
    // 41. Slotting Analytics
    console.log('🎯 Criando análises de slotting...');
    await db.insert(schema.slottingAnalytics).values([
      {
        productId: products.find(p => p.name.includes('Cerveja'))?.id || products[0].id,
        warehouseId: warehouses[0].id,
        currentLocation: 'A-08-12',
        recommendedLocation: 'A-01-01',
        rotationFrequency: '15.2500',
        pickingDistance: '52.75',
        affinityScore: '91.80',
        seasonalityFactor: '1.35',
        improvementPotential: '31.50',
        status: 'approved'
      },
      {
        productId: products.find(p => p.name.includes('Fuba'))?.id || products[1].id,
        warehouseId: warehouses[0].id,
        currentLocation: 'B-15-08',
        recommendedLocation: 'B-03-05',
        rotationFrequency: '8.7500',
        pickingDistance: '38.25',
        affinityScore: '76.40',
        seasonalityFactor: '1.15',
        improvementPotential: '18.75',
        status: 'pending'
      }
    ]);

    // 42. Product Affinity
    console.log('🔗 Criando dados de afinidade de produtos...');
    await db.insert(schema.productAffinity).values([
      {
        productA: products.find(p => p.name.includes('Cerveja'))?.id || products[0].id,
        productB: products.find(p => p.name.includes('Refrigerante'))?.id || products[1].id,
        affinityScore: '89.75',
        coOccurrenceCount: 342,
        confidence: '94.20'
      },
      {
        productA: products.find(p => p.name.includes('Fuba'))?.id || products[0].id,
        productB: products.find(p => p.name.includes('Óleo'))?.id || products[1].id,
        affinityScore: '85.30',
        coOccurrenceCount: 267,
        confidence: '91.80'
      },
      {
        productA: products.find(p => p.name.includes('Açúcar'))?.id || products[0].id,
        productB: products.find(p => p.name.includes('Arroz'))?.id || products[1].id,
        affinityScore: '78.90',
        coOccurrenceCount: 198,
        confidence: '87.40'
      }
    ]);

    // 43. Slotting Rules
    console.log('📋 Criando regras de slotting...');
    await db.insert(schema.slottingRules).values([
      {
        warehouseId: warehouses[0].id,
        ruleName: 'Regra ABC Velocity - Produtos Rápidos',
        conditions: {
          abcClass: 'A',
          rotationFrequency: {min: 10},
          weight: {max: 25}
        },
        actions: {
          preferredZone: 'A',
          heightRange: {min: 0.8, max: 1.8},
          accessibility: 'high'
        },
        priority: 1,
        isActive: true
      },
      {
        warehouseId: warehouses[0].id,
        ruleName: 'Regra Produtos Pesados - Nível Térreo',
        conditions: {
          weight: {min: 10000}
        },
        actions: {
          preferredZone: 'C',
          heightRange: {min: 0, max: 1},
          equipmentRequired: 'forklift'
        },
        priority: 2,
        isActive: true
      }
    ]);

    // 44. ML Models
    console.log('🤖 Criando modelos de ML...');
    await db.insert(schema.mlModels).values([
      {
        modelName: 'Angola Demand Forecast LSTM v3.2',
        modelType: 'demand_forecast',
        version: '3.2.0',
        parameters: {
          layers: [256, 128, 64],
          dropout: 0.25,
          epochs: 150,
          batch_size: 64,
          learning_rate: 0.0005,
          optimizer: 'adam',
          features: ['sales_history', 'seasonality', 'weather', 'events', 'prices', 'promotions']
        },
        trainingData: {
          records: 45000,
          period: '2020-01-01_to_2024-12-31',
          features: ['sales_history', 'seasonality', 'weather', 'events', 'prices', 'promotions', 'holiday_angola'],
          validation_split: 0.2,
          regions: ['Luanda', 'Huambo', 'Benguela', 'Lubango']
        },
        accuracy: '0.9280',
        status: 'deployed',
        lastTraining: new Date('2025-02-01T10:00:00Z'),
        deployedAt: new Date('2025-02-05T14:30:00Z')
      },
      {
        modelName: 'Auto-Slotting Optimizer v2.8',
        modelType: 'slotting_optimization',
        version: '2.8.0',
        parameters: {
          algorithm: 'genetic_algorithm',
          population_size: 100,
          generations: 500,
          mutation_rate: 0.1,
          crossover_rate: 0.8
        },
        trainingData: {
          records: 25000,
          period: '2023-01-01_to_2024-12-31',
          optimization_targets: ['travel_distance', 'pick_time', 'space_utilization']
        },
        accuracy: '0.8850',
        status: 'deployed',
        lastTraining: new Date('2025-01-20T08:00:00Z'),
        deployedAt: new Date('2025-01-22T12:00:00Z')
      }
    ]);

    // 45. Optimization Jobs
    console.log('⚙️ Criando trabalhos de otimização...');
    await db.insert(schema.optimizationJobs).values([
      {
        jobType: 'warehouse_layout_optimization',
        warehouseId: warehouses[0].id,
        parameters: {
          optimization_scope: 'zone_A',
          target_metric: 'picking_efficiency',
          constraints: {
            max_moves: 50,
            budget: 15000
          }
        },
        results: {
          current_efficiency: 78.2,
          optimized_efficiency: 91.5,
          improvement_percentage: 17.0,
          moves_required: 23,
          estimated_cost: 8500,
          payback_period_days: 45
        },
        status: 'completed',
        startedAt: new Date('2025-02-16T08:00:00Z'),
        completedAt: new Date('2025-02-16T09:15:00Z'),
        executionTime: 4500, // 75 minutes
        improvementMetrics: {
          travel_distance_reduction: 28.7,
          pick_time_reduction: 22.1,
          space_utilization_improvement: 12.3
        },
        createdBy: users[0].id
      }
    ]);

    console.log('✅ SEED COMPLETO finalizado com sucesso!');
    console.log(`
🎉 RESUMO FINAL - SEED COMPLETO DO SGST ANGOLA:

===== DADOS BÁSICOS =====
✅ ${users.length} Utilizadores criados
✅ ${categories.length} Categorias de produtos criadas  
✅ ${suppliers.length} Fornecedores angolanos criados
✅ ${warehouses.length} Armazéns criados (Luanda, Huambo, Benguela, etc.)
✅ ${products.length} Produtos diversos criados
✅ ${inventoryRecords.length} Registos de inventário criados
✅ ${productLocations.length} Localizações de produtos criadas
✅ ${stockMovements.length} Movimentos de stock criados
✅ ${orders.length} Encomendas criadas
✅ ${orderItems.length} Itens de encomenda criados
✅ ${shipments.length} Envios criados
✅ ${alerts.length} Alertas criados
✅ ${notificationPrefs.length} Preferências de notificação criadas

===== FUNCIONALIDADES BÁSICAS =====
✅ ${inventoryCounts.length} Contagens de inventário criadas
✅ ${countItems.length} Itens de contagem criados
✅ ${pickingLists.length} Listas de picking criadas
✅ Itens de picking criados
✅ ${barcodeScans.length} Scans de código de barras criados
✅ ${returns.length} Devoluções criadas
✅ Itens de devolução criados

===== FUNCIONALIDADES AVANÇADAS =====
✅ ${asns.length} Advanced Shipment Notices (ASN) criados
✅ Itens de ASN criados
✅ ${receivingReceipts.length} Recibos de receção criados
✅ Itens de receção criados
✅ Resultados de visão computacional criados
✅ ${putawayRules.length} Regras de putaway criadas
✅ Tarefas de putaway criadas
✅ ${ssccPallets.length} Pallets SSCC criados
✅ Itens de pallet criados
✅ ${replenishmentRules.length} Regras de reabastecimento criadas
✅ Previsões de demanda criadas
✅ Tarefas de reabastecimento criadas
✅ Dados de velocidade de picking criados

===== DIGITAL TWIN OPERACIONAL =====
✅ ${warehouseZones.length} Zonas de armazém criadas
✅ Layouts de armazém criados
✅ Simulações de digital twin criadas
✅ Dados de visualização em tempo real criados

===== TRIPLE-LEDGER TRACEABILITY =====
✅ ${auditTrail.length} Registos de auditoria criados
✅ Armazenamento WORM criado
✅ Alertas de detecção de fraude criados

===== AUTO-SLOTTING INTELIGENTE =====
✅ Análises de slotting criadas
✅ Dados de afinidade de produtos criados
✅ Regras de slotting criadas
✅ Modelos ML criados
✅ Trabalhos de otimização criados

🚀 SISTEMA COMPLETO PRONTO PARA TESTE!
🇦🇴 Todos os dados são específicos para o mercado angolano
📊 Base de dados populada com ${
  users.length + categories.length + suppliers.length + warehouses.length + 
  products.length + inventoryRecords.length + productLocations.length + 
  stockMovements.length + orders.length + orderItems.length + shipments.length +
  alerts.length + notificationPrefs.length + inventoryCounts.length + 
  countItems.length + pickingLists.length + barcodeScans.length + returns.length +
  asns.length + receivingReceipts.length + putawayRules.length + ssccPallets.length +
  replenishmentRules.length + warehouseZones.length + auditTrail.length
}+ registos
    `);

  } catch (error) {
    console.error('❌ Erro durante o seed completo:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Executar a função de seed
seedCompleteDatabase()
  .then(() => {
    console.log('🎉 SEED COMPLETO concluído com sucesso para SGST Angola!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 SEED COMPLETO falhou:', error);
    process.exit(1);
  });

export { seedCompleteDatabase };