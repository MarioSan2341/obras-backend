"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const usuarios_service_1 = require("../src/usuarios/usuarios.service");
async function migrarContraseñas() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const usuariosService = app.get(usuarios_service_1.UsuariosService);
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
    }
    catch (error) {
        console.error('❌ Error durante la migración:', error.message);
        process.exit(1);
    }
    finally {
        await app.close();
    }
}
migrarContraseñas();
//# sourceMappingURL=migrar-contrase%C3%B1as.js.map