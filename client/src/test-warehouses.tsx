import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Warehouse {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
}

export function TestWarehouses() {
  // TestWarehouses component rendered
  
  const { data: warehouses, isLoading, error } = useQuery<Warehouse[]>({
    queryKey: ['test-warehouses'],
    queryFn: async () => {
      // Executando query de teste para armazéns...
      const response = await apiRequest('GET', '/api/warehouses');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      // Resultado da query de teste
      
      return result.data || result;
    },
    staleTime: 0,
    gcTime: 0,
    retry: false
  });
  
  // Estado da query
  
  return (
    <div style={{ padding: '20px', border: '2px solid red', margin: '10px' }}>
      <h3>Teste de Armazéns</h3>
      <p>Loading: {isLoading ? 'Sim' : 'Não'}</p>
      <p>Error: {error ? String(error) : 'Nenhum'}</p>
      <p>Warehouses: {warehouses ? warehouses.length : 0}</p>
      {warehouses && (
        <ul>
          {warehouses.map((w) => (
            <li key={w.id}>{w.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}