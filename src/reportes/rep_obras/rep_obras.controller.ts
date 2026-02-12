// src/reportes/rep_obras/rep_obras.controller.ts
import { Controller, Get, Query, Res, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { RepObrasService } from './rep_obras.service';
import { ReporteObrasFilterDto } from './dto/reporte-obras-filter.dto';

@Controller('reportes/obras')
export class RepObrasController {
  constructor(private readonly repObrasService: RepObrasService) {}

  // 📄 Obtener reporte paginado
  @Get()
  findReporte(@Query() filters: ReporteObrasFilterDto) {
    return this.repObrasService.getReporteObras(filters);
  }

  // 📋 Detalle completo de una obra (todos los datos)
  @Get('detalle/:id')
  async getDetalle(@Param('id', ParseIntPipe) id: number) {
    const obra = await this.repObrasService.getDetalleObra(id);
    if (!obra) throw new NotFoundException('Obra no encontrada');
    return obra;
  }

  // 📊 Exportar Excel
  @Get('export')
  async exportExcel(
    @Query() filters: ReporteObrasFilterDto,
    @Res() res: Response,
  ) {
    return this.repObrasService.exportExcel(filters, res);
  }
}
