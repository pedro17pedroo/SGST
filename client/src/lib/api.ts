/**
 * API Legacy - Funções de compatibilidade
 * Este arquivo mantém as funções existentes para compatibilidade,
 * mas agora utiliza o serviço centralizado internamente.
 * 
 * @deprecated Use apiServices diretamente para novas implementações
 */

import apiServices from '../services/api.service';

// === PRODUTOS ===
export async function createProduct(product: any) {
  const result = await apiServices.products.createProduct(product);
  return result.data;
}

export async function updateProduct(id: string, product: any) {
  const result = await apiServices.products.updateProduct(id, product);
  return result.data;
}

export async function deactivateProduct(id: string) {
  const result = await apiServices.products.deactivateProduct(id);
  return result.data;
}

export async function activateProduct(id: string) {
  const result = await apiServices.products.activateProduct(id);
  return result.data;
}

export async function deleteProduct(id: string) {
  await apiServices.products.deleteProduct(id);
}

// === CATEGORIAS ===
export async function getCategories() {
  const result = await apiServices.categories.getCategories();
  return result.data;
}

export async function createCategory(category: any) {
  const result = await apiServices.categories.createCategory(category);
  return result.data;
}

export async function updateCategory(id: string, category: any) {
  const result = await apiServices.categories.updateCategory(id, category);
  return result.data;
}

export async function deleteCategory(id: string) {
  await apiServices.categories.deleteCategory(id);
}

// === FORNECEDORES ===
export async function createSupplier(supplier: any) {
  const result = await apiServices.suppliers.createSupplier(supplier);
  return result.data;
}

// === ARMAZÉNS ===
// Nota: Esta função precisa ser implementada no serviço de armazéns
export async function createWarehouse(warehouse: any) {
  // Temporariamente usando apiRequest diretamente até implementar warehousesService
  const { apiRequest } = await import('./queryClient');
  const response = await apiRequest("POST", "/api/warehouses", warehouse);
  return response.json();
}

// === INVENTÁRIO ===
export async function updateInventory(productId: string, warehouseId: string, quantity: number) {
  const result = await apiServices.inventory.updateInventory({
    productId,
    warehouseId,
    quantity,
  });
  return result.data;
}

export async function createStockMovement(movement: any) {
  const result = await apiServices.inventory.createInventoryMovement(movement);
  return result.data;
}

// === ENCOMENDAS ===
export async function createOrder(order: any) {
  const result = await apiServices.orders.createOrder(order);
  return result.data;
}

// === ENVIOS ===
export async function createShipment(shipment: any) {
  const result = await apiServices.shipping.createShipment(shipment);
  return result.data;
}

// === PICKING & PACKING ===
// Nota: Estas funções precisam ser implementadas nos serviços de picking/packing
export async function getPickingLists() {
  // Temporariamente usando apiRequest diretamente até implementar pickingService
  const { apiRequest } = await import('./queryClient');
  const response = await apiRequest("GET", "/api/picking-lists");
  return response.json();
}

export async function createPickingList(pickingList: any) {
  // Temporariamente usando apiRequest diretamente até implementar pickingService
  const { apiRequest } = await import('./queryClient');
  const response = await apiRequest("POST", "/api/picking-lists", pickingList);
  return response.json();
}

export async function getPackingTasks() {
  // Temporariamente usando apiRequest diretamente até implementar packingService
  const { apiRequest } = await import('./queryClient');
  const response = await apiRequest("GET", "/api/packing-tasks");
  return response.json();
}

export async function createPackingTask(packingTask: any) {
  // Temporariamente usando apiRequest diretamente até implementar packingService
  const { apiRequest } = await import('./queryClient');
  const response = await apiRequest("POST", "/api/packing-tasks", packingTask);
  return response.json();
}

export async function startPickingList(pickingListId: string, userId?: string) {
  // Temporariamente usando apiRequest diretamente até implementar pickingService
  const { apiRequest } = await import('./queryClient');
  const response = await apiRequest("POST", `/api/picking-lists/${pickingListId}/start`, { userId });
  return response.json();
}

// Re-exportar os serviços para facilitar migração gradual
export { default as apiServices } from '../services/api.service';
export * from '../services/api.service';
