import { Controller, Get, Query } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';

@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('pagos')
  async obtenerEstadisticasPagos(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.estadisticasService.obtenerEstadisticasPagos(
      fechaInicio,
      fechaFin,
    );
  }

  @Get('pagos-por-mes')
  async obtenerEstadisticasPorMes(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.estadisticasService.obtenerEstadisticasPorMes(
      fechaInicio,
      fechaFin,
    );
  }
}
