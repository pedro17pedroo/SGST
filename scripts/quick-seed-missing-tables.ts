import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema.js";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function seedMissingTables() {
  console.log('🚀 SEED RÁPIDO - Populando tabelas em falta...');
  
  try {
    // Buscar dados existentes
    const [existingUsers, existingProducts, existingWarehouses] = await Promise.all([
      db.select().from(schema.users).limit(8),
      db.select().from(schema.products).limit(20),
      db.select().from(schema.warehouses).limit(10)
    ]);

    console.log(`📊 Dados existentes: ${existingUsers.length} users, ${existingProducts.length} products, ${existingWarehouses.length} warehouses`);

    if (existingUsers.length === 0 || existingProducts.length === 0 || existingWarehouses.length === 0) {
      console.log('❌ Dados básicos em falta. Execute o seed principal primeiro.');
      return;
    }

    // ===== WAREHOUSE ZONES =====
    console.log('🏢 Criando zonas do armazém...');
    const zones = [
      {
        warehouseId: existingWarehouses[0].id,
        name: 'Zona RECEIVING',
        type: 'receiving',
        coordinates: { x: 0, y: 0, width: 40, height: 30, z: 0, floor: 1 },
        capacity: { maxItems: 1000, maxWeight: 50000, maxVolume: 500 },
        currentUtilization: { items: 650, weight: 32500, volume: 325, percentage: 65 },
        isActive: true
      },
      {
        warehouseId: existingWarehouses[0].id,
        name: 'Zona STORAGE',
        type: 'storage',
        coordinates: { x: 50, y: 0, width: 40, height: 30, z: 0, floor: 1 },
        capacity: { maxItems: 2000, maxWeight: 100000, maxVolume: 1000 },
        currentUtilization: { items: 1450, weight: 72500, volume: 725, percentage: 73 },
        isActive: true
      },
      {
        warehouseId: existingWarehouses[0].id,
        name: 'Zona PICKING',
        type: 'picking',
        coordinates: { x: 100, y: 0, width: 40, height: 30, z: 0, floor: 1 },
        capacity: { maxItems: 800, maxWeight: 40000, maxVolume: 400 },
        currentUtilization: { items: 520, weight: 26000, volume: 260, percentage: 65 },
        isActive: true
      }
    ];
    await db.insert(schema.warehouseZones).values(zones);

    // ===== WAREHOUSE LAYOUT =====
    console.log('🗺️ Criando layout do armazém...');
    const layouts = [
      {
        warehouseId: existingWarehouses[0].id,
        name: 'Layout Centro Luanda',
        version: '1.0',
        layoutData: {
          dimensions: { width: 200, height: 150, floors: 1 },
          zones: [
            { id: "A", type: "picking", x: 0, y: 0, width: 80, height: 60 },
            { id: "B", type: "storage", x: 80, y: 0, width: 120, height: 100 }
          ],
          aisles: [
            { id: "A1", startX: 10, startY: 10, endX: 70, endY: 10, width: 3 }
          ]
        },
        isActive: true,
        createdBy: existingUsers[0].id
      }
    ];
    await db.insert(schema.warehouseLayout).values(layouts);

    // ===== ML MODELS =====
    console.log('🤖 Criando modelos ML...');
    const mlModels = [
      {
        modelName: 'Refriango Demand Forecast V2.1',
        modelType: 'demand_forecast',
        version: '2.1.0',
        parameters: { algorithm: "lstm", layers: 3, neurons: 64 },
        trainingData: { samples: 50000, features: 15, accuracy: 0.87 },
        accuracy: '0.8700',
        status: 'deployed',
        deployedAt: new Date()
      },
      {
        modelName: 'Computer Vision YOLO V8 Refriango',
        modelType: 'computer_vision',
        version: '8.2.0',
        parameters: { architecture: "yolo_v8", input_size: 640, confidence_threshold: 0.7 },
        trainingData: { images: 100000, annotations: 500000, products: 200 },
        accuracy: '0.9350',
        status: 'deployed',
        deployedAt: new Date()
      }
    ];
    await db.insert(schema.mlModels).values(mlModels);

    // ===== OPTIMIZATION JOBS =====
    console.log('⚡ Criando jobs de optimização...');
    const optimizationJobs = [
      {
        jobType: 'weekly_slotting_optimization',
        warehouseId: existingWarehouses[0].id,
        parameters: { products: "all", criteria: "picking_efficiency" },
        results: { improvements: 25, relocations: 12, efficiency_gain: "18%" },
        status: 'completed',
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 30 * 60 * 1000),
        executionTime: 7500,
        improvementMetrics: { distance_saved: "45m per pick", time_saved: "15 seconds" },
        createdBy: existingUsers[1].id
      },
      {
        jobType: 'carbon_footprint_optimization',
        warehouseId: existingWarehouses[0].id,
        parameters: { scope: "logistics", target: "reduce_emissions" },
        results: { co2_reduced: "125kg", fuel_saved: "45L", efficiency_gain: "22%" },
        status: 'completed',
        startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        executionTime: 64800,
        improvementMetrics: { route_optimization: "35%", load_optimization: "28%" },
        createdBy: existingUsers[2].id
      }
    ];
    await db.insert(schema.optimizationJobs).values(optimizationJobs);

    // ===== FRAUD DETECTION =====
    console.log('🛡️ Criando alertas anti-fraude...');
    const fraudDetection = [
      {
        alertType: 'unusual_movement_pattern',
        severity: 'medium',
        description: 'Movimento de stock fora do padrão normal detectado no armazém Luanda',
        entityType: 'stock_movement',
        entityId: 'general',
        riskScore: '6.75',
        evidenceData: { pattern: "off_hours_activity", user: "system_detected" },
        status: 'investigating',
        investigatedBy: existingUsers[3].id
      },
      {
        alertType: 'inventory_discrepancy',
        severity: 'high',
        description: 'Discrepância significativa na contagem vs sistema',
        entityType: 'inventory_count',
        entityId: 'general',
        riskScore: '8.25',
        evidenceData: { expected: 1000, counted: 750, variance: -250 },
        status: 'pending',
        investigatedBy: null
      }
    ];
    await db.insert(schema.fraudDetection).values(fraudDetection);

    // ===== DIGITAL TWIN SIMULATIONS =====
    console.log('👥 Criando simulações Digital Twin...');
    const digitalTwinSims = [
      {
        warehouseId: existingWarehouses[0].id,
        name: 'Simulação Otimização Picking Blue Cola',
        type: 'picking_optimization',
        parameters: { product_categories: ["Refrigerantes"], optimization_target: "time" },
        results: { time_saved: 25, efficiency_gain: 15, route_optimization: "completed" },
        status: 'completed',
        startedAt: new Date(Date.now() - 60 * 60 * 1000),
        completedAt: new Date(),
        createdBy: existingUsers[1].id
      },
      {
        warehouseId: existingWarehouses[0].id,
        name: 'Simulação Green ETA Rota Otimizada',
        type: 'route_optimization',
        parameters: { delivery_points: 12, carbon_optimization: true, fuel_efficiency: "maximize" },
        results: { carbon_saved: "12.5kg", fuel_saved: "8.2L", route_efficiency: "92%" },
        status: 'running',
        startedAt: new Date(Date.now() - 15 * 60 * 1000),
        completedAt: null,
        createdBy: existingUsers[2].id
      }
    ];
    await db.insert(schema.digitalTwinSimulations).values(digitalTwinSims);

    // ===== REAL TIME VISUALIZATION =====
    console.log('📍 Criando visualização em tempo real...');
    const rtVisualization = [
      {
        warehouseId: existingWarehouses[0].id,
        entityType: 'worker',
        entityId: existingUsers[4].id,
        position: { x: 45, y: 25, z: 0, floor: 1, zone: "A" },
        status: 'active',
        metadata: { last_update: new Date().toISOString(), accuracy: 0.95, signal_strength: 85 },
        timestamp: new Date()
      },
      {
        warehouseId: existingWarehouses[0].id,
        entityType: 'equipment',
        entityId: 'FORK-001',
        position: { x: 180, y: 45, z: 0, floor: 1, zone: "D" },
        status: 'idle',
        metadata: { last_update: new Date().toISOString(), accuracy: 0.88, signal_strength: 72, battery: "65%" },
        timestamp: new Date()
      }
    ];
    await db.insert(schema.realTimeVisualization).values(rtVisualization);

    // ===== AUDIT TRAIL =====
    console.log('📋 Criando trilha de auditoria...');
    const auditTrail = [
      {
        tableName: 'products',
        recordId: existingProducts[0].id,
        operation: 'CREATE',
        oldValues: {},
        newValues: { name: "Blue Cola Original 330ml", sku: "BLUE-COLA-001" },
        userId: existingUsers[0].id,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Refriango System',
        checksum: 'a1b2c3d4e5f6789012345678901234567890abcd',
        previousHash: null,
        signature: 'digital_signature_data',
        wormStored: true
      },
      {
        tableName: 'inventory',
        recordId: existingProducts[0].id,
        operation: 'UPDATE',
        oldValues: { quantity: 1000 },
        newValues: { quantity: 1200 },
        userId: existingUsers[4].id,
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 Refriango Mobile',
        checksum: 'b2c3d4e5f6789012345678901234567890abcde',
        previousHash: 'a1b2c3d4e5f6789012345678901234567890abcd',
        signature: 'digital_signature_data_2',
        wormStored: true
      }
    ];
    await db.insert(schema.auditTrail).values(auditTrail);

    console.log('✅ Seed das tabelas em falta concluído com sucesso!');
    console.log('📊 Verifique o dashboard para ver todos os dados.');

  } catch (error) {
    console.error('❌ Erro durante seed rápido:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seedMissingTables();