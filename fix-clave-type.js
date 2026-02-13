/**
 * Script para cambiar el tipo de la columna 'clave' de INTEGER a VARCHAR(255)
 * 
 * Uso: node fix-clave-type.js
 */

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  ssl: { rejectUnauthorized: false }
});

async function fixClaveType() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');
    
    // Verificar tipo actual
    console.log('📊 Verificando tipo actual de la columna...');
    const before = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'usuarios' AND column_name = 'clave';
    `);
    
    if (before.rows.length === 0) {
      console.log('❌ La columna "clave" no existe en la tabla usuarios');
      return;
    }
    
    console.log('Tipo actual:', before.rows[0]);
    console.log('');
    
    // Cambiar el tipo
    console.log('🔧 Cambiando tipo de columna de INTEGER a VARCHAR(255)...');
    await client.query(`
      ALTER TABLE usuarios 
      ALTER COLUMN clave TYPE VARCHAR(255) 
      USING CASE 
        WHEN clave IS NULL THEN NULL
        ELSE clave::text
      END;
    `);
    
    console.log('✅ Columna clave cambiada a VARCHAR(255)\n');
    
    // Verificar cambio
    console.log('📊 Verificando cambio...');
    const after = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'usuarios' AND column_name = 'clave';
    `);
    
    console.log('Nuevo tipo:', after.rows[0]);
    
    if (after.rows[0].data_type === 'character varying' && after.rows[0].character_maximum_length === 255) {
      console.log('\n✨ ¡Éxito! La columna ahora es VARCHAR(255)');
      console.log('💡 Reinicia el servidor backend para aplicar los cambios');
    } else {
      console.log('\n⚠️  El cambio no se aplicó correctamente');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === '42704') {
      console.error('   La columna "clave" no existe');
    } else if (error.code === '42P01') {
      console.error('   La tabla "usuarios" no existe');
    } else {
      console.error('   Detalles:', error);
    }
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

fixClaveType();
