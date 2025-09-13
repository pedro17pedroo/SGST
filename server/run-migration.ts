import { db } from './database/db';
import fs from 'fs';

async function runMigration() {
  try {
    console.log('🚀 Iniciando migração da tabela vehicles...');
    
    const sql = fs.readFileSync('./database/migrations/fix_vehicles_table_structure.sql', 'utf8');
    
    // Dividir o SQL em statements individuais
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('USE'));
    
    console.log(`📝 Encontrados ${statements.length} statements para executar`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executando statement ${i + 1}/${statements.length}:`);
        console.log(statement.substring(0, 100) + '...');
        
        try {
          await db.execute(statement);
          console.log('✅ Statement executado com sucesso');
        } catch (error) {
          console.error(`❌ Erro no statement ${i + 1}:`, error);
          // Continuar com os próximos statements mesmo se um falhar
        }
      }
    }
    
    console.log('🎉 Migração concluída!');
    
    // Verificar a estrutura final da tabela
    console.log('\n📋 Verificando estrutura final da tabela vehicles:');
    const result = await db.execute('DESCRIBE vehicles');
    console.log(result);
    
  } catch (error) {
    console.error('💥 Erro geral na migração:', error);
  }
}

runMigration();