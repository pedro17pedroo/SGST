/**
 * Hook para gestão de escaneamento de códigos de barras
 * Centraliza operações de escaneamento, busca de produtos e rastreamento
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiServices } from '../../services/api.service';
import type { QueryParams, ApiResponse, PaginatedResponse } from '../../services/api.service';
import { CACHE_CONFIG } from '../../config/api';
import { useToast } from '../use-toast';
import { useAuth } from '../../contexts/auth-context';
import { useModules } from '../../contexts/module-context';
import { useMemo } from 'react';

// Tipos para escaneamento de códigos de barras
export interface BarcodeScan {
  id: string;
  scannedCode: string;
  scanType: 'barcode' | 'qr' | 'rfid';
  scanPurpose: 'inventory' | 'picking' | 'receiving' | 'shipping' | 'counting' | 'tracking';
  productId?: string;
  warehouseId?: string;
  locationId?: string;
  userId: string;
  metadata?: any;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    barcode: string;
    price: string;
    category?: {
      name: string;
    };
  };
  warehouse?: {
    id: string;
    name: string;
    address: string;
  };
  user?: {
    id: string;
    name: string;
  };
}

export interface ProductByBarcode {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode: string;
  price: string;
  costPrice: string;
  weight?: string;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  };
  supplier?: {
    id: string;
    name: string;
  };
  inventory?: {
    quantity: number;
    minStockLevel: number;
    warehouse: {
      id: string;
      name: string;
    };
  }[];
  locations?: {
    id: string;
    zone: string;
    aisle: string;
    shelf: string;
    bin: string;
    warehouse: {
      id: string;
      name: string;
    };
  }[];
  lastScanned?: {
    timestamp: string;
    userId: string;
    userName: string;
  };
}

export interface ProductLocation {
  id: string;
  productId: string;
  warehouseId: string;
  zone: string;
  aisle: string;
  shelf: string;
  bin: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  lastUpdated: string;
  warehouse: {
    id: string;
    name: string;
    address: string;
  };
}

export interface CreateBarcodeScanData {
  scannedCode: string;
  scanType: 'barcode' | 'qr' | 'rfid';
  scanPurpose: 'inventory' | 'picking' | 'receiving' | 'shipping' | 'counting' | 'tracking';
  productId?: string;
  warehouseId?: string;
  locationId?: string;
  metadata?: any;
}

// Chaves de query para cache
export const BARCODE_SCANNING_QUERY_KEYS = {
  all: ['barcode-scanning'] as const,
  scans: () => [...BARCODE_SCANNING_QUERY_KEYS.all, 'scans'] as const,
  scansList: (params?: QueryParams) => [...BARCODE_SCANNING_QUERY_KEYS.scans(), params] as const,
  productScans: (productId: string) => [...BARCODE_SCANNING_QUERY_KEYS.scans(), 'product', productId] as const,
  productByBarcode: (barcode: string) => [...BARCODE_SCANNING_QUERY_KEYS.all, 'product', 'barcode', barcode] as const,
  productLocation: (productId: string) => [...BARCODE_SCANNING_QUERY_KEYS.all, 'location', productId] as const,
};

/**
 * Hook para obter lista de escaneamentos com paginação
 */
export function useBarcodeScans(params?: QueryParams) {
  const { isAuthenticated, isReady } = useAuth();
  const { isLoading: isModulesLoading } = useModules();

  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading;
  }, [isAuthenticated, isReady, isModulesLoading]);

  return useQuery<PaginatedResponse<BarcodeScan>, Error>({
    queryKey: BARCODE_SCANNING_QUERY_KEYS.scansList(params),
    queryFn: () => apiServices.barcodeScanning.getBarcodeScans(params),
    enabled: canLoadData,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook para obter escaneamentos de um produto específico
 */
export function useProductBarcodeScans(productId: string) {
  const { isAuthenticated, isReady } = useAuth();
  const { isLoading: isModulesLoading } = useModules();

  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading && !!productId;
  }, [isAuthenticated, isReady, isModulesLoading, productId]);

  return useQuery<ApiResponse<BarcodeScan[]>, Error>({
    queryKey: BARCODE_SCANNING_QUERY_KEYS.productScans(productId),
    queryFn: () => apiServices.barcodeScanning.getBarcodeScansForProduct(productId),
    enabled: canLoadData,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    refetchOnWindowFocus: false,
    retry: 3,
  });
}

/**
 * Hook para buscar produto por código de barras
 */
export function useProductByBarcode(barcode: string) {
  const { isAuthenticated, isReady } = useAuth();
  const { isLoading: isModulesLoading } = useModules();

  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading && !!barcode;
  }, [isAuthenticated, isReady, isModulesLoading, barcode]);

  return useQuery<ApiResponse<ProductByBarcode>, Error>({
    queryKey: BARCODE_SCANNING_QUERY_KEYS.productByBarcode(barcode),
    queryFn: () => apiServices.barcodeScanning.findProductByBarcode(barcode),
    enabled: canLoadData,
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Não tentar novamente para produto não encontrado
      if (error?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook para obter última localização de um produto
 */
export function useProductLastLocation(productId: string) {
  const { isAuthenticated, isReady } = useAuth();
  const { isLoading: isModulesLoading } = useModules();

  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading && !!productId;
  }, [isAuthenticated, isReady, isModulesLoading, productId]);

  return useQuery<ApiResponse<ProductLocation>, Error>({
    queryKey: BARCODE_SCANNING_QUERY_KEYS.productLocation(productId),
    queryFn: () => apiServices.barcodeScanning.getLastProductLocation(productId),
    enabled: canLoadData,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook para criar escaneamento de código de barras
 */
export function useCreateBarcodeScan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation<ApiResponse<BarcodeScan>, Error, CreateBarcodeScanData>({
    mutationFn: (data) => {
      const scanData = {
        ...data,
        userId: user?.id || '',
      };
      return apiServices.barcodeScanning.createBarcodeScan(scanData);
    },
    onSuccess: (response, variables) => {
      // Invalidar cache de escaneamentos
      queryClient.invalidateQueries({ queryKey: BARCODE_SCANNING_QUERY_KEYS.scans() });
      
      // Se foi encontrado um produto, invalidar cache relacionado
      if (response.data.productId) {
        queryClient.invalidateQueries({ 
          queryKey: BARCODE_SCANNING_QUERY_KEYS.productScans(response.data.productId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: BARCODE_SCANNING_QUERY_KEYS.productLocation(response.data.productId) 
        });
      }
      
      // Invalidar cache do produto por código de barras para atualizar informações
      queryClient.invalidateQueries({ 
        queryKey: BARCODE_SCANNING_QUERY_KEYS.productByBarcode(variables.scannedCode) 
      });

      toast({
        title: "Escaneamento registado com sucesso!",
        description: `Código: ${variables.scannedCode}`,
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar escaneamento:', error);
      toast({
        title: "Erro ao registar escaneamento",
        description: error.message || "Não foi possível registar o escaneamento.",
        variant: "destructive",
      });
    },
  });
}

// Hook removido - funcionalidade de updateScanLocation não está disponível no serviço

/**
 * Hook combinado para funcionalidades completas de escaneamento
 */
export function useBarcodeScanningFeatures() {
  const createScan = useCreateBarcodeScan();

  return {
    createScan,
    isLoading: createScan.isPending,
  };
}