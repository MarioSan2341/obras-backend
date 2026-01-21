import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { ConceptosService } from './conceptos.service';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';

@Controller('conceptos')
export class ConceptosController {
  constructor(private readonly service: ConceptosService) {}

  // 🔹 Todos los conceptos (admin / debug)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // 🔹 Conceptos para selects dependientes
  @Get('select')
  getForSelect(@Query('parent_id') parentId?: number) {
    return this.service.getForSelect(parentId);
  }

  // 🔹 Hijos por padre
  @Get('padre/:id')
  findByParent(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByParent(id);
  }

  // 🔹 Árbol completo
  @Get('arbol')
  getArbol() {
    return this.service.getArbol();
  }

  // 🔹 Obtener un solo concepto (editar)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // 🔹 Crear
  @Post()
  create(@Body() dto: CreateConceptoDto) {
    return this.service.create(dto);
  }

  // 🔹 Actualizar
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConceptoDto,
  ) {
    return this.service.update(id, dto);
  }

  // 🔹 Eliminar
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
