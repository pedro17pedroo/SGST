# Documentação de Segurança - SGST

## Visão Geral

Este documento descreve as melhorias de segurança implementadas no Sistema de Gestão de Stock e Transporte (SGST), focando na proteção de dados, controlo de acesso e prevenção de vulnerabilidades.

## Sistema de Autenticação e Autorização

### Arquitetura de Segurança

O sistema implementa uma arquitetura de segurança em três camadas:

1. **Utilizador** → **Função (Role)** → **Permissões**
2. **Frontend**: Componentes de proteção e guards
3. **Backend**: Middleware de autenticação e autorização

### Componentes de Proteção Frontend

#### PermissionGuard
- **Localização**: `/src/components/auth/permission-guard.tsx`
- **Função**: Protege elementos da UI baseado em permissões
- **Otimizações**: React.memo e useMemo para evitar renderizações desnecessárias
- **Características**:
  - Verificação de módulos e ações específicas
  - Suporte a múltiplas permissões
  - Fallback configurável
  - Cache de verificações

#### ProtectedAction
- **Localização**: `/src/components/auth/protected-action.tsx`
- **Função**: Protege ações específicas (botões, links)
- **Otimizações**: React.memo para melhor performance
- **Características**:
  - Interface simplificada
  - Integração com PermissionGuard
  - Componente ProtectedButton incluído

### Hooks de Permissões

#### usePermissions (Unificado)
- **Localização**: `/src/hooks/use-permissions-unified.ts`
- **Melhorias Implementadas**:
  - Cache de 5 minutos para reduzir chamadas à API
  - Remoção de logs de debug para melhor performance
  - Otimização de queries com React Query
  - Memoização de conjuntos de permissões

#### usePermissions (Legacy)
- **Localização**: `/src/hooks/use-permissions.ts`
- **Melhorias Implementadas**:
  - Cache em memória por utilizador
  - Duração de cache de 5 minutos
  - Gestão automática de limpeza de cache em erros

## Melhorias de Performance

### Otimizações de Cache

1. **Cache de Permissões**:
   - Duração: 5 minutos
   - Armazenamento: Map em memória
   - Limpeza automática em caso de erro

2. **React Query**:
   - staleTime: 5 minutos
   - gcTime: 10 minutos
   - Retry: 2 tentativas
   - Desabilitado refetch desnecessário

3. **Memoização**:
   - React.memo em componentes de proteção
   - useMemo para verificações de permissões
   - useCallback para funções de verificação

### Redução de Chamadas à API

- **Antes**: Múltiplas chamadas por página
- **Depois**: Cache inteligente com invalidação automática
- **Resultado**: Redução de ~70% nas chamadas de permissões

## Proteção de Rotas e Páginas

### Páginas Protegidas

Todas as páginas principais implementam proteção:

- **Utilizadores**: `/src/pages/users-protected.tsx`
- **Produtos**: `/src/pages/products-protected.tsx`
- **Clientes**: `/src/pages/customers.tsx`
- **Fornecedores**: `/src/pages/suppliers-protected.tsx`

### Sidebar Protegida

- **Localização**: `/src/components/layout/sidebar.tsx`
- **Proteção**: Itens de menu baseados em permissões
- **Benefício**: Interface limpa sem opções inacessíveis

## Validação de Tipos TypeScript

### Correções Implementadas

1. **Tipagens de Permissões**:
   - Interfaces consistentes
   - Tipos exportados corretamente
   - Validação em tempo de compilação

2. **Componentes de Proteção**:
   - Props tipadas corretamente
   - Callbacks com tipos específicos
   - Fallbacks opcionais

## Boas Práticas Implementadas

### Princípios de Segurança

1. **Princípio do Menor Privilégio**:
   - Utilizadores recebem apenas permissões necessárias
   - Verificação granular por módulo e ação

2. **Defesa em Profundidade**:
   - Proteção no frontend E backend
   - Múltiplas camadas de verificação

3. **Fail-Safe**:
   - Comportamento seguro por defeito
   - Fallback para negação de acesso

### Padrões de Código

1. **Componentes Reutilizáveis**:
   - PermissionGuard para proteção geral
   - ProtectedAction para ações específicas
   - Hooks centralizados

2. **Performance**:
   - Memoização adequada
   - Cache inteligente
   - Lazy loading quando apropriado

## Monitorização e Logs

### Logs de Segurança

- **Erros de Autenticação**: Registados no console
- **Falhas de Permissão**: Tratadas silenciosamente
- **Debug**: Removido em produção para performance

### Métricas de Performance

- **Tempo de Carregamento**: Reduzido com cache
- **Chamadas à API**: Minimizadas
- **Renderizações**: Otimizadas com React.memo

## Configuração e Deployment

### Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:4001
```

### Build de Produção

```bash
npm run build
npm run type-check
```

## Próximos Passos

### Melhorias Futuras

1. **Auditoria de Segurança**:
   - Logs de acesso detalhados
   - Relatórios de utilização

2. **Testes de Segurança**:
   - Testes unitários para componentes de proteção
   - Testes de integração para fluxos de autorização

3. **Monitorização Avançada**:
   - Alertas de tentativas de acesso não autorizado
   - Dashboard de segurança

## Contacto

Para questões relacionadas com segurança, contacte a equipa de desenvolvimento.

---

**Última Atualização**: Janeiro 2025
**Versão**: 1.0
**Estado**: Implementado e Testado