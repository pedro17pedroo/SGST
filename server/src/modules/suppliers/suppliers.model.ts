// Interface para filtros de fornecedores
export interface SupplierFilters {
  search?: string;
  email?: string;
  phone?: string;
  sortBy?: 'name' | 'email' | 'phone' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Interface para resposta com paginação
export interface SuppliersWithPagination {
  suppliers: Array<{
    id: string;
    name: string;
    address: string | null;
    createdAt: Date | null;
    email: string | null;
    phone: string | null;
  }>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Dados simulados de fornecedores
const mockSuppliers: Array<{
  id: string;
  name: string;
  address: string | null;
  createdAt: Date | null;
  email: string | null;
  phone: string | null;
}> = [
  {
    id: '1',
    name: 'Cervejaria Cuca',
    email: 'comercial@cuca.ao',
    phone: '+244 222 123 456',
    address: 'Rua Rainha Ginga, 123, Luanda, Angola',
     createdAt: new Date('2023-01-15')
  },
  {
    id: '2',
    name: 'Refriango - Refrigerantes de Angola',
    email: 'vendas@refriango.ao',
    phone: '+244 222 234 567',
    address: 'Zona Industrial de Viana, Luanda, Angola',
     createdAt: new Date('2023-02-20')
  },
  {
    id: '3',
    name: 'Águas de Angola',
    email: 'comercial@aguasangola.ao',
    phone: '+244 222 345 678',
    address: 'Estrada de Catete, Km 15, Luanda, Angola',
     createdAt: new Date('2023-03-10')
  },
  {
    id: '4',
    name: 'Vinhos Africanos Lda',
    email: 'info@vinhosafricanos.ao',
    phone: '+244 222 456 789',
    address: 'Rua Amílcar Cabral, 45, Luanda, Angola',
     createdAt: new Date('2023-04-05')
  },
  {
    id: '5',
    name: 'Destilaria Lda',
    email: 'vendas@destilaria.ao',
    phone: '+244 222 567 890',
    address: 'Zona Industrial do Cacuaco, Luanda, Angola',
     createdAt: new Date('2023-05-12')
  },
  {
    id: '6',
    name: 'Coca-Cola Angola',
    email: 'comercial@cocacola.ao',
    phone: '+244 222 678 901',
    address: 'Rua Comandante Che Guevara, 78, Luanda, Angola',
     createdAt: new Date('2023-06-18')
  },
  {
    id: '7',
    name: 'Sumos Tropicais',
    email: 'info@sumostropicais.ao',
    phone: '+244 222 789 012',
    address: 'Estrada de Benguela, Km 8, Luanda, Angola',
     createdAt: new Date('2023-07-25')
  }
];

export class SuppliersModel {
  async getSuppliersWithFilters(
    page: number = 1,
    limit: number = 10,
    filters: SupplierFilters = {}
  ): Promise<SuppliersWithPagination> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Aplicar filtros
    let filteredSuppliers = mockSuppliers.filter(supplier => {
      // Se há filtro de busca, aplicar
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return supplier.name.toLowerCase().includes(searchLower) ||
               (supplier.email && supplier.email.toLowerCase().includes(searchLower)) ||
               (supplier.phone && supplier.phone.toLowerCase().includes(searchLower));
      }
      
      // Se há filtro de email específico, aplicar
      if (filters.email && supplier.email) {
        return supplier.email.toLowerCase().includes(filters.email.toLowerCase());
      }
      
      // Se há filtro de telefone específico, aplicar
      if (filters.phone && supplier.phone) {
        return supplier.phone.toLowerCase().includes(filters.phone.toLowerCase());
      }
      
      // Se não há filtros específicos, retornar todos
      return true;
    });

    // Aplicar ordenação
    if (filters.sortBy) {
      filteredSuppliers.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'email':
            aValue = a.email || '';
            bValue = b.email || '';
            break;
          case 'phone':
            aValue = a.phone || '';
            bValue = b.phone || '';
            break;
          case 'createdAt':
            aValue = a.createdAt;
            bValue = b.createdAt;
            break;
          case 'name':
          default:
            aValue = a.name;
            bValue = b.name;
            break;
        }

        if (filters.sortOrder === 'desc') {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    }

    // Calcular paginação
    const totalCount = filteredSuppliers.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);

    return {
      suppliers: paginatedSuppliers,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }

  async getSupplierById(id: string) {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockSuppliers.find(supplier => supplier.id === id) || null;
  }

  async createSupplier(data: { name: string; email?: string; phone?: string; address?: string }): Promise<{
    id: string;
    name: string;
    address: string | null;
    createdAt: Date | null;
    email: string | null;
    phone: string | null;
  }> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newSupplier = {
      id: (mockSuppliers.length + 1).toString(),
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      createdAt: new Date()
    };
    mockSuppliers.push(newSupplier);
    return newSupplier;
  }

  async updateSupplier(id: string, data: Partial<{ name: string; email: string; phone: string; address: string }>) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockSuppliers.findIndex(supplier => supplier.id === id);
    if (index === -1) return null;
    
    mockSuppliers[index] = { ...mockSuppliers[index], ...data };
    return mockSuppliers[index];
  }

  async deleteSupplier(id: string) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockSuppliers.findIndex(supplier => supplier.id === id);
    if (index === -1) return null;
    
    const deletedSupplier = mockSuppliers[index];
    mockSuppliers.splice(index, 1);
    return deletedSupplier;
  }
}