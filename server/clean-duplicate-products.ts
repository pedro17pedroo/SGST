import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

interface DuplicateProduct {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  created_at: Date;
}

async function cleanDuplicateProducts() {
  const connection = await mysql2.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔍 Conectado ao banco de dados');
    
    // Encontrar produtos duplicados por SKU
    console.log('\n📋 Procurando produtos duplicados por SKU...');
    const [duplicateSkuRows] = await connection.execute(`
      SELECT sku, COUNT(*) as count, GROUP_CONCAT(id) as ids
      FROM products 
      WHERE sku IS NOT NULL 
      GROUP BY sku 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    const duplicateSkus = duplicateSkuRows as any[];
    console.log(`Encontrados ${duplicateSkus.length} SKUs duplicados`);
    
    for (const duplicate of duplicateSkus) {
      console.log(`\n🔄 Processando SKU duplicado: ${duplicate.sku} (${duplicate.count} produtos)`);
      const ids = duplicate.ids.split(',');
      
      // Manter apenas o primeiro produto (mais antigo)
      const [productDetails] = await connection.execute(`
        SELECT id, name, sku, barcode, created_at 
        FROM products 
        WHERE id IN (${ids.map(() => '?').join(',')}) 
        ORDER BY created_at ASC
      `, ids);
      
      const products = productDetails as DuplicateProduct[];
      const keepProduct = products[0];
      const deleteProducts = products.slice(1);
      
      console.log(`   ✅ Mantendo: ${keepProduct.name} (ID: ${keepProduct.id})`);
      
      for (const product of deleteProducts) {
        console.log(`   🗑️  Removendo: ${product.name} (ID: ${product.id})`);
        await connection.execute('DELETE FROM products WHERE id = ?', [product.id]);
      }
    }
    
    // Encontrar produtos duplicados por código de barras
    console.log('\n📋 Procurando produtos duplicados por código de barras...');
    const [duplicateBarcodeRows] = await connection.execute(`
      SELECT barcode, COUNT(*) as count, GROUP_CONCAT(id) as ids
      FROM products 
      WHERE barcode IS NOT NULL AND barcode != '' 
      GROUP BY barcode 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    const duplicateBarcodes = duplicateBarcodeRows as any[];
    console.log(`Encontrados ${duplicateBarcodes.length} códigos de barras duplicados`);
    
    for (const duplicate of duplicateBarcodes) {
      console.log(`\n🔄 Processando código de barras duplicado: ${duplicate.barcode} (${duplicate.count} produtos)`);
      const ids = duplicate.ids.split(',');
      
      // Manter apenas o primeiro produto (mais antigo)
      const [productDetails] = await connection.execute(`
        SELECT id, name, sku, barcode, created_at 
        FROM products 
        WHERE id IN (${ids.map(() => '?').join(',')}) 
        ORDER BY created_at ASC
      `, ids);
      
      const products = productDetails as DuplicateProduct[];
      const keepProduct = products[0];
      const deleteProducts = products.slice(1);
      
      console.log(`   ✅ Mantendo: ${keepProduct.name} (ID: ${keepProduct.id})`);
      
      for (const product of deleteProducts) {
        console.log(`   🗑️  Removendo: ${product.name} (ID: ${product.id})`);
        await connection.execute('DELETE FROM products WHERE id = ?', [product.id]);
      }
    }
    
    // Verificar produtos de teste específicos
    console.log('\n📋 Procurando produtos de teste específicos...');
    const [testProducts] = await connection.execute(`
      SELECT id, name, sku, barcode 
      FROM products 
      WHERE sku LIKE 'TESTE-%' OR name LIKE '%Teste%' OR name LIKE '%TEST%'
      ORDER BY created_at DESC
    `);
    
    const testProductsList = testProducts as DuplicateProduct[];
    console.log(`Encontrados ${testProductsList.length} produtos de teste`);
    
    if (testProductsList.length > 0) {
      console.log('\n🧹 Removendo produtos de teste...');
      for (const product of testProductsList) {
        console.log(`   🗑️  Removendo produto de teste: ${product.name} (SKU: ${product.sku})`);
        await connection.execute('DELETE FROM products WHERE id = ?', [product.id]);
      }
    }
    
    // Estatísticas finais
    console.log('\n📊 Estatísticas finais:');
    const [finalCount] = await connection.execute('SELECT COUNT(*) as total FROM products');
    const total = (finalCount as any[])[0].total;
    console.log(`Total de produtos restantes: ${total}`);
    
    const [uniqueSkus] = await connection.execute('SELECT COUNT(DISTINCT sku) as unique_skus FROM products WHERE sku IS NOT NULL');
    const uniqueSkuCount = (uniqueSkus as any[])[0].unique_skus;
    console.log(`SKUs únicos: ${uniqueSkuCount}`);
    
    const [uniqueBarcodes] = await connection.execute('SELECT COUNT(DISTINCT barcode) as unique_barcodes FROM products WHERE barcode IS NOT NULL AND barcode != ""');
    const uniqueBarcodeCount = (uniqueBarcodes as any[])[0].unique_barcodes;
    console.log(`Códigos de barras únicos: ${uniqueBarcodeCount}`);
    
    console.log('\n✅ Limpeza de produtos duplicados concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('🔌 Conexão com o banco de dados fechada');
  }
}

// Executar o script
cleanDuplicateProducts().catch(console.error);