// src/obra-conceptos/obra-conceptos.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ObraConceptosService } from './obra-conceptos.service';
import { CreateObraConceptoDto } from './dto/create-obra-concepto.dto';

@Controller('obra-conceptos')
export class ObraConceptosController {
  constructor(private readonly service: ObraConceptosService) {}

  @Get('obra/:id')
  findByObra(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByObra(id);
  }

  @Post()
  create(@Body() dto: CreateObraConceptoDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
