/**
 * Script para migrar todas las contraseñas en texto plano a hash bcrypt
 * 
 * Uso:
 * 1. Asegúrate de tener un usuario ADMIN en la base de datos
 * 2. Ejecuta: npm run migrate:passwords
 * 
 * O usa el endpoint POST /usuarios/migrar-contraseñas con:
 * {
 *   "idAdmin": 1,
 *   "claveAdmin": "tu_clave_admin"
 * }
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsuariosService } from '../src/usuarios/usuarios.service';

async function migrarContraseñas() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usuariosService = app.get(UsuariosService);

  // Obtener ID del admin desde argumentos o usar 1 por defecto
  const idAdmin = process.argv[2] ? parseInt(process.argv[2]) : 1;
  const claveAdmin = process.argv[3] || '';

  if (!claveAdmin) {
    console.error('❌ Error: Debes proporcionar la clave del administrador');
    console.log('Uso: npm run migrate:passwords <idAdmin> <claveAdmin>');
    console.log('Ejemplo: npm run migrate:passwords 1 miClave123');
    process.exit(1);
  }

  try {
    console.log('🔄 Iniciando migración de contraseñas...');
    const resultado = await usuariosService.hashearTodasLasContraseñas(idAdmin, claveAdmin);
    console.log('✅', resultado.mensaje);
    console.log(`📊 Usuarios actualizados: ${resultado.usuariosActualizados}`);
  } catch (error: any) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

migrarContraseñas();
