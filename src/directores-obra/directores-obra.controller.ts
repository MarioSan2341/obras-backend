import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
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

  /** Placeholder SVG cuando el archivo de imagen no existe (evita 404 en el front) */
  private static readonly PLACEHOLDER_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect fill="#e5e7eb" width="80" height="80"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="10" font-family="sans-serif">Sin imagen</text></svg>';

  /** Sirve la imagen de un director por nombre de archivo (evita 404 JSON) */
  @Get('imagen/:filename')
  serveImagen(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.directoresObraService.getImagenPath(filename);
    if (!filePath) {
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(DirectoresObraController.PLACEHOLDER_SVG);
    }
    return res.sendFile(filePath);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('statusFilter') statusFilter?: string,
  ) {
    // Si hay parámetros de paginación, usar findPaginated
    // Verificar si los parámetros están presentes (incluso si son strings vacíos)
    const hasPage = page !== undefined && page !== null && page !== '';
    const hasLimit = limit !== undefined && limit !== null && limit !== '';
    const hasSearch = search !== undefined && search !== null && search !== '';
    const hasStatusFilter = statusFilter !== undefined && statusFilter !== null && statusFilter !== '';
    
    if (hasPage || hasLimit || hasSearch || hasStatusFilter) {
      return this.directoresObraService.findPaginated({
        page: hasPage ? +page : 1,
        limit: hasLimit ? +limit : 10,
        search: hasSearch ? search : undefined,
        statusFilter: hasStatusFilter ? statusFilter : undefined,
      });
    }
    return this.directoresObraService.findAll();
  }

  @Get('export-all')
  findAllFiltered(
    @Query('search') search?: string,
    @Query('statusFilter') statusFilter?: string,
  ) {
    return this.directoresObraService.findAllFiltered({
      search: search || undefined,
      statusFilter: statusFilter || undefined,
    });
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