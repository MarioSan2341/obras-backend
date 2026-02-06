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

  // 📌 Listar conceptos de una obra
  @Get('obra/:id')
  findByObra(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByObra(id);
  }

  // ➕ Agregar concepto a una obra
  @Post()
  async create(@Body() dto: CreateObraConceptoDto) {
    await this.service.create(dto);
    return this.service.findByObra(dto.obraId);
  }

  // ❌ Quitar concepto de la obra
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // 💰 Total de conceptos por obra
  @Get('obra/:id/total')
  getTotal(@Param('id', ParseIntPipe) id: number) {
    return this.service.getTotalByObra(id);
  }
}
