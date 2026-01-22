import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { DirectoresObraService } from './directores-obra.service';
import { CreateDirectorObraDto } from './dto/create-director-obra.dto';

@Controller('directores-obra')
export class DirectoresObraController {
  constructor(private service: DirectoresObraService) {}

  @Post()
  create(@Body() dto: CreateDirectorObraDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id/baja')
  darDeBaja(@Param('id') id: number) {
    return this.service.baja(Number(id));
  }
}
