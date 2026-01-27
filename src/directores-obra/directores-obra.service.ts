import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectorObra } from './director-obra.entity';

@Injectable()
export class DirectoresObraService {
  constructor(
    @InjectRepository(DirectorObra)
    private repo: Repository<DirectorObra>,
  ) {}

  create(data: any) {
    const director = this.repo.create({
      ...data,
      activo: true,
      fecha_registro: new Date(),
    });
    return this.repo.save(director);
  }

  findAll() {
    return this.repo.find();
  }

  async update(id: number, data: any) {
    const director = await this.repo.findOne({ where: { id } });

    if (!director) {
      throw new Error('Director no encontrado');
    }

    Object.assign(director, data);
    director.fecha_actualizacion = new Date();

    return this.repo.save(director);
  }

  async baja(id: number) {
    return this.repo.update(id, {
      activo: false,
      fecha_baja: new Date(),
    });
  }
}
