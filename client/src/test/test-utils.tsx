/**
 * Utilitários para testes
 * Fornece wrappers e mocks para facilitar o testing dos hooks e componentes
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock do apiRequest
export const mockApiRequest = jest.fn();

// Criar um QueryClient para testes
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Wrapper para testes com React Query
interface AllTheProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

const AllTheProviders = ({ children, queryClient }: AllTheProvidersProps) => {
  const testQueryClient = queryClient || createTestQueryClient();
  
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Função customizada de render
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { queryClient, ...renderOptions } = options;
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders queryClient={queryClient}>{children}</AllTheProviders>
  );
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Função para criar mocks de resposta da API
export const createApiResponse = <T,>(data: T, success = true) => ({
  data,
  success,
  message: success ? 'Sucesso' : 'Erro',
});

// Função para criar mocks de resposta paginada
export const createPaginatedResponse = <T,>(data: T[], page = 1, limit = 10) => ({
  data,
  success: true,
  message: 'Sucesso',
  pagination: {
    page,
    limit,
    total: data.length,
    totalPages: Math.ceil(data.length / limit),
  },
});

// Função para aguardar que todas as promises sejam resolvidas
export const waitForPromises = () => new Promise(resolve => setTimeout(resolve, 0));

// Função para limpar mocks
export const clearAllMocks = () => {
  jest.clearAllMocks();
  mockApiRequest.mockClear();
};

// Função para configurar mock de sucesso
export const mockApiSuccess = <T,>(data: T) => {
  mockApiRequest.mockResolvedValueOnce(createApiResponse(data));
};

// Função para configurar mock de erro
export const mockApiError = (message = 'Erro na API') => {
  mockApiRequest.mockRejectedValueOnce(new Error(message));
};

// Função para configurar mock de resposta paginada
export const mockApiPaginatedSuccess = <T,>(data: T[], page = 1, limit = 10) => {
  mockApiRequest.mockResolvedValueOnce(createPaginatedResponse(data, page, limit));
};

// Função para criar wrapper para hooks
export const createWrapper = (queryClient?: QueryClient) => {
  const testQueryClient = queryClient || createTestQueryClient();
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Re-exportar tudo do testing-library
export * from '@testing-library/react';
export { customRender as render };