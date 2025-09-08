import dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Criar pool de conexões MySQL com configurações otimizadas para evitar timeouts e ECONNRESET
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 3,
  idleTimeout: 30000,
  queueLimit: 0,
  // Configurações para lidar com ECONNRESET
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // SSL configuração segura
  ssl: {
    rejectUnauthorized: false
  }
});
export const db = drizzle(pool, { schema, mode: 'default' });

// Wrapper para retry automático em queries
export async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      if (error.code === 'ECONNRESET' && attempt < maxRetries) {
        console.warn(`🔄 Tentativa ${attempt}/${maxRetries} - Erro ECONNRESET, tentando novamente...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Máximo de tentativas excedido');
}

// Função para testar a conexão com retry logic
export async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      console.log('✅ Conexão MySQL estabelecida com sucesso');
      return true;
    } catch (error: any) {
      console.error(`❌ Tentativa ${i + 1}/${retries} - Erro na conexão MySQL:`, error.message);
      if (i === retries - 1) {
        console.error('❌ Falha ao conectar após todas as tentativas');
        return false;
      }
      // Aguardar antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
  return false;
}

// Função para fechar o pool de conexões
export async function closeConnection() {
  try {
    await pool.end();
    console.log('✅ Pool de conexões MySQL fechado');
  } catch (error) {
    console.error('❌ Erro ao fechar pool MySQL:', error);
  }
}