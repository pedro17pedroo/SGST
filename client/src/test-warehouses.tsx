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
  console.log('🧪 TestWarehouses component rendered');
  
  const { data: warehouses, isLoading, error } = useQuery<Warehouse[]>({
    queryKey: ['test-warehouses'],
    queryFn: async () => {
      console.log('🧪 Executando query de teste para armazéns...');
      const response = await apiRequest('GET', '/api/warehouses');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🧪 Resultado da query de teste:', result);
      
      return result.data || result;
    },
    staleTime: 0,
    gcTime: 0,
    retry: false
  });
  
  console.log('🧪 Estado da query:', { warehouses, isLoading, error });
  
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