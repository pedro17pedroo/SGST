/**
 * Hook para operações de escaneamento de códigos de barras
 * Centraliza todas as operações relacionadas com barcode scanning,
 * incluindo busca de produtos, criação de escaneamentos e rastreamento.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiServices } from '../services/api.service';
import { QueryParams } from '../services/api.service';
import { toast } from 'sonner';

// === TIPOS ===

/**
 * Dados para criar um novo escaneamento
 */
export interface CreateBarcodeScanData {
  barcode: string;
  scanType: 'barcode' | 'qr' | 'rfid';
  purpose: 'inventory' | 'picking' | 'receiving' | 'shipping' | 'counting' | 'tracking';
  warehouseId: string;
  userId?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    zone?: string;
    aisle?: string;
    shelf?: string;
  };
  metadata?: {
    deviceInfo?: string;
    userAgent?: string;
    method?: 'laser' | 'camera' | 'manual';
    [key: string]: any;
  };
}

/**
 * Dados de um escaneamento
 */
export interface BarcodeScan {
  id: string;
  barcode: string;
  scanType: 'barcode' | 'qr' | 'rfid';
  purpose: 'inventory' | 'picking' | 'receiving' | 'shipping' | 'counting' | 'tracking';
  productId?: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    barcode: string;
  };
  warehouseId: string;
  warehouse?: {
    id: string;
    name: string;
    code: string;
  };
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
    zone?: string;
    aisle?: string;
    shelf?: string;
  };
  metadata?: {
    deviceInfo?: string;
    userAgent?: string;
    method?: 'laser' | 'camera' | 'manual';
    [key: string]: any;
  };
  scannedAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dados de produto encontrado por código de barras
 */
export interface ProductByBarcode {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  description?: string;
  category?: {
    id: string;
    name: string;
  };
  currentStock?: number;
  location?: {
    warehouseId: string;
    warehouse?: {
      id: string;
      name: string;
      code: string;
    };
    zone?: string;
    aisle?: string;
    shelf?: string;
  };
  lastScan?: {
    scannedAt: string;
    userId: string;
    user?: {
      name: string;
    };
  };
}

/**
 * Localização de produto
 */
export interface ProductLocation {
  productId: string;
  warehouseId: string;
  warehouse?: {
    id: string;
    name: string;
    code: string;
  };
  zone?: string;
  aisle?: string;
  shelf?: string;
  lastUpdated: string;
  lastScannedBy?: {
    userId: string;
    user?: {
      name: string;
    };
    scannedAt: string;
  };
}

// === CHAVES DE QUERY ===

export const BARCODE_SCANNING_QUERY_KEYS = {
  all: ['barcode-scanning'] as const,
  scans: () => [...BARCODE_SCANNING_QUERY_KEYS.all, 'scans'] as const,
  scansList: (params?: QueryParams) => [...BARCODE_SCANNING_QUERY_KEYS.scans(), 'list', params] as const,
  productScans: (productId: string) => [...BARCODE_SCANNING_QUERY_KEYS.all, 'product-scans', productId] as const,
  productScansList: (productId: string, params?: QueryParams) => [...BARCODE_SCANNING_QUERY_KEYS.productScans(productId), 'list', params] as const,
  productByBarcode: (barcode: string) => [...BARCODE_SCANNING_QUERY_KEYS.all, 'product-by-barcode', barcode] as const,
  productLocation: (productId: string) => [...BARCODE_SCANNING_QUERY_KEYS.all, 'product-location', productId] as const,
} as const;

// === HOOKS ===

/**
 * Hook para obter histórico de escaneamentos
 */
export function useBarcodeScans(params?: QueryParams) {
  return useQuery({
    queryKey: BARCODE_SCANNING_QUERY_KEYS.scansList(params),
    queryFn: () => apiServices.barcodeScanning.getBarcodeScans(params),
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obter escaneamentos de um produto específico
 */
export function useProductBarcodeScans(productId: string, params?: QueryParams) {
  return useQuery({
    queryKey: BARCODE_SCANNING_QUERY_KEYS.productScansList(productId, params),
    queryFn: () => apiServices.barcodeScanning.getBarcodeScansForProduct(productId, params),
    enabled: !!productId,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar produto por código de barras
 */
export function useProductByBarcode(barcode: string) {
  return useQuery({
    queryKey: BARCODE_SCANNING_QUERY_KEYS.productByBarcode(barcode),
    queryFn: () => apiServices.barcodeScanning.findProductByBarcode(barcode),
    enabled: !!barcode && barcode.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error: any) => {
      // Não tentar novamente se o produto não for encontrado
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook para obter última localização de um produto
 */
export function useProductLocation(productId: string) {
  return useQuery({
    queryKey: BARCODE_SCANNING_QUERY_KEYS.productLocation(productId),
    queryFn: () => apiServices.barcodeScanning.getLastProductLocation(productId),
    enabled: !!productId,
    staleTime: 60 * 1000, // 1 minuto
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para criar novo escaneamento
 */
export function useCreateBarcodeScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scanData: CreateBarcodeScanData) => {
      // Mapear os campos para o formato esperado pelo backend
      const backendData = {
        scannedCode: scanData.barcode,
        scanType: scanData.scanType,
        scanPurpose: scanData.purpose,
        productId: undefined, // Será determinado pelo backend
        warehouseId: scanData.warehouseId,
        locationId: undefined, // Opcional
        userId: scanData.userId || 'system', // Garantir que userId seja enviado
        metadata: scanData.metadata
      };
      return apiServices.barcodeScanning.createBarcodeScan(backendData);
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: BARCODE_SCANNING_QUERY_KEYS.scans() });
      
      // Se o produto foi encontrado, invalidar suas queries específicas
      if (data.data?.productId) {
        queryClient.invalidateQueries({ 
          queryKey: BARCODE_SCANNING_QUERY_KEYS.productScans(data.data.productId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: BARCODE_SCANNING_QUERY_KEYS.productLocation(data.data.productId) 
        });
      }
      
      // Invalidar query de busca por código de barras
      queryClient.invalidateQueries({ 
        queryKey: BARCODE_SCANNING_QUERY_KEYS.productByBarcode(variables.barcode) 
      });
      
      // Mostrar notificação de sucesso
      const method = variables.metadata?.method;
      const methodMap: Record<string, string> = {
        laser: 'Leitor Laser',
        camera: 'Câmera',
        manual: 'Entrada Manual'
      };
      const methodText = method ? methodMap[method] || 'Scanner' : 'Scanner';
      
      toast.success('Código escaneado com sucesso!', {
        description: `Método: ${methodText} | Código: ${variables.barcode}`,
        duration: 3000,
      });
    },
    onError: (error: any) => {
      console.error('Erro ao criar escaneamento:', error);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Erro ao processar escaneamento';
      
      toast.error('Erro no escaneamento', {
        description: errorMessage,
        duration: 5000,
      });
    },
  });
}

/**
 * Hook para invalidar todas as queries de barcode scanning
 */
export function useInvalidateBarcodeScanningQueries() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: BARCODE_SCANNING_QUERY_KEYS.all });
  };
}

/**
 * Hook para prefetch de dados de produto por código de barras
 */
export function usePrefetchProductByBarcode() {
  const queryClient = useQueryClient();
  
  return (barcode: string) => {
    if (!barcode || barcode.length === 0) return;
    
    queryClient.prefetchQuery({
      queryKey: BARCODE_SCANNING_QUERY_KEYS.productByBarcode(barcode),
      queryFn: () => apiServices.barcodeScanning.findProductByBarcode(barcode),
      staleTime: 2 * 60 * 1000, // 2 minutos
    });
  };
}

/**
 * Hook para obter estatísticas de escaneamento
 */
export function useBarcodeScanningStats(params?: { 
  warehouseId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: [...BARCODE_SCANNING_QUERY_KEYS.all, 'stats', params],
    queryFn: () => apiServices.barcodeScanning.getBarcodeScans({
      ...params,
      limit: 1000, // Para calcular estatísticas
    }),
    select: (data) => {
      const scans = data.data || [];
      
      return {
        totalScans: scans.length,
        successfulScans: scans.filter((scan: BarcodeScan) => scan.productId).length,
        unknownProducts: scans.filter((scan: BarcodeScan) => !scan.productId).length,
        scansByMethod: scans.reduce((acc: Record<string, number>, scan: BarcodeScan) => {
          const method = scan.metadata?.method || 'unknown';
          acc[method] = (acc[method] || 0) + 1;
          return acc;
        }, {}),
        scansByPurpose: scans.reduce((acc: Record<string, number>, scan: BarcodeScan) => {
          acc[scan.purpose] = (acc[scan.purpose] || 0) + 1;
          return acc;
        }, {}),
        recentScans: scans.slice(0, 10), // 10 mais recentes
      };
    },
    staleTime: 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}