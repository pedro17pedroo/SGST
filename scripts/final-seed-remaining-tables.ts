import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema.js";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function seedRemainingTables() {
  console.log('🏁 SEED FINAL - Populando últimas tabelas...');
  
  try {
    // Buscar dados existentes
    const [users, products, warehouses, orders, productLocations] = await Promise.all([
      db.select().from(schema.users).limit(10),
      db.select().from(schema.products).limit(10),
      db.select().from(schema.warehouses).limit(5),
      db.select().from(schema.orders).limit(5),
      db.select().from(schema.productLocations).limit(10)
    ]);

    console.log(`📊 Usando: ${users.length} users, ${products.length} products, ${warehouses.length} warehouses`);

    // ===== NOTIFICATION PREFERENCES =====
    console.log('🔔 Criando preferências de notificação...');
    const notificationPrefs = [];
    for (const user of users.slice(0, 5)) {
      notificationPrefs.push(
        { userId: user.id, alertType: 'low_stock', channel: 'email', enabled: true },
        { userId: user.id, alertType: 'reorder_point', channel: 'in_app', enabled: true }
      );
    }
    await db.insert(schema.notificationPreferences).values(notificationPrefs);

    // ===== BARCODE SCANS =====
    console.log('📱 Criando scans de códigos...');
    const barcodeScans = [
      {
        scannedCode: '6201234567001',
        scanType: 'barcode',
        productId: products[0].id,
        warehouseId: warehouses[0].id,
        locationId: productLocations[0]?.id || null,
        scanPurpose: 'inventory',
        userId: users[4].id,
        metadata: { device: "Motorola TC20", battery: "85%" }
      },
      {
        scannedCode: '6201234567004',
        scanType: 'barcode',
        productId: products[1].id,
        warehouseId: warehouses[0].id,
        locationId: productLocations[1]?.id || null,
        scanPurpose: 'picking',
        userId: users[5].id,
        metadata: { device: "Zebra TC57", battery: "92%" }
      }
    ];
    await db.insert(schema.barcodeScans).values(barcodeScans);

    // ===== DEMAND FORECASTS =====
    console.log('📈 Criando previsões de demanda...');
    const demandForecasts = [];
    for (const product of products.slice(0, 5)) {
      for (const warehouse of warehouses.slice(0, 2)) {
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

    // ===== PICKING VELOCITY =====
    console.log('⚡ Criando velocidades de picking...');
    const pickingVelocity = [];
    for (const product of products.slice(0, 4)) {
      if (productLocations.length > 0) {
        const location = productLocations.find(pl => pl.productId === product.id) || productLocations[0];
        pickingVelocity.push({
          productId: product.id,
          warehouseId: warehouses[0].id,
          locationId: location.id,
          date: new Date(),
          period: 'daily',
          totalPicked: Math.floor(Math.random() * 200) + 50,
          pickingEvents: Math.floor(Math.random() * 50) + 10,
          averagePickTime: (Math.random() * 30 + 10).toFixed(2),
          peakHour: Math.floor(Math.random() * 8) + 9,
          velocityScore: (Math.random() * 10).toFixed(4),
          abcClass: product.name.includes('Blue') ? 'A' : 'B',
          trendDirection: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)]
        });
      }
    }
    if (pickingVelocity.length > 0) {
      await db.insert(schema.pickingVelocity).values(pickingVelocity);
    }

    // ===== PRODUCT AFFINITY =====
    console.log('🔗 Criando afinidade de produtos...');
    const productAffinity = [
      {
        productA: products[0].id,
        productB: products[1].id,
        affinityScore: '4.25',
        coOccurrenceCount: 150,
        confidence: '0.89'
      },
      {
        productA: products[0].id,
        productB: products[2].id,
        affinityScore: '3.80',
        coOccurrenceCount: 98,
        confidence: '0.76'
      }
    ];
    await db.insert(schema.productAffinity).values(productAffinity);

    // ===== SLOTTING RULES =====
    console.log('📋 Criando regras de slotting...');
    const slottingRules = [
      {
        warehouseId: warehouses[0].id,
        ruleName: 'Produtos A - Zona Picking Rápida',
        conditions: { abc_class: "A", velocity: "high" },
        actions: { zone: "A", shelf_height: "eye_level" },
        priority: 1,
        isActive: true
      },
      {
        warehouseId: warehouses[0].id,
        ruleName: 'Produtos Pesados - Chão',
        conditions: { weight_min: 20 },
        actions: { zone: "B", shelf_height: "ground" },
        priority: 2,
        isActive: true
      }
    ];
    await db.insert(schema.slottingRules).values(slottingRules);

    // ===== SLOTTING ANALYTICS =====
    console.log('📊 Criando análises de slotting...');
    const slottingAnalytics = [];
    for (const product of products.slice(0, 4)) {
      slottingAnalytics.push({
        productId: product.id,
        warehouseId: warehouses[0].id,
        currentLocation: 'A01-01',
        recommendedLocation: 'A01-01',
        rotationFrequency: (Math.random() * 15 + 5).toFixed(4),
        pickingDistance: (Math.random() * 50 + 10).toFixed(2),
        affinityScore: (Math.random() * 2 + 3).toFixed(2),
        seasonalityFactor: (Math.random() * 0.3 + 0.9).toFixed(2),
        improvementPotential: (Math.random() * 30 + 10).toFixed(2),
        status: Math.random() > 0.5 ? 'optimal' : 'pending'
      });
    }
    await db.insert(schema.slottingAnalytics).values(slottingAnalytics);

    // ===== WORM STORAGE =====
    console.log('🔐 Criando armazenamento WORM...');
    const auditRecords = await db.select().from(schema.auditTrail).limit(3);
    const wormStorage = [];
    for (const audit of auditRecords) {
      wormStorage.push({
        auditId: audit.id,
        dataHash: audit.checksum,
        encryptedData: `encrypted_${audit.checksum}_data`,
        accessCount: Math.floor(Math.random() * 3),
        firstAccess: new Date(Date.now() - 60 * 60 * 1000),
        lastAccess: new Date(),
        retention: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000),
        immutable: true
      });
    }
    if (wormStorage.length > 0) {
      await db.insert(schema.wormStorage).values(wormStorage);
    }

    console.log('✅ Seed final concluído com sucesso!');
    console.log('🎉 TODAS as tabelas estão agora populadas com dados da Refriango!');

  } catch (error) {
    console.error('❌ Erro durante seed final:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seedRemainingTables();