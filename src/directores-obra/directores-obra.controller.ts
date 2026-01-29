import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DirectoresObraService } from './directores-obra.service';
import { CreateDirectorObraDto } from './dto/create-director-obra.dto';

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
  @UseInterceptors(FileInterceptor('imagen'))
  async create(
    @Body() data: CreateDirectorObraDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.directoresObraService.create({ ...data, file });
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('imagen'))
  async update(
    @Param('id') id: number,
    @Body() data: CreateDirectorObraDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.directoresObraService.update(+id, data, file);
  }

  @Patch(':id/baja')
  baja(@Param('id') id: number) {
    return this.directoresObraService.baja(+id);
  }

  @Patch(':id/reactivar')
  reactivar(@Param('id') id: number) {
    return this.directoresObraService.reactivar(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.directoresObraService.findOne(+id);
  }
}