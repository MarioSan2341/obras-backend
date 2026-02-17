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

async function populateHistorialFromObras() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    // Verificar si la tabla historial_usuario existe
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'historial_usuario'
      );
    `);

    if (!checkTable.rows[0].exists) {
      console.log('La tabla historial_usuario no existe. Ejecuta primero: npm run create:historial-table');
      await client.end();
      return;
    }

    // Obtener todas las obras con usuario capturador
    const obras = await client.query(`
      SELECT idobra, idusuariocapturador, fechacaptura, consecutivo
      FROM op_obras
      WHERE idusuariocapturador IS NOT NULL
      ORDER BY fechacaptura DESC
    `);

    console.log(`Encontradas ${obras.rows.length} obras con usuario capturador`);

    let insertados = 0;
    let duplicados = 0;

    for (const obra of obras.rows) {
      // Verificar si ya existe un registro de creación para esta obra
      const existe = await client.query(`
        SELECT COUNT(*) as count
        FROM historial_usuario
        WHERE id_usuario = $1
        AND tipo = 'crear'
        AND entidad = 'Obra'
        AND id_entidad = $2
      `, [obra.idusuariocapturador, obra.idobra]);

      if (parseInt(existe.rows[0].count) > 0) {
        duplicados++;
        continue;
      }

      // Insertar registro de creación
      await client.query(`
        INSERT INTO historial_usuario 
        (id_usuario, accion, tipo, entidad, id_entidad, detalles, fecha_accion)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        obra.idusuariocapturador,
        'Creó una nueva obra',
        'crear',
        'Obra',
        obra.idobra,
        `Obra ID: ${obra.idobra}, Consecutivo: ${obra.consecutivo || 'N/A'}`,
        obra.fechacaptura,
      ]);

      insertados++;
    }

    console.log(`\nResumen:`);
    console.log(`- Registros insertados: ${insertados}`);
    console.log(`- Registros duplicados (omitidos): ${duplicados}`);
    console.log(`\nHistorial poblado exitosamente`);
  } catch (error) {
    console.error('Error al poblar historial:', error);
  } finally {
    await client.end();
  }
}

populateHistorialFromObras();
