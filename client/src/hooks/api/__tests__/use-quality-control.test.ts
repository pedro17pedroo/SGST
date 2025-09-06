/**
 * Testes para hooks de controle de qualidade
 */

// import { renderHook } from '@testing-library/react'; // Removed unused import
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Removed unused import
// import React, { ReactNode } from 'react'; // Removed unused import

// Mocks
const mockQueryClient = {
  invalidateQueries: jest.fn(),
  setQueryData: jest.fn(),
  getQueryData: jest.fn(),
};

const mockApiServices = {
  qualityControl: {
    getInspections: jest.fn(),
    getInspection: jest.fn(),
    getTests: jest.fn(),
    createInspection: jest.fn(),
    startInspection: jest.fn(),
    recordTestResult: jest.fn(),
    recordDefect: jest.fn(),
    completeInspection: jest.fn(),
    getStatistics: jest.fn(),
  },
};

const mockCacheConfig = {
  staleTime: 5 * 60 * 1000,
  cacheTime: 10 * 60 * 1000,
};

const mockRetryConfig = {
  retry: 3,
  retryDelay: 1000,
};

const mockUseToast = jest.fn(() => ({
  toast: jest.fn(),
}));

jest.mock('../../services/api.service', () => ({
  apiServices: mockApiServices,
}));

jest.mock('../../config/api', () => ({
  CACHE_CONFIG: mockCacheConfig,
  RETRY_CONFIG: mockRetryConfig,
}));

jest.mock('../use-toast', () => ({
  useToast: mockUseToast,
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(() => mockQueryClient),
}));

// Importações dos hooks
import {
  useQualityInspections,
  useQualityInspection,
  useQualityTests,
  useCreateInspection,
  useStartInspection,
  useRecordTestResult,
  useRecordDefect,
  useCompleteInspection,
  useQualityStatistics,
  QUALITY_QUERY_KEYS,
  type QualityInspection,
  type QualityTestResult,
  type QualityDefect,
  type QualityTest,
  type InspectionFormData,
  type TestResultData,
  type DefectData,
} from '../use-quality-control';

// Wrapper para testes
// const createWrapper = () => {
//   const queryClient = new QueryClient({
//     defaultOptions: {
//       queries: {
//         retry: false,
//       },
//       mutations: {
//         retry: false,
//       },
//     },
//   });

//   return ({ children }: { children: ReactNode }) => 
//     React.createElement(QueryClientProvider, { client: queryClient }, children);
// }; // Removed unused function

describe('use-quality-control hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook imports', () => {
    it('should import all quality control hooks', () => {
      expect(useQualityInspections).toBeDefined();
      expect(useQualityInspection).toBeDefined();
      expect(useQualityTests).toBeDefined();
      expect(useCreateInspection).toBeDefined();
      expect(useStartInspection).toBeDefined();
      expect(useRecordTestResult).toBeDefined();
      expect(useRecordDefect).toBeDefined();
      expect(useCompleteInspection).toBeDefined();
      expect(useQualityStatistics).toBeDefined();
    });
  });

  describe('Query keys', () => {
    it('should define QUALITY_QUERY_KEYS correctly', () => {
      expect(QUALITY_QUERY_KEYS.all).toEqual(['quality-control']);
      expect(QUALITY_QUERY_KEYS.inspections()).toEqual(['quality-control', 'inspections']);
      expect(QUALITY_QUERY_KEYS.inspection('123')).toEqual(['quality-control', 'inspections', '123']);
      expect(QUALITY_QUERY_KEYS.tests()).toEqual(['quality-control', 'tests']);
      expect(QUALITY_QUERY_KEYS.statistics()).toEqual(['quality-control', 'statistics']);
      expect(QUALITY_QUERY_KEYS.reports()).toEqual(['quality-control', 'reports']);
    });
  });

  describe('Type exports', () => {
    it('should export all quality control types', () => {
      // Verificar se os tipos estão disponíveis (TypeScript compilation check)
      const inspection: QualityInspection = {} as QualityInspection;
      const testResult: QualityTestResult = {} as QualityTestResult;
      const defect: QualityDefect = {} as QualityDefect;
      const test: QualityTest = {} as QualityTest;
      const formData: InspectionFormData = {} as InspectionFormData;
      const testResultData: TestResultData = {} as TestResultData;
      const defectData: DefectData = {} as DefectData;

      expect(inspection).toBeDefined();
      expect(testResult).toBeDefined();
      expect(defect).toBeDefined();
      expect(test).toBeDefined();
      expect(formData).toBeDefined();
      expect(testResultData).toBeDefined();
      expect(defectData).toBeDefined();
    });
  });
});