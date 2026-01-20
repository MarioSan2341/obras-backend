import { Controller, Post, Body } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

 @Post('login')
async login(@Body() body: { nombre: string; clave: string }) {
  return this.usuariosService.login(body.nombre, body.clave);
}

}
