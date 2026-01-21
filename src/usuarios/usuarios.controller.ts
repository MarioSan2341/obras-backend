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

 

}
