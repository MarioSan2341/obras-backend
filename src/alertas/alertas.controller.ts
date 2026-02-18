import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { Alerta } from './alertas.entity';

@Controller('alertas')
export class AlertasController {
  constructor(private alertasService: AlertasService) {}

  @Get()
  findAll(): Promise<Alerta[]> {
    return this.alertasService.findAll();
  }

  @Get('obra/:idObra')
  findByObra(@Param('idObra', ParseIntPipe) idObra: number): Promise<Alerta[]> {
    return this.alertasService.findByObra(idObra);
  }

  @Get('obra/:idObra/tipo/:tipoPdf')
  findByObraAndTipo(
    @Param('idObra', ParseIntPipe) idObra: number,
    @Param('tipoPdf') tipoPdf: string,
  ): Promise<Alerta | null> {
    return this.alertasService.findByObraAndTipo(idObra, tipoPdf);
  }

  @Post()
  create(@Body() body: Partial<Alerta>): Promise<Alerta> {
    return this.alertasService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Alerta>,
  ): Promise<Alerta> {
    return this.alertasService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.alertasService.delete(id);
  }
}
