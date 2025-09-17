const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkProducts() {
  let connection;
  try {
    console.log('Conectando à base de dados...');
    connection = await mysql.createConnection({
      host: '193.203.166.230',
      port: 3306,
      user: 'u824538998_gstock',
      password: 'Gstock.2025',
      database: 'u824538998_gstock_db',
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('Conexão estabelecida!');
    
    // Verificar se a tabela products existe
    const [tables] = await connection.execute("SHOW TABLES LIKE 'products'");
    console.log('Tabela products existe:', tables.length > 0);
    
    if (tables.length > 0) {
      // Contar total de produtos
      const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM products');
      console.log('Total de produtos:', countResult[0].total);
      
      // Contar produtos com barcode
      const [barcodeCountResult] = await connection.execute("SELECT COUNT(*) as total FROM products WHERE barcode IS NOT NULL AND barcode != ''");
      console.log('Produtos com código de barras:', barcodeCountResult[0].total);
      
      // Mostrar alguns produtos com barcode
      const [products] = await connection.execute("SELECT id, name, sku, barcode FROM products WHERE barcode IS NOT NULL AND barcode != '' LIMIT 10");
      console.log('\nPrimeiros produtos com código de barras:');
      products.forEach(p => {
        console.log(`- ID: ${p.id}, Nome: ${p.name}, SKU: ${p.sku}, Barcode: ${p.barcode}`);
      });
      
      // Verificar se existe o código específico que foi testado
      const [specificProduct] = await connection.execute("SELECT * FROM products WHERE barcode = ?", ['620123456001']);
      console.log('\nProduto com código 620123456001:', specificProduct.length > 0 ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
      if (specificProduct.length > 0) {
        console.log('Detalhes:', specificProduct[0]);
      }
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkProducts();