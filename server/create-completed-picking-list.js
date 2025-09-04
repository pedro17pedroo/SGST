import { db } from './database/db.js';
import { pickingLists, pickingListItems } from '../shared/schema.js';
import { nanoid } from 'nanoid';

async function createCompletedPickingList() {
  try {
    console.log('🔄 Criando lista de picking com status completed...');
    
    // Primeiro, vamos buscar um warehouse e um usuário existente
    const warehouses = await db.query.warehouses.findMany({ limit: 1 });
    const users = await db.query.users.findMany({ limit: 1 });
    
    if (warehouses.length === 0) {
      console.log('❌ Nenhum warehouse encontrado');
      return;
    }
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado');
      return;
    }
    
    const warehouse = warehouses[0];
    const user = users[0];
    
    console.log(`📦 Usando warehouse: ${warehouse.name}`);
    console.log(`👤 Usando usuário: ${user.username}`);
    
    // Criar lista de picking com status 'completed'
    const pickingListId = nanoid();
    const pickNumber = `PK-${Date.now()}`;
    const orderNumber = `ORD-${Date.now()}`;
    
    const newPickingList = {
      id: pickingListId,
      pickNumber: pickNumber,
      orderNumber: orderNumber,
      warehouseId: warehouse.id,
      status: 'completed',
      priority: 'normal',
      assignedTo: user.id,
      type: 'individual',
      scheduledDate: new Date(),
      startedAt: new Date(Date.now() - 3600000), // 1 hora atrás
      completedAt: new Date(), // agora
      estimatedTime: 60, // 60 minutos
      actualTime: 55, // 55 minutos
      notes: 'Lista de picking de teste criada automaticamente',
      userId: user.id,
      createdAt: new Date()
    };
    
    // Inserir a lista de picking
    await db.insert(pickingLists).values(newPickingList);
    
    console.log('✅ Lista de picking criada com sucesso!');
    console.log(`📋 ID: ${pickingListId}`);
    console.log(`🔢 Pick Number: ${pickNumber}`);
    console.log(`📦 Order Number: ${orderNumber}`);
    console.log(`📊 Status: completed`);
    
    // Verificar se foi criada corretamente
    const createdList = await db.query.pickingLists.findFirst({
      where: (lists, { eq }) => eq(lists.id, pickingListId),
      with: {
        warehouse: true,
        assignedToUser: true
      }
    });
    
    if (createdList) {
      console.log('✅ Verificação: Lista encontrada na base de dados');
      console.log(`   - Status: ${createdList.status}`);
      console.log(`   - Warehouse: ${createdList.warehouse?.name}`);
      console.log(`   - Assigned to: ${createdList.assignedToUser?.username}`);
    } else {
      console.log('❌ Erro: Lista não encontrada após criação');
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar lista de picking:', error);
  }
}

createCompletedPickingList();