import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
} from '@nestjs/common';
import { DirectoresObraService } from './directores-obra.service';

@Controller('directores-obra')
export class DirectoresObraController {
  constructor(
    private readonly directoresObraService: DirectoresObraService,
  ) {}

  @Get()
  findAll() {
    return this.directoresObraService.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.directoresObraService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: any) {
    return this.directoresObraService.update(+id, data);
  }

  @Patch(':id/baja')
  baja(@Param('id') id: number) {
    return this.directoresObraService.baja(+id);
  }
}
