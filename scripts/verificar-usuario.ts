/**
 * Script para verificar el estado de un usuario específico
 * 
 * Uso: npm run verify:user <nombre_usuario>
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { Usuario } from '../src/usuarios/usuario.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function verificarUsuario() {
  const nombreUsuario = process.argv[2];

  if (!nombreUsuario) {
    console.error('❌ Error: Debes proporcionar el nombre de usuario');
    console.log('Uso: npm run verify:user <nombre_usuario>');
    console.log('Ejemplo: npm run verify:user admin');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const usuariosRepository = app.get<Repository<Usuario>>(getRepositoryToken(Usuario));

  try {
    const usuario = await usuariosRepository
      .createQueryBuilder('u')
      .where('LOWER(u.usuario) = LOWER(:usuario)', { usuario: nombreUsuario })
      .leftJoinAndSelect('u.cargo', 'cargo')
      .getOne();

    if (!usuario) {
      console.log(`❌ Usuario "${nombreUsuario}" no encontrado`);
      process.exit(1);
    }

    console.log('\n📋 INFORMACIÓN DEL USUARIO\n');
    console.log('─'.repeat(60));
    console.log(`ID: ${usuario.id_usuarios}`);
    console.log(`Usuario: ${usuario.usuario}`);
    console.log(`Nombre: ${usuario.nombre} ${usuario.ap_paterno || ''} ${usuario.ap_materno || ''}`.trim());
    console.log(`Rol: ${usuario.rol}`);
    console.log(`Estado: ${usuario.estado || 'No definido'}`);
    console.log(`Teléfono: ${usuario.telefono || 'No definido'}`);
    console.log(`Cargo: ${usuario.cargo?.nombre || 'No definido'}`);
    
    // Información de la contraseña
    console.log('\n🔐 INFORMACIÓN DE CONTRASEÑA\n');
    console.log('─'.repeat(60));
    if (!usuario.clave || usuario.clave.trim() === '') {
      console.log('Estado: ❌ Sin contraseña');
    } else if (usuario.clave.startsWith('$2a$') || usuario.clave.startsWith('$2b$') || usuario.clave.startsWith('$2y$')) {
      console.log('Estado: ✅ Hasheada');
      console.log(`Formato: ${usuario.clave.substring(0, 10)}...`);
      console.log(`Longitud: ${usuario.clave.length} caracteres`);
    } else {
      console.log('Estado: ⚠️  Texto plano');
      console.log(`Longitud: ${usuario.clave.length} caracteres`);
      console.log(`Muestra: ${usuario.clave.substring(0, 10)}...`);
    }

    console.log('\n💡 RECOMENDACIONES\n');
    console.log('─'.repeat(60));
    if (usuario.estado !== 'Activo') {
      console.log('⚠️  El usuario está INACTIVO. Para activarlo:');
      console.log(`   UPDATE usuarios SET estado = 'Activo' WHERE id_usuarios = ${usuario.id_usuarios};`);
    } else {
      console.log('✅ El usuario está ACTIVO');
    }

    if (usuario.clave && !usuario.clave.startsWith('$2')) {
      console.log('⚠️  La contraseña está en texto plano. Debería hashearse.');
      console.log('   Ejecuta: npm run migrate:passwords <idAdmin> <claveAdmin>');
    }

    console.log('\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

verificarUsuario();
