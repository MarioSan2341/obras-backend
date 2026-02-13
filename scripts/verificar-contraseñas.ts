/**
 * Script para verificar el estado de las contraseñas en la base de datos
 * 
 * Uso: npm run verify:passwords
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { Usuario } from '../src/usuarios/usuario.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function verificarContraseñas() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usuariosRepository = app.get<Repository<Usuario>>(getRepositoryToken(Usuario));

  try {
    const usuarios = await usuariosRepository.find({
      select: ['id_usuarios', 'usuario', 'nombre', 'clave'],
    });

    console.log('\n📊 ESTADO DE CONTRASEÑAS EN LA BASE DE DATOS\n');
    console.log('─'.repeat(80));
    console.log(`${'ID'.padEnd(5)} | ${'Usuario'.padEnd(20)} | ${'Nombre'.padEnd(25)} | Estado`);
    console.log('─'.repeat(80));

    let hasheadas = 0;
    let textoPlano = 0;
    let sinClave = 0;

    usuarios.forEach((u) => {
      const nombreCompleto = `${u.nombre || ''} ${u.ap_paterno || ''} ${u.ap_materno || ''}`.trim().substring(0, 25);
      const usuarioNombre = (u.usuario || '').substring(0, 20);
      
      let estado = '';
      if (!u.clave || u.clave.trim() === '') {
        estado = '❌ Sin contraseña';
        sinClave++;
      } else if (u.clave.startsWith('$2a$') || u.clave.startsWith('$2b$') || u.clave.startsWith('$2y$')) {
        estado = '✅ Hasheada';
        hasheadas++;
      } else {
        estado = '⚠️  Texto plano';
        textoPlano++;
      }

      console.log(`${String(u.id_usuarios).padEnd(5)} | ${usuarioNombre.padEnd(20)} | ${nombreCompleto.padEnd(25)} | ${estado}`);
    });

    console.log('─'.repeat(80));
    console.log('\n📈 RESUMEN:');
    console.log(`   ✅ Hasheadas: ${hasheadas}`);
    console.log(`   ⚠️  Texto plano: ${textoPlano}`);
    console.log(`   ❌ Sin contraseña: ${sinClave}`);
    console.log(`   📊 Total: ${usuarios.length}\n`);

    if (textoPlano > 0) {
      console.log('💡 TIP: Ejecuta la migración con: npm run migrate:passwords <idAdmin> <claveAdmin>\n');
    } else {
      console.log('✨ ¡Todas las contraseñas están hasheadas!\n');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

verificarContraseñas();
