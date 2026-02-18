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

async function createAlertasTable() {
  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // Verificar si la tabla ya existe
    const checkTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'alertas'
    `);

    if (checkTable.rows.length > 0) {
      console.log('⚠ La tabla alertas ya existe');
      await client.end();
      return;
    }

    // Crear la tabla alertas
    await client.query(`
      CREATE TABLE alertas (
        idalerta SERIAL PRIMARY KEY,
        idobra INTEGER NOT NULL,
        tipopdf VARCHAR(100) NOT NULL,
        mensaje TEXT NOT NULL,
        fechacreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fechamodificacion TIMESTAMP NULL,
        idusuario INTEGER NULL,
        CONSTRAINT fk_alertas_obra FOREIGN KEY (idobra) REFERENCES op_obras(idobra) ON DELETE CASCADE
      )
    `);

    // Crear índices
    await client.query(`
      CREATE INDEX idx_alertas_idobra ON alertas(idobra)
    `);

    await client.query(`
      CREATE INDEX idx_alertas_tipopdf ON alertas(tipopdf)
    `);

    console.log('✓ Tabla alertas creada exitosamente');
    console.log('✓ Índices creados exitosamente');
    
    await client.end();
  } catch (error) {
    console.error('✗ Error al crear tabla alertas:', error.message);
    await client.end();
    process.exit(1);
  }
}

createAlertasTable();
