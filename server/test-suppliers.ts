import { db } from "./database/db";
import { suppliers } from "@shared/schema";
import { like, or, sql } from "drizzle-orm";

async function testSuppliers() {
  try {
    console.log('🔍 Testando consulta de fornecedores...');
    
    // Teste 1: Buscar todos os fornecedores
    console.log('\n1. Buscando todos os fornecedores:');
    const allSuppliers = await db.select().from(suppliers).limit(5);
    console.log(`Encontrados ${allSuppliers.length} fornecedores:`, allSuppliers);
    
    // Teste 2: Buscar com filtro de pesquisa
    console.log('\n2. Testando busca com filtro "re":');
    const searchResults = await db
      .select()
      .from(suppliers)
      .where(
        or(
          like(suppliers.name, '%re%'),
          like(suppliers.email, '%re%')
        )
      )
      .limit(10);
    console.log(`Encontrados ${searchResults.length} fornecedores com "re":`, searchResults);
    
    // Teste 3: Verificar estrutura da tabela
    console.log('\n3. Verificando estrutura da tabela suppliers:');
    const tableInfo = await db.execute(sql`DESCRIBE suppliers`);
    console.log('Estrutura da tabela:', tableInfo);
    
    console.log('\n✅ Testes de fornecedores concluídos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao testar fornecedores:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'Stack trace não disponível');
  } finally {
    process.exit(0);
  }
}

testSuppliers();