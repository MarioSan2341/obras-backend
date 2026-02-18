"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const usuario_entity_1 = require("../src/usuarios/usuario.entity");
const typeorm_1 = require("@nestjs/typeorm");
async function verificarUsuario() {
    const nombreUsuario = process.argv[2];
    if (!nombreUsuario) {
        console.error('❌ Error: Debes proporcionar el nombre de usuario');
        console.log('Uso: npm run verify:user <nombre_usuario>');
        console.log('Ejemplo: npm run verify:user admin');
        process.exit(1);
    }
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const usuariosRepository = app.get((0, typeorm_1.getRepositoryToken)(usuario_entity_1.Usuario));
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
        console.log('\n🔐 INFORMACIÓN DE CONTRASEÑA\n');
        console.log('─'.repeat(60));
        if (!usuario.clave || usuario.clave.trim() === '') {
            console.log('Estado: ❌ Sin contraseña');
        }
        else if (usuario.clave.startsWith('$2a$') || usuario.clave.startsWith('$2b$') || usuario.clave.startsWith('$2y$')) {
            console.log('Estado: ✅ Hasheada');
            console.log(`Formato: ${usuario.clave.substring(0, 10)}...`);
            console.log(`Longitud: ${usuario.clave.length} caracteres`);
        }
        else {
            console.log('Estado: ⚠️  Texto plano');
            console.log(`Longitud: ${usuario.clave.length} caracteres`);
            console.log(`Muestra: ${usuario.clave.substring(0, 10)}...`);
        }
        console.log('\n💡 RECOMENDACIONES\n');
        console.log('─'.repeat(60));
        if (usuario.estado !== 'Activo') {
            console.log('⚠️  El usuario está INACTIVO. Para activarlo:');
            console.log(`   UPDATE usuarios SET estado = 'Activo' WHERE id_usuarios = ${usuario.id_usuarios};`);
        }
        else {
            console.log('✅ El usuario está ACTIVO');
        }
        if (usuario.clave && !usuario.clave.startsWith('$2')) {
            console.log('⚠️  La contraseña está en texto plano. Debería hashearse.');
            console.log('   Ejecuta: npm run migrate:passwords <idAdmin> <claveAdmin>');
        }
        console.log('\n');
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
    finally {
        await app.close();
    }
}
verificarUsuario();
//# sourceMappingURL=verificar-usuario.js.map