import { Controller, Get, Put, Param, Body, ParseIntPipe } from '@nestjs/common';
import { LugaresRecibidosService } from './lugares-recibidos.service';

@Controller('lugares-recibidos')
export class LugaresRecibidosController {
  constructor(private lugaresRecibidosService: LugaresRecibidosService) {}

  @Get('obra/:idObra')
  async findByObra(@Param('idObra', ParseIntPipe) idObra: number) {
    const lugares = await this.lugaresRecibidosService.findByObra(idObra);
    return lugares || {
      idObra,
      secretariaObrasPublicas: '',
      presidencia: '',
      padronLicencias: '',
    };
  }

  @Put('obra/:idObra')
  async createOrUpdate(
    @Param('idObra', ParseIntPipe) idObra: number,
    @Body() body: {
      secretariaObrasPublicas?: string;
      presidencia?: string;
      padronLicencias?: string;
    },
  ) {
    return this.lugaresRecibidosService.createOrUpdate(idObra, body);
  }
}
