// funcion-usuarios.controller.ts
import { Controller, Get } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { FuncionUsuario } from './funcion-usuario.entity';

@Controller('funciones-usuarios')
export class FuncionUsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll(): Promise<FuncionUsuario[]> {
    return this.usuariosService.findAllFunciones();
  }
}
