import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertCategorySchema, insertSupplierSchema, insertWarehouseSchema,
  insertProductSchema, insertStockMovementSchema, insertOrderSchema, insertShipmentSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
