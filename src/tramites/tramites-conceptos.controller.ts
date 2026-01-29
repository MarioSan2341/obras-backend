import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TramitesConceptosService } from './tramites-conceptos.service';
import { CreateTramiteConceptoDto } from './dto/create-tramite-concepto.dto';

@Controller('tramites-conceptos')
export class TramitesConceptosController {
  constructor(
    private readonly service: TramitesConceptosService,
  ) {}

  // 🔹 Obtener conceptos por trámite
  @Get('tramite/:id')
  getByTramite(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findByTramite(id);
  }

  // 🔹 Agregar concepto a trámite
  @Post()
  create(@Body() dto: CreateTramiteConceptoDto) {
    return this.service.create(dto);
  }

  // 🔹 Eliminar concepto de trámite
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(id);
  }
}
