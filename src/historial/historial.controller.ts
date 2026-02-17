import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HistorialService } from './historial.service';

@Controller('usuarios')
export class HistorialController {
  constructor(private historialService: HistorialService) {}

  @Get(':id/historial')
  async obtenerHistorialUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.historialService.obtenerHistorialUsuario(id);
  }
}
