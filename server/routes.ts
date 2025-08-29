import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertCategorySchema, insertSupplierSchema, insertWarehouseSchema,
  insertProductSchema, insertStockMovementSchema, insertOrderSchema, insertShipmentSchema,
  insertProductLocationSchema, insertInventoryCountSchema, insertInventoryCountItemSchema,
  insertBarcodeScanSchema, insertReturnSchema, insertReturnItemSchema,
  insertPickingListSchema, insertPickingListItemSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users", error });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user", error });
      }
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, updateData);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update user", error });
      }
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user", error });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats", error });
    }
  });

  app.get("/api/dashboard/top-products", async (req, res) => {
    try {
      const products = await storage.getTopProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top products", error });
    }
  });

  app.get("/api/dashboard/recent-activities", async (req, res) => {
    try {
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent activities", error });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories", error });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const category = insertCategorySchema.parse(req.body);
      const result = await storage.createCategory(category);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create category", error });
      }
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertCategorySchema.partial().parse(req.body);
      const result = await storage.updateCategory(id, updates);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update category", error });
      }
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category", error });
    }
  });

  // Suppliers routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers", error });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplier = insertSupplierSchema.parse(req.body);
      const result = await storage.createSupplier(supplier);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create supplier", error });
      }
    }
  });

  // Warehouses routes
  app.get("/api/warehouses", async (req, res) => {
    try {
      const warehouses = await storage.getWarehouses();
      res.json(warehouses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch warehouses", error });
    }
  });

  app.post("/api/warehouses", async (req, res) => {
    try {
      const warehouse = insertWarehouseSchema.parse(req.body);
      const result = await storage.createWarehouse(warehouse);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid warehouse data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create warehouse", error });
      }
    }
  });

  app.put("/api/warehouses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertWarehouseSchema.partial().parse(req.body);
      const result = await storage.updateWarehouse(id, updates);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid warehouse data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update warehouse", error });
      }
    }
  });

  app.delete("/api/warehouses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWarehouse(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete warehouse", error });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products", error });
    }
  });

  app.get("/api/products/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        res.status(400).json({ message: "Query parameter 'q' is required" });
        return;
      }
      const products = await storage.searchProducts(q as string);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to search products", error });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product", error });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = insertProductSchema.parse(req.body);
      const result = await storage.createProduct(product);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create product", error });
      }
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertProductSchema.partial().parse(req.body);
      const result = await storage.updateProduct(id, updates);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update product", error });
      }
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product", error });
    }
  });

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders", error });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(id);
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order", error });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const order = insertOrderSchema.parse(req.body);
      const result = await storage.createOrder(order);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order", error });
      }
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertOrderSchema.partial().parse(req.body);
      const result = await storage.updateOrder(id, updates);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update order", error });
      }
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteOrder(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete order", error });
    }
  });

  // Shipments routes
  app.get("/api/shipments", async (req, res) => {
    try {
      const shipments = await storage.getShipments();
      res.json(shipments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipments", error });
    }
  });

  app.post("/api/shipments", async (req, res) => {
    try {
      const shipment = insertShipmentSchema.parse(req.body);
      const result = await storage.createShipment(shipment);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid shipment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create shipment", error });
      }
    }
  });

  app.put("/api/shipments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertShipmentSchema.partial().parse(req.body);
      const result = await storage.updateShipment(id, updates);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid shipment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update shipment", error });
      }
    }
  });

  // Public tracking API (no authentication required)
  app.get("/api/public/track/:trackingNumber", async (req, res) => {
    try {
      const { trackingNumber } = req.params;
      
      if (!trackingNumber || trackingNumber.trim() === '') {
        res.status(400).json({ 
          message: "Número de rastreamento é obrigatório",
          error: "INVALID_TRACKING_NUMBER"
        });
        return;
      }

      const shipment = await storage.getShipmentByTrackingNumber(trackingNumber.trim());
      
      if (!shipment) {
        res.status(404).json({ 
          message: "Encomenda não encontrada. Verifique o número de rastreamento.",
          error: "SHIPMENT_NOT_FOUND"
        });
        return;
      }

      // Return only public information (hide internal details)
      const publicShipmentInfo = {
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        carrier: shipment.carrier,
        estimatedDelivery: shipment.estimatedDelivery,
        actualDelivery: shipment.actualDelivery,
        shippingAddress: shipment.shippingAddress,
        createdAt: shipment.createdAt,
        order: shipment.order ? {
          orderNumber: shipment.order.orderNumber,
          customerName: shipment.order.customerName,
          totalAmount: shipment.order.totalAmount
        } : null,
        items: shipment.orderItems?.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })) || []
      };

      res.json(publicShipmentInfo);
    } catch (error) {
      console.error('Tracking error:', error);
      res.status(500).json({ 
        message: "Erro interno do servidor. Tente novamente mais tarde.",
        error: "INTERNAL_SERVER_ERROR"
      });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders", error });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(id);
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order", error });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order", error });
      }
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = insertOrderSchema.partial().parse(req.body);
      const order = await storage.updateOrder(id, updateData);
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update order", error });
      }
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteOrder(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete order", error });
    }
  });

  // Shipment routes
  app.get("/api/shipments", async (req, res) => {
    try {
      const shipments = await storage.getShipments();
      res.json(shipments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipments", error });
    }
  });

  app.post("/api/shipments", async (req, res) => {
    try {
      const shipmentData = insertShipmentSchema.parse(req.body);
      const shipment = await storage.createShipment(shipmentData);
      res.status(201).json(shipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid shipment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create shipment", error });
      }
    }
  });

  app.put("/api/shipments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = insertShipmentSchema.partial().parse(req.body);
      const shipment = await storage.updateShipment(id, updateData);
      res.json(shipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid shipment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update shipment", error });
      }
    }
  });

  // Stock movements routes
  app.get("/api/stock-movements", async (req, res) => {
    try {
      const movements = await storage.getStockMovements();
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock movements", error });
    }
  });

  app.post("/api/stock-movements", async (req, res) => {
    try {
      const movement = insertStockMovementSchema.parse(req.body);
      const result = await storage.createStockMovement(movement);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid movement data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create movement", error });
      }
    }
  });

  // Inventory routes
  app.get("/api/inventory/low-stock", async (req, res) => {
    try {
      const lowStockProducts = await storage.getLowStockProducts();
      res.json(lowStockProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock products", error });
    }
  });

  app.get("/api/inventory/warehouse/:warehouseId", async (req, res) => {
    try {
      const { warehouseId } = req.params;
      const inventory = await storage.getInventoryByWarehouse(warehouseId);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory", error });
    }
  });

  app.get("/api/inventory/product/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const inventory = await storage.getProductInventory(productId);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product inventory", error });
    }
  });

  app.put("/api/inventory", async (req, res) => {
    try {
      const { productId, warehouseId, quantity } = req.body;
      const result = await storage.updateInventory(productId, warehouseId, quantity);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to update inventory", error });
    }
  });

  // Stock movements routes
  app.get("/api/stock-movements", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const movements = await storage.getStockMovements(limit);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock movements", error });
    }
  });

  app.post("/api/stock-movements", async (req, res) => {
    try {
      const movement = insertStockMovementSchema.parse(req.body);
      const result = await storage.createStockMovement(movement);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid stock movement data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create stock movement", error });
      }
    }
  });

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders", error });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(id);
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order", error });
    }
  });

  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getOrderItems(id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order items", error });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const order = insertOrderSchema.parse(req.body);
      const result = await storage.createOrder(order);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order", error });
      }
    }
  });

  // Shipments routes
  app.get("/api/shipments", async (req, res) => {
    try {
      const shipments = await storage.getShipments();
      res.json(shipments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipments", error });
    }
  });

  app.post("/api/shipments", async (req, res) => {
    try {
      const shipment = insertShipmentSchema.parse(req.body);
      const result = await storage.createShipment(shipment);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid shipment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create shipment", error });
      }
    }
  });

  app.put("/api/shipments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertShipmentSchema.partial().parse(req.body);
      const result = await storage.updateShipment(id, updates);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid shipment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update shipment", error });
      }
    }
  });

  // Product Locations routes (RF1.5)
  app.get("/api/product-locations", async (req, res) => {
    try {
      const { warehouseId } = req.query;
      const locations = await storage.getProductLocations(warehouseId as string);
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product locations", error });
    }
  });

  app.post("/api/product-locations", async (req, res) => {
    try {
      const location = insertProductLocationSchema.parse(req.body);
      const result = await storage.createProductLocation(location);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid location data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create location", error });
      }
    }
  });

  app.put("/api/product-locations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertProductLocationSchema.partial().parse(req.body);
      const result = await storage.updateProductLocation(id, updates);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid location data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update location", error });
      }
    }
  });

  app.delete("/api/product-locations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProductLocation(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete location", error });
    }
  });

  // Inventory Counts routes (RF1.4)
  app.get("/api/inventory-counts", async (req, res) => {
    try {
      const { warehouseId } = req.query;
      const counts = await storage.getInventoryCounts(warehouseId as string);
      res.json(counts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory counts", error });
    }
  });

  app.get("/api/inventory-counts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const count = await storage.getInventoryCount(id);
      if (!count) {
        return res.status(404).json({ message: "Inventory count not found" });
      }
      res.json(count);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory count", error });
    }
  });

  app.post("/api/inventory-counts", async (req, res) => {
    try {
      const count = insertInventoryCountSchema.parse(req.body);
      const result = await storage.createInventoryCount(count);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid count data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create inventory count", error });
      }
    }
  });

  app.put("/api/inventory-counts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertInventoryCountSchema.partial().parse(req.body);
      const result = await storage.updateInventoryCount(id, updates);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid count data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update inventory count", error });
      }
    }
  });

  app.get("/api/inventory-counts/:id/items", async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getInventoryCountItems(id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch count items", error });
    }
  });

  app.post("/api/inventory-count-items", async (req, res) => {
    try {
      const item = insertInventoryCountItemSchema.parse(req.body);
      const result = await storage.createInventoryCountItem(item);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid count item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create count item", error });
      }
    }
  });

  app.put("/api/inventory-count-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertInventoryCountItemSchema.partial().parse(req.body);
      const result = await storage.updateInventoryCountItem(id, updates);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid count item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update count item", error });
      }
    }
  });

  // Barcode Scans routes (RF2.1)
  app.get("/api/barcode-scans", async (req, res) => {
    try {
      const { limit } = req.query;
      const scans = await storage.getBarcodeScans(limit ? parseInt(limit as string) : undefined);
      res.json(scans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch barcode scans", error });
    }
  });

  app.post("/api/barcode-scans", async (req, res) => {
    try {
      const scanData = insertBarcodeScanSchema.parse(req.body);
      
      // Try to find product by barcode automatically
      if (!scanData.productId && scanData.scannedCode) {
        const product = await storage.findProductByBarcode(scanData.scannedCode);
        if (product) {
          scanData.productId = product.id;
        }
      }
      
      const result = await storage.createBarcodeScan(scanData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid scan data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create barcode scan", error });
      }
    }
  });

  app.get("/api/products/:id/scans", async (req, res) => {
    try {
      const { id } = req.params;
      const scans = await storage.getBarcodeScansByProduct(id);
      res.json(scans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product scans", error });
    }
  });

  app.get("/api/products/by-barcode/:barcode", async (req, res) => {
    try {
      const { barcode } = req.params;
      const product = await storage.findProductByBarcode(barcode);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to find product by barcode", error });
    }
  });

  // Product Locations routes (RF1.5 - Warehouse Organization)
  app.get("/api/product-locations", async (req, res) => {
    try {
      const { warehouseId } = req.query;
      const locations = await storage.getProductLocations(warehouseId as string);
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product locations", error });
    }
  });

  app.post("/api/product-locations", async (req, res) => {
    try {
      const locationData = insertProductLocationSchema.parse(req.body);
      const location = await storage.createProductLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid location data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create product location", error });
      }
    }
  });

  app.put("/api/product-locations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertProductLocationSchema.partial().parse(req.body);
      const location = await storage.updateProductLocation(id, updates);
      res.json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid location data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update product location", error });
      }
    }
  });

  app.delete("/api/product-locations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProductLocation(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product location", error });
    }
  });

  // Inventory Counts routes (RF1.4 - Cycle Counting)
  app.get("/api/inventory-counts", async (req, res) => {
    try {
      const { warehouseId } = req.query;
      const counts = await storage.getInventoryCounts(warehouseId as string);
      res.json(counts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory counts", error });
    }
  });

  app.post("/api/inventory-counts", async (req, res) => {
    try {
      const countData = insertInventoryCountSchema.parse(req.body);
      const count = await storage.createInventoryCount(countData);
      res.status(201).json(count);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid count data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create inventory count", error });
      }
    }
  });

  app.put("/api/inventory-counts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertInventoryCountSchema.partial().parse(req.body);
      const count = await storage.updateInventoryCount(id, updates);
      res.json(count);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid count data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update inventory count", error });
      }
    }
  });

  app.get("/api/inventory-counts/:id/items", async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getInventoryCountItems(id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch count items", error });
    }
  });

  app.post("/api/inventory-count-items", async (req, res) => {
    try {
      const itemData = insertInventoryCountItemSchema.parse(req.body);
      const item = await storage.createInventoryCountItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid count item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create count item", error });
      }
    }
  });

  app.put("/api/inventory-count-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertInventoryCountItemSchema.partial().parse(req.body);
      const item = await storage.updateInventoryCountItem(id, updates);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid count item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update count item", error });
      }
    }
  });

  // Barcode Scans routes (RF2.1 - Product Tracking)
  app.get("/api/barcode-scans", async (req, res) => {
    try {
      const { limit } = req.query;
      const scans = await storage.getBarcodeScans(limit ? parseInt(limit as string) : 50);
      res.json(scans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch barcode scans", error });
    }
  });

  app.post("/api/barcode-scans", async (req, res) => {
    try {
      const scanData = insertBarcodeScanSchema.parse(req.body);
      const scan = await storage.createBarcodeScan(scanData);
      res.status(201).json(scan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid scan data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create barcode scan", error });
      }
    }
  });

  app.get("/api/products/barcode/:barcode", async (req, res) => {
    try {
      const { barcode } = req.params;
      const product = await storage.findProductByBarcode(barcode);
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to find product by barcode", error });
    }
  });

  app.get("/api/barcode-scans/product/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const scans = await storage.getBarcodeScansByProduct(productId);
      res.json(scans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scans for product", error });
    }
  });

  // Returns routes (RF3.3 - Returns Management)
  app.get("/api/returns", async (req, res) => {
    try {
      const { supplierId } = req.query;
      const returnsData = await storage.getReturns(supplierId as string);
      res.json(returnsData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch returns", error });
    }
  });

  app.get("/api/returns/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const returnData = await storage.getReturn(id);
      if (!returnData) {
        return res.status(404).json({ message: "Return not found" });
      }
      res.json(returnData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch return", error });
    }
  });

  app.post("/api/returns", async (req, res) => {
    try {
      const returnData = insertReturnSchema.parse(req.body);
      const result = await storage.createReturn(returnData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid return data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create return", error });
      }
    }
  });

  app.put("/api/returns/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertReturnSchema.partial().parse(req.body);
      const result = await storage.updateReturn(id, updates);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid return data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update return", error });
      }
    }
  });

  app.get("/api/returns/:id/items", async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getReturnItems(id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch return items", error });
    }
  });

  app.post("/api/return-items", async (req, res) => {
    try {
      const itemData = insertReturnItemSchema.parse(req.body);
      const item = await storage.createReturnItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid return item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create return item", error });
      }
    }
  });

  app.put("/api/return-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertReturnItemSchema.partial().parse(req.body);
      const item = await storage.updateReturnItem(id, updates);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid return item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update return item", error });
      }
    }
  });

  // Picking Lists routes (RF2.4 - Picking & Packing)
  app.get("/api/picking-lists", async (req, res) => {
    try {
      const { warehouseId } = req.query;
      const pickingLists = await storage.getPickingLists(warehouseId as string);
      res.json(pickingLists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch picking lists", error });
    }
  });

  app.get("/api/picking-lists/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const pickingList = await storage.getPickingList(id);
      if (!pickingList) {
        res.status(404).json({ message: "Picking list not found" });
        return;
      }
      res.json(pickingList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch picking list", error });
    }
  });

  app.post("/api/picking-lists", async (req, res) => {
    try {
      const pickingData = insertPickingListSchema.parse(req.body);
      const result = await storage.createPickingList(pickingData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid picking list data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create picking list", error });
      }
    }
  });

  app.put("/api/picking-lists/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertPickingListSchema.partial().parse(req.body);
      const result = await storage.updatePickingList(id, updates);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid picking list data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update picking list", error });
      }
    }
  });

  app.delete("/api/picking-lists/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePickingList(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete picking list", error });
    }
  });

  // Picking List Items routes
  app.get("/api/picking-lists/:id/items", async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getPickingListItems(id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch picking list items", error });
    }
  });

  app.post("/api/picking-lists/:id/items", async (req, res) => {
    try {
      const itemData = insertPickingListItemSchema.parse(req.body);
      const item = await storage.createPickingListItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid picking list item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create picking list item", error });
      }
    }
  });

  app.put("/api/picking-lists/items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertPickingListItemSchema.partial().parse(req.body);
      const item = await storage.updatePickingListItem(id, updates);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid picking list item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update picking list item", error });
      }
    }
  });

  // Packing Tasks routes (RF2.4)
  app.get("/api/packing-tasks", async (req, res) => {
    try {
      // Demo data for now
      const packingTasks = [
        {
          id: 'pack-001',
          pickingList: { id: 'pick-003', orderNumber: 'ORD-2025-003' },
          packageType: 'Caixa Média',
          status: 'completed',
          weight: 2.5,
          dimensions: { length: 30, width: 20, height: 15 },
          trackingNumber: 'TRK-001-2025',
          packedBy: { id: 'user-001', username: 'João Admin' },
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        }
      ];
      res.json(packingTasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch packing tasks", error });
    }
  });

  app.post("/api/packing-tasks", async (req, res) => {
    try {
      // Demo implementation
      const packingData = req.body;
      const result = {
        id: 'pack-' + Date.now(),
        ...packingData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to create packing task", error });
    }
  });

  // Advanced Analytics routes (RF5.2-5.3)
  app.get("/api/analytics/demand-forecast", async (req, res) => {
    try {
      // Demo predictive analytics data
      const forecast = {
        period: '30 days',
        predictions: [
          {
            productId: '1',
            productName: 'Smartphone Samsung Galaxy A54',
            currentStock: 45,
            predictedDemand: 28,
            recommendedReorder: 15,
            confidence: 0.89,
            seasonalFactor: 1.2
          },
          {
            productId: '2',
            productName: 'Notebook Lenovo IdeaPad 3i',
            currentStock: 12,
            predictedDemand: 8,
            recommendedReorder: 5,
            confidence: 0.76,
            seasonalFactor: 0.95
          }
        ],
        generatedAt: new Date().toISOString()
      };
      res.json(forecast);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate demand forecast", error });
    }
  });

  app.get("/api/analytics/turnover-analysis", async (req, res) => {
    try {
      // Demo turnover analysis
      const analysis = {
        period: '6 months',
        categories: [
          {
            categoryId: 'cat-001',
            categoryName: 'Smartphones',
            turnoverRate: 4.2,
            averageDaysToSell: 87,
            fastMovingProducts: 5,
            slowMovingProducts: 2,
            status: 'healthy'
          },
          {
            categoryId: 'cat-002',
            categoryName: 'Computadores',
            turnoverRate: 2.8,
            averageDaysToSell: 130,
            fastMovingProducts: 3,
            slowMovingProducts: 4,
            status: 'attention'
          }
        ],
        obsoleteItems: [
          {
            productId: '8',
            productName: 'Impressora Antiga X200',
            daysInStock: 365,
            currentValue: 25000,
            recommendation: 'liquidate'
          }
        ],
        generatedAt: new Date().toISOString()
      };
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate turnover analysis", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
