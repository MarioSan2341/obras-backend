"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const usuario_entity_1 = require("../src/usuarios/usuario.entity");
const typeorm_1 = require("@nestjs/typeorm");
async function verificarContraseñas() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const usuariosRepository = app.get((0, typeorm_1.getRepositoryToken)(usuario_entity_1.Usuario));
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
            }
            else if (u.clave.startsWith('$2a$') || u.clave.startsWith('$2b$') || u.clave.startsWith('$2y$')) {
                estado = '✅ Hasheada';
                hasheadas++;
            }
            else {
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
        }
        else {
            console.log('✨ ¡Todas las contraseñas están hasheadas!\n');
        }
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
    finally {
        await app.close();
    }
}
verificarContraseñas();
//# sourceMappingURL=verificar-contrase%C3%B1as.js.map