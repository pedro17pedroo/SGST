#!/usr/bin/env tsx

import axios from 'axios';

const API_BASE = 'http://localhost:4001';

// Configurar axios para incluir cookies de sessão
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testRolesAPI() {
  try {
    console.log('🔍 Testando API de Roles e Permissions...\n');

    // 1. Fazer login primeiro
    console.log('1. Fazendo login...');
    const loginResponse = await api.post('/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    console.log('✅ Login realizado:', loginResponse.data);

    // 2. Testar endpoint de roles
    console.log('\n2. Testando GET /api/roles...');
    try {
      const rolesResponse = await api.get('/api/roles');
      console.log('✅ Roles encontrados:', rolesResponse.data);
      console.log('📊 Total de roles:', rolesResponse.data.length);
    } catch (error: any) {
      console.log('❌ Erro ao buscar roles:', error.response?.data || error.message);
    }

    // 3. Testar endpoint de permissions
    console.log('\n3. Testando GET /api/permissions...');
    try {
      const permissionsResponse = await api.get('/api/permissions');
      console.log('✅ Permissions encontradas:', permissionsResponse.data);
      console.log('📊 Total de permissions:', permissionsResponse.data.length);
    } catch (error: any) {
      console.log('❌ Erro ao buscar permissions:', error.response?.data || error.message);
    }

    // 4. Testar criação de role
    console.log('\n4. Testando criação de role...');
    try {
      const newRole = {
        name: 'Teste Role',
        description: 'Role criada para teste'
      };
      const createRoleResponse = await api.post('/api/roles', newRole);
      console.log('✅ Role criada:', createRoleResponse.data);
    } catch (error: any) {
      console.log('❌ Erro ao criar role:', error.response?.data || error.message);
    }

    // 5. Testar seed de permissions
    console.log('\n5. Testando seed de permissions...');
    try {
      const seedResponse = await api.post('/api/permissions/seed');
      console.log('✅ Seed de permissions:', seedResponse.data);
    } catch (error: any) {
      console.log('❌ Erro no seed de permissions:', error.response?.data || error.message);
    }

    // 6. Verificar novamente as permissions após seed
    console.log('\n6. Verificando permissions após seed...');
    try {
      const permissionsAfterSeed = await api.get('/api/permissions');
      console.log('✅ Permissions após seed:', permissionsAfterSeed.data);
      console.log('📊 Total de permissions após seed:', permissionsAfterSeed.data.length);
    } catch (error: any) {
      console.log('❌ Erro ao buscar permissions após seed:', error.response?.data || error.message);
    }

  } catch (error: any) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

testRolesAPI();