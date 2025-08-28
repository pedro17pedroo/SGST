import { apiRequest } from "./queryClient";

export async function createProduct(product: any) {
  const response = await apiRequest("POST", "/api/products", product);
  return response.json();
}

export async function updateProduct(id: string, product: any) {
  const response = await apiRequest("PUT", `/api/products/${id}`, product);
  return response.json();
}

export async function deleteProduct(id: string) {
  await apiRequest("DELETE", `/api/products/${id}`);
}

export async function createCategory(category: any) {
  const response = await apiRequest("POST", "/api/categories", category);
  return response.json();
}

export async function createSupplier(supplier: any) {
  const response = await apiRequest("POST", "/api/suppliers", supplier);
  return response.json();
}

export async function createWarehouse(warehouse: any) {
  const response = await apiRequest("POST", "/api/warehouses", warehouse);
  return response.json();
}

export async function updateInventory(productId: string, warehouseId: string, quantity: number) {
  const response = await apiRequest("PUT", "/api/inventory", {
    productId,
    warehouseId,
    quantity,
  });
  return response.json();
}

export async function createStockMovement(movement: any) {
  const response = await apiRequest("POST", "/api/stock-movements", movement);
  return response.json();
}

export async function createOrder(order: any) {
  const response = await apiRequest("POST", "/api/orders", order);
  return response.json();
}

export async function createShipment(shipment: any) {
  const response = await apiRequest("POST", "/api/shipments", shipment);
  return response.json();
}
