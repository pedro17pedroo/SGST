import session from 'express-session';
import MongoStore from 'connect-mongo';
import { connectMongoDB } from '../database/mongodb';

/**
 * Configuração das sessões usando MongoDB
 */
export async function createSessionConfig(): Promise<session.SessionOptions> {
  // Conecta ao MongoDB para as sessões
  await connectMongoDB();
  
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/sgst_sessions';
  const sessionSecret = process.env.SESSION_SECRET || 'sgst-secret-key-change-in-production';
  
  return {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUrl,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 24 horas em segundos
      autoRemove: 'native'
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
      httpOnly: true, // Previne acesso via JavaScript
      maxAge: 24 * 60 * 60 * 1000, // 24 horas em milissegundos
      sameSite: 'strict' // Proteção CSRF
    },
    name: 'sgst.sid' // Nome personalizado do cookie
  };
}

/**
 * Middleware para inicializar as sessões
 */
export async function initializeSession() {
  const sessionConfig = await createSessionConfig();
  return session(sessionConfig);
}