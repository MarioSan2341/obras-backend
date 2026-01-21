import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tramite } from './tramite.entity';

@Injectable()
export class TramitesService {
  constructor(
    @InjectRepository(Tramite)
    private readonly repo: Repository<Tramite>,
  ) {}

  create(data: Partial<Tramite>) {
    const tramite = this.repo.create(data);
    return this.repo.save(tramite);
  }

  findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const tramite = await this.repo.findOne({ where: { id } });
    if (!tramite) throw new NotFoundException('Trámite no encontrado');
    return tramite;
  }

  async update(id: number, data: Partial<Tramite>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const tramite = await this.findOne(id);
    return this.repo.remove(tramite);
  }

  async toggleEstado(id: number) {
    const tramite = await this.findOne(id);
    tramite.estado = !tramite.estado;
    return this.repo.save(tramite);
  }
}
