import { Controller, Get } from '@nestjs/common';
import { OpNumerosOficialesService } from './op-numeros-oficiales.service';

@Controller('op-numeros-oficiales')
export class OpNumerosOficialesController {
  constructor(
    private readonly numerosOficialesService: OpNumerosOficialesService,
  ) {}

  @Get('reporte')
  getReporte() {
    return this.numerosOficialesService.findObrasConNumerosOficiales();
  }

  @Get('todos')
  getAll() {
    return this.numerosOficialesService.findAllWithNumerosOficiales();
  }
}
