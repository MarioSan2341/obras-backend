import { Controller, Get, Post, Body } from '@nestjs/common';
import { AsignacionesService } from './asignaciones.service';

@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  // ✅ ESTE ES EL QUE TE FALTABA
  @Get()
  findAll() {
    return this.asignacionesService.findAll();
  }

  // ✅ YA FUNCIONA
  @Get('funciones')
  findFunciones() {
    return this.asignacionesService.findFunciones();
  }

  @Post()
  asignarFuncion(
    @Body() body: { id_usuario: number; id_funcion: number },
  ) {
    return this.asignacionesService.asignarFuncion(
      body.id_usuario,
      body.id_funcion,
    );
  }
}
