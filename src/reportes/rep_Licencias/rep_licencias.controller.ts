import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RepLicenciasService } from './rep_licencias.service';
import { ReporteLicenciasFilterDto } from './dto/reporte-licencias-filter.dto';

@Controller('reportes/licencias')
export class RepLicenciasController {
  constructor(private readonly repLicenciasService: RepLicenciasService) {}

  // 📄 Obtener reporte paginado
  @Get()
  findReporte(@Query() filters: ReporteLicenciasFilterDto) {
    return this.repLicenciasService.getReporteLicencias(filters);
  }

  // 📊 Exportar Excel
  @Get('export')
  async exportExcel(
    @Query() filters: ReporteLicenciasFilterDto,
    @Res() res: Response,
  ) {
    return this.repLicenciasService.exportExcel(filters, res);
  }
}
