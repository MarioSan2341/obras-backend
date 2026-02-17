import { Controller, Get, Query } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';

@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('pagos')
  async obtenerEstadisticasPagos(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('idColonia') idColonia?: string,
    @Query('idDirector') idDirector?: string,
    @Query('estadoObra') estadoObra?: string,
    @Query('tipoPropietario') tipoPropietario?: string,
    @Query('destinoActual') destinoActual?: string,
    @Query('destinoPropuesto') destinoPropuesto?: string,
  ) {
    return this.estadisticasService.obtenerEstadisticasPagos(
      fechaInicio,
      fechaFin,
      idColonia ? parseInt(idColonia, 10) : undefined,
      idDirector ? parseInt(idDirector, 10) : undefined,
      estadoObra,
      tipoPropietario,
      destinoActual,
      destinoPropuesto,
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
