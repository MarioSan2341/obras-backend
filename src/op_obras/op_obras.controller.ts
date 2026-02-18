import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { OpObrasService } from './op_obras.service';
import { OpObra } from './op_obras.entity';

@Controller('op_obras')
export class OpObrasController {

  constructor(private opObrasService: OpObrasService) {}

  @Get('listado')
  findAllListado() {
    return this.opObrasService.findAllListado();
  }

  @Get('listado-filtrado')
  findListadoFiltrado(
    @Query('consecutivo') consecutivo?: string,
    @Query('fechaCaptura') fechaCaptura?: string,
    @Query('nombrePropietario') nombrePropietario?: string,
    @Query('numerosPrediosContiguos') numerosPrediosContiguos?: string,
  ) {
    return this.opObrasService.findListadoFiltrado(consecutivo, fechaCaptura, nombrePropietario, numerosPrediosContiguos);
  }

  @Get('listado-filtrado-paginado')
  findListadoFiltradoPaginado(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('consecutivo') consecutivo?: string,
    @Query('fechaCaptura') fechaCaptura?: string,
    @Query('nombrePropietario') nombrePropietario?: string,
    @Query('numerosPrediosContiguos') numerosPrediosContiguos?: string,
    @Query('estadoObra') estadoObra?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || '10', 10) || 10));
    return this.opObrasService.findListadoFiltradoPaginado(
      pageNum,
      limitNum,
      consecutivo,
      fechaCaptura,
      nombrePropietario,
      numerosPrediosContiguos,
      estadoObra,
    );
  }

  @Get()
  findAll(): Promise<OpObra[]> {
    return this.opObrasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.opObrasService.findOneWithDetails(id);
  }

  @Post()
  create(@Body() body: Partial<OpObra> & { idUsuarioLogueado?: number }): Promise<OpObra> {
    // Si viene idUsuarioLogueado en el body, usarlo para idUsuarioCapturador si no está definido
    if (body.idUsuarioLogueado && !body.idUsuarioCapturador) {
      body.idUsuarioCapturador = body.idUsuarioLogueado;
    }
    delete body.idUsuarioLogueado; // Remover del body para no guardarlo como campo de la obra
    return this.opObrasService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<OpObra> & { idUsuarioLogueado?: number },
  ): Promise<OpObra> {
    const idUsuarioLogueado = body.idUsuarioLogueado;
    delete body.idUsuarioLogueado; // Remover del body para no guardarlo como campo de la obra
    return this.opObrasService.update(id, body, idUsuarioLogueado);
  }

  @Post(':id/numeros-manual')
  saveNumerosManual(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { numeros: { calle?: string; numeroOficial?: string }[]; idUsuarioLogueado?: number },
  ) {
    return this.opObrasService.saveNumerosManual(id, body.numeros ?? [], body.idUsuarioLogueado);
  }

   @Delete(':id')
  async eliminarObra(@Param('id') id: number, @Body() body?: any) {
    // Obtener el ID del usuario logueado del body si está presente
    const idUsuarioEliminador = body?.idUsuarioLogueado;
    return this.opObrasService.eliminarObra(+id, idUsuarioEliminador);
  }
}
