import session from 'express-session';
import { Sequelize } from 'sequelize';
import connectSessionSequelize from 'connect-session-sequelize';
import path from 'path';

// Criar o SequelizeStore
const SequelizeStore = connectSessionSequelize(session.Store);

// Configurar Sequelize para SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(process.cwd(), 'database', 'sessions.db'),
  logging: false, // Desabilitar logs SQL
});

// Criar o store de sessões
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'sessions',
  checkExpirationInterval: 15 * 60 * 1000, // Verificar expiração a cada 15 minutos
  expiration: 24 * 60 * 60 * 1000, // Sessões expiram em 24 horas
});

// Sincronizar a tabela de sessões
sessionStore.sync();

export { sessionStore, sequelize };

// Configuração de sessão para produção
export const getSessionConfig = (isProduction: boolean) => {
  const sessionSecret = process.env.SESSION_SECRET || 'sgst-development-secret-key';
  
  return {
    store: sessionStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: 'sgst-session',
    cookie: {
      secure: isProduction, // Apenas HTTPS em produção
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      sameSite: isProduction ? 'none' as const : 'lax' as const, // 'none' para cross-origin em produção
      domain: isProduction ? undefined : undefined // Deixar undefined para funcionar com subdomínios
    },
    rolling: true // Reset expiry on each request
  };
};