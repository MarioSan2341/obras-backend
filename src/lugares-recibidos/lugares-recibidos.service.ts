import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LugaresRecibidosObra } from './lugares-recibidos.entity';

@Injectable()
export class LugaresRecibidosService {
  constructor(
    @InjectRepository(LugaresRecibidosObra)
    private lugaresRecibidosRepository: Repository<LugaresRecibidosObra>,
  ) {}

  async findByObra(idObra: number): Promise<LugaresRecibidosObra | null> {
    return this.lugaresRecibidosRepository.findOne({
      where: { idObra },
    });
  }

  async createOrUpdate(
    idObra: number,
    data: {
      secretariaObrasPublicas?: string;
      presidencia?: string;
      padronLicencias?: string;
    },
  ): Promise<LugaresRecibidosObra> {
    const existente = await this.findByObra(idObra);

    if (existente) {
      // Actualizar registro existente
      Object.assign(existente, data);
      existente.fechaActualizacion = new Date();
      return this.lugaresRecibidosRepository.save(existente);
    } else {
      // Crear nuevo registro
      const nuevo = this.lugaresRecibidosRepository.create({
        idObra,
        ...data,
      });
      return this.lugaresRecibidosRepository.save(nuevo);
    }
  }
}
