import { MongoClient, Db } from 'mongodb';

// Configuração do MongoDB para sessões e logs
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sgst_sessions';

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Conecta ao MongoDB
 */
export async function connectMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    // Extrai o nome da base de dados da URI
    const dbName = MONGODB_URI.split('/').pop()?.split('?')[0] || 'sgst_sessions';
    db = client.db(dbName);
    
    console.log('✅ Conectado ao MongoDB com sucesso');
    return db;
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    throw error;
  }
}

/**
 * Testa a conexão com o MongoDB
 */
export async function testMongoConnection(): Promise<boolean> {
  try {
    const database = await connectMongoDB();
    await database.admin().ping();
    console.log('✅ Teste de conexão MongoDB bem-sucedido');
    return true;
  } catch (error) {
    console.error('❌ Falha no teste de conexão MongoDB:', error);
    return false;
  }
}

/**
 * Fecha a conexão com o MongoDB
 */
export async function closeMongoConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 Conexão MongoDB fechada');
  }
}

/**
 * Obtém a instância da base de dados MongoDB
 */
export function getMongoDb(): Db | null {
  return db;
}

/**
 * Configuração das coleções
 */
export const COLLECTIONS = {
  SESSIONS: 'sessions',
  LOGS: 'logs',
  AUDIT_LOGS: 'audit_logs'
} as const;

/**
 * Interface para logs do sistema
 */
export interface SystemLog {
  _id?: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  module?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Interface para logs de auditoria
 */
export interface AuditLog {
  _id?: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Função para registar logs do sistema
 */
export async function logSystem(log: Omit<SystemLog, '_id' | 'timestamp'>): Promise<void> {
  try {
    const database = await connectMongoDB();
    const collection = database.collection<SystemLog>(COLLECTIONS.LOGS);
    
    await collection.insertOne({
      ...log,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Erro ao registar log do sistema:', error);
  }
}

/**
 * Função para registar logs de auditoria
 */
export async function logAudit(log: Omit<AuditLog, '_id' | 'timestamp'>): Promise<void> {
  try {
    const database = await connectMongoDB();
    const collection = database.collection<AuditLog>(COLLECTIONS.AUDIT_LOGS);
    
    await collection.insertOne({
      ...log,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Erro ao registar log de auditoria:', error);
  }
}