/**
 * Testes para hooks de funções e permissões
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mocks
jest.mock('../../../lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  }
}));

jest.mock('../../../services/api.service', () => ({
  apiServices: {
    roles: {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    permissions: {
      getAll: jest.fn(),
    },
    userRoles: {
      getByUserId: jest.fn(),
      assign: jest.fn(),
    }
  }
}));

jest.mock('../../../config/api', () => ({
  CACHE_CONFIG: {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  }
}));

jest.mock('../../use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
    dismiss: jest.fn(),
  })
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: undefined, isLoading: false })),
  useMutation: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
  }))
}));

// Importações dos hooks e tipos
import {
  useRoles,
  useRole,
  useSystemPermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useUserRoles,
  useAssignRoles,
  useHasPermission,
  useHasRole,
  ROLES_QUERY_KEYS,
  type Role,
  type Permission,
  type RoleFormData,
  type UserRole,
  type AssignRoleData
} from '../use-roles';

describe('Hooks de Funções e Permissões', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve importar os hooks sem erros', () => {
    expect(useRoles).toBeDefined();
    expect(useRole).toBeDefined();
    expect(useSystemPermissions).toBeDefined();
    expect(useCreateRole).toBeDefined();
    expect(useUpdateRole).toBeDefined();
    expect(useDeleteRole).toBeDefined();
    expect(useUserRoles).toBeDefined();
    expect(useAssignRoles).toBeDefined();
    expect(useHasPermission).toBeDefined();
    expect(useHasRole).toBeDefined();
  });

  it('deve ter as chaves de query definidas corretamente', () => {
    expect(ROLES_QUERY_KEYS.all).toEqual(['roles']);
    expect(ROLES_QUERY_KEYS.lists()).toEqual(['roles', 'list']);
    expect(ROLES_QUERY_KEYS.list({ page: 1 })).toEqual(['roles', 'list', { page: 1 }]);
    expect(ROLES_QUERY_KEYS.details()).toEqual(['roles', 'detail']);
    expect(ROLES_QUERY_KEYS.detail('role-1')).toEqual(['roles', 'detail', 'role-1']);
    expect(ROLES_QUERY_KEYS.permissions()).toEqual(['permissions']);
    expect(ROLES_QUERY_KEYS.userRoles()).toEqual(['user-roles']);
    expect(ROLES_QUERY_KEYS.userRole('user-1')).toEqual(['user-roles', 'user-1']);
  });

  it('deve exportar as interfaces de tipos', () => {
    // Verificar se os tipos estão disponíveis (TypeScript compilation check)
    const role: Role = {
      id: 'role-1',
      name: 'Admin',
      description: 'Administrator role',
      permissions: [],
      isSystem: false,
      userCount: 5,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    const permission: Permission = {
      id: 'perm-1',
      name: 'read_users',
      resource: 'users',
      action: 'read',
      description: 'Read users permission',
      category: 'user_management'
    };

    const roleFormData: RoleFormData = {
      name: 'New Role',
      description: 'A new role',
      permissionIds: ['perm-1', 'perm-2']
    };

    const userRole: UserRole = {
      userId: 'user-1',
      userName: 'John Doe',
      email: 'john@example.com',
      roles: [role],
      isActive: true,
      lastLogin: '2024-01-01T00:00:00Z'
    };

    const assignRoleData: AssignRoleData = {
      userId: 'user-1',
      roleIds: ['role-1', 'role-2']
    };

    expect(role).toBeDefined();
    expect(permission).toBeDefined();
    expect(roleFormData).toBeDefined();
    expect(userRole).toBeDefined();
    expect(assignRoleData).toBeDefined();
  });
});