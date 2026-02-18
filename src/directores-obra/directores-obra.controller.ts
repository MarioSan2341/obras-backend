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
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { DirectoresObraService } from './directores-obra.service';
import { CreateDirectorObraDto } from './dto/create-director-obra.dto';

@Controller('directores-obra')
export class DirectoresObraController {
  constructor(
    private readonly directoresObraService: DirectoresObraService,
  ) {}

  /** Sirve la imagen de un director por nombre de archivo (evita 404 JSON) */
  @Get('imagen/:filename')
  serveImagen(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.directoresObraService.getImagenPath(filename);
    if (!filePath) {
      throw new NotFoundException('Imagen no encontrada');
    }
    return res.sendFile(filePath);
  }

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