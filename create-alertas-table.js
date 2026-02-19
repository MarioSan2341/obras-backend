const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  // Match backend app.module.ts: use same SSL so script works in same environment
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
});

async function createAlertasTable() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos\n');

    const createTable = `
      CREATE TABLE IF NOT EXISTS alertas (
        idalerta SERIAL PRIMARY KEY,
        idobra INTEGER NOT NULL,
        tipopdf VARCHAR(100) NOT NULL,
        mensaje TEXT NOT NULL,
        fechacreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fechamodificacion TIMESTAMP NULL,
        idusuario INTEGER NULL,
        CONSTRAINT fk_alertas_obra FOREIGN KEY (idobra) REFERENCES op_obras(idobra) ON DELETE CASCADE
      );
    `;
    await client.query(createTable);
    console.log('Tabla "alertas" creada o ya existía.\n');

    const indexObra = `CREATE INDEX IF NOT EXISTS idx_alertas_idobra ON alertas(idobra);`;
    await client.query(indexObra);
    console.log('Índice idx_alertas_idobra creado o ya existía.\n');

    console.log('Listo.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createAlertasTable();
