import { Controller, Post, Body, Get, Param, Delete, Put } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

 @Post('login')
async login(@Body() body: { nombre: string; clave: string }) {
  return this.usuariosService.login(body.nombre, body.clave);
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
  return this.usuariosService.updateUsuario(Number(id), body);
}

@Delete(':id')
delete(@Param('id') id: number) {
  return this.usuariosService.deleteUsuario(Number(id));
}


}
