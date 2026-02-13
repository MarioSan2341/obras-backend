import { Controller, Post, Body, Get, Param, Delete, Put } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Rol } from './roles.enum';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('login')
  async login(@Body() body: { nombre: string; clave: string }) {
    return this.usuariosService.login(body.nombre, body.clave);
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
}
