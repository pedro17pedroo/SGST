import dotenv from 'dotenv';
dotenv.config();

import { db } from './database/db';
import { products } from '../shared/schema';

async function checkProducts() {
  try {
    console.log('Verificando produtos na base de dados...');
    const result = await db.select().from(products).limit(10);
    
    console.log('Produtos encontrados:', result.length);
    
    if (result.length > 0) {
      console.log('Primeiros produtos:');
      result.slice(0, 3).forEach(p => {
        console.log(`- ID: ${p.id}, Nome: ${p.name}, SKU: ${p.sku}, Código de Barras: ${p.barcode}`);
      });
    } else {
      console.log('Nenhum produto encontrado na base de dados');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Erro ao verificar produtos:', err);
    process.exit(1);
  }
}

checkProducts();