import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../types/auth';
import { z } from 'zod';
import { PickingPackingModel } from './picking-packing.model';

// Validation schemas
const pickingListItemSchema = z.object({
  productId: z.string().min(1, "ID do produto inválido"),
  quantityToPick: z.number().int().min(1, "Quantidade deve ser pelo menos 1"),
  locationId: z.string().optional()
});

const createPickingListSchema = z.object({
  orderNumbers: z.array(z.string()).min(1, "Pelo menos uma encomenda é obrigatória"),
  warehouseId: z.string().uuid("ID do armazém inválido"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  assignedToUserId: z.string().uuid().optional(),
  notes: z.string().optional(),
  pickingType: z.enum(["individual", "batch", "wave"]).default("individual"),
  items: z.array(pickingListItemSchema).min(1, "Pelo menos um item é obrigatório")
});

const updatePickingListSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
  assignedToUserId: z.string().uuid().optional(),
  notes: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional()
});

const pickItemSchema = z.object({
  quantityPicked: z.number().int().min(0, "Quantidade deve ser positiva"),
  locationVerified: z.boolean().default(false),
  barcodeScanned: z.boolean().default(false),
  notes: z.string().optional()
});

const packingTaskSchema = z.object({
  pickingListId: z.string().min(1, "ID da lista de picking é obrigatório"),
  packageType: z.string().min(1, "Tipo de embalagem é obrigatório"),
  targetWeight: z.number().min(0).optional(),
  specialInstructions: z.string().optional()
});

const packItemsSchema = z.object({
  items: z.array(z.object({
    pickingListItemId: z.string().uuid(),
    quantityPacked: z.number().int().min(0),
    packageId: z.string().optional()
  })),
  packageDetails: z.object({
    weight: z.number().min(0),
    dimensions: z.object({
      length: z.number().min(0),
      width: z.number().min(0),
      height: z.number().min(0)
    }),
    packageType: z.string(),
    trackingNumber: z.string().optional(),
    automaticWeighing: z.boolean().default(false),
    scaleDeviceId: z.string().optional(),
    dimensionScanDeviceId: z.string().optional()
  })
});

const automaticPackagingSchema = z.object({
  pickingListId: z.string().min(1, "ID da lista de picking é obrigatório"),
  enableAutoWeighing: z.boolean().default(true),
  enableAutoDimensions: z.boolean().default(true),
  scaleDeviceId: z.string().optional(),
  dimensionScannerDeviceId: z.string().optional(),
  targetCarrier: z.string().optional(),
  packagePreferences: z.object({
    preferredPackageType: z.string().optional(),
    maxWeight: z.number().min(0).optional(),
    fragile: z.boolean().default(false),
    expedited: z.boolean().default(false)
  }).optional()
});

const shippingLabelSchema = z.object({
  packageId: z.string().uuid(),
  carrier: z.string().min(1, "Transportadora é obrigatória"),
  serviceType: z.enum(["standard", "express", "overnight", "economy"]).default("standard"),
  recipientAddress: z.object({
    name: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().optional()
  }),
  senderAddress: z.object({
    name: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().optional()
  }),
  insuranceValue: z.number().min(0).optional(),
  signatureRequired: z.boolean().default(false),
  labelFormat: z.enum(["PDF", "PNG", "ZPL", "EPL"]).default("PDF")
});

const freightCalculationSchema = z.object({
  origin: z.object({
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    postalCode: z.string().min(1)
  }),
  destination: z.object({
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    postalCode: z.string().min(1)
  }),
  packageDetails: z.object({
    weight: z.number().min(0.1),
    dimensions: z.object({
      length: z.number().min(0.1),
      width: z.number().min(0.1),
      height: z.number().min(0.1)
    }),
    declaredValue: z.number().min(0).optional()
  }),
  carriers: z.array(z.string()).optional(),
  serviceTypes: z.array(z.enum(["standard", "express", "overnight", "economy"])).optional()
});

export class PickingPackingController {
  static async getPickingLists(req: AuthenticatedRequest, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const status = req.query.status as string | undefined;
      const assignedToUserId = req.query.assignedToUserId as string | undefined;
      
      const pickingLists = await PickingPackingModel.getPickingLists({
        warehouseId,
        status,
        assignedToUserId
      });
      
      res.json(pickingLists);
    } catch (error) {
      console.error('Error fetching picking lists:', error);
      res.status(500).json({
        message: "Erro ao buscar listas de picking",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPickingList(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const pickingList = await PickingPackingModel.getPickingListById(id);
      
      if (!pickingList) {
        return res.status(404).json({
          message: "Lista de picking não encontrada"
        });
      }

      res.json(pickingList);
    } catch (error) {
      console.error('Error fetching picking list:', error);
      res.status(500).json({
        message: "Erro ao buscar lista de picking",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createPickingList(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const validated = createPickingListSchema.parse(req.body);
      
      // Mapear os dados do schema para a interface InsertPickingList
      const pickingListData = {
        warehouseId: validated.warehouseId,
        priority: validated.priority,
        assignedTo: validated.assignedToUserId,
        type: validated.pickingType,
        notes: validated.notes,
        userId,
        status: 'pending' as const,
        items: validated.items,
        orderNumbers: validated.orderNumbers
      };
      

      const pickingList = await PickingPackingModel.createPickingList(pickingListData);
      res.status(201).json(pickingList);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.errors 
        });
      }
      console.error('Erro ao criar lista de picking:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async updatePickingList(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validated = updatePickingListSchema.parse(req.body);
      const pickingList = await PickingPackingModel.updatePickingList(id, validated);
      
      res.json(pickingList);
    } catch (error) {
      console.error('Error updating picking list:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao atualizar lista de picking",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async deletePickingList(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await PickingPackingModel.deletePickingList(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting picking list:', error);
      res.status(500).json({
        message: "Erro ao eliminar lista de picking",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async startPicking(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.body.userId || req.user?.id || 'system';
      
      if (!userId || userId === 'system') {
        console.warn('No user ID found in request, using system user');
      }
      
      const result = await PickingPackingModel.startPicking(id, userId);
      res.json(result);
    } catch (error) {
      console.error('Error starting picking:', error);
      res.status(500).json({
        message: "Erro ao iniciar picking",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async completePicking(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await PickingPackingModel.completePicking(id);
      res.json(result);
    } catch (error) {
      console.error('Error completing picking:', error);
      res.status(500).json({
        message: "Erro ao completar picking",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async pickItem(req: AuthenticatedRequest, res: Response) {
    try {
      const { itemId } = req.params;
      const validated = pickItemSchema.parse(req.body);
      const userId = req.body.userId || req.user?.id;
      
      const result = await PickingPackingModel.pickItem(itemId, {
        quantityPicked: validated.quantityPicked,
        locationVerified: validated.locationVerified,
        barcodeScanned: validated.barcodeScanned,
        notes: validated.notes
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error picking item:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao fazer picking do item",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async verifyPickedItem(req: AuthenticatedRequest, res: Response) {
    try {
      const { itemId } = req.params;
      const { barcode, location } = req.body;
      
      const result = await PickingPackingModel.verifyPickedItem(itemId, {
        barcode,
        location
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error verifying picked item:', error);
      res.status(500).json({
        message: "Erro ao verificar item",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createPickingWave(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, pickingListIds, assignedToUserId, priority } = req.body;
      
      const wave = await PickingPackingModel.createPickingWave({
        name,
        pickingListIds,
        assignedToUserId,
        priority
      });
      
      res.status(201).json(wave);
    } catch (error) {
      console.error('Error creating picking wave:', error);
      res.status(500).json({
        message: "Erro ao criar onda de picking",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPickingWave(req: AuthenticatedRequest, res: Response) {
    try {
      const { waveId } = req.params;
      const wave = await PickingPackingModel.getPickingWave(waveId);
      
      if (!wave) {
        return res.status(404).json({
          message: "Onda de picking não encontrada"
        });
      }

      res.json(wave);
    } catch (error) {
      console.error('Error fetching picking wave:', error);
      res.status(500).json({
        message: "Erro ao buscar onda de picking",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async assignWaveToUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { waveId } = req.params;
      const { userId } = req.body;
      
      const result = await PickingPackingModel.assignWaveToUser(waveId, userId);
      res.json(result);
    } catch (error) {
      console.error('Error assigning wave to user:', error);
      res.status(500).json({
        message: "Erro ao atribuir onda ao utilizador",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPackingTasks(req: AuthenticatedRequest, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const status = req.query.status as string | undefined;
      
      const tasks = await PickingPackingModel.getPackingTasks({
        warehouseId,
        status
      });
      
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching packing tasks:', error);
      res.status(500).json({
        message: "Erro ao buscar tarefas de embalagem",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createPackingTask(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = packingTaskSchema.parse(req.body);
      const task = await PickingPackingModel.createPackingTask(validated);
      
      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating packing task:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar tarefa de embalagem",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async packItems(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validated = packItemsSchema.parse(req.body);
      
      const result = await PickingPackingModel.packItems(id, validated);
      res.json(result);
    } catch (error) {
      console.error('Error packing items:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao embalar itens",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async completePackaging(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await PickingPackingModel.completePackaging(id);
      res.json(result);
    } catch (error) {
      console.error('Error completing packaging:', error);
      res.status(500).json({
        message: "Erro ao completar embalagem",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async generateShippingLabel(req: AuthenticatedRequest, res: Response) {
    try {
      const { packingTaskId, shippingMethod, recipient } = req.body;
      
      const label = await PickingPackingModel.generateShippingLabel({
        packageId: packingTaskId,
        shippingAddress: {
          name: recipient.name,
          address: recipient.address,
          city: recipient.city,
          postalCode: recipient.postalCode,
          country: recipient.country
        },
        carrier: shippingMethod.carrier,
        serviceType: shippingMethod.serviceType
      });
      
      res.json(label);
    } catch (error) {
      console.error('Error generating shipping label:', error);
      res.status(500).json({
        message: "Erro ao gerar etiqueta de envio",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getShippingInfo(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const shippingInfo = await PickingPackingModel.getShippingInfo(id);
      
      if (!shippingInfo) {
        return res.status(404).json({
          message: "Informações de envio não encontradas"
        });
      }

      res.json(shippingInfo);
    } catch (error) {
      console.error('Error fetching shipping info:', error);
      res.status(500).json({
        message: "Erro ao buscar informações de envio",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // === NOVAS FUNCIONALIDADES AVANÇADAS ===

  static async startAutomaticPackaging(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = automaticPackagingSchema.parse(req.body);
      
      const result = await PickingPackingModel.startAutomaticPackaging({
        pickingListId: validated.pickingListId,
        deviceId: validated.scaleDeviceId || validated.dimensionScannerDeviceId || 'default-device',
        packageType: validated.packagePreferences?.preferredPackageType
      });
      
      res.status(201).json({
        message: "Embalagem automática iniciada com sucesso",
        session: result
      });
    } catch (error) {
      console.error('Error starting automatic packaging:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao iniciar embalagem automática",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async recordAutomaticWeightDimensions(req: AuthenticatedRequest, res: Response) {
    try {
      const { packageId } = req.params;
      const { weight, dimensions, deviceId, confidence } = req.body;
      
      const result = await PickingPackingModel.recordAutomaticMeasurements(packageId, {
        weight: parseFloat(weight),
        dimensions: {
          length: parseFloat(dimensions.length),
          width: parseFloat(dimensions.width),
          height: parseFloat(dimensions.height)
        },
        deviceId
      });
      
      res.json({
        message: "Medições automáticas registradas com sucesso",
        measurements: result
      });
    } catch (error) {
      console.error('Error recording automatic measurements:', error);
      res.status(500).json({
        message: "Erro ao registrar medições automáticas",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async generateAutomaticShippingLabel(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = shippingLabelSchema.parse(req.body);
      
      const label = await PickingPackingModel.generateAutomaticShippingLabel({
        packageId: validated.packageId,
        shippingAddress: {
          name: validated.recipientAddress.name,
          address: validated.recipientAddress.addressLine1,
          city: validated.recipientAddress.city,
          postalCode: validated.recipientAddress.postalCode,
          country: validated.recipientAddress.country
        },
        carrier: validated.carrier,
        serviceType: validated.serviceType
      });
      
      res.json({
        message: "Etiqueta de envio gerada automaticamente",
        label: label || {
          id: 'temp-id',
          trackingNumber: 'temp-tracking',
          labelUrl: 'temp-url',
          carrier: validated.carrier || 'temp-carrier',
          serviceType: validated.serviceType || 'temp-service',
          estimatedDelivery: new Date(),
          cost: 0
        }
      });
    } catch (error) {
      console.error('Error generating automatic shipping label:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos para geração de etiqueta",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao gerar etiqueta de envio automática",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async calculateFreightCosts(req: Request, res: Response) {
    try {
      const validated = freightCalculationSchema.parse(req.body);
      
      const quotes = await PickingPackingModel.calculateFreightCosts({
        packageDetails: validated.packageDetails,
        origin: `${validated.origin.city}, ${validated.origin.state}, ${validated.origin.country}`,
        destination: `${validated.destination.city}, ${validated.destination.state}, ${validated.destination.country}`,
        serviceType: validated.serviceTypes?.[0]
      });
      
      res.json({
        message: "Custos de frete calculados com sucesso",
        quotes: quotes?.carriers?.map((quote: any) => ({
          carrier: quote.carrier,
          serviceType: quote.serviceType,
          cost: quote.cost,
          currency: quote.currency,
          estimatedDeliveryDays: quote.estimatedDeliveryDays,
          estimatedDeliveryDate: quote.estimatedDeliveryDate,
          features: quote.features,
          restrictions: quote.restrictions
        }))
      });
    } catch (error) {
      console.error('Error calculating freight costs:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos para cálculo de frete",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao calcular custos de frete",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async getAutomaticPackagingDevices(req: Request, res: Response) {
    try {
      const devices = await PickingPackingModel.getAutomaticPackagingDevices();
      
      res.json({
        devices: (devices || []).map((device: any) => ({
          id: device.id || 'unknown',
          name: device.name || 'Unknown Device',
          type: device.type || 'unknown',
          status: device.status || 'offline',
          capabilities: device.capabilities || [],
          lastCalibration: device.lastCalibration || null,
          location: device.location || 'unknown'
        }))
      });
    } catch (error) {
      console.error('Error getting packaging devices:', error);
      res.status(500).json({
        message: "Erro ao buscar dispositivos de embalagem",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getFreightCarriers(req: Request, res: Response) {
    try {
      const region = req.query.region as string;
      const serviceType = req.query.serviceType as string;
      
      const carriers = await PickingPackingModel.getFreightCarriers({ region, serviceType });
      
      res.json({
        carriers: (carriers || []).map((carrier: any) => ({
          id: carrier.id || 'unknown',
          name: carrier.name || 'Unknown Carrier',
          logo: carrier.logo || null,
          supportedServices: carrier.supportedServices || [],
          coverage: carrier.coverage || [],
          pricing: carrier.pricing || {},
          features: carrier.features || []
        }))
      });
    } catch (error) {
      console.error('Error getting freight carriers:', error);
      res.status(500).json({
        message: "Erro ao buscar transportadoras",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}