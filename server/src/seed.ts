import dotenv from "dotenv";
dotenv.config();

import { db } from "../database/db";
import { eq } from "drizzle-orm";
import type { MySqlTable } from "drizzle-orm/mysql-core";
import { 
  users, categories, customers, suppliers, warehouses, products, inventory, 
  stockMovements, orders, orderItems, shipments, productLocations, 
  inventoryCounts, inventoryCountItems, barcodeScans, pickingLists, pickingListItems,
  vehicles, vehicleMaintenance, gpsTracking, geofences, vehicleAssignments, geofenceAlerts, gpsSessions,
  carriers, roles, permissions, rolePermissions, userRoles
} from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Iniciando seed da base de dados para empresa de bebidas em Angola...");
  
  try {
    // Clear existing data
    console.log("🧹 Limpando dados existentes...");
    // Limpar tabelas dependentes primeiro
    await db.delete(geofenceAlerts as unknown as MySqlTable<any>);
    await db.delete(gpsSessions as unknown as MySqlTable<any>);
    await db.delete(gpsTracking as unknown as MySqlTable<any>);
    await db.delete(vehicleAssignments as unknown as MySqlTable<any>);
    await db.delete(vehicleMaintenance as unknown as MySqlTable<any>);
    await db.delete(pickingListItems as unknown as MySqlTable<any>);
    await db.delete(pickingLists as unknown as MySqlTable<any>);
    await db.delete(inventoryCountItems as unknown as MySqlTable<any>);
    await db.delete(inventoryCounts as unknown as MySqlTable<any>);
    await db.delete(barcodeScans as unknown as MySqlTable<any>);
    await db.delete(shipments as unknown as MySqlTable<any>);
    await db.delete(orderItems as unknown as MySqlTable<any>);
    await db.delete(orders as unknown as MySqlTable<any>);
    await db.delete(stockMovements as unknown as MySqlTable<any>);
    await db.delete(inventory as unknown as MySqlTable<any>);
    await db.delete(productLocations as unknown as MySqlTable<any>);
    await db.delete(products as unknown as MySqlTable<any>);
    await db.delete(geofences as unknown as MySqlTable<any>);
    await db.delete(vehicles as unknown as MySqlTable<any>);
    await db.delete(carriers as unknown as MySqlTable<any>);
    await db.delete(warehouses as unknown as MySqlTable<any>);
    await db.delete(customers as unknown as MySqlTable<any>);
    await db.delete(suppliers as unknown as MySqlTable<any>);
    await db.delete(categories as unknown as MySqlTable<any>);
    await db.delete(userRoles as unknown as MySqlTable<any>);
    await db.delete(rolePermissions as unknown as MySqlTable<any>);
    await db.delete(roles as unknown as MySqlTable<any>);
    await db.delete(permissions as unknown as MySqlTable<any>);
    await db.delete(users as unknown as MySqlTable<any>);

    // 1. PERMISSIONS - Permissões do sistema de gestão de bebidas
    console.log("🔐 Criando permissões do sistema...");
    const permissionsData = [
      // Gestão de Utilizadores
      { name: "users.read", description: "Visualizar utilizadores", module: "users", action: "read", resource: "users" },
      { name: "users.create", description: "Criar utilizadores", module: "users", action: "create", resource: "users" },
      { name: "users.update", description: "Editar utilizadores", module: "users", action: "update", resource: "users" },
      { name: "users.delete", description: "Eliminar utilizadores", module: "users", action: "delete", resource: "users" },
      
      // Gestão de Perfis e Permissões
      { name: "roles.read", description: "Visualizar perfis", module: "roles", action: "read", resource: "roles" },
      { name: "roles.create", description: "Criar perfis", module: "roles", action: "create", resource: "roles" },
      { name: "roles.update", description: "Editar perfis", module: "roles", action: "update", resource: "roles" },
      { name: "roles.delete", description: "Eliminar perfis", module: "roles", action: "delete", resource: "roles" },
      
      // Gestão de Produtos e Categorias
      { name: "products.read", description: "Visualizar produtos", module: "products", action: "read", resource: "products" },
      { name: "products.create", description: "Criar produtos", module: "products", action: "create", resource: "products" },
      { name: "products.update", description: "Editar produtos", module: "products", action: "update", resource: "products" },
      { name: "products.delete", description: "Eliminar produtos", module: "products", action: "delete", resource: "products" },
      
      // Gestão de Inventário
      { name: "inventory.read", description: "Visualizar inventário", module: "inventory", action: "read", resource: "inventory" },
      { name: "inventory.update", description: "Atualizar inventário", module: "inventory", action: "update", resource: "inventory" },
      { name: "inventory.count", description: "Realizar contagens", module: "inventory", action: "count", resource: "inventory" },
      { name: "inventory.adjust", description: "Ajustar stock", module: "inventory", action: "adjust", resource: "inventory" },
      
      // Gestão de Encomendas
      { name: "orders.read", description: "Visualizar encomendas", module: "orders", action: "read", resource: "orders" },
      { name: "orders.create", description: "Criar encomendas", module: "orders", action: "create", resource: "orders" },
      { name: "orders.update", description: "Editar encomendas", module: "orders", action: "update", resource: "orders" },
      { name: "orders.cancel", description: "Cancelar encomendas", module: "orders", action: "cancel", resource: "orders" },
      
      // Gestão de Clientes
      { name: "customers.read", description: "Visualizar clientes", module: "customers", action: "read", resource: "customers" },
      { name: "customers.create", description: "Criar clientes", module: "customers", action: "create", resource: "customers" },
      { name: "customers.update", description: "Editar clientes", module: "customers", action: "update", resource: "customers" },
      { name: "customers.delete", description: "Eliminar clientes", module: "customers", action: "delete", resource: "customers" },
      
      // Gestão de Fornecedores
      { name: "suppliers.read", description: "Visualizar fornecedores", module: "suppliers", action: "read", resource: "suppliers" },
      { name: "suppliers.create", description: "Criar fornecedores", module: "suppliers", action: "create", resource: "suppliers" },
      { name: "suppliers.update", description: "Editar fornecedores", module: "suppliers", action: "update", resource: "suppliers" },
      { name: "suppliers.delete", description: "Eliminar fornecedores", module: "suppliers", action: "delete", resource: "suppliers" },
      
      // Gestão de Transportadoras
      { name: "carriers.read", description: "Visualizar transportadoras", module: "carriers", action: "read", resource: "carriers" },
      { name: "carriers.create", description: "Criar transportadoras", module: "carriers", action: "create", resource: "carriers" },
      { name: "carriers.update", description: "Editar transportadoras", module: "carriers", action: "update", resource: "carriers" },
      { name: "carriers.delete", description: "Eliminar transportadoras", module: "carriers", action: "delete", resource: "carriers" },
      
      // Gestão de Frota e Veículos
      { name: "fleet.read", description: "Visualizar frota", module: "fleet", action: "read", resource: "vehicles" },
      { name: "fleet.create", description: "Adicionar veículos", module: "fleet", action: "create", resource: "vehicles" },
      { name: "fleet.update", description: "Editar veículos", module: "fleet", action: "update", resource: "vehicles" },
      { name: "fleet.maintenance", description: "Gerir manutenção", module: "fleet", action: "maintenance", resource: "vehicles" },
      { name: "fleet.tracking", description: "Rastreamento GPS", module: "fleet", action: "tracking", resource: "vehicles" },
      
      // Picking e Armazém
      { name: "picking.read", description: "Visualizar listas de picking", module: "picking", action: "read", resource: "picking" },
      { name: "picking.create", description: "Criar listas de picking", module: "picking", action: "create", resource: "picking" },
      { name: "picking.execute", description: "Executar picking", module: "picking", action: "execute", resource: "picking" },
      
      // Relatórios e Analytics
      { name: "reports.read", description: "Visualizar relatórios", module: "reports", action: "read", resource: "reports" },
      { name: "reports.export", description: "Exportar relatórios", module: "reports", action: "export", resource: "reports" },
      
      // Configurações do Sistema
      { name: "settings.read", description: "Visualizar configurações", module: "settings", action: "read", resource: "settings" },
      { name: "settings.update", description: "Alterar configurações", module: "settings", action: "update", resource: "settings" },
      
      // Dashboard
      { name: "dashboard.read", description: "Visualizar dashboard", module: "dashboard", action: "read", resource: "dashboard" }
    ];
    
    await db.insert(permissions).values(permissionsData);
    const insertedPermissions = await db.select().from(permissions).orderBy(permissions.name);

    // 2. ROLES - Perfis do sistema de bebidas
    console.log("👑 Criando perfis do sistema...");
    const rolesData = [
      { name: "Administrador", description: "Acesso total ao sistema de gestão de bebidas", isActive: true },
      { name: "Gestor de Operações", description: "Gestão operacional de armazém e distribuição", isActive: true },
      { name: "Gestor de Vendas", description: "Gestão de clientes e encomendas", isActive: true },
      { name: "Operador de Armazém", description: "Operações de picking, receção e expedição", isActive: true },
      { name: "Motorista", description: "Aplicação móvel para entregas e recolhas", isActive: true },
      { name: "Supervisor de Qualidade", description: "Controlo de qualidade e lotes", isActive: true },
      { name: "Analista", description: "Relatórios e análise de dados", isActive: true }
    ];
    
    await db.insert(roles).values(rolesData);
    const insertedRoles = await db.select().from(roles).orderBy(roles.name);
    
    // Mapear roles por nome para facilitar atribuição de permissões
    const roleMap = insertedRoles.reduce((acc, role) => {
      acc[role.name] = role;
      return acc;
    }, {} as Record<string, any>);

    // 3. ROLE PERMISSIONS - Atribuir permissões aos perfis
    console.log("🔗 Atribuindo permissões aos perfis...");
    
    // Administrador - Todas as permissões
    const adminPermissions = insertedPermissions.map(permission => ({
      roleId: roleMap["Administrador"].id,
      permissionId: permission.id
    }));
    
    // Gestor de Operações - Gestão operacional completa
    const operationsManagerPermissions = insertedPermissions
      .filter(p => [
        "products.read", "products.create", "products.update",
        "inventory.read", "inventory.update", "inventory.count", "inventory.adjust",
        "orders.read", "orders.create", "orders.update", "orders.cancel",
        "suppliers.read", "suppliers.create", "suppliers.update",
        "carriers.read", "carriers.create", "carriers.update", "carriers.delete",
        "fleet.read", "fleet.update", "fleet.maintenance", "fleet.tracking",
        "picking.read", "picking.create", "picking.execute",
        "reports.read", "reports.export",
        "users.read"
      ].includes(p.name))
      .map(permission => ({
        roleId: roleMap["Gestor de Operações"].id,
        permissionId: permission.id
      }));
    
    // Gestor de Vendas - Foco em clientes e vendas
    const salesManagerPermissions = insertedPermissions
      .filter(p => [
        "customers.read", "customers.create", "customers.update",
        "orders.read", "orders.create", "orders.update",
        "products.read",
        "inventory.read",
        "reports.read", "reports.export"
      ].includes(p.name))
      .map(permission => ({
        roleId: roleMap["Gestor de Vendas"].id,
        permissionId: permission.id
      }));
    
    // Operador de Armazém - Operações básicas
    const warehouseOperatorPermissions = insertedPermissions
      .filter(p => [
        "products.read",
        "inventory.read", "inventory.update", "inventory.count",
        "orders.read", "orders.update",
        "picking.read", "picking.execute"
      ].includes(p.name))
      .map(permission => ({
        roleId: roleMap["Operador de Armazém"].id,
        permissionId: permission.id
      }));
    
    // Motorista - Apenas visualização e tracking
    const driverPermissions = insertedPermissions
      .filter(p => [
        "orders.read",
        "customers.read",
        "fleet.read", "fleet.tracking"
      ].includes(p.name))
      .map(permission => ({
        roleId: roleMap["Motorista"].id,
        permissionId: permission.id
      }));
    
    // Supervisor de Qualidade - Controlo de qualidade
    const qualitySupervisorPermissions = insertedPermissions
      .filter(p => [
        "products.read",
        "inventory.read", "inventory.count", "inventory.adjust",
        "suppliers.read",
        "reports.read", "reports.export"
      ].includes(p.name))
      .map(permission => ({
        roleId: roleMap["Supervisor de Qualidade"].id,
        permissionId: permission.id
      }));
    
    // Analista - Apenas relatórios e visualização
    const analystPermissions = insertedPermissions
      .filter(p => [
        "products.read",
        "inventory.read",
        "orders.read",
        "customers.read",
        "suppliers.read",
        "carriers.read",
        "fleet.read",
        "reports.read", "reports.export"
      ].includes(p.name))
      .map(permission => ({
        roleId: roleMap["Analista"].id,
        permissionId: permission.id
      }));
    
    // Inserir todas as permissões de roles
    await db.insert(rolePermissions).values([
      ...adminPermissions,
      ...operationsManagerPermissions,
      ...salesManagerPermissions,
      ...warehouseOperatorPermissions,
      ...driverPermissions,
      ...qualitySupervisorPermissions,
      ...analystPermissions
    ]);

    // 4. USERS - Utilizadores do sistema
    console.log("👥 Criando utilizadores...");
    const hashedPassword = await bcrypt.hash("123456", 10);
    
    const usersData = [
      {
        username: "admin",
        email: "admin@bebidas-angola.ao",
        password: hashedPassword,
        role: "admin",
        isActive: true
      },
      {
        username: "carlos.silva",
        email: "carlos.silva@bebidas-angola.ao",
        password: hashedPassword,
        role: "manager",
        isActive: true
      },
      {
        username: "maria.santos",
        email: "maria.santos@bebidas-angola.ao",
        password: hashedPassword,
        role: "sales_manager",
        isActive: true
      },
      {
        username: "joao.manuel",
        email: "joao.manuel@bebidas-angola.ao",
        password: hashedPassword,
        role: "operator",
        isActive: true
      },
      {
        username: "antonio.driver",
        email: "antonio.driver@bebidas-angola.ao",
        password: hashedPassword,
        role: "driver",
        isActive: true
      },
      {
        username: "lucia.quality",
        email: "lucia.quality@bebidas-angola.ao",
        password: hashedPassword,
        role: "quality",
        isActive: true
      },
      {
        username: "pedro.analyst",
        email: "pedro.analyst@bebidas-angola.ao",
        password: hashedPassword,
        role: "analyst",
        isActive: true
      }
    ];
    
    await db.insert(users).values(usersData);
    const insertedUsers = await db.select().from(users).orderBy(users.username);
    
    // Mapear usuários por username
    const userMap = insertedUsers.reduce((acc, user) => {
      acc[user.username] = user;
      return acc;
    }, {} as Record<string, any>);

    // 5. USER ROLES - Atribuir perfis aos utilizadores
    console.log("🔗 Atribuindo perfis aos utilizadores...");
    const userRolesData = [
      { userId: userMap["admin"].id, roleId: roleMap["Administrador"].id, assignedBy: userMap["admin"].id },
      { userId: userMap["carlos.silva"].id, roleId: roleMap["Gestor de Operações"].id, assignedBy: userMap["admin"].id },
      { userId: userMap["maria.santos"].id, roleId: roleMap["Gestor de Vendas"].id, assignedBy: userMap["admin"].id },
      { userId: userMap["joao.manuel"].id, roleId: roleMap["Operador de Armazém"].id, assignedBy: userMap["admin"].id },
      { userId: userMap["antonio.driver"].id, roleId: roleMap["Motorista"].id, assignedBy: userMap["admin"].id },
      { userId: userMap["lucia.quality"].id, roleId: roleMap["Supervisor de Qualidade"].id, assignedBy: userMap["admin"].id },
      { userId: userMap["pedro.analyst"].id, roleId: roleMap["Analista"].id, assignedBy: userMap["admin"].id }
    ];
    
    await db.insert(userRoles).values(userRolesData);

    // 6. CATEGORIES - Categorias de bebidas
    console.log("🍺 Criando categorias de bebidas...");
    const categoriesData = [
      { name: "Cervejas", description: "Cervejas nacionais e importadas" },
      { name: "Refrigerantes", description: "Bebidas gaseificadas e sumos" },
      { name: "Águas", description: "Água mineral e gaseificada" },
      { name: "Vinhos", description: "Vinhos nacionais e importados" },
      { name: "Destilados", description: "Whisky, vodka, gin e outros destilados" },
      { name: "Licores", description: "Licores e bebidas doces" },
      { name: "Energéticos", description: "Bebidas energéticas" },
      { name: "Sumos Naturais", description: "Sumos de fruta natural" },
      { name: "Bebidas Tradicionais", description: "Bebidas tradicionais angolanas" }
    ];
    
    await db.insert(categories).values(categoriesData);
    const insertedCategories = await db.select().from(categories).orderBy(categories.name);
    
    // Mapear categorias por nome
    const categoryMap = insertedCategories.reduce((acc, category) => {
      acc[category.name] = category;
      return acc;
    }, {} as Record<string, any>);

    // 7. SUPPLIERS - Fornecedores de bebidas em Angola
    console.log("🏭 Criando fornecedores...");
    const suppliersData = [
      {
        name: "Cervejaria Cuca",
        email: "comercial@cuca.ao",
        phone: "+244 222 123 456",
        address: "Rua Rainha Ginga, 123, Luanda, Angola"
      },
      {
        name: "Refriango - Refrigerantes de Angola",
        email: "vendas@refriango.ao",
        phone: "+244 222 234 567",
        address: "Zona Industrial de Viana, Luanda, Angola"
      },
      {
        name: "Águas de Angola",
        email: "comercial@aguasangola.ao",
        phone: "+244 222 345 678",
        address: "Estrada de Catete, Km 15, Luanda, Angola"
      },
      {
        name: "Vinhos Africanos Lda",
        email: "info@vinhosafricanos.ao",
        phone: "+244 222 456 789",
        address: "Rua Amílcar Cabral, 45, Luanda, Angola"
      },
      {
        name: "Destilaria Nacional",
        email: "vendas@destilarianacional.ao",
        phone: "+244 222 567 890",
        address: "Zona Industrial do Cacuaco, Luanda, Angola"
      },
      {
        name: "Coca-Cola Angola",
        email: "comercial@cocacola.ao",
        phone: "+244 222 678 901",
        address: "Rua Comandante Che Guevara, 78, Luanda, Angola"
      },
      {
        name: "Sumos Tropicais",
        email: "info@sumostropicais.ao",
        phone: "+244 222 789 012",
        address: "Estrada de Benguela, Km 8, Luanda, Angola"
      }
    ];
    
    await db.insert(suppliers).values(suppliersData);
    const insertedSuppliers = await db.select().from(suppliers).orderBy(suppliers.name);
    
    // Mapear fornecedores por nome
    const supplierMap = insertedSuppliers.reduce((acc, supplier) => {
      acc[supplier.name] = supplier;
      return acc;
    }, {} as Record<string, any>);

    // 8. WAREHOUSES - Armazéns de distribuição
    console.log("🏢 Criando armazéns...");
    const warehousesData = [
      {
        name: "Armazém Central Luanda",
        type: "central",
        address: "Zona Industrial de Viana, Luanda, Angola",
        isActive: true
      },
      {
        name: "Centro de Distribuição Benguela",
        type: "regional",
        address: "Zona Industrial de Benguela, Angola",
        isActive: true
      },
      {
        name: "Depósito Huambo",
        type: "local",
        address: "Rua da Independência, Huambo, Angola",
        isActive: true
      },
      {
        name: "Armazém Lobito",
        type: "local",
        address: "Porto do Lobito, Benguela, Angola",
        isActive: true
      }
    ];
    
    await db.insert(warehouses).values(warehousesData);
    const insertedWarehouses = await db.select().from(warehouses).orderBy(warehouses.name);
    
    // Mapear armazéns por nome
    const warehouseMap = insertedWarehouses.reduce((acc, warehouse) => {
      acc[warehouse.name] = warehouse;
      return acc;
    }, {} as Record<string, any>);

    // 9. PRODUCTS - Produtos de bebidas
    console.log("🍻 Criando produtos de bebidas...");
    const productsData = [
      // Cervejas
      {
        name: "Cuca Original",
        description: "Cerveja angolana tradicional",
        categoryId: categoryMap["Cervejas"].id,
        supplierId: supplierMap["Cervejaria Cuca"].id,
        sku: "CUC-001",
        barcode: "7891234567890",
        price: "150.00",
      costPrice: "100.00",
        weight: "0.33",
        dimensions: "6.5x6.5x20",
        minStockLevel: 100,
        maxStockLevel: 1000,
        reorderPoint: 200,
        isActive: true
      },
      {
        name: "Cuca Preta",
        description: "Cerveja preta angolana",
        categoryId: categoryMap["Cervejas"].id,
        supplierId: supplierMap["Cervejaria Cuca"].id,
        sku: "CUC-002",
        barcode: "7891234567891",
        price: "180.00",
      costPrice: "120.00",
        weight: "0.33",
        dimensions: "6.5x6.5x20",
        minStockLevel: 50,
        maxStockLevel: 500,
        reorderPoint: 100,
        isActive: true
      },
      {
        name: "Nocal",
        description: "Cerveja premium angolana",
        categoryId: categoryMap["Cervejas"].id,
        supplierId: supplierMap["Cervejaria Cuca"].id,
        sku: "NOC-001",
        barcode: "7891234567892",
        price: "200.00",
      costPrice: "140.00",
        weight: "0.33",
        dimensions: "6.5x6.5x20",
        minStockLevel: 80,
        maxStockLevel: 800,
        reorderPoint: 150,
        isActive: true
      },
      {
        name: "Heineken",
        description: "Cerveja internacional",
        categoryId: categoryMap["Cervejas"].id,
        supplierId: supplierMap["Coca-Cola Angola"].id,
        sku: "HEI-001",
        barcode: "7891234567893",
        price: "250.00",
      costPrice: "180.00",
        weight: "0.33",
        dimensions: "6.5x6.5x20",
        minStockLevel: 60,
        maxStockLevel: 600,
        reorderPoint: 120,
        isActive: true
      },
      
      // Refrigerantes
      {
        name: "Coca-Cola 350ml",
        description: "Refrigerante de cola",
        categoryId: categoryMap["Refrigerantes"].id,
        supplierId: supplierMap["Coca-Cola Angola"].id,
        sku: "COC-350",
        barcode: "7891234567894",
        price: "120.00",
      costPrice: "80.00",
        weight: "0.35",
        dimensions: "6x6x12",
        minStockLevel: 200,
        maxStockLevel: 2000,
        reorderPoint: 400,
        isActive: true
      },
      {
        name: "Pepsi 350ml",
        description: "Refrigerante de cola",
        categoryId: categoryMap["Refrigerantes"].id,
        supplierId: supplierMap["Refriango - Refrigerantes de Angola"].id,
        sku: "PEP-350",
        barcode: "7891234567895",
        price: "110.00",
      costPrice: "75.00",
        weight: "0.35",
        dimensions: "6x6x12",
        minStockLevel: 150,
        maxStockLevel: 1500,
        reorderPoint: 300,
        isActive: true
      },
      {
        name: "Fanta Laranja 350ml",
        description: "Refrigerante de laranja",
        categoryId: categoryMap["Refrigerantes"].id,
        supplierId: supplierMap["Coca-Cola Angola"].id,
        sku: "FAN-350",
        barcode: "7891234567896",
        price: "110.00",
      costPrice: "75.00",
        weight: "0.35",
        dimensions: "6x6x12",
        minStockLevel: 120,
        maxStockLevel: 1200,
        reorderPoint: 250,
        isActive: true
      },
      
      // Águas
      {
        name: "Água Pura 500ml",
        description: "Água mineral natural",
        categoryId: categoryMap["Águas"].id,
        supplierId: supplierMap["Águas de Angola"].id,
        sku: "AGU-500",
        barcode: "7891234567897",
        price: "80.00",
      costPrice: "50.00",
        weight: "0.5",
        dimensions: "6x6x20",
        minStockLevel: 300,
        maxStockLevel: 3000,
        reorderPoint: 600,
        isActive: true
      },
      {
        name: "Água Pura 1.5L",
        description: "Água mineral natural",
        categoryId: categoryMap["Águas"].id,
        supplierId: supplierMap["Águas de Angola"].id,
        sku: "AGU-1500",
        barcode: "7891234567898",
        price: "150.00",
      costPrice: "100.00",
        weight: "1.5",
        dimensions: "8x8x30",
        minStockLevel: 200,
        maxStockLevel: 2000,
        reorderPoint: 400,
        isActive: true
      },
      
      // Vinhos
      {
        name: "Vinho Tinto Calulo",
        description: "Vinho tinto angolano",
        categoryId: categoryMap["Vinhos"].id,
        supplierId: supplierMap["Vinhos Africanos Lda"].id,
        sku: "VIN-CAL",
        barcode: "7891234567899",
        price: "800.00",
      costPrice: "500.00",
        weight: "0.75",
        dimensions: "8x8x30",
        minStockLevel: 30,
        maxStockLevel: 300,
        reorderPoint: 60,
        isActive: true
      },
      {
        name: "Vinho Branco Calulo",
        description: "Vinho branco angolano",
        categoryId: categoryMap["Vinhos"].id,
        supplierId: supplierMap["Vinhos Africanos Lda"].id,
        sku: "VIN-CAL-B",
        barcode: "7891234567900",
        price: "750.00",
      costPrice: "450.00",
        weight: "0.75",
        dimensions: "8x8x30",
        minStockLevel: 25,
        maxStockLevel: 250,
        reorderPoint: 50,
        isActive: true
      },
      
      // Sumos
      {
        name: "Sumo de Manga Tropical",
        description: "Sumo natural de manga",
        categoryId: categoryMap["Sumos Naturais"].id,
        supplierId: supplierMap["Sumos Tropicais"].id,
        sku: "SUM-MAN",
        barcode: "7891234567901",
        price: "180.00",
      costPrice: "120.00",
        weight: "1.0",
        dimensions: "8x8x25",
        minStockLevel: 100,
        maxStockLevel: 1000,
        reorderPoint: 200,
        isActive: true
      },
      {
        name: "Sumo de Laranja Tropical",
        description: "Sumo natural de laranja",
        categoryId: categoryMap["Sumos Naturais"].id,
        supplierId: supplierMap["Sumos Tropicais"].id,
        sku: "SUM-LAR",
        barcode: "7891234567902",
        price: "170.00",
      costPrice: "110.00",
        weight: "1.0",
        dimensions: "8x8x25",
        minStockLevel: 80,
        maxStockLevel: 800,
        reorderPoint: 160,
        isActive: true
      },
      
      // Energéticos
      {
        name: "Red Bull 250ml",
        description: "Bebida energética",
        categoryId: categoryMap["Energéticos"].id,
        supplierId: supplierMap["Refriango - Refrigerantes de Angola"].id,
        sku: "RDB-250",
        barcode: "7891234567903",
        price: "400.00",
      costPrice: "280.00",
        weight: "0.25",
        dimensions: "5x5x15",
        minStockLevel: 50,
        maxStockLevel: 500,
        reorderPoint: 100,
        isActive: true
      },
      {
        name: "Monster Energy 500ml",
        description: "Bebida energética",
        categoryId: categoryMap["Energéticos"].id,
        supplierId: supplierMap["Refriango - Refrigerantes de Angola"].id,
        sku: "MON-500",
        barcode: "7891234567904",
        price: "500.00",
      costPrice: "350.00",
        weight: "0.5",
        dimensions: "6x6x18",
        minStockLevel: 40,
        maxStockLevel: 400,
        reorderPoint: 80,
        isActive: true
      },
      
      // Destilados
      {
        name: "Whisky Black Label",
        description: "Whisky escocês premium",
        categoryId: categoryMap["Destilados"].id,
        supplierId: supplierMap["Destilaria Nacional"].id,
        sku: "WHI-BL",
        barcode: "7891234567905",
        price: "3500.00",
      costPrice: "2500.00",
        weight: "0.7",
        dimensions: "8x8x32",
        minStockLevel: 10,
        maxStockLevel: 100,
        reorderPoint: 20,
        isActive: true
      },
      {
        name: "Vodka Smirnoff",
        description: "Vodka premium",
        categoryId: categoryMap["Destilados"].id,
        supplierId: supplierMap["Destilaria Nacional"].id,
        sku: "VOD-SM",
        barcode: "7891234567906",
        price: "2800.00",
      costPrice: "2000.00",
        weight: "0.7",
        dimensions: "8x8x32",
        minStockLevel: 15,
        maxStockLevel: 150,
        reorderPoint: 30,
        isActive: true
      }
    ];
    
    await db.insert(products).values(productsData);
     const insertedProducts = await db.select().from(products).orderBy(products.name);

     // 10. CUSTOMERS - Clientes (distribuidores, bares, restaurantes)
     console.log("🏪 Criando clientes...");
     const customersData = [
       // Distribuidores
        {
          customerNumber: "DIST-001",
          name: "Distribuidora Luanda Sul",
          email: "vendas@luandasul.ao",
          phone: "+244 923 456 789",
          address: "Rua Amílcar Cabral, 123, Luanda",
          city: "Luanda",
          province: "Luanda",
          postalCode: "1000",
          country: "Angola",
          customerType: "distribuidor",
          taxNumber: "5417123456",
          creditLimit: "500000.00",
          paymentTerms: "30 dias",
          isActive: true
        },
       {
          customerNumber: "DIST-002",
          name: "Distribuidora Benguela Norte",
          email: "comercial@benguelanorte.ao",
          phone: "+244 924 567 890",
          address: "Avenida Norton de Matos, 456, Benguela",
          city: "Benguela",
          province: "Benguela",
          postalCode: "2000",
          country: "Angola",
          customerType: "distribuidor",
          taxNumber: "5417234567",
          creditLimit: "300000.00",
          paymentTerms: "30 dias",
          isActive: true
        },
       {
          customerNumber: "DIST-003",
          name: "Distribuidora Huambo Central",
          email: "geral@huambocentral.ao",
          phone: "+244 925 678 901",
          address: "Rua José Eduardo dos Santos, 789, Huambo",
          city: "Huambo",
          province: "Huambo",
          postalCode: "3000",
          country: "Angola",
          customerType: "distribuidor",
          taxNumber: "5417345678",
          creditLimit: "250000.00",
          paymentTerms: "30 dias",
          isActive: true
        },
       
       // Restaurantes
       {
         customerNumber: "REST-001",
         name: "Restaurante Ilha do Cabo",
         email: "reservas@ilhadocabo.ao",
         phone: "+244 926 789 012",
         address: "Ilha do Mussulo, Luanda",
         city: "Luanda",
         province: "Luanda",
         postalCode: "1001",
         country: "Angola",
         customerType: "restaurante",
         taxNumber: "5417456789",
         creditLimit: "50000.00",
         paymentTerms: "15 dias",
         isActive: true
       },
       {
         customerNumber: "REST-002",
         name: "Restaurante Fortaleza",
         email: "info@fortaleza.ao",
         phone: "+244 927 890 123",
         address: "Fortaleza de São Miguel, Luanda",
         city: "Luanda",
         province: "Luanda",
         postalCode: "1002",
         country: "Angola",
         customerType: "restaurante",
         taxNumber: "5417567890",
         creditLimit: "40000.00",
         paymentTerms: "15 dias",
         isActive: true
       },
       {
         customerNumber: "REST-003",
         name: "Restaurante Marginal",
         email: "contato@marginal.ao",
         phone: "+244 928 901 234",
         address: "Marginal de Luanda, 234, Luanda",
         city: "Luanda",
         province: "Luanda",
         postalCode: "1003",
         country: "Angola",
         customerType: "restaurante",
         taxNumber: "5417678901",
         creditLimit: "35000.00",
         paymentTerms: "15 dias",
         isActive: true
       },
       
       // Bares e Discotecas
       {
         customerNumber: "BAR-001",
         name: "Bar Tamariz",
         email: "eventos@tamariz.ao",
         phone: "+244 929 012 345",
         address: "Talatona, Luanda",
         city: "Luanda",
         province: "Luanda",
         postalCode: "1004",
         country: "Angola",
         customerType: "bar",
         taxNumber: "5417789012",
         creditLimit: "30000.00",
         paymentTerms: "7 dias",
         isActive: true
       },
       {
         customerNumber: "BAR-002",
         name: "Discoteca Miami Beach",
         email: "reservas@miamibeach.ao",
         phone: "+244 930 123 456",
         address: "Rua Rainha Ginga, 567, Luanda",
         city: "Luanda",
         province: "Luanda",
         postalCode: "1005",
         country: "Angola",
         customerType: "bar",
         taxNumber: "5417890123",
         creditLimit: "45000.00",
         paymentTerms: "7 dias",
         isActive: true
       },
       
       // Hotéis
       {
         customerNumber: "HOT-001",
         name: "Hotel Presidente",
         email: "compras@hotelpresidente.ao",
         phone: "+244 931 234 567",
         address: "Largo 17 de Setembro, Luanda",
         city: "Luanda",
         province: "Luanda",
         postalCode: "1006",
         country: "Angola",
         customerType: "hotel",
         taxNumber: "5417901234",
         creditLimit: "80000.00",
         paymentTerms: "30 dias",
         isActive: true
       },
       {
         customerNumber: "HOT-002",
         name: "Hotel Tropico",
         email: "f&b@tropico.ao",
         phone: "+244 932 345 678",
         address: "Rua Garcia Neto, 890, Luanda",
         city: "Luanda",
         province: "Luanda",
         postalCode: "1007",
         country: "Angola",
         customerType: "hotel",
         taxNumber: "5418012345",
         creditLimit: "60000.00",
         paymentTerms: "30 dias",
         isActive: true
       },
       
       // Supermercados
       {
         customerNumber: "SUP-001",
         name: "Supermercado Kero",
         email: "compras@kero.ao",
         phone: "+244 933 456 789",
         address: "Avenida 4 de Fevereiro, 123, Luanda",
         city: "Luanda",
         province: "Luanda",
         postalCode: "1008",
         country: "Angola",
         customerType: "supermercado",
         taxNumber: "5418123456",
         creditLimit: "100000.00",
         paymentTerms: "30 dias",
         isActive: true
       },
       {
         customerNumber: "SUP-002",
         name: "Supermercado Candando",
         email: "comercial@candando.ao",
         phone: "+244 934 567 890",
         address: "Rua Comandante Che Guevara, 456, Luanda",
         city: "Luanda",
         province: "Luanda",
         postalCode: "1009",
         country: "Angola",
         customerType: "supermercado",
         taxNumber: "5418234567",
         creditLimit: "120000.00",
         paymentTerms: "30 dias",
         isActive: true
       }
     ];
     
     await db.insert(customers).values(customersData);
     const insertedCustomers = await db.select().from(customers).orderBy(customers.name);

     // 10. CARRIERS - Criar transportadoras
     console.log('🚚 Criando transportadoras...');
     const carriersData = [
       {
         name: "Transportes Internos SGST",
         code: "SGST-INT",
         type: "internal",
         email: "frota@sgst.ao",
         phone: "+244 222 123 456",
         address: "Zona Industrial de Viana, Luanda, Angola",
         contactPerson: "Carlos Silva",
         taxId: "5418000001",
         isActive: true,
         notes: "Frota própria da empresa"
       },
       {
         name: "Transportes Rápidos Angola",
         code: "TRA-EXT",
         type: "external",
         email: "comercial@transportesrapidos.ao",
         phone: "+244 222 234 567",
         address: "Rua da Independência, 123, Luanda, Angola",
         contactPerson: "Maria Santos",
         taxId: "5418000002",
         isActive: true,
         notes: "Parceiro logístico para rotas especiais"
       }
     ];
     
     await db.insert(carriers).values(carriersData);
     const insertedCarriers = await db.select().from(carriers).orderBy(carriers.name);
     
     // Mapear transportadoras por código
     const carrierMap = insertedCarriers.reduce((acc, carrier) => {
       acc[carrier.code] = carrier;
       return acc;
     }, {} as Record<string, any>);

     // 11. VEHICLES - Criar veículos para distribuição
     console.log('🚛 Criando veículos para distribuição...');
     const vehiclesData = [
       // Camiões para distribuição de longa distância
       {
         licensePlate: "LD-12-34-AB",
         make: "Mercedes-Benz",
         model: "Atego 1725",
         year: 2020,
         vin: "WDB9700451L123456",
         type: "truck",
         capacity: "7500.00", // 7.5 toneladas
         fuelType: "diesel",
         status: "available",
         carrierId: carrierMap["SGST-INT"].id,
         driverId: null,
         currentLocation: JSON.stringify({
           lat: -8.8390,
           lng: 13.2894,
           address: "Armazém Central Luanda"
         }),
         isActive: true
       },
       {
         licensePlate: "LD-56-78-CD",
         make: "Iveco",
         model: "Daily 70C17",
         year: 2019,
         vin: "ZCFC7700005123789",
         type: "truck",
         capacity: "6000.00", // 6 toneladas
         fuelType: "diesel",
         status: "available",
         carrierId: carrierMap["SGST-INT"].id,
         driverId: null,
         currentLocation: JSON.stringify({
           lat: -12.5844,
           lng: 13.5906,
           address: "Armazém Regional Benguela"
         }),
         isActive: true
       },
       {
         licensePlate: "HB-90-12-EF",
         make: "Mitsubishi",
         model: "Canter 7C15",
         year: 2021,
         vin: "JMFXDAU60NP123456",
         type: "truck",
         capacity: "5000.00", // 5 toneladas
         fuelType: "diesel",
         status: "available",
         carrierId: carrierMap["SGST-INT"].id,
         driverId: null,
         currentLocation: JSON.stringify({
           lat: -12.7761,
           lng: 15.7394,
           address: "Armazém Regional Huambo"
         }),
         isActive: true
       },
       
       // Carrinhas para distribuição urbana
       {
         licensePlate: "LD-34-56-GH",
         make: "Ford",
         model: "Transit 350L",
         year: 2020,
         vin: "WF0XXXTTGXKW123456",
         type: "van",
         capacity: "2000.00", // 2 toneladas
         fuelType: "diesel",
         status: "available",
         carrierId: carrierMap["SGST-INT"].id,
         driverId: null,
         currentLocation: JSON.stringify({
           lat: -8.8390,
           lng: 13.2894,
           address: "Armazém Local Luanda Sul"
         }),
         isActive: true
       },
       {
         licensePlate: "LD-78-90-IJ",
         make: "Volkswagen",
         model: "Crafter 35",
         year: 2019,
         vin: "WV1ZZZZZKXHX123456",
         type: "van",
         capacity: "1800.00", // 1.8 toneladas
         fuelType: "diesel",
         status: "available",
         carrierId: carrierMap["SGST-INT"].id,
         driverId: null,
         currentLocation: JSON.stringify({
           lat: -8.8390,
           lng: 13.2894,
           address: "Armazém Local Luanda Norte"
         }),
         isActive: true
       },
       
       // Carros para supervisão e vendas
       {
         licensePlate: "LD-12-90-KL",
         make: "Toyota",
         model: "Hilux 2.8D",
         year: 2021,
         vin: "AHTEB52G9N0123456",
         type: "car",
         capacity: "1000.00", // 1 tonelada
         fuelType: "diesel",
         status: "available",
         carrierId: carrierMap["SGST-INT"].id,
         driverId: null,
         currentLocation: JSON.stringify({
           lat: -8.8390,
           lng: 13.2894,
           address: "Sede da Empresa - Luanda"
         }),
         isActive: true
       },
       {
         licensePlate: "LD-34-12-MN",
         make: "Nissan",
         model: "Navara 2.3D",
         year: 2020,
         vin: "JN1TBNT26Z0123456",
         type: "car",
         capacity: "1000.00", // 1 tonelada
         fuelType: "diesel",
         status: "available",
         carrierId: carrierMap["SGST-INT"].id,
         driverId: null,
         currentLocation: JSON.stringify({
           lat: -8.8390,
           lng: 13.2894,
           address: "Sede da Empresa - Luanda"
         }),
         isActive: true
       }
     ];
     
     await db.insert(vehicles).values(vehiclesData);
     const insertedVehicles = await db.select().from(vehicles).orderBy(vehicles.licensePlate);
 
     // 11. INVENTORY - Criar inventário para os produtos nos armazéns
     console.log('📦 Criando inventário...');
     
     const inventoryData = [];
     
     // Para cada produto, criar inventário em cada armazém com quantidades realistas
     for (const product of insertedProducts) {
       for (const warehouse of insertedWarehouses) {
         let quantity = 0;
         
         // Definir quantidades baseadas no tipo de armazém e produto
         if (warehouse.type === 'central') {
           // Armazém central tem mais stock
           quantity = Math.floor(Math.random() * 500) + 200; // 200-700 unidades
         } else if (warehouse.type === 'regional') {
           // Armazém regional tem stock médio
           quantity = Math.floor(Math.random() * 300) + 100; // 100-400 unidades
         } else {
           // Armazém local tem menos stock
           quantity = Math.floor(Math.random() * 150) + 50; // 50-200 unidades
         }
         
         // Alguns produtos podem ter stock baixo ou zero para simular realidade
         if (Math.random() < 0.1) {
           quantity = Math.floor(Math.random() * 20); // 0-20 unidades (stock baixo)
         }
         
         inventoryData.push({
           productId: product.id,
           warehouseId: warehouse.id,
           quantity,
           reservedQuantity: Math.floor(quantity * 0.1), // 10% reservado
         });
       }
     }
     
     await db.insert(inventory).values(inventoryData);
      const insertedInventory = await db.select().from(inventory);
      
      // Criar movimentos de stock iniciais
      console.log('📈 Criando movimentos de stock iniciais...');
      
      const stockMovementsData = [];
      const adminUser = insertedUsers.find(u => u.role === 'admin');
      
      // Para cada produto, criar alguns movimentos históricos
      for (const product of insertedProducts) {
        for (const warehouse of insertedWarehouses) {
          // Movimento de entrada inicial (recebimento)
          stockMovementsData.push({
            productId: product.id,
            warehouseId: warehouse.id,
            type: 'in',
            quantity: Math.floor(Math.random() * 200) + 100, // 100-300 unidades
            reference: `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            reason: 'Recebimento inicial de stock',
            userId: adminUser?.id,
          });
          
          // Alguns movimentos de saída (vendas)
          if (Math.random() > 0.3) {
            stockMovementsData.push({
              productId: product.id,
              warehouseId: warehouse.id,
              type: 'out',
              quantity: Math.floor(Math.random() * 50) + 10, // 10-60 unidades
              reference: `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              reason: 'Venda para cliente',
              userId: adminUser?.id,
            });
          }
          
          // Alguns ajustes de inventário
          if (Math.random() > 0.8) {
            stockMovementsData.push({
              productId: product.id,
              warehouseId: warehouse.id,
              type: 'adjustment',
              quantity: Math.floor(Math.random() * 20) - 10, // -10 a +10 unidades
              reference: `ADJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              reason: 'Ajuste de inventário após contagem',
              userId: adminUser?.id,
            });
          }
        }
      }
      
      await db.insert(stockMovements).values(stockMovementsData);
      const insertedStockMovements = await db.select().from(stockMovements);
      
      // Criar pedidos (orders) e itens de pedidos
      console.log('📋 Criando pedidos de venda e compra...');
      
      const ordersData = [];
      const orderItemsData = [];
      const salesUser = insertedUsers.find(u => u.role === 'sales');
      const purchaseUser = insertedUsers.find(u => u.role === 'purchase');
      
      // Criar pedidos de venda
      for (let i = 0; i < 8; i++) {
        const customer = insertedCustomers[Math.floor(Math.random() * insertedCustomers.length)];
        const orderNumber = `SALE-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`;
        
        const order = {
          orderNumber,
          type: 'sale',
          status: ['pending', 'confirmed', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 5)],
          customerId: customer.id,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          customerAddress: customer.address,
          totalAmount: '0', // Será calculado depois
          notes: `Pedido de venda para ${customer.name}`,
          userId: salesUser?.id,
        };
        
        ordersData.push(order);
      }
      
      // Criar pedidos de compra
      for (let i = 0; i < 5; i++) {
        const supplier = insertedSuppliers[Math.floor(Math.random() * insertedSuppliers.length)];
        const orderNumber = `PURCH-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`;
        
        const order = {
          orderNumber,
          type: 'purchase',
          status: ['pending', 'confirmed', 'received', 'completed'][Math.floor(Math.random() * 4)],
          supplierId: supplier.id,
          totalAmount: '0', // Será calculado depois
          notes: `Pedido de compra para ${supplier.name}`,
          userId: purchaseUser?.id,
        };
        
        ordersData.push(order);
      }
      
      await db.insert(orders).values(ordersData);
      const insertedOrders = await db.select().from(orders);
      
      // Criar itens para cada pedido
      for (const order of insertedOrders) {
        const numItems = Math.floor(Math.random() * 5) + 2; // 2-6 itens por pedido
        let orderTotal = 0;
        
        for (let i = 0; i < numItems; i++) {
          const product = insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
          const quantity = Math.floor(Math.random() * 50) + 10; // 10-60 unidades
          const unitPrice = parseFloat(product.price);
          const totalPrice = quantity * unitPrice;
          
          orderItemsData.push({
            orderId: order.id,
            productId: product.id,
            quantity,
            unitPrice: unitPrice.toString(),
            totalPrice: totalPrice.toString(),
          });
          
          orderTotal += totalPrice;
        }
        
        // Atualizar o total do pedido
        await db.update(orders)
          .set({ totalAmount: orderTotal.toString() })
          .where(eq(orders.id, order.id));
      }
      
      await db.insert(orderItems).values(orderItemsData);
      const insertedOrderItems = await db.select().from(orderItems);
      
      // Criar listas de picking
      console.log('📦 Criando listas de picking...');
      
      const pickingListsData = [];
      const pickingListItemsData = [];
      const warehouseUser = insertedUsers.find(u => u.role === 'warehouse');
      
      // Criar listas de picking para pedidos confirmados
      const confirmedOrders = insertedOrders.filter(o => o.status === 'confirmed' || o.status === 'processing');
      
      for (let i = 0; i < Math.min(5, confirmedOrders.length); i++) {
        const order = confirmedOrders[i];
        const warehouse = insertedWarehouses[Math.floor(Math.random() * insertedWarehouses.length)];
        
        const pickingList = {
          pickNumber: `PICK-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
          orderId: order.id,
          warehouseId: warehouse.id,
          status: ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)],
          assignedTo: warehouseUser?.id,
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          notes: `Lista de picking para pedido ${order.orderNumber}`,
        };
        
        pickingListsData.push(pickingList);
      }
      
      await db.insert(pickingLists).values(pickingListsData);
      const insertedPickingLists = await db.select().from(pickingLists);
      
      // Criar itens para cada lista de picking
      for (const pickingList of insertedPickingLists) {
        const orderItems = insertedOrderItems.filter(item => item.orderId === pickingList.orderId);
        
        for (const orderItem of orderItems) {
          const product = insertedProducts.find(p => p.id === orderItem.productId);
          const location = `A${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 5) + 1}`;
          
          pickingListItemsData.push({
            pickingListId: pickingList.id,
            productId: orderItem.productId,
            quantityToPick: orderItem.quantity,
            quantityPicked: pickingList.status === 'completed' ? orderItem.quantity : 0,
            location,
            status: pickingList.status === 'completed' ? 'picked' : 'pending',
            notes: `Produto: ${product?.name}`,
          });
        }
      }
      
      await db.insert(pickingListItems).values(pickingListItemsData);
      const insertedPickingListItems = await db.select().from(pickingListItems);
      
      // Criar shipments (envios)
      console.log('🚚 Criando envios e tracking...');
      
      const shipmentsData = [];
      const logisticsUser = insertedUsers.find(u => u.role === 'logistics');
      
      // Criar envios para pedidos processados
      const processedOrders = insertedOrders.filter(o => o.status === 'processing' || o.status === 'shipped');
      
      for (let i = 0; i < Math.min(6, processedOrders.length); i++) {
        const order = processedOrders[i];
        const vehicle = insertedVehicles[Math.floor(Math.random() * insertedVehicles.length)];
        const warehouse = insertedWarehouses[Math.floor(Math.random() * insertedWarehouses.length)];
        
        const shipment = {
          shipmentNumber: `SHIP-${new Date().getFullYear()}-${String(i + 1).padStart(6, '0')}`,
          trackingNumber: `TRACK-${new Date().getFullYear()}-${String(i + 1).padStart(6, '0')}`,
          orderId: order.id,
          vehicleId: vehicle.id,
          status: ['preparing', 'in_transit', 'delivered', 'returned'][Math.floor(Math.random() * 4)],
          estimatedDelivery: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // 0-7 dias
          actualDelivery: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) : null,
          userId: logisticsUser?.id,
        };
        
        shipmentsData.push(shipment);
      }
      
      await db.insert(shipments).values(shipmentsData);
      const insertedShipments = await db.select().from(shipments);
      
      // Criar localizações de produtos nos armazéns
      console.log('📍 Criando localizações de produtos...');
      
      const productLocationsData = [];
      
      for (const warehouse of insertedWarehouses) {
        for (const product of insertedProducts) {
          // Nem todos os produtos estão em todos os armazéns
          if (Math.random() > 0.3) {
            const location = `${warehouse.name}-A${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 5) + 1}`;
            
            productLocationsData.push({
              productId: product.id,
              warehouseId: warehouse.id,
              zone: `Zona ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`, // A-E
              aisle: `Corredor ${Math.floor(Math.random() * 10) + 1}`,
              shelf: `Prateleira ${Math.floor(Math.random() * 20) + 1}`,
              bin: `Compartimento ${Math.floor(Math.random() * 5) + 1}`,
              location,
              isActive: true,
            });
          }
        }
      }
      
      await db.insert(productLocations).values(productLocationsData);
      const insertedProductLocations = await db.select().from(productLocations);
      
      // Criar scans de código de barras
      console.log('📱 Criando scans de código de barras...');
      
      const barcodeScansData = [];
      
      for (let i = 0; i < 25; i++) {
        const product = insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
        const user = insertedUsers[Math.floor(Math.random() * insertedUsers.length)];
        const warehouse = insertedWarehouses[Math.floor(Math.random() * insertedWarehouses.length)];
        
        // Só criar scan se o produto tiver barcode
        if (product.barcode) {
          barcodeScansData.push({
            scannedCode: product.barcode,
            scanType: ['barcode', 'qr', 'rfid'][Math.floor(Math.random() * 3)],
            scanPurpose: ['inventory', 'picking', 'receiving', 'shipping'][Math.floor(Math.random() * 4)],
            productId: product.id,
            userId: user.id,
            warehouseId: warehouse.id,
            metadata: { device: 'Scanner-001', session: `scan_${i}`, quantity: Math.floor(Math.random() * 20) + 1, location: `${warehouse.name}-A${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 20) + 1}` },
          });
        }
      }
      
      await db.insert(barcodeScans).values(barcodeScansData);
      const insertedBarcodeScans = await db.select().from(barcodeScans);
      
      // Criar dados de GPS tracking
      console.log('🛰️ Criando dados de GPS tracking...');
      
      const gpsTrackingData = [];
      
      for (const vehicle of insertedVehicles) {
        // Criar 5-10 pontos de tracking por veículo
        const numPoints = Math.floor(Math.random() * 6) + 5;
        
        for (let i = 0; i < numPoints; i++) {
          // Coordenadas aproximadas de Luanda, Angola
          const baseLat = -8.8383;
          const baseLng = 13.2344;
          const latOffset = (Math.random() - 0.5) * 0.2; // ±0.1 graus
          const lngOffset = (Math.random() - 0.5) * 0.2;
          
          gpsTrackingData.push({
            vehicleId: vehicle.id,
            latitude: (baseLat + latOffset).toString(),
            longitude: (baseLng + lngOffset).toString(),
            speed: (Math.floor(Math.random() * 80) + 10).toString(), // 10-90 km/h
            heading: Math.floor(Math.random() * 360).toString(),
            altitude: (Math.floor(Math.random() * 100) + 50).toString(), // 50-150m
            accuracy: (Math.floor(Math.random() * 10) + 1).toString(), // 1-10m
            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // últimas 24h
            metadata: JSON.stringify({ 
              engine: Math.random() > 0.5 ? 'on' : 'off',
              fuel: Math.floor(Math.random() * 100),
              temperature: Math.floor(Math.random() * 40) + 15
            }),
          });
        }
      }
      
      await db.insert(gpsTracking).values(gpsTrackingData);
      const insertedGpsTracking = await db.select().from(gpsTracking);

      console.log("✅ Seed da base de dados concluído com sucesso!");
      console.log(`📊 Resumo dos dados criados:`);
      console.log(`   • ${insertedPermissions.length} permissões`);
      console.log(`   • ${insertedRoles.length} perfis`);
      console.log(`   • ${insertedUsers.length} utilizadores`);
      console.log(`   • ${insertedCategories.length} categorias`);
      console.log(`   • ${insertedSuppliers.length} fornecedores`);
      console.log(`   • ${insertedWarehouses.length} armazéns`);
      console.log(`   • ${insertedProducts.length} produtos`);
      console.log(`   • ${insertedCustomers.length} clientes`);
      console.log(`   • ${insertedVehicles.length} veículos`);
      console.log(`   • ${insertedInventory.length} registos de inventário`);
      console.log(`   • ${insertedStockMovements.length} movimentos de stock`);
      console.log(`   • ${insertedOrders.length} pedidos`);
      console.log(`   • ${insertedOrderItems.length} itens de pedidos`);
      console.log(`   • ${insertedPickingLists.length} listas de picking`);
      console.log(`   • ${insertedPickingListItems.length} itens de picking`);
      console.log(`   • ${insertedShipments.length} envios`);
      console.log(`   • ${insertedProductLocations.length} localizações de produtos`);
      console.log(`   • ${insertedBarcodeScans.length} scans de código de barras`);
      console.log(`   • ${insertedGpsTracking.length} pontos de GPS tracking`);
      console.log(`   - ${insertedUsers.length} utilizadores`);
      console.log(`   - ${insertedCategories.length} categorias`);
      console.log(`   - ${insertedSuppliers.length} fornecedores`);
      console.log(`   - ${insertedWarehouses.length} armazéns`);
      console.log(`   - ${insertedProducts.length} produtos`);
      console.log(`   - ${insertedCustomers.length} clientes`);
      console.log(`   - ${insertedVehicles.length} veículos`);
      console.log(`   - ${insertedInventory.length} registos de inventário`);
       console.log(`   - ${insertedStockMovements.length} movimentos de stock`);
    
  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    throw error;
  }
}

// Executar seed se chamado diretamente
if (require.main === module) {
  seed()
    .then(() => {
      console.log("🎉 Seed executado com sucesso!");
      process.exit(0);
    })
    .catch((error: any) => {
      console.error("💥 Erro no seed:", error);
      process.exit(1);
    });
}

export { seed };