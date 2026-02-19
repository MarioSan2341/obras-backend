import { Controller, Get, Query } from '@nestjs/common';
import { OpObrasService } from './op_obras.service';

/**
 * Controller only for listado* routes. Registered before OpObrasController
 * so GET /op_obras/listado-filtrado-paginado is never matched by @Get(':id').
 */
@Controller('op_obras')
export class OpObrasListadoController {
  constructor(private readonly opObrasService: OpObrasService) {}

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
    @Query('calle') calle?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.opObrasService.findListadoFiltrado(
      consecutivo,
      fechaCaptura,
      nombrePropietario,
      numerosPrediosContiguos,
      calle,
      page ? +page : undefined,
      limit ? +limit : undefined,
    );
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
}
