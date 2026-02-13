/**
 * Script para agregar la columna 'fecha_modificacion' a la tabla usuarios.
 * TypeORM la actualizará automáticamente en cada save() del usuario.
 *
 * Uso: node add-fecha-modificacion.js
 */

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function addFechaModificacion() {
  try {
    console.log('Conectando a la base de datos...');
    await client.connect();
    console.log('Conectado.\n');

    const check = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'usuarios' AND column_name = 'fecha_modificacion';
    `);

    if (check.rows.length > 0) {
      console.log('La columna fecha_modificacion ya existe en usuarios.');
      return;
    }

    console.log('Agregando columna fecha_modificacion (TIMESTAMP)...');
    await client.query(`
      ALTER TABLE usuarios
      ADD COLUMN fecha_modificacion TIMESTAMP;
    `);
    console.log('Columna agregada correctamente.');
    console.log('Reinicia el backend. A partir de ahora, cada vez que se guarde un usuario se actualizará esta fecha.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
    console.log('Conexión cerrada.');
  }
}

addFechaModificacion();
