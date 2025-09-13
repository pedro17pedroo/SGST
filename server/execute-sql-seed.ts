import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Script para executar SQL direto no banco de dados
 * Cria e popula as tabelas vehicle_types e fuel_types
 */
async function executeSqlSeed() {
  let connection;
  
  try {
    console.log('🔌 Conectando ao banco de dados...');
    
    // Criar conexão com o banco de dados usando DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL não encontrada no arquivo .env');
    }
    
    // Parse da URL do banco de dados
    const url = new URL(databaseUrl);
    
    connection = await mysql.createConnection({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove a barra inicial
      port: parseInt(url.port || '3306'),
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('✅ Conectado ao banco de dados!');
    
    // Ler o arquivo SQL
    const sqlFilePath = path.join(__dirname, 'create-and-seed-tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 Executando script SQL...');
    
    // Dividir o SQL em comandos individuais
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    // Executar cada comando
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      if (command.trim()) {
        try {
          console.log(`🔄 Executando comando ${i + 1}/${sqlCommands.length}: ${command.substring(0, 80)}...`);
          const [results] = await connection.execute(command);
          
          // Se for um SELECT, mostrar os resultados
          if (command.trim().toUpperCase().startsWith('SELECT')) {
            console.log('📊 Resultados:', results);
          } else {
            console.log(`✅ Comando ${i + 1} executado com sucesso`);
          }
        } catch (error) {
          console.error(`❌ Erro ao executar comando ${i + 1}: ${command.substring(0, 50)}...`);
          console.error('Erro:', error instanceof Error ? error.message : String(error));
          // Continuar com os próximos comandos mesmo se um falhar
        }
      }
    }
    
    console.log('🎉 Script SQL executado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a execução:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada.');
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  executeSqlSeed()
    .then(() => {
      console.log('✅ Processo concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Falha no processo:', error);
      process.exit(1);
    });
}

export { executeSqlSeed };