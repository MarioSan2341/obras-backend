const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function createHistorialTable() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    // Verificar si la tabla ya existe
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'historial_usuario'
      );
    `);

    if (checkTable.rows[0].exists) {
      console.log('La tabla historial_usuario ya existe');
      await client.end();
      return;
    }

    // Crear la tabla
    await client.query(`
      CREATE TABLE historial_usuario (
        id_historial SERIAL PRIMARY KEY,
        id_usuario INTEGER NOT NULL,
        accion VARCHAR(255) NOT NULL,
        tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('crear', 'modificar', 'eliminar', 'otro')),
        entidad VARCHAR(100) NOT NULL,
        id_entidad INTEGER,
        detalles TEXT,
        fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear índice para mejorar las consultas por usuario
    await client.query(`
      CREATE INDEX idx_historial_usuario_id_usuario ON historial_usuario(id_usuario);
    `);

    // Crear índice para mejorar las consultas por fecha
    await client.query(`
      CREATE INDEX idx_historial_usuario_fecha_accion ON historial_usuario(fecha_accion DESC);
    `);

    console.log('Tabla historial_usuario creada exitosamente');
  } catch (error) {
    console.error('Error al crear la tabla:', error);
  } finally {
    await client.end();
  }
}

createHistorialTable();
