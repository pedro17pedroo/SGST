import { apiRequest } from "./queryClient";

export async function createProduct(product: any) {
  const response = await apiRequest("POST", "/api/products", product);
  return response.json();
}

export async function updateProduct(id: string, product: any) {
  const response = await apiRequest("PUT", `/api/products/${id}`, product);
  return response.json();
}

export async function deactivateProduct(id: string) {
  const response = await apiRequest("PATCH", `/api/products/${id}/deactivate`);
  return response.json();
}

export async function activateProduct(id: string) {
  const response = await apiRequest("PATCH", `/api/products/${id}/activate`);
  return response.json();
}

export async function deleteProduct(id: string) {
  await apiRequest("DELETE", `/api/products/${id}`);
}

export async function getCategories() {
  const response = await apiRequest("GET", "/api/categories");
  return response.json();
}

export async function createCategory(category: any) {
  const response = await apiRequest("POST", "/api/categories", category);
  return response.json();
}

export async function updateCategory(id: string, category: any) {
  const response = await apiRequest("PUT", `/api/categories/${id}`, category);
  return response.json();
}

export async function deleteCategory(id: string) {
  await apiRequest("DELETE", `/api/categories/${id}`);
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
  const response = await apiRequest("POST", "/api/inventory/stock-movements", movement);
  return response.json();
}

export async function createOrder(order: any) {
  const response = await apiRequest("POST", "/api/orders", order);
  return response.json();
}

export async function createShipment(shipment: any) {
  const response = await apiRequest("POST", "/api/shipping", shipment);
  return response.json();
}

// Picking & Packing API functions
export async function getPickingLists() {
  const response = await apiRequest("GET", "/api/picking-lists");
  return response.json();
}

export async function createPickingList(pickingList: any) {
  const response = await apiRequest("POST", "/api/picking-lists", pickingList);
  return response.json();
}

export async function getPackingTasks() {
  const response = await apiRequest("GET", "/api/packing-tasks");
  return response.json();
}

export async function createPackingTask(packingTask: any) {
  const response = await apiRequest("POST", "/api/packing-tasks", packingTask);
  return response.json();
}

export async function startPickingList(pickingListId: string, userId?: string) {
  const response = await apiRequest("POST", `/api/picking-lists/${pickingListId}/start`, { userId });
  return response.json();
}
