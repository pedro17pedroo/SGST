import { db } from "./db";
import { 
  users, categories, customers, suppliers, warehouses, products, inventory, 
  stockMovements, orders, orderItems, shipments, productLocations, 
  inventoryCounts, inventoryCountItems, barcodeScans, returns, returnItems,
  alerts, pickingLists, pickingListItems, notificationPreferences,
  asn, asnLineItems, receivingReceipts, receivingReceiptItems,
  cvCountingResults, putawayRules, putawayTasks, ssccPallets, palletItems,
  replenishmentRules, demandForecasts, replenishmentTasks, pickingVelocity,
  warehouseZones, warehouseLayout, digitalTwinSimulations, realTimeVisualization,
  auditTrail, wormStorage, fraudDetection, slottingAnalytics, productAffinity,
  slottingRules, mlModels, optimizationJobs, vehicles, vehicleMaintenance,
  gpsTracking, geofences, vehicleAssignments, drivers, routes, routeStops,
  deliveryProofs, fleetAlerts
} from "../shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Iniciando seed da base de dados...");

  try {
    // 1. USERS - Utilizadores do sistema
    console.log("👥 Criando utilizadores...");
    const usersData = [
      {
        username: "admin",
        email: "admin@sgst.ao",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
      },
      {
        username: "gerente",
        email: "gerente@sgst.ao", 
        password: await bcrypt.hash("gerente123", 10),
        role: "manager",
      },
      {
        username: "operador1",
        email: "operador1@sgst.ao",
        password: await bcrypt.hash("operador123", 10),
        role: "operator",
      },
      {
        username: "operador2", 
        email: "operador2@sgst.ao",
        password: await bcrypt.hash("operador123", 10),
        role: "operator",
      },
      {
        username: "motorista1",
        email: "motorista1@sgst.ao",
        password: await bcrypt.hash("motorista123", 10),
        role: "driver",
      },
      {
        username: "motorista2",
        email: "motorista2@sgst.ao", 
        password: await bcrypt.hash("motorista123", 10),
        role: "driver",
      }
    ];
    
    const insertedUsers = await db.insert(users).values(usersData).returning();
    const adminUser = insertedUsers[0];
    const managerUser = insertedUsers[1];
    const operator1 = insertedUsers[2];
    const operator2 = insertedUsers[3];
    const driver1 = insertedUsers[4];
    const driver2 = insertedUsers[5];

    // 2. CATEGORIES - Categorias de produtos
    console.log("📂 Criando categorias...");
    const categoriesData = [
      { name: "Alimentos e Bebidas", description: "Produtos alimentares e bebidas" },
      { name: "Têxtil e Vestuário", description: "Roupas, tecidos e acessórios" },
      { name: "Eletrodomésticos", description: "Aparelhos eletrónicos domésticos" },
      { name: "Móveis", description: "Mobiliário para casa e escritório" },
      { name: "Cosméticos", description: "Produtos de beleza e higiene" },
      { name: "Automóveis", description: "Peças e acessórios automóveis" },
      { name: "Construção", description: "Materiais de construção" },
      { name: "Farmácia", description: "Medicamentos e produtos farmacêuticos" }
    ];
    
    const insertedCategories = await db.insert(categories).values(categoriesData).returning();

    // 3. SUPPLIERS - Fornecedores
    console.log("🏭 Criando fornecedores...");
    const suppliersData = [
      {
        name: "Refriango - Produtos Alimentares",
        email: "compras@refriango.co.ao",
        phone: "+244 222 000 001",
        address: "Zona Industrial de Viana, Luanda, Angola"
      },
      {
        name: "Textang - Têxtil de Angola", 
        email: "vendas@textang.co.ao",
        phone: "+244 222 000 002",
        address: "Rua Major Kanhangulo, Luanda, Angola"
      },
      {
        name: "Eletro Angola",
        email: "comercial@eletroangola.co.ao", 
        phone: "+244 222 000 003",
        address: "Av. 4 de Fevereiro, Luanda, Angola"
      },
      {
        name: "Móveis do Kwanza",
        email: "geral@moveiskwanza.co.ao",
        phone: "+244 222 000 004", 
        address: "Estrada de Catete, Luanda, Angola"
      },
      {
        name: "Cosméticos Afro",
        email: "info@cosmeticosafro.co.ao",
        phone: "+244 222 000 005",
        address: "Rua Amílcar Cabral, Luanda, Angola"
      }
    ];
    
    const insertedSuppliers = await db.insert(suppliers).values(suppliersData).returning();

    // 4. CUSTOMERS - Clientes
    console.log("👤 Criando clientes...");
    const customersData = [
      {
        customerNumber: "CUST-001",
        name: "João Manuel Silva",
        email: "joao.silva@email.ao",
        phone: "+244 923 456 789",
        mobile: "+244 923 456 789",
        address: "Rua das Flores, 123",
        city: "Luanda",
        province: "Luanda",
        postalCode: "1000",
        country: "Angola",
        taxNumber: "123456789",
        customerType: "individual",
        creditLimit: "50000.00",
        paymentTerms: "cash"
      },
      {
        customerNumber: "CUST-002", 
        name: "Maria Fernanda Costa",
        email: "maria.costa@email.ao",
        phone: "+244 924 567 890",
        mobile: "+244 924 567 890", 
        address: "Av. Agostinho Neto, 456",
        city: "Benguela",
        province: "Benguela",
        postalCode: "2000",
        country: "Angola",
        taxNumber: "987654321",
        customerType: "individual",
        creditLimit: "75000.00",
        paymentTerms: "credit_30"
      },
      {
        customerNumber: "CUST-003",
        name: "Empresa ABC Lda",
        email: "compras@empresaabc.co.ao", 
        phone: "+244 222 111 222",
        mobile: "+244 925 678 901",
        address: "Zona Industrial, Lote 15",
        city: "Huambo",
        province: "Huambo", 
        postalCode: "3000",
        country: "Angola",
        taxNumber: "543216789",
        customerType: "company",
        creditLimit: "200000.00",
        paymentTerms: "credit_60"
      }
    ];
    
    const insertedCustomers = await db.insert(customers).values(customersData).returning();

    // 5. WAREHOUSES - Armazéns
    console.log("🏬 Criando armazéns...");
    const warehousesData = [
      {
        name: "Armazém Central Luanda",
        address: "Zona Industrial de Viana, Luanda, Angola",
        isActive: true
      },
      {
        name: "Armazém Benguela",
        address: "Porto de Benguela, Benguela, Angola", 
        isActive: true
      },
      {
        name: "Armazém Huambo",
        address: "Estrada Nacional EN-250, Huambo, Angola",
        isActive: true
      }
    ];
    
    const insertedWarehouses = await db.insert(warehouses).values(warehousesData).returning();
    const luandaWarehouse = insertedWarehouses[0];
    const benguelaWarehouse = insertedWarehouses[1];
    const huamboWarehouse = insertedWarehouses[2];

    // 6. PRODUCTS - Produtos
    console.log("📦 Criando produtos...");
    const productsData = [
      {
        name: "Óleo de Palma Premium",
        description: "Óleo de palma refinado de alta qualidade",
        sku: "OIL-PALM-001",
        barcode: "1234567890123",
        price: "850.00",
        weight: "1.000",
        dimensions: { length: 10, width: 10, height: 25 },
        categoryId: insertedCategories[0].id,
        supplierId: insertedSuppliers[0].id,
        minStockLevel: 50
      },
      {
        name: "Camisa Algodão Masculina",
        description: "Camisa de algodão 100% para homem",
        sku: "TXT-SHIRT-M-001", 
        barcode: "2345678901234",
        price: "3500.00",
        weight: "0.300",
        dimensions: { length: 30, width: 25, height: 2 },
        categoryId: insertedCategories[1].id,
        supplierId: insertedSuppliers[1].id,
        minStockLevel: 20
      },
      {
        name: "Frigorífico 200L",
        description: "Frigorífico doméstico 200 litros",
        sku: "FRIG-200L-001",
        barcode: "3456789012345", 
        price: "95000.00",
        weight: "45.000",
        dimensions: { length: 60, width: 60, height: 150 },
        categoryId: insertedCategories[2].id,
        supplierId: insertedSuppliers[2].id,
        minStockLevel: 5
      },
      {
        name: "Mesa de Jantar Madeira",
        description: "Mesa de jantar em madeira de eucalipto",
        sku: "MOB-TABLE-001",
        barcode: "4567890123456",
        price: "45000.00", 
        weight: "25.000",
        dimensions: { length: 150, width: 90, height: 75 },
        categoryId: insertedCategories[3].id,
        supplierId: insertedSuppliers[3].id,
        minStockLevel: 3
      },
      {
        name: "Creme Hidratante Facial",
        description: "Creme hidratante para pele africana",
        sku: "COS-CREAM-001",
        barcode: "5678901234567",
        price: "2500.00",
        weight: "0.150",
        dimensions: { length: 8, width: 8, height: 5 },
        categoryId: insertedCategories[4].id,
        supplierId: insertedSuppliers[4].id,
        minStockLevel: 30
      }
    ];
    
    const insertedProducts = await db.insert(products).values(productsData).returning();

    // 7. INVENTORY - Inventário
    console.log("📊 Criando inventário...");
    const inventoryData = [];
    for (const product of insertedProducts) {
      for (const warehouse of insertedWarehouses) {
        inventoryData.push({
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: Math.floor(Math.random() * 100) + 10,
          reservedQuantity: Math.floor(Math.random() * 5)
        });
      }
    }
    
    await db.insert(inventory).values(inventoryData);

    // 8. PRODUCT LOCATIONS - Localizações de produtos
    console.log("📍 Criando localizações de produtos...");
    const productLocationsData = [];
    for (const product of insertedProducts) {
      for (const warehouse of insertedWarehouses) {
        productLocationsData.push({
          productId: product.id,
          warehouseId: warehouse.id,
          zone: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
          shelf: `${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}${Math.floor(Math.random() * 10) + 1}`,
          bin: `${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}${Math.floor(Math.random() * 10) + 1}-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
          scannedByUserId: operator1.id
        });
      }
    }
    
    await db.insert(productLocations).values(productLocationsData);

    // 9. VEHICLES - Veículos da frota
    console.log("🚛 Criando frota de veículos...");
    const vehiclesData = [
      {
        licensePlate: "LD-123-AO",
        brand: "Toyota",
        model: "Hilux",
        year: 2020,
        capacityKg: "1000.00",
        capacityM3: "2.500",
        fuelType: "diesel",
        status: "ativo",
        driverId: driver1.id,
        gpsDeviceId: "GPS001",
        isGpsActive: true
      },
      {
        licensePlate: "BG-456-AO", 
        brand: "Mitsubishi",
        model: "Canter",
        year: 2019,
        capacityKg: "3000.00",
        capacityM3: "8.000",
        fuelType: "diesel",
        status: "ativo",
        driverId: driver2.id,
        gpsDeviceId: "GPS002",
        isGpsActive: true
      },
      {
        licensePlate: "HU-789-AO",
        brand: "Isuzu",
        model: "NPR",
        year: 2021,
        capacityKg: "5000.00", 
        capacityM3: "15.000",
        fuelType: "diesel",
        status: "manutencao"
      }
    ];
    
    const insertedVehicles = await db.insert(vehicles).values(vehiclesData).returning();

    // 10. GPS TRACKING - Dados de rastreamento GPS
    console.log("📡 Criando dados de GPS...");
    const gpsTrackingData = [
      {
        vehicleId: insertedVehicles[0].id,
        latitude: "-8.8137",
        longitude: "13.2302", // Luanda
        speed: "45.50",
        heading: "180.00",
        altitude: "10.00",
        accuracy: "5.00",
        batteryLevel: 85,
        signalStrength: -65,
        isEngineOn: true,
        userId: driver1.id
      },
      {
        vehicleId: insertedVehicles[1].id,
        latitude: "-12.5763",
        longitude: "13.4055", // Benguela
        speed: "0.00",
        heading: "90.00",
        altitude: "15.00",
        accuracy: "3.00",
        batteryLevel: 92,
        signalStrength: -58,
        isEngineOn: false,
        userId: driver2.id
      }
    ];
    
    await db.insert(gpsTracking).values(gpsTrackingData);

    // 11. GEOFENCES - Cercas geográficas
    console.log("🗺️ Criando geofences...");
    const geofencesData = [
      {
        name: "Armazém Central Luanda", 
        description: "Área do armazém principal em Luanda",
        type: "warehouse",
        warehouseId: luandaWarehouse.id,
        polygonCoordinates: [
          { lat: -8.8137, lng: 13.2302 },
          { lat: -8.8140, lng: 13.2305 },
          { lat: -8.8143, lng: 13.2302 },
          { lat: -8.8140, lng: 13.2299 }
        ],
        radius: "100.00",
        alertOnEnter: true,
        alertOnExit: true,
        createdBy: adminUser.id
      },
      {
        name: "Porto de Benguela",
        description: "Área do porto de Benguela",
        type: "customer",
        polygonCoordinates: [
          { lat: -12.5763, lng: 13.4055 },
          { lat: -12.5766, lng: 13.4058 },
          { lat: -12.5769, lng: 13.4055 },
          { lat: -12.5766, lng: 13.4052 }
        ],
        radius: "200.00",
        alertOnEnter: true,
        alertOnExit: false,
        createdBy: adminUser.id
      }
    ];
    
    await db.insert(geofences).values(geofencesData);

    // 12. ORDERS - Encomendas
    console.log("📋 Criando encomendas...");
    const ordersData = [
      {
        orderNumber: "ORD-2024-001",
        type: "sale",
        status: "completed",
        customerId: insertedCustomers[0].id,
        customerName: insertedCustomers[0].name,
        customerEmail: insertedCustomers[0].email,
        customerPhone: insertedCustomers[0].phone,
        customerAddress: insertedCustomers[0].address,
        totalAmount: "98500.00",
        notes: "Entrega urgente",
        userId: managerUser.id
      },
      {
        orderNumber: "ORD-2024-002",
        type: "sale", 
        status: "processing",
        customerId: insertedCustomers[1].id,
        customerName: insertedCustomers[1].name,
        customerEmail: insertedCustomers[1].email,
        customerPhone: insertedCustomers[1].phone,
        customerAddress: insertedCustomers[1].address,
        totalAmount: "7000.00",
        userId: operator1.id
      },
      {
        orderNumber: "PUR-2024-001",
        type: "purchase",
        status: "pending",
        supplierId: insertedSuppliers[0].id,
        totalAmount: "85000.00",
        notes: "Compra de stock",
        userId: managerUser.id
      }
    ];
    
    const insertedOrders = await db.insert(orders).values(ordersData).returning();

    // 13. ORDER ITEMS - Itens das encomendas
    console.log("📦 Criando itens das encomendas...");
    const orderItemsData = [
      {
        orderId: insertedOrders[0].id,
        productId: insertedProducts[2].id, // Frigorífico
        quantity: 1,
        unitPrice: "95000.00",
        totalPrice: "95000.00"
      },
      {
        orderId: insertedOrders[0].id,
        productId: insertedProducts[4].id, // Creme
        quantity: 1,
        unitPrice: "2500.00", 
        totalPrice: "2500.00"
      },
      {
        orderId: insertedOrders[1].id,
        productId: insertedProducts[1].id, // Camisa
        quantity: 2,
        unitPrice: "3500.00",
        totalPrice: "7000.00"
      },
      {
        orderId: insertedOrders[2].id,
        productId: insertedProducts[0].id, // Óleo
        quantity: 100,
        unitPrice: "850.00",
        totalPrice: "85000.00"
      }
    ];
    
    await db.insert(orderItems).values(orderItemsData);

    // 14. SHIPMENTS - Envios
    console.log("🚚 Criando envios...");
    const shipmentsData = [
      {
        shipmentNumber: "SHIP-2024-001",
        orderId: insertedOrders[0].id,
        vehicleId: insertedVehicles[0].id,
        status: "delivered",
        carrier: "SGST Logística",
        trackingNumber: "TRK001234567",
        shippingAddress: insertedCustomers[0].address,
        estimatedDelivery: new Date('2024-09-15'),
        actualDelivery: new Date('2024-09-14'),
        userId: operator1.id
      },
      {
        shipmentNumber: "SHIP-2024-002", 
        orderId: insertedOrders[1].id,
        vehicleId: insertedVehicles[1].id,
        status: "in_transit",
        carrier: "SGST Logística",
        trackingNumber: "TRK001234568",
        shippingAddress: insertedCustomers[1].address,
        estimatedDelivery: new Date('2024-09-20'),
        userId: operator2.id
      }
    ];
    
    await db.insert(shipments).values(shipmentsData);

    // 15. STOCK MOVEMENTS - Movimentos de stock
    console.log("📈 Criando movimentos de stock...");
    const stockMovementsData = [
      {
        productId: insertedProducts[0].id,
        warehouseId: luandaWarehouse.id,
        type: "in",
        quantity: 100,
        reference: "PUR-2024-001",
        reason: "Compra de fornecedor",
        userId: operator1.id
      },
      {
        productId: insertedProducts[2].id,
        warehouseId: luandaWarehouse.id,
        type: "out",
        quantity: 1,
        reference: "ORD-2024-001",
        reason: "Venda para cliente",
        userId: operator1.id
      },
      {
        productId: insertedProducts[1].id,
        warehouseId: benguelaWarehouse.id,
        type: "transfer",
        quantity: 10,
        reference: "TRF-001",
        reason: "Transferência entre armazéns",
        userId: operator2.id
      }
    ];
    
    await db.insert(stockMovements).values(stockMovementsData);

    // 16. ALERTS - Alertas do sistema
    console.log("⚠️ Criando alertas...");
    const alertsData = [
      {
        type: "low_stock",
        priority: "high",
        title: "Stock Baixo - Óleo de Palma",
        message: "O produto Óleo de Palma está com stock abaixo do mínimo",
        entityType: "product", 
        entityId: insertedProducts[0].id,
        userId: managerUser.id
      },
      {
        type: "vehicle_maintenance",
        priority: "medium",
        title: "Manutenção Veículo",
        message: "Veículo HU-789-AO precisa de manutenção",
        entityType: "vehicle",
        entityId: insertedVehicles[2].id,
        userId: managerUser.id
      },
      {
        type: "gps_offline",
        priority: "critical",
        title: "GPS Offline",
        message: "Veículo LD-123-AO sem sinal GPS há 2 horas",
        entityType: "vehicle",
        entityId: insertedVehicles[0].id,
        userId: operator1.id
      }
    ];
    
    await db.insert(alerts).values(alertsData);

    // 17. PICKING LISTS - Listas de picking
    console.log("📝 Criando listas de picking...");
    const pickingListsData = [
      {
        pickNumber: "PICK-2024-001",
        orderId: insertedOrders[1].id,
        warehouseId: benguelaWarehouse.id,
        status: "in_progress",
        priority: "high",
        assignedTo: operator2.id,
        type: "order",
        scheduledDate: new Date(),
        estimatedTime: 30,
        userId: managerUser.id
      }
    ];
    
    const insertedPickingLists = await db.insert(pickingLists).values(pickingListsData).returning();

    // 18. PICKING LIST ITEMS - Itens das listas de picking
    console.log("📋 Criando itens de picking...");
    const pickingListItemsData = [
      {
        pickingListId: insertedPickingLists[0].id,
        productId: insertedProducts[1].id,
        quantityToPick: 2,
        quantityPicked: 1,
        status: "partial"
      }
    ];
    
    await db.insert(pickingListItems).values(pickingListItemsData);

    // 19. INVENTORY COUNTS - Contagens de inventário
    console.log("🔢 Criando contagens de inventário...");
    const inventoryCountsData = [
      {
        countNumber: "CNT-2024-001",
        type: "cycle",
        status: "completed",
        warehouseId: luandaWarehouse.id,
        scheduledDate: new Date('2024-09-01'),
        completedDate: new Date('2024-09-01'),
        userId: operator1.id,
        notes: "Contagem mensal de rotina"
      }
    ];
    
    const insertedInventoryCounts = await db.insert(inventoryCounts).values(inventoryCountsData).returning();

    // 20. INVENTORY COUNT ITEMS
    console.log("📊 Criando itens de contagem...");
    const inventoryCountItemsData = [
      {
        countId: insertedInventoryCounts[0].id,
        productId: insertedProducts[0].id,
        expectedQuantity: 50,
        countedQuantity: 48,
        variance: -2,
        reconciled: true,
        countedByUserId: operator1.id,
        countedAt: new Date('2024-09-01')
      }
    ];
    
    await db.insert(inventoryCountItems).values(inventoryCountItemsData);

    // 21. BARCODE SCANS - Scans de códigos de barras
    console.log("📱 Criando scans de códigos...");
    const barcodeScanData = [
      {
        scannedCode: "1234567890123",
        scanType: "barcode",
        productId: insertedProducts[0].id,
        warehouseId: luandaWarehouse.id,
        scanPurpose: "inventory",
        userId: operator1.id,
        metadata: { device: "scanner-001", location: "A1-01" }
      }
    ];
    
    await db.insert(barcodeScans).values(barcodeScanData);

    // 22. WAREHOUSE ZONES - Zonas do armazém
    console.log("🏭 Criando zonas dos armazéns...");
    const warehouseZonesData = [
      {
        warehouseId: luandaWarehouse.id,
        name: "Zona A - Picking",
        type: "picking",
        coordinates: { x: 0, y: 0, width: 50, height: 30, z: 0, floor: 1 },
        capacity: { maxItems: 1000, maxWeight: 5000, maxVolume: 100 },
        currentUtilization: { items: 750, weight: 3500, volume: 75, percentage: 75 }
      },
      {
        warehouseId: luandaWarehouse.id,
        name: "Zona B - Armazenamento",
        type: "storage", 
        coordinates: { x: 50, y: 0, width: 80, height: 50, z: 0, floor: 1 },
        capacity: { maxItems: 2000, maxWeight: 15000, maxVolume: 300 },
        currentUtilization: { items: 1200, weight: 8500, volume: 180, percentage: 60 }
      }
    ];
    
    await db.insert(warehouseZones).values(warehouseZonesData);

    // 23. DIGITAL TWIN SIMULATIONS
    console.log("🎯 Criando simulações digitais...");
    const digitalTwinSimulationsData = [
      {
        warehouseId: luandaWarehouse.id,
        name: "Simulação Otimização Picking",
        type: "picking_optimization",
        parameters: { 
          timeHorizon: "1_week",
          optimizationLevel: "high",
          includeSeasonality: true 
        },
        results: {
          currentEfficiency: 78,
          projectedEfficiency: 89,
          estimatedSavings: "15%",
          recommendations: ["Reorganizar zona A", "Implementar cross-docking"]
        },
        status: "completed",
        startedAt: new Date('2024-09-01T10:00:00'),
        completedAt: new Date('2024-09-01T10:30:00'),
        createdBy: managerUser.id
      }
    ];
    
    await db.insert(digitalTwinSimulations).values(digitalTwinSimulationsData);

    // 24. AUDIT TRAIL - Trilha de auditoria
    console.log("🔍 Criando trilha de auditoria...");
    const auditTrailData = [
      {
        tableName: "products",
        recordId: insertedProducts[0].id,
        operation: "CREATE",
        newValues: { name: "Óleo de Palma Premium", sku: "OIL-PALM-001" },
        userId: adminUser.id,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (compatible; SGST/1.0)",
        checksum: "abc123def456ghi789",
        wormStored: true
      }
    ];
    
    await db.insert(auditTrail).values(auditTrailData);

    // 25. ML MODELS - Modelos de Machine Learning
    console.log("🤖 Criando modelos de ML...");
    const mlModelsData = [
      {
        modelName: "Demand Forecasting Model",
        modelType: "demand_forecast",
        version: "1.0.0",
        parameters: {
          algorithm: "ARIMA",
          seasonality: true,
          confidence: 0.95
        },
        trainingData: {
          records: 10000,
          startDate: "2023-01-01", 
          endDate: "2024-08-31"
        },
        accuracy: "0.8750",
        status: "deployed",
        lastTraining: new Date('2024-09-01'),
        deployedAt: new Date('2024-09-01')
      }
    ];
    
    await db.insert(mlModels).values(mlModelsData);

    // 26. VEHICLE ASSIGNMENTS - Atribuições de veículos
    console.log("🚛 Criando atribuições de veículos...");
    const vehicleAssignmentsData = [
      {
        vehicleId: insertedVehicles[0].id,
        assignmentType: "shipment",
        entityId: shipmentsData[0].shipmentNumber,
        driverId: driver1.id,
        status: "completed",
        assignedAt: new Date('2024-09-10'),
        completedAt: new Date('2024-09-14'),
        assignedBy: managerUser.id
      },
      {
        vehicleId: insertedVehicles[1].id,
        assignmentType: "shipment", 
        entityId: shipmentsData[1].shipmentNumber,
        driverId: driver2.id,
        status: "active",
        assignedAt: new Date('2024-09-15'),
        assignedBy: managerUser.id
      }
    ];
    
    await db.insert(vehicleAssignments).values(vehicleAssignmentsData);

    // 27. VEHICLE MAINTENANCE - Manutenção de veículos
    console.log("🔧 Criando registos de manutenção...");
    const vehicleMaintenanceData = [
      {
        vehicleId: insertedVehicles[0].id,
        type: "preventiva",
        description: "Mudança de óleo e filtros",
        cost: "15000.00",
        serviceProvider: "Oficina Central Luanda",
        maintenanceDate: new Date('2024-08-15'),
        nextMaintenanceDate: new Date('2024-11-15'),
        mileage: 45000,
        status: "concluida",
        performedBy: operator1.id
      },
      {
        vehicleId: insertedVehicles[2].id,
        type: "corretiva",
        description: "Reparação de sistema de travões",
        cost: "35000.00",
        serviceProvider: "Oficina Especializada",
        maintenanceDate: new Date('2024-09-01'),
        mileage: 78000,
        status: "em_progresso",
        performedBy: operator2.id
      }
    ];
    
    await db.insert(vehicleMaintenance).values(vehicleMaintenanceData);

    // 28. NOTIFICATION PREFERENCES - Preferências de notificação
    console.log("🔔 Criando preferências de notificação...");
    const notificationPreferencesData = [
      {
        userId: managerUser.id,
        alertType: "low_stock",
        channel: "email",
        enabled: true,
        threshold: { minLevel: 10 }
      },
      {
        userId: operator1.id,
        alertType: "picking_task",
        channel: "in_app",
        enabled: true
      }
    ];
    
    await db.insert(notificationPreferences).values(notificationPreferencesData);

    console.log("✅ Seed concluído com sucesso!");
    console.log("📈 Base de dados populada com:");
    console.log(`   👥 ${usersData.length} utilizadores`);
    console.log(`   📂 ${categoriesData.length} categorias`);
    console.log(`   🏭 ${suppliersData.length} fornecedores`);
    console.log(`   👤 ${customersData.length} clientes`);
    console.log(`   🏬 ${warehousesData.length} armazéns`);
    console.log(`   📦 ${productsData.length} produtos`);
    console.log(`   🚛 ${vehiclesData.length} veículos`);
    console.log(`   📋 ${ordersData.length} encomendas`);
    console.log(`   🚚 ${shipmentsData.length} envios`);
    console.log(`   ⚠️ ${alertsData.length} alertas`);
    console.log("   📊 Inventário, localizações, e dados de GPS");
    console.log("   🎯 Simulações digitais e modelos ML");
    console.log("   🔍 Trilha de auditoria e dados RTLS");

  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    throw error;
  }
}

// Executar seed se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log("🌱 Seed executado com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Falha no seed:", error);
      process.exit(1);
    });
}

export { seed };