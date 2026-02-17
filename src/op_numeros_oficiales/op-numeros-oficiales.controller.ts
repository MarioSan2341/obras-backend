import { Controller, Get, Query } from '@nestjs/common';
import { OpNumerosOficialesService } from './op-numeros-oficiales.service';

@Controller('op-numeros-oficiales')
export class OpNumerosOficialesController {
  constructor(
    private readonly numerosOficialesService: OpNumerosOficialesService,
  ) {}

  @Get('reporte')
  getReporte(
    @Query('consecutivo') consecutivo?: string,
    @Query('numeroOficial') numeroOficial?: string,
    @Query('calle') calle?: string,
  ) {
    return this.numerosOficialesService.findObrasConNumerosOficialesFiltrado(
      consecutivo,
      numeroOficial,
      calle,
    );
  }

  @Get('todos')
  getAll() {
    return this.numerosOficialesService.findAllWithNumerosOficiales();
  }
}
