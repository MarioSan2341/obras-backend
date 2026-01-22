import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectorObra } from './director-obra.entity';
import { CreateDirectorObraDto } from './dto/create-director-obra.dto';

@Injectable()
export class DirectoresObraService {
  constructor(
    @InjectRepository(DirectorObra)
    private repo: Repository<DirectorObra>,
  ) {}

  // CREAR
  create(dto: CreateDirectorObraDto) {
    const director = this.repo.create(dto);
    return this.repo.save(director);
  }

  // LISTAR
  findAll() {
    return this.repo.find();
  }

  // BAJA LÓGICA
 baja(id: number) {
  return this.repo.update(id, {
    activo: false,
    fecha_baja: new Date()
  });
}

}
