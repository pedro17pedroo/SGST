import { db } from '../../../database/db';
import { type PickingList, type InsertPickingList, type PickingListItem, type InsertPickingListItem } from '../../../../shared/schema';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export class PickingPackingModel {
  static async getPickingLists(filters?: {
    warehouseId?: string;
    status?: string;
    assignedToUserId?: string;
  }): Promise<Array<PickingList & { items?: PickingListItem[] }>> {
    try {
      // Construir query SQL com filtros
      let whereClause = '';
      const conditions = [];
      
      if (filters?.warehouseId) {
        conditions.push(`warehouse_id = '${filters.warehouseId}'`);
      }
      if (filters?.status) {
        conditions.push(`status = '${filters.status}'`);
      }
      if (filters?.assignedToUserId) {
        conditions.push(`assigned_to = '${filters.assignedToUserId}'`);
      }
      
      if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(' AND ')}`;
      }
      
      const query = `
        SELECT pl.id, pl.pick_number, pl.order_id, pl.warehouse_id, pl.status, pl.priority, pl.assigned_to, 
               pl.type, pl.scheduled_date, pl.started_at, pl.completed_at, pl.estimated_time, pl.actual_time, 
               pl.notes, pl.user_id, pl.created_at,
               o.order_number, w.name as warehouse_name
        FROM picking_lists pl
        LEFT JOIN orders o ON pl.order_id = o.id
        LEFT JOIN warehouses w ON pl.warehouse_id = w.id
        ${whereClause}
        ORDER BY pl.created_at DESC
      `;
      
      const result = await db.execute(sql.raw(query));
      
      // Mapear resultados para o formato correto
      const pickingLists = (result[0] as any).map((row: any) => ({
        id: row.id,
        pickNumber: row.pick_number,
        orderId: row.order_id,
        orderNumber: row.order_number,
        warehouseId: row.warehouse_id,
        warehouse: {
          id: row.warehouse_id,
          name: row.warehouse_name
        },
        status: row.status,
        priority: row.priority,
        assignedTo: row.assigned_to,
        type: row.type,
        scheduledDate: row.scheduled_date,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        estimatedTime: row.estimated_time,
        actualTime: row.actual_time,
        notes: row.notes,
        userId: row.user_id,
        createdAt: row.created_at
      }));
      
      // Para cada picking list, buscar os itens
      const listsWithItems = await Promise.all(
        pickingLists.map(async (list: PickingList) => {
          const itemsQuery = `
            SELECT id, picking_list_id, product_id, location_id, quantity_to_pick, 
                   quantity_picked, status, picked_by, picked_at, notes, substituted_with
            FROM picking_list_items 
            WHERE picking_list_id = '${list.id}'
          `;
          
          const itemsResult = await db.execute(sql.raw(itemsQuery));
          const items = (itemsResult[0] as any).map((row: any) => ({
            id: row.id,
            pickingListId: row.picking_list_id,
            productId: row.product_id,
            locationId: row.location_id,
            quantityToPick: row.quantity_to_pick,
            quantityPicked: row.quantity_picked,
            status: row.status,
            pickedBy: row.picked_by,
            pickedAt: row.picked_at,
            notes: row.notes,
            substitutedWith: row.substituted_with
          }));
          
          return {
            ...list,
            items
          };
        })
      );
      
      return listsWithItems;
    } catch (error) {
      console.error('Erro ao buscar picking lists:', error);
      throw new Error('Erro ao buscar picking lists');
    }
  }

  static async getPickingListById(id: string) {
    // Implementação temporária
    return {
      id,
      orderNumbers: [`ORDER-${Date.now()}`],
      warehouseId: 'warehouse-1',
      status: 'pending',
      priority: 'normal',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  static async createPickingList(data: InsertPickingList & { items?: Array<{ productId: string; quantityToPick: number; locationId?: string }>; orderNumbers?: string[] }): Promise<PickingList> {
    try {
      const id = randomUUID();
      const pickNumber = `PICK-${Date.now()}`;
      
      // Se orderNumbers foi fornecido, buscar o orderId baseado no primeiro orderNumber
      let orderId = data.orderId;
      if (data.orderNumbers && data.orderNumbers.length > 0) {
        const orderQuery = `SELECT id FROM orders WHERE order_number = '${data.orderNumbers[0]}' LIMIT 1`;
        const orderResult = await db.execute(sql.raw(orderQuery));
        if (orderResult[0] && (orderResult[0] as any).length > 0) {
          orderId = (orderResult[0] as any)[0].id;
          console.log('Order encontrada:', { orderNumber: data.orderNumbers[0], orderId });
        } else {
          console.log('Order não encontrada para orderNumber:', data.orderNumbers[0]);
        }
      }
      
      const insertQuery = `
        INSERT INTO picking_lists (
          id, pick_number, order_id, warehouse_id, status, priority, assigned_to, 
          type, scheduled_date, estimated_time, notes, user_id, created_at
        ) VALUES (
          '${id}', '${pickNumber}', ${orderId ? `'${orderId}'` : 'NULL'}, 
          '${data.warehouseId}', '${data.status || 'pending'}', '${data.priority || 'normal'}', 
          ${data.assignedTo ? `'${data.assignedTo}'` : 'NULL'}, '${data.type || 'individual'}', 
          ${data.scheduledDate ? `'${data.scheduledDate.toISOString()}'` : 'NULL'}, 
          ${data.estimatedTime || 'NULL'}, ${data.notes ? `'${data.notes}'` : 'NULL'}, 
          '${data.userId}', NOW()
        )
      `;
      
      console.log('Query de inserção da picking list:', insertQuery);
      await db.execute(sql.raw(insertQuery));
      
      // Criar itens da picking list se fornecidos
      console.log('🔍 VERIFICANDO ITENS PARA CRIAÇÃO:');
      console.log('  - data.items existe?', !!data.items);
      console.log('  - data.items:', data.items);
      console.log('  - data.items.length:', data.items ? data.items.length : 'N/A');
      console.log('  - Condição (data.items && data.items.length > 0):', data.items && data.items.length > 0);
      
      if (data.items && data.items.length > 0) {
        console.log('✅ CONDIÇÃO ATENDIDA - Chamando createPickingListItems');
        console.log('  - pickingListId:', id);
        console.log('  - items:', JSON.stringify(data.items, null, 2));
        
        try {
          await this.createPickingListItems(id, data.items);
          console.log('✅ createPickingListItems executado com sucesso');
        } catch (error) {
          console.error('❌ ERRO em createPickingListItems:', error);
          throw error;
        }
      } else {
        console.log('❌ CONDIÇÃO NÃO ATENDIDA - Nenhum item fornecido para criação');
        console.log('  - Motivo: items não existe ou está vazio');
      }
      
      // Buscar o registro criado
      const selectQuery = `
        SELECT id, pick_number, order_id, warehouse_id, status, priority, assigned_to, 
               type, scheduled_date, started_at, completed_at, estimated_time, actual_time, 
               notes, user_id, created_at
        FROM picking_lists 
        WHERE id = '${id}'
      `;
      
      const result = await db.execute(sql.raw(selectQuery));
      const row = (result[0] as any)[0];
      
      return {
        id: row.id,
        pickNumber: row.pick_number,
        orderId: row.order_id,
        warehouseId: row.warehouse_id,
        status: row.status,
        priority: row.priority,
        assignedTo: row.assigned_to,
        type: row.type,
        scheduledDate: row.scheduled_date,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        estimatedTime: row.estimated_time,
        actualTime: row.actual_time,
        notes: row.notes,
        userId: row.user_id,
        createdAt: row.created_at
      };
    } catch (error) {
      console.error('Erro ao criar picking list:', error);
      throw new Error('Erro ao criar picking list');
    }
  }

  static async createPickingListItems(pickingListId: string, items: Array<{ productId: string; quantityToPick: number; locationId?: string }>): Promise<void> {
    try {
      console.log('=== createPickingListItems INICIADO ===');
      console.log('pickingListId:', pickingListId);
      console.log('items recebidos:', JSON.stringify(items, null, 2));
      console.log('número de itens:', items.length);
      
      if (!items || items.length === 0) {
        console.log('Nenhum item para inserir');
        return;
      }
      
      const insertPromises = items.map((item, index) => {
        const itemId = randomUUID();
        const insertQuery = `
          INSERT INTO picking_list_items (
            id, picking_list_id, product_id, location_id, quantity_to_pick, 
            quantity_picked, status
          ) VALUES (
            '${itemId}', '${pickingListId}', '${item.productId}', 
            ${item.locationId && item.locationId !== 'no-location' ? `'${item.locationId}'` : 'NULL'}, 
            ${item.quantityToPick}, 0, 'pending'
          )
        `;
        
        console.log(`--- Item ${index + 1} ---`);
        console.log('ID gerado:', itemId);
        console.log('Query:', insertQuery.trim());
        console.log('Valores:', {
          id: itemId,
          picking_list_id: pickingListId,
          product_id: item.productId,
          location_id: item.locationId || null,
          quantity_to_pick: item.quantityToPick
        });
        
        return db.execute(sql.raw(insertQuery)).then(result => {
          console.log(`Item ${index + 1} inserido com sucesso:`, result);
          return result;
        }).catch(error => {
          console.error(`Erro ao inserir item ${index + 1}:`, error);
          throw error;
        });
      });
      
      const results = await Promise.all(insertPromises);
      console.log('=== TODOS OS ITENS INSERIDOS COM SUCESSO ===');
      console.log('Resultados:', results);
    } catch (error) {
      console.error('=== ERRO AO INSERIR ITENS ===');
      console.error('Erro:', error);
      throw new Error('Erro ao criar itens da picking list');
    }
  }

  static async updatePickingList(id: string, data: {
    status?: string;
    assignedToUserId?: string;
    notes?: string;
    priority?: string;
  }) {
    // Implementação temporária
    const updatedList = {
      id,
      ...data,
      updatedAt: new Date()
    };
    console.log('Lista de picking atualizada (mock):', updatedList);
    return updatedList;
  }

  static async deletePickingList(id: string) {
    // Implementação temporária
    console.log('Lista de picking deletada (mock):', id);
    return true;
  }

  static async startPicking(id: string, userId: string) {
    // Implementação temporária
    const result = {
      id,
      userId,
      status: 'in_progress',
      startedAt: new Date()
    };
    console.log('Picking iniciado (mock):', result);
    return result;
  }

  static async completePicking(id: string) {
    // Implementação temporária
    const result = {
      id,
      status: 'completed',
      completedAt: new Date()
    };
    console.log('Picking completado (mock):', result);
    return result;
  }

  static async pickItem(itemId: string, data: {
    quantityPicked: number;
    locationVerified?: boolean;
    barcodeScanned?: boolean;
    notes?: string;
  }) {
    // Implementação temporária
    const result = {
      itemId,
      ...data,
      pickedAt: new Date()
    };
    console.log('Item coletado (mock):', result);
    return result;
  }

  static async verifyPickedItem(itemId: string, data: {
    barcode?: string;
    location?: string;
    verified?: boolean;
    discrepancyReason?: string;
    notes?: string;
  }) {
    // Implementação temporária
    const result = {
      itemId,
      ...data,
      verified: true,
      verifiedAt: new Date()
    };
    console.log('Item verificado (mock):', result);
    return result;
  }

  static async createPickingWave(data: {
    name: string;
    pickingListIds: string[];
    priority?: string;
    assignedToUserId?: string;
  }) {
    // Implementação temporária
    const wave = {
      id: `wave-${Date.now()}`,
      ...data,
      status: 'pending',
      createdAt: new Date()
    };
    console.log('Wave de picking criada (mock):', wave);
    return wave;
  }

  static async getPickingWave(waveId: string) {
    // Implementação temporária
    return {
      id: waveId,
      name: `Wave ${waveId}`,
      status: 'pending',
      pickingListIds: [],
      createdAt: new Date()
    };
  }

  static async assignWaveToUser(waveId: string, userId: string) {
    // Implementação temporária
    const result = {
      waveId,
      userId,
      assignedAt: new Date()
    };
    console.log('Wave atribuída ao usuário (mock):', result);
    return result;
  }

  static async getPackingTasks(filters: { warehouseId?: string; status?: string }) {
    try {
      // Implementação temporária com dados de demonstração
      const mockData = [
        {
          id: 'pt-001',
          pickingListId: 'pl-001',
          packageType: 'Caixa Pequena',
          status: 'pending',
          targetWeight: 2.5,
          actualWeight: null,
          specialInstructions: 'Embalar com cuidado - produtos frágeis',
          warehouseId: filters.warehouseId || 'warehouse-1',
          assignedTo: null,
          startedAt: null,
          completedAt: null,
          createdAt: new Date()
        },
        {
          id: 'pt-002',
          pickingListId: 'pl-002',
          packageType: 'Caixa Média',
          status: 'in_progress',
          targetWeight: 5.0,
          actualWeight: 4.8,
          specialInstructions: 'Produtos eletrônicos - usar material antiestático',
          warehouseId: filters.warehouseId || 'warehouse-1',
          assignedTo: 'user-3',
          startedAt: new Date(),
          completedAt: null,
          createdAt: new Date(Date.now() - 1800000)
        }
      ];

      // Filtrar dados baseado nos filtros fornecidos
      let filteredData = mockData;
      if (filters.warehouseId) {
        filteredData = filteredData.filter(item => item.warehouseId === filters.warehouseId);
      }
      if (filters.status) {
        filteredData = filteredData.filter(item => item.status === filters.status);
      }

      return filteredData;
    } catch (error) {
      console.error('Erro ao buscar tarefas de packing:', error);
      return [];
    }
  }

  static async createPackingTask(data: {
    pickingListId: string;
    packageType: string;
    targetWeight?: number;
    specialInstructions?: string;
  }) {
    // Implementação temporária
    const task = {
      id: `pack-${Date.now()}`,
      ...data,
      status: 'pending',
      createdAt: new Date()
    };
    console.log('Tarefa de embalagem criada (mock):', task);
    return task;
  }

  static async packItems(id: string, data: {
    items: Array<{
      pickingListItemId: string;
      quantityPacked: number;
      packageId?: string;
    }>;
    packageDetails: {
      weight: number;
      dimensions: {
        length: number;
        width: number;
        height: number;
      };
      packageType: string;
    };
  }) {
    // Implementação temporária
    const result = {
      id,
      packageId: `pkg-${Date.now()}`,
      ...data,
      packedAt: new Date()
    };
    console.log('Itens embalados (mock):', result);
    return result;
  }

  static async completePackaging(id: string) {
    // Implementação temporária
    const result = {
      id,
      status: 'completed',
      completedAt: new Date()
    };
    console.log('Embalagem completada (mock):', result);
    return result;
  }

  static async generateShippingLabel(data: {
    packageId: string;
    shippingAddress: {
      name: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
    };
    carrier: string;
    serviceType: string;
  }) {
    // Implementação temporária
    const label = {
      labelId: `lbl-${Date.now()}`,
      trackingNumber: `TRK-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      generatedAt: new Date()
    };
    console.log('Etiqueta de envio gerada (mock):', label);
    return label;
  }

  static async getShippingInfo(id: string) {
    // Implementação temporária
    return {
      id,
      trackingNumber: `TRK-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      carrier: 'Transportadora Exemplo',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    };
  }

  static async startAutomaticPackaging(data: {
    pickingListId: string;
    deviceId: string;
    packageType?: string;
  }) {
    // Implementação temporária
    const result = {
      sessionId: `auto-${Date.now()}`,
      ...data,
      status: 'started',
      startedAt: new Date()
    };
    console.log('Embalagem automática iniciada (mock):', result);
    return result;
  }

  static async recordAutomaticMeasurements(packageId: string, data: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    deviceId: string;
  }) {
    // Implementação temporária
    const result = {
      packageId,
      ...data,
      recordedAt: new Date()
    };
    console.log('Medições automáticas registradas (mock):', result);
    return result;
  }

  static async generateAutomaticShippingLabel(data: {
    packageId: string;
    shippingAddress: {
      name: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
    };
    carrier?: string;
    serviceType?: string;
  }) {
    // Implementação temporária
    const label = {
      labelId: `auto-lbl-${Date.now()}`,
      trackingNumber: `AUTO-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      generatedAt: new Date()
    };
    console.log('Etiqueta automática gerada (mock):', label);
    return label;
  }

  static async calculateFreightCosts(data: {
    packageDetails: {
      weight: number;
      dimensions: {
        length: number;
        width: number;
        height: number;
      };
    };
    origin: string;
    destination: string;
    serviceType?: string;
  }) {
    // Implementação temporária
    return {
      carriers: [
        {
          name: 'Transportadora A',
          cost: 150.00,
          estimatedDays: 3,
          serviceType: data.serviceType || 'standard'
        },
        {
          name: 'Transportadora B',
          cost: 180.00,
          estimatedDays: 2,
          serviceType: 'express'
        }
      ]
    };
  }

  static async getAutomaticPackagingDevices() {
    // Implementação temporária
    return [
      {
        id: 'device-1',
        name: 'Balança Automática 1',
        type: 'scale',
        status: 'online'
      },
      {
        id: 'device-2',
        name: 'Scanner de Dimensões 1',
        type: 'dimension_scanner',
        status: 'online'
      }
    ];
  }

  static async getFreightCarriers(filters: {
    region?: string;
    serviceType?: string;
  }) {
    // Implementação temporária
    return [
      {
        id: 'carrier-1',
        name: 'Transportadora Nacional',
        region: 'nacional',
        serviceTypes: ['standard', 'express']
      },
      {
        id: 'carrier-2',
        name: 'Transportadora Internacional',
        region: 'internacional',
        serviceTypes: ['standard', 'express', 'overnight']
      }
    ];
  }
}