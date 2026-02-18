import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alerta } from './alertas.entity';

@Injectable()
export class AlertasService {
  constructor(
    @InjectRepository(Alerta)
    private alertasRepository: Repository<Alerta>,
  ) {}

  async findAll(): Promise<Alerta[]> {
    return this.alertasRepository.find({
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findByObra(idObra: number): Promise<Alerta[]> {
    return this.alertasRepository.find({
      where: { idObra },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findByObraAndTipo(idObra: number, tipoPdf: string): Promise<Alerta | null> {
    return this.alertasRepository.findOne({
      where: { idObra, tipoPdf },
    });
  }

  async create(data: Partial<Alerta>): Promise<Alerta> {
    const alerta = this.alertasRepository.create({
      ...data,
      fechaCreacion: new Date(),
    });
    return this.alertasRepository.save(alerta);
  }

  async update(idAlerta: number, data: Partial<Alerta>): Promise<Alerta | null> {
    await this.alertasRepository.update(idAlerta, {
      ...data,
      fechaModificacion: new Date(),
    });
    return this.alertasRepository.findOne({ where: { idAlerta } });
  }

  async delete(idAlerta: number): Promise<void> {
    await this.alertasRepository.delete(idAlerta);
  }

  async deleteByObraAndTipo(idObra: number, tipoPdf: string): Promise<void> {
    await this.alertasRepository.delete({ idObra, tipoPdf });
  }
}
