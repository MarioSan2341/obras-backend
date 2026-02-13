import { Controller, Post, Body, Get, Param, Delete, Put, HttpException, HttpStatus } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Rol } from './roles.enum';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('login')
  async login(@Body() body: { nombre?: string; usuario?: string; clave: string }) {
    try {
      // Aceptar tanto "nombre" como "usuario" para compatibilidad
      const usuarioLogin = body.usuario || body.nombre;
      if (!usuarioLogin) {
        throw new HttpException('Usuario o nombre requerido', HttpStatus.BAD_REQUEST);
      }
      if (!body.clave) {
        throw new HttpException('Contraseña requerida', HttpStatus.BAD_REQUEST);
      }
      return await this.usuariosService.login(usuarioLogin, body.clave);
    } catch (error) {
      // Si ya es una HttpException, relanzarla
      if (error instanceof HttpException) {
        throw error;
      }
      // Para otros errores, loguear y lanzar un error genérico
      console.error('Error en login controller:', error);
      throw new HttpException(
        'Error al procesar el login. Intenta nuevamente.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
create(@Body() body: any) {
  const usuarioFake = {
    rol: Rol.ADMIN, 
  };

  

  return this.usuariosService.createUsuario(body, usuarioFake as any);
}

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Put(':id')
update(
  @Param('id') id: number,
  @Body() body: any,
) {
  const usuarioFake = {
    rol: Rol.ADMIN, // 👈 simulamos que Luis es admin
  };

  return this.usuariosService.updateUsuario(Number(id), body, usuarioFake as any);
}


  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.usuariosService.deleteUsuario(Number(id));
  }

  @Post(':id/revelar-clave')
  async revelarClave(
    @Param('id') id: string,
    @Body() body: { idAdmin: number; claveAdmin: string },
  ) {
    return this.usuariosService.revelarClave(
      Number(id),
      body.idAdmin,
      body.claveAdmin,
    );
  }

  @Put(':id/clave')
  async cambiarClave(
    @Param('id') id: string,
    @Body() body: { claveActual: string; nuevaClave: string; confirmarNuevaClave: string },
  ) {
    return this.usuariosService.cambiarClave(
      Number(id),
      body.claveActual,
      body.nuevaClave,
      body.confirmarNuevaClave,
    );
  }

  @Put(':id/clave-admin')
  async cambiarClaveComoAdmin(
    @Param('id') id: string,
    @Body() body: { idAdmin: number; claveAdmin: string; nuevaClave: string; confirmarNuevaClave: string },
  ) {
    return this.usuariosService.cambiarClaveComoAdmin(
      Number(id),
      body.idAdmin,
      body.claveAdmin,
      body.nuevaClave,
      body.confirmarNuevaClave,
    );
  }

  @Post('migrar-contraseñas')
  async migrarContraseñas(
    @Body() body: { idAdmin: number; claveAdmin: string },
  ) {
    return this.usuariosService.hashearTodasLasContraseñas(
      body.idAdmin,
      body.claveAdmin,
    );
  }
}
