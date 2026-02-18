const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function agregarCuentaPredial() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    // Verificar si la columna ya existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'op_obras' 
      AND column_name = 'cuenta_predial'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('La columna cuenta_predial ya existe en la tabla op_obras');
      await client.end();
      return;
    }

    // Agregar la columna cuenta_predial
    await client.query(`
      ALTER TABLE op_obras 
      ADD COLUMN cuenta_predial VARCHAR(255) NULL
    `);

    console.log('✓ Columna cuenta_predial agregada exitosamente a la tabla op_obras');
    
    await client.end();
  } catch (error) {
    console.error('Error al agregar columna cuenta_predial:', error);
    await client.end();
    process.exit(1);
  }
}

agregarCuentaPredial();
