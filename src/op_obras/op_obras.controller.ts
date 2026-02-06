import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { OpObrasService } from './op_obras.service';
import { OpObra } from './op_obras.entity';

@Controller('op_obras')
export class OpObrasController {

  constructor(private opObrasService: OpObrasService) {}

  @Get('listado')
  findAllListado() {
    return this.opObrasService.findAllListado();
  }

  @Get()
  findAll(): Promise<OpObra[]> {
    return this.opObrasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<OpObra> {
    return this.opObrasService.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<OpObra>): Promise<OpObra> {
    return this.opObrasService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<OpObra>,
  ): Promise<OpObra> {
    return this.opObrasService.update(id, body);
  }

   @Delete(':id')
  async eliminarObra(@Param('id') id: number) {
    return this.opObrasService.eliminarObra(+id);
  }
}
