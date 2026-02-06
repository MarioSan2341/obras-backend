import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { OpObrasService } from './op_obras.service';
import { OpObra } from './op_obras.entity';

@Controller('op_obras')
export class OpObrasController {

  constructor(private opObrasService: OpObrasService) {}

  // ✅ Ruta especial primero
  @Get('listado')
  findAllListado() {
    return this.opObrasService.findAllListado();
  }

  // ✅ Obtener todos
  @Get()
  findAll(): Promise<OpObra[]> {
    return this.opObrasService.findAll();
  }

  // ✅ Obtener uno por ID (SIEMPRE después de rutas fijas)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<OpObra> {
    return this.opObrasService.findOne(Number(id));
  }

  // ✅ Crear
  @Post()
  create(@Body() body: Partial<OpObra>): Promise<OpObra> {
    return this.opObrasService.create(body);
  }

  // ✅ Actualizar
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<OpObra>,
  ): Promise<OpObra> {
    return this.opObrasService.update(Number(id), body);
  }

  // ✅ Eliminar
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.opObrasService.remove(Number(id));
  }
}
