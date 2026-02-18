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

async function verificarCuentaPredial() {
  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');

    // Verificar si la columna existe
    const checkColumn = await client.query(`
      SELECT column_name, data_type, is_nullable, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'op_obras' 
      AND column_name = 'cuenta_predial'
    `);

    if (checkColumn.rows.length > 0) {
      const col = checkColumn.rows[0];
      console.log('✓ La columna cuenta_predial SÍ existe en la tabla op_obras');
      console.log('\nDetalles de la columna:');
      console.log(`  - Nombre: ${col.column_name}`);
      console.log(`  - Tipo de dato: ${col.data_type}`);
      console.log(`  - Permite NULL: ${col.is_nullable}`);
      if (col.character_maximum_length) {
        console.log(`  - Longitud máxima: ${col.character_maximum_length}`);
      }
      
      // Verificar cuántos registros tienen cuenta_predial
      const count = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(cuenta_predial) as con_cuenta,
          COUNT(*) - COUNT(cuenta_predial) as sin_cuenta
        FROM op_obras
      `);
      
      console.log('\nEstadísticas:');
      console.log(`  - Total de obras: ${count.rows[0].total}`);
      console.log(`  - Obras con cuenta predial: ${count.rows[0].con_cuenta}`);
      console.log(`  - Obras sin cuenta predial: ${count.rows[0].sin_cuenta}`);
      
      // Mostrar algunos ejemplos
      const ejemplos = await client.query(`
        SELECT idobra, consecutivo, cuenta_predial, nombrepropietario
        FROM op_obras
        WHERE cuenta_predial IS NOT NULL AND cuenta_predial != ''
        LIMIT 5
      `);
      
      if (ejemplos.rows.length > 0) {
        console.log('\nEjemplos de obras con cuenta predial:');
        ejemplos.rows.forEach((row, index) => {
          console.log(`  ${index + 1}. ID: ${row.idobra}, Consecutivo: ${row.consecutivo || 'N/A'}, Cuenta: ${row.cuenta_predial}, Propietario: ${row.nombrepropietario || 'N/A'}`);
        });
      } else {
        console.log('\n⚠ No hay obras con cuenta predial registrada aún');
      }
    } else {
      console.log('✗ La columna cuenta_predial NO existe en la tabla op_obras');
      console.log('\nPara agregarla, ejecuta: npm run add:cuenta-predial');
    }

    await client.end();
  } catch (error) {
    console.error('✗ Error al verificar:', error.message);
    await client.end();
    process.exit(1);
  }
}

verificarCuentaPredial();
