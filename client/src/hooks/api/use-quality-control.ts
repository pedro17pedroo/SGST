/**
 * Hook para gestão de controle de qualidade
 * Centraliza operações de inspeções, testes e conformidade
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { apiServices } from '../../services/api.service'; // Removido - não utilizado
import type { QueryParams, ApiResponse } from '../../services/api.service';
import { CACHE_CONFIG } from '../../config/api';
import { useToast } from '../use-toast';

// Tipos para controle de qualidade
export interface QualityInspection {
  id: string;
  inspectionNumber: string;
  type: 'incoming' | 'in_process' | 'outgoing' | 'random';
  status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  productId: string;
  productName: string;
  sku: string;
  batchNumber?: string;
  supplierId?: string;
  supplierName?: string;
  quantity: number;
  sampleSize: number;
  inspectorId: string;
  inspectorName: string;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  testResults: QualityTestResult[];
  defects: QualityDefect[];
  overallScore: number;
  passed: boolean;
  notes?: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QualityTestResult {
  id: string;
  testId: string;
  testName: string;
  category: string;
  expectedValue: string;
  actualValue: string;
  unit?: string;
  tolerance?: number;
  result: 'pass' | 'fail' | 'warning';
  notes?: string;
  testedAt: string;
  testedBy: string;
}

export interface QualityDefect {
  id: string;
  type: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  quantity: number;
  location?: string;
  images: string[];
  correctionRequired: boolean;
  correctionNotes?: string;
}

export interface QualityTest {
  id: string;
  name: string;
  category: string;
  description: string;
  procedure: string;
  expectedValue?: string;
  unit?: string;
  tolerance?: number;
  isActive: boolean;
  applicableProducts: string[];
}

export interface InspectionFormData {
  type: 'incoming' | 'in_process' | 'outgoing' | 'random';
  productId: string;
  batchNumber?: string;
  supplierId?: string;
  quantity: number;
  sampleSize: number;
  scheduledDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  testIds: string[];
  notes?: string;
}

export interface TestResultData {
  testId: string;
  actualValue: string;
  result: 'pass' | 'fail' | 'warning';
  notes?: string;
}

export interface DefectData {
  type: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  quantity: number;
  location?: string;
  correctionRequired: boolean;
  correctionNotes?: string;
}

// Chaves de query para cache
export const QUALITY_QUERY_KEYS = {
  all: ['quality-control'] as const,
  inspections: () => [...QUALITY_QUERY_KEYS.all, 'inspections'] as const,
  inspection: (id: string) => [...QUALITY_QUERY_KEYS.inspections(), id] as const,
  inspectionsList: (params?: QueryParams) => [...QUALITY_QUERY_KEYS.inspections(), 'list', params] as const,
  tests: () => [...QUALITY_QUERY_KEYS.all, 'tests'] as const,
  testsList: (params?: QueryParams) => [...QUALITY_QUERY_KEYS.tests(), 'list', params] as const,
  statistics: () => [...QUALITY_QUERY_KEYS.all, 'statistics'] as const,
  reports: () => [...QUALITY_QUERY_KEYS.all, 'reports'] as const,
};

/**
 * Hook para listar inspeções de qualidade
 */
export function useQualityInspections(params?: QueryParams) {
  const { toast } = useToast();

  return useQuery<ApiResponse<QualityInspection[]>, Error>({
    queryKey: QUALITY_QUERY_KEYS.inspectionsList(params),
    queryFn: async () => {
      // Simular dados de inspeções
      const inspections: QualityInspection[] = [
        {
          id: 'insp-1',
          inspectionNumber: 'QC-2024-001',
          type: 'incoming',
          status: 'passed',
          priority: 'high',
          productId: 'prod-1',
          productName: 'Produto A',
          sku: 'SKU-001',
          batchNumber: 'BATCH-001',
          supplierId: 'sup-1',
          supplierName: 'Fornecedor ABC',
          quantity: 1000,
          sampleSize: 50,
          inspectorId: 'user-1',
          inspectorName: 'Maria Santos',
          scheduledDate: '2024-01-15T09:00:00Z',
          startedAt: '2024-01-15T09:15:00Z',
          completedAt: '2024-01-15T11:30:00Z',
          testResults: [],
          defects: [],
          overallScore: 95.5,
          passed: true,
          notes: 'Inspeção realizada conforme procedimento padrão',
          attachments: [],
          createdAt: '2024-01-14T16:00:00Z',
          updatedAt: '2024-01-15T11:30:00Z',
        },
        {
          id: 'insp-2',
          inspectionNumber: 'QC-2024-002',
          type: 'outgoing',
          status: 'in_progress',
          priority: 'medium',
          productId: 'prod-2',
          productName: 'Produto B',
          sku: 'SKU-002',
          quantity: 500,
          sampleSize: 25,
          inspectorId: 'user-2',
          inspectorName: 'João Silva',
          scheduledDate: '2024-01-20T14:00:00Z',
          startedAt: '2024-01-20T14:05:00Z',
          testResults: [],
          defects: [],
          overallScore: 0,
          passed: false,
          attachments: [],
          createdAt: '2024-01-19T10:00:00Z',
          updatedAt: '2024-01-20T14:05:00Z',
        },
      ];

      return {
        data: inspections,
        success: true,
        message: 'Inspeções carregadas com sucesso',
      };
    },
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    retry: 2,
    meta: {
      onError: () => {
        toast({
          title: 'Erro ao carregar inspeções',
          description: 'Não foi possível carregar as inspeções de qualidade.',
          variant: 'destructive',
        });
      },
    },
  });
}

/**
 * Hook para obter detalhes de uma inspeção específica
 */
export function useQualityInspection(id: string) {
  const { toast } = useToast();

  return useQuery<ApiResponse<QualityInspection>, Error>({
    queryKey: QUALITY_QUERY_KEYS.inspection(id),
    queryFn: async () => {
      // Simular dados detalhados da inspeção
      const inspection: QualityInspection = {
        id,
        inspectionNumber: 'QC-2024-001',
        type: 'incoming',
        status: 'passed',
        priority: 'high',
        productId: 'prod-1',
        productName: 'Produto A',
        sku: 'SKU-001',
        batchNumber: 'BATCH-001',
        supplierId: 'sup-1',
        supplierName: 'Fornecedor ABC',
        quantity: 1000,
        sampleSize: 50,
        inspectorId: 'user-1',
        inspectorName: 'Maria Santos',
        scheduledDate: '2024-01-15T09:00:00Z',
        startedAt: '2024-01-15T09:15:00Z',
        completedAt: '2024-01-15T11:30:00Z',
        testResults: [
          {
            id: 'result-1',
            testId: 'test-1',
            testName: 'Teste de Dimensões',
            category: 'Físico',
            expectedValue: '10.0',
            actualValue: '9.98',
            unit: 'cm',
            tolerance: 0.1,
            result: 'pass',
            testedAt: '2024-01-15T10:00:00Z',
            testedBy: 'user-1',
          },
          {
            id: 'result-2',
            testId: 'test-2',
            testName: 'Teste de Resistência',
            category: 'Mecânico',
            expectedValue: '500',
            actualValue: '520',
            unit: 'N',
            tolerance: 50,
            result: 'pass',
            testedAt: '2024-01-15T10:30:00Z',
            testedBy: 'user-1',
          },
        ],
        defects: [
          {
            id: 'defect-1',
            type: 'Risco superficial',
            severity: 'minor',
            description: 'Pequenos riscos na superfície do produto',
            quantity: 2,
            location: 'Face frontal',
            images: [],
            correctionRequired: false,
          },
        ],
        overallScore: 95.5,
        passed: true,
        notes: 'Inspeção realizada conforme procedimento padrão',
        attachments: [],
        createdAt: '2024-01-14T16:00:00Z',
        updatedAt: '2024-01-15T11:30:00Z',
      };

      return {
        data: inspection,
        success: true,
        message: 'Inspeção carregada com sucesso',
      };
    },
    enabled: !!id,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    retry: 2,
    meta: {
      onError: () => {
        toast({
          title: 'Erro ao carregar inspeção',
          description: 'Não foi possível carregar os detalhes da inspeção.',
          variant: 'destructive',
        });
      },
    },
  });
}

/**
 * Hook para listar testes de qualidade disponíveis
 */
export function useQualityTests(params?: QueryParams) {
  const { toast } = useToast();

  return useQuery<ApiResponse<QualityTest[]>, Error>({
    queryKey: QUALITY_QUERY_KEYS.testsList(params),
    queryFn: async () => {
      // Simular dados de testes
      const tests: QualityTest[] = [
        {
          id: 'test-1',
          name: 'Teste de Dimensões',
          category: 'Físico',
          description: 'Verificação das dimensões do produto',
          procedure: 'Medir com paquímetro digital',
          expectedValue: '10.0',
          unit: 'cm',
          tolerance: 0.1,
          isActive: true,
          applicableProducts: ['prod-1', 'prod-2'],
        },
        {
          id: 'test-2',
          name: 'Teste de Resistência',
          category: 'Mecânico',
          description: 'Teste de resistência à tração',
          procedure: 'Aplicar força gradual até ruptura',
          expectedValue: '500',
          unit: 'N',
          tolerance: 50,
          isActive: true,
          applicableProducts: ['prod-1'],
        },
        {
          id: 'test-3',
          name: 'Teste de Cor',
          category: 'Visual',
          description: 'Verificação da cor conforme padrão',
          procedure: 'Comparar com amostra padrão',
          isActive: true,
          applicableProducts: ['prod-2'],
        },
      ];

      return {
        data: tests,
        success: true,
        message: 'Testes carregados com sucesso',
      };
    },
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    retry: 2,
    meta: {
      onError: () => {
        toast({
          title: 'Erro ao carregar testes',
          description: 'Não foi possível carregar os testes de qualidade.',
          variant: 'destructive',
        });
      },
    },
  });
}

/**
 * Hook para criar nova inspeção
 */
export function useCreateInspection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<QualityInspection>, Error, InspectionFormData>({
    mutationFn: async (inspectionData) => {
      // Simular criação de inspeção
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newInspection: QualityInspection = {
        id: `insp-${Date.now()}`,
        inspectionNumber: `QC-2024-${String(Date.now()).slice(-3)}`,
        type: inspectionData.type,
        status: 'pending',
        priority: inspectionData.priority,
        productId: inspectionData.productId,
        productName: 'Produto Selecionado',
        sku: 'SKU-XXX',
        batchNumber: inspectionData.batchNumber,
        supplierId: inspectionData.supplierId,
        supplierName: inspectionData.supplierId ? 'Fornecedor Selecionado' : undefined,
        quantity: inspectionData.quantity,
        sampleSize: inspectionData.sampleSize,
        inspectorId: 'current-user',
        inspectorName: 'Utilizador Atual',
        scheduledDate: inspectionData.scheduledDate,
        testResults: [],
        defects: [],
        overallScore: 0,
        passed: false,
        notes: inspectionData.notes,
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return {
        data: newInspection,
        success: true,
        message: 'Inspeção criada com sucesso',
      };
    },
    onSuccess: (response) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: QUALITY_QUERY_KEYS.inspections() });
      
      toast({
        title: 'Inspeção criada',
        description: `${response.data.inspectionNumber} foi criada com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar inspeção',
        description: error.message || 'Não foi possível criar a inspeção.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para iniciar inspeção
 */
export function useStartInspection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<QualityInspection>, Error, string>({
    mutationFn: async () => {
      // Simular início da inspeção
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        data: {} as QualityInspection,
        success: true,
        message: 'Inspeção iniciada com sucesso',
      };
    },
    onSuccess: () => {
      // Atualizar cache
      queryClient.invalidateQueries({ 
        queryKey: QUALITY_QUERY_KEYS.inspections() 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUALITY_QUERY_KEYS.inspections() 
      });
      
      toast({
        title: 'Inspeção iniciada',
        description: 'A inspeção foi iniciada com sucesso.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao iniciar inspeção',
        description: error.message || 'Não foi possível iniciar a inspeção.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para registrar resultado de teste
 */
export function useRecordTestResult() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<QualityTestResult>, Error, { inspectionId: string; result: TestResultData }>({
    mutationFn: async ({ inspectionId: _ }) => {
      // Simular registro de resultado
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        data: {} as QualityTestResult,
        success: true,
        message: 'Resultado registrado com sucesso',
      };
    },
    onSuccess: (_, { inspectionId }) => {
      // Atualizar cache da inspeção
      queryClient.invalidateQueries({ 
        queryKey: QUALITY_QUERY_KEYS.inspection(inspectionId) 
      });
      
      toast({
        title: 'Resultado registrado',
        description: 'O resultado do teste foi registrado.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao registrar resultado',
        description: error.message || 'Não foi possível registrar o resultado.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para registrar defeito
 */
export function useRecordDefect() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<QualityDefect>, Error, { inspectionId: string; defect: DefectData }>({
    mutationFn: async ({ inspectionId: _ }) => {
      // Simular registro de defeito
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        data: {} as QualityDefect,
        success: true,
        message: 'Defeito registrado com sucesso',
      };
    },
    onSuccess: (_, { inspectionId }) => {
      // Atualizar cache da inspeção
      queryClient.invalidateQueries({ 
        queryKey: QUALITY_QUERY_KEYS.inspection(inspectionId) 
      });
      
      toast({
        title: 'Defeito registrado',
        description: 'O defeito foi registrado na inspeção.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao registrar defeito',
        description: error.message || 'Não foi possível registrar o defeito.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para finalizar inspeção
 */
export function useCompleteInspection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<QualityInspection>, Error, string>({
    mutationFn: async (_inspectionId) => {
      // Simular finalização da inspeção
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        data: {} as QualityInspection,
        success: true,
        message: 'Inspeção finalizada com sucesso',
      };
    },
    onSuccess: () => {
      // Atualizar caches
      queryClient.invalidateQueries({ 
        queryKey: QUALITY_QUERY_KEYS.inspections() 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUALITY_QUERY_KEYS.inspections() 
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast({
        title: 'Inspeção finalizada',
        description: 'A inspeção foi finalizada com sucesso.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao finalizar inspeção',
        description: error.message || 'Não foi possível finalizar a inspeção.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para obter estatísticas de qualidade
 */
export function useQualityStatistics() {
  const { toast } = useToast();

  return useQuery<any, Error>({
    queryKey: QUALITY_QUERY_KEYS.statistics(),
    queryFn: async () => {
      // Simular estatísticas de qualidade
      return {
        totalInspections: 156,
        passedInspections: 142,
        failedInspections: 14,
        passRate: 91.0,
        averageScore: 94.2,
        topDefects: [
          { type: 'Risco superficial', count: 8 },
          { type: 'Dimensão incorreta', count: 5 },
          { type: 'Cor fora do padrão', count: 3 },
        ],
        monthlyTrend: [
          { month: 'Jan', passRate: 89.5 },
          { month: 'Fev', passRate: 91.2 },
          { month: 'Mar', passRate: 93.1 },
        ],
      };
    },
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    retry: 2,
    meta: {
      onError: (_error: Error) => {
        toast({
          title: 'Erro ao carregar estatísticas',
          description: 'Não foi possível carregar as estatísticas de qualidade.',
          variant: 'destructive',
        });
      },
    },
  });
}