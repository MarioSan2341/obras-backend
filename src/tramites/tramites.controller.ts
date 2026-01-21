import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TramitesService } from './tramites.service';
import { Tramite } from './tramite.entity';

@Controller('tramites')
export class TramitesController {
  constructor(private readonly service: TramitesService) {}

  @Post()
  create(@Body() body: Partial<Tramite>) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() body: Partial<Tramite>) {
    return this.service.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }

  @Patch(':id/estado')
  toggleEstado(@Param('id') id: number) {
    return this.service.toggleEstado(+id);
  }
}
