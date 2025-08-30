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

async function seedAdvancedTables() {
  console.log('🚀 Starting ADVANCED tables seeding for Angola Beverages Company...');

  try {
    // Get existing data to reference
    const users = await db.select().from(schema.users);
    const suppliers = await db.select().from(schema.suppliers);
    const warehouses = await db.select().from(schema.warehouses);
    const products = await db.select().from(schema.products);
    const categories = await db.select().from(schema.categories);
    const productLocations = await db.select().from(schema.productLocations);

    if (users.length === 0 || products.length === 0) {
      console.log('❌ Basic data not found. Please run basic seed first.');
      return;
    }

    console.log(`Found ${users.length} users, ${products.length} products, ${warehouses.length} warehouses`);

    // Clear advanced tables only
    console.log('🧹 Clearing advanced tables only...');
    try { await db.delete(schema.productAffinity); } catch {}
    try { await db.delete(schema.slottingAnalytics); } catch {}
    try { await db.delete(schema.fraudDetection); } catch {}
    try { await db.delete(schema.auditTrail); } catch {}
    try { await db.delete(schema.realTimeVisualization); } catch {}
    try { await db.delete(schema.digitalTwinSimulations); } catch {}
    try { await db.delete(schema.warehouseLayout); } catch {}
    try { await db.delete(schema.warehouseZones); } catch {}
    try { await db.delete(schema.pickingVelocity); } catch {}
    try { await db.delete(schema.demandForecasts); } catch {}
    try { await db.delete(schema.replenishmentRules); } catch {}
    try { await db.delete(schema.ssccPallets); } catch {}
    try { await db.delete(schema.putawayRules); } catch {}
    try { await db.delete(schema.cvCountingResults); } catch {}
    try { await db.delete(schema.asnLineItems); } catch {}
    try { await db.delete(schema.asn); } catch {}
    try { await db.delete(schema.mlModels); } catch {}

    // ==== ADVANCED WAREHOUSE MANAGEMENT FEATURES ====
    
    // 1. Advanced Shipment Notice (ASN)
    console.log('📋 Creating Advanced Shipment Notices...');
    const asns = await db.insert(schema.asn).values([
      {
        asnNumber: 'ASN-2025-001',
        supplierId: suppliers.find(s => s.name?.includes('Coca-Cola'))?.id || suppliers[0].id,
        warehouseId: warehouses[0]?.id,
        poNumber: 'PO-COCA-2025-001',
        status: 'in_transit',
        transportMode: 'truck',
        carrier: 'Transporte Rápido de Angola',
        trackingNumber: 'TRA-2025-001234',
        estimatedArrival: new Date('2025-02-15T14:00:00Z'),
        containerNumbers: ['CTR-2025-001', 'CTR-2025-002'],
        sealNumbers: ['SEAL-001', 'SEAL-002'],
        totalWeight: '25000.000',
        totalVolume: '45.500',
        documentUrl: '/docs/asn/ASN-2025-001.pdf',
        notes: 'Carregamento de refrigerantes Coca-Cola para centro de distribuição',
        userId: users[0].id
      },
      {
        asnNumber: 'ASN-2025-002',
        supplierId: suppliers.find(s => s.name?.includes('ECA'))?.id || suppliers[1]?.id || suppliers[0].id,
        warehouseId: warehouses[1]?.id || warehouses[0].id,
        poNumber: 'PO-ECA-2025-002',
        status: 'arrived',
        transportMode: 'truck',
        carrier: 'Logística Kwanza',
        trackingNumber: 'LKW-2025-005678',
        estimatedArrival: new Date('2025-02-10T09:00:00Z'),
        actualArrival: new Date('2025-02-10T09:30:00Z'),
        containerNumbers: ['CTR-ECA-001'],
        sealNumbers: ['SEAL-ECA-001'],
        totalWeight: '18000.000',
        totalVolume: '32.000',
        documentUrl: '/docs/asn/ASN-2025-002.pdf',
        notes: 'Entrega de cervejas Cuca e Eka para região centro',
        userId: users[1]?.id || users[0].id
      }
    ]).returning();

    // 2. ASN Line Items
    console.log('📝 Creating ASN line items...');
    await db.insert(schema.asnLineItems).values([
      {
        asnId: asns[0].id,
        productId: products[0].id,
        expectedQuantity: 5000,
        unitOfMeasure: 'EA',
        lotNumber: 'LOT-COCA-2025-001',
        expiryDate: new Date('2025-12-31'),
        palletId: 'PLT-COCA-001',
        packaging: 'case',
        expectedWeight: '1750.000',
        expectedDimensions: {length: 40, width: 30, height: 25},
        notes: 'Latas de 330ml em caixas de 24 unidades'
      },
      {
        asnId: asns[1].id,
        productId: products[1]?.id || products[0].id,
        expectedQuantity: 4000,
        unitOfMeasure: 'EA',
        lotNumber: 'LOT-CUCA-2025-001',
        expiryDate: new Date('2025-08-31'),
        palletId: 'PLT-CUCA-001',
        packaging: 'case',
        expectedWeight: '2200.000',
        expectedDimensions: {length: 42, width: 32, height: 26},
        notes: 'Garrafas long neck 330ml em caixas de 24 unidades'
      }
    ]);

    // 3. Computer Vision Counting Results
    console.log('🔍 Creating computer vision counting results...');
    await db.insert(schema.cvCountingResults).values([
      {
        sessionId: 'CV-2025-001',
        imageUrl: '/cv/images/session-001-frame-001.jpg',
        videoUrl: '/cv/videos/session-001.mp4',
        productId: products[2]?.id || products[0].id,
        detectedCount: 6500,
        confidence: '0.9850',
        algorithm: 'yolo_v8',
        boundingBoxes: [
          {x: 120, y: 80, width: 200, height: 150, confidence: 0.98},
          {x: 350, y: 90, width: 190, height: 145, confidence: 0.97}
        ],
        dimensions: {length: 45, width: 35, height: 28},
        weight: '3380.000',
        damage: {detected: false, confidence: 0.99, regions: []},
        manualVerification: true,
        manualCount: 6500,
        verifiedBy: users[2]?.id || users[0].id,
        status: 'verified',
        metadata: {
          camera: 'CAM-BENGUELA-001',
          lighting: 'natural',
          resolution: '4K',
          fps: 30
        },
        processingTime: 2847
      }
    ]);

    // 4. Putaway Rules
    console.log('📍 Creating putaway rules...');
    const putawayRules = await db.insert(schema.putawayRules).values([
      {
        name: 'Regra Refrigerantes - Zona Fria',
        priority: 1,
        warehouseId: warehouses[0].id,
        productCriteria: {categoryId: categories[0]?.id, temperature: 'cold'},
        locationCriteria: {zone: 'A', shelfType: 'cold', heightRange: {min: 0, max: 3}, accessibility: 'high'},
        strategy: 'abc_velocity',
        crossDockEligible: true,
        crossDockCriteria: {maxHours: 4, minQuantity: 1000},
        maxCapacityUtilization: '0.8500',
        isActive: true,
        userId: users[0].id
      },
      {
        name: 'Regra Cervejas - Armazenamento Controlado',
        priority: 2,
        warehouseId: warehouses[0].id,
        productCriteria: {categoryId: categories[1]?.id || categories[0].id},
        locationCriteria: {zone: 'B', shelfType: 'standard', heightRange: {min: 1, max: 4}, accessibility: 'medium'},
        strategy: 'fifo',
        crossDockEligible: false,
        maxCapacityUtilization: '0.9000',
        isActive: true,
        userId: users[0].id
      }
    ]).returning();

    // 5. SSCC Pallets
    console.log('📦 Creating SSCC pallets...');
    const ssccPallets = await db.insert(schema.ssccPallets).values([
      {
        ssccCode: '100234567890123456',
        palletType: 'euro',
        status: 'completed',
        warehouseId: warehouses[0].id,
        locationId: productLocations[0]?.id,
        maxWeight: '1000.000',
        maxHeight: '200.00',
        currentWeight: '875.500',
        currentHeight: '165.00',
        itemCount: 48,
        mixedProducts: false,
        palletLabel: {
          sscc: '100234567890123456',
          content: 'Coca-Cola 330ml',
          quantity: 48,
          weight: '875.5kg',
          date: '2025-02-10'
        },
        completedAt: new Date('2025-02-10T16:00:00Z'),
        userId: users[0].id
      }
    ]).returning();

    // 6. Replenishment Rules
    console.log('🔄 Creating replenishment rules...');
    const replenishmentRules = await db.insert(schema.replenishmentRules).values([
      {
        name: 'Regra Coca-Cola Auto-Replenishment',
        productId: products[0].id,
        warehouseId: warehouses[0].id,
        locationId: productLocations[0]?.id,
        strategy: 'demand_based',
        minLevel: 500,
        maxLevel: 2000,
        reorderPoint: 800,
        replenishQuantity: 1200,
        leadTimeDays: 2,
        safetyStock: 200,
        abcClassification: 'A',
        velocityCategory: 'fast',
        seasonalFactor: '1.2000',
        mlModelId: 'demand-forecast-v2.1',
        isActive: true,
        userId: users[0].id
      }
    ]).returning();

    // 7. Demand Forecasts
    console.log('📈 Creating demand forecasts...');
    await db.insert(schema.demandForecasts).values([
      {
        productId: products[0].id,
        warehouseId: warehouses[0].id,
        forecastDate: new Date('2025-02-15'),
        forecastPeriod: 'daily',
        predictedDemand: '450.00',
        confidence: '0.8900',
        actualDemand: '425.00',
        accuracy: '0.9444',
        modelVersion: 'v2.1-lstm',
        algorithm: 'lstm',
        features: ['sales_history', 'seasonality', 'weather', 'events'],
        metadata: {temperature: 28, humidity: 75, special_events: ['Valentine Day promotions']}
      }
    ]);

    // 8. Picking Velocity
    console.log('⚡ Creating picking velocity data...');
    await db.insert(schema.pickingVelocity).values([
      {
        productId: products[0].id,
        warehouseId: warehouses[0].id,
        locationId: productLocations[0]?.id,
        date: new Date('2025-02-10'),
        period: 'daily',
        totalPicked: 850,
        pickingEvents: 25,
        averagePickTime: '45.60',
        peakHour: 14,
        velocityScore: '95.7500',
        abcClass: 'A',
        trendDirection: 'up'
      }
    ]);

    // ==== DIGITAL TWIN OPERACIONAL ====
    
    // 9. Warehouse Zones
    console.log('🏗️ Creating warehouse zones...');
    const warehouseZones = await db.insert(schema.warehouseZones).values([
      {
        warehouseId: warehouses[0].id,
        name: 'Zona A - Refrigerantes',
        type: 'picking',
        coordinates: {x: 0, y: 0, width: 50, height: 30, z: 0, floor: 1},
        capacity: {maxItems: 10000, maxWeight: 25000, maxVolume: 1500},
        currentUtilization: {items: 7500, weight: 18750, volume: 1125, percentage: 75},
        isActive: true
      },
      {
        warehouseId: warehouses[0].id,
        name: 'Zona B - Cervejas',
        type: 'storage',
        coordinates: {x: 50, y: 0, width: 40, height: 30, z: 0, floor: 1},
        capacity: {maxItems: 8000, maxWeight: 20000, maxVolume: 1200},
        currentUtilization: {items: 5600, weight: 14000, volume: 840, percentage: 70},
        isActive: true
      },
      {
        warehouseId: warehouses[0].id,
        name: 'Zona C - Águas e Sumos',
        type: 'picking',
        coordinates: {x: 0, y: 30, width: 50, height: 25, z: 0, floor: 1},
        capacity: {maxItems: 15000, maxWeight: 30000, maxVolume: 2000},
        currentUtilization: {items: 12000, weight: 24000, volume: 1600, percentage: 80},
        isActive: true
      }
    ]).returning();

    // 10. Warehouse Layout
    console.log('📐 Creating warehouse layouts...');
    await db.insert(schema.warehouseLayout).values([
      {
        warehouseId: warehouses[0].id,
        name: 'Layout Principal Luanda v3.2',
        version: '3.2',
        layoutData: {
          dimensions: {length: 110, width: 55, height: 12},
          zones: [
            {id: 'A', name: 'Refrigerantes', x: 0, y: 0, width: 50, height: 30, type: 'picking'},
            {id: 'B', name: 'Cervejas', x: 50, y: 0, width: 40, height: 30, type: 'storage'},
            {id: 'C', name: 'Águas', x: 0, y: 30, width: 50, height: 25, type: 'picking'}
          ],
          aisles: [
            {id: 'AISLE-1', start: {x: 10, y: 0}, end: {x: 10, y: 55}, width: 3},
            {id: 'AISLE-MAIN', start: {x: 0, y: 27.5}, end: {x: 110, y: 27.5}, width: 5}
          ]
        },
        isActive: true,
        createdBy: users[0].id
      }
    ]);

    // 11. Digital Twin Simulations
    console.log('🎯 Creating digital twin simulations...');
    await db.insert(schema.digitalTwinSimulations).values([
      {
        warehouseId: warehouses[0].id,
        name: 'Otimização Picking Zona A',
        type: 'picking_optimization',
        parameters: {
          zone: 'A',
          products: ['REF-COCA-001', 'REF-FANT-002', 'REF-SPRT-003'],
          optimization_target: 'travel_distance',
          constraints: {max_capacity: 0.85, min_accessibility: 0.7},
          simulation_duration: '24h'
        },
        results: {
          current_efficiency: 72.5,
          optimized_efficiency: 89.2,
          improvement: 16.7,
          travel_distance_reduction: 23.4,
          picking_time_reduction: 18.8,
          recommended_changes: [
            'Mover Coca-Cola para zona A01-A05',
            'Reorganizar Fanta para A06-A10',
            'Criar corredor express para produtos ABC'
          ]
        },
        status: 'completed',
        startedAt: new Date('2025-02-10T09:00:00Z'),
        completedAt: new Date('2025-02-10T09:45:00Z'),
        createdBy: users[0].id
      }
    ]);

    // 12. Real-time Visualization
    console.log('📡 Creating real-time visualization data...');
    await db.insert(schema.realTimeVisualization).values([
      {
        warehouseId: warehouses[0].id,
        entityType: 'worker',
        entityId: users[0].id,
        position: {x: 25.5, y: 15.2, z: 0, floor: 1, zone: 'A'},
        status: 'picking',
        metadata: {
          task: 'ORD-2025-001',
          efficiency: 92,
          items_picked: 15,
          device: 'SCANNER-007'
        }
      },
      {
        warehouseId: warehouses[0].id,
        entityType: 'equipment',
        entityId: 'FORKLIFT-003',
        position: {x: 70.8, y: 35.1, z: 0, floor: 1, zone: 'B'},
        status: 'moving',
        metadata: {
          operator: users[1]?.id || users[0].id,
          load_weight: 2500,
          battery_level: 78,
          destination: 'B-05-12'
        }
      }
    ]);

    // ==== TRIPLE-LEDGER TRACEABILITY ====
    
    // 13. Audit Trail
    console.log('🔒 Creating audit trail records...');
    const auditTrail = await db.insert(schema.auditTrail).values([
      {
        tableName: 'inventory',
        recordId: 'mock-inventory-001',
        operation: 'UPDATE',
        oldValues: {quantity: 1500, reservedQuantity: 225},
        newValues: {quantity: 1350, reservedQuantity: 202},
        userId: users[0].id,
        ipAddress: '10.0.1.15',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WMS/2.5.1',
        checksum: 'a1b2c3d4e5f6789012345678901234567890abcd1234567890abcdef12345678',
        previousHash: '9876543210fedcba0987654321fedcba0987654321fedcba0987654321fedcba',
        signature: 'SIG_INVENTORY_UPDATE_2025021012345',
        wormStored: true,
        blockchainHash: 'bc_1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
      }
    ]).returning();

    // 14. Fraud Detection
    console.log('🚨 Creating fraud detection alerts...');
    await db.insert(schema.fraudDetection).values([
      {
        alertType: 'suspicious_inventory_adjustment',
        severity: 'medium',
        description: 'Ajuste de inventário fora do horário normal (02:30) por utilizador não autorizado para operações noturnas',
        entityType: 'inventory',
        entityId: 'mock-inventory-005',
        riskScore: '67.50',
        evidenceData: {
          timestamp: '2025-02-09T02:30:15Z',
          user: 'lucia.miguel',
          normal_hours: '08:00-18:00',
          adjustment_amount: -250,
          ip_address: '10.0.1.99',
          user_agent: 'curl/7.68.0'
        },
        status: 'investigating',
        investigatedBy: users[0].id,
        resolution: 'Investigação em curso - aguardando explicação do operador'
      }
    ]);

    // ==== AUTO-SLOTTING INTELIGENTE ====
    
    // 15. Slotting Analytics
    console.log('🎯 Creating slotting analytics...');
    await db.insert(schema.slottingAnalytics).values([
      {
        productId: products[0].id,
        warehouseId: warehouses[0].id,
        currentLocation: 'A-01-05',
        recommendedLocation: 'A-01-01',
        rotationFrequency: '12.5000',
        pickingDistance: '45.75',
        affinityScore: '95.80',
        seasonalityFactor: '1.25',
        improvementPotential: '23.50',
        status: 'approved'
      }
    ]);

    // 16. Product Affinity
    console.log('🔗 Creating product affinity data...');
    await db.insert(schema.productAffinity).values([
      {
        productA: products[0].id,
        productB: products[1]?.id || products[0].id,
        affinityScore: '87.50',
        coOccurrenceCount: 245,
        confidence: '92.30'
      },
      {
        productA: products[2]?.id || products[0].id,
        productB: products[3]?.id || products[1]?.id || products[0].id,
        affinityScore: '73.20',
        coOccurrenceCount: 189,
        confidence: '85.40'
      }
    ]);

    // 17. ML Models
    console.log('🤖 Creating ML models...');
    await db.insert(schema.mlModels).values([
      {
        modelName: 'Demand Forecast LSTM v2.1',
        modelType: 'demand_forecast',
        version: '2.1.0',
        parameters: {
          layers: [128, 64, 32],
          dropout: 0.2,
          epochs: 100,
          batch_size: 32,
          learning_rate: 0.001,
          optimizer: 'adam'
        },
        trainingData: {
          records: 15000,
          period: '2022-01-01_to_2024-12-31',
          features: ['sales_history', 'seasonality', 'weather', 'events', 'prices'],
          validation_split: 0.2
        },
        accuracy: '0.9150',
        status: 'deployed',
        lastTraining: new Date('2025-01-15T10:00:00Z'),
        deployedAt: new Date('2025-01-20T14:30:00Z')
      }
    ]);

    console.log('✅ ADVANCED TABLES seeding completed successfully for Angola Beverages!');
    console.log(`
🚀 ADVANCED FEATURES Summary:

=== ADVANCED WAREHOUSE MANAGEMENT ===
- 2 Advanced Shipment Notices (ASN) criados
- 2 ASN line items criados
- 1 resultado de visão computacional criado
- 2 regras de putaway criadas
- 1 pallet SSCC criado
- 1 regra de reabastecimento criada
- 1 previsão de demanda criada
- 1 registo de velocidade de picking criado

=== DIGITAL TWIN OPERACIONAL ===
- 3 zonas de armazém criadas
- 1 layout de armazém criado
- 1 simulação de digital twin criada
- 2 registos de visualização em tempo real criados

=== TRIPLE-LEDGER TRACEABILITY ===
- 1 registo de auditoria criado
- 1 alerta de deteção de fraude criado

=== AUTO-SLOTTING INTELIGENTE ===
- 1 análise de slotting criada
- 2 dados de afinidade de produtos criados
- 1 modelo ML criado

🎯 FUNCIONALIDADES AVANÇADAS ATIVAS:
✅ Advanced Shipment Notice (ASN) 
✅ Computer Vision para contagem
✅ Regras de putaway inteligente
✅ Pallets SSCC automatizados
✅ Reabastecimento baseado em ML
✅ Digital Twin 3D/2D
✅ Rastreabilidade anti-fraude
✅ Auto-slotting com IA
✅ Visualização em tempo real
    `);

  } catch (error) {
    console.error('❌ Error seeding advanced tables:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the seeding function
seedAdvancedTables()
  .then(() => {
    console.log('🎉 Advanced tables seeding completed for Angola Beverages!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Advanced seeding failed:', error);
    process.exit(1);
  });

export { seedAdvancedTables };