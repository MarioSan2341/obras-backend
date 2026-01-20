import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ColoniasService } from './colonias.service';

@Controller('colonias')
export class ColoniasController {
  constructor(private service: ColoniasService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }

  @Post()
  create(
    @Body() body: { nombre: string; densidad: string },
  ) {
    return this.service.create(body);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { nombre: string; densidad: string },
  ) {
    return this.service.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.delete(+id);
  }
}
