import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpObra } from './op_obras.entity';


@Injectable()
export class OpObrasService {

  constructor(
    @InjectRepository(OpObra)
    private opObraRepository: Repository<OpObra>,
  ) {}

  // Obtener todas
  findAll(): Promise<OpObra[]> {
    return this.opObraRepository.find({
      order: { idObra: 'DESC' }
    });
  }

  // Obtener una
  async findOne(id: number): Promise<OpObra> {

  const obra = await this.opObraRepository.findOne({
    where: { idObra: id }
  });

  if (!obra) {
    throw new NotFoundException('Obra no encontrada');
  }

  return obra;
}

  // Crear
  create(data: Partial<OpObra>): Promise<OpObra> {
    const obra = this.opObraRepository.create(data);
    return this.opObraRepository.save(obra);
  }

  // Actualizar
  async update(id: number, data: Partial<OpObra>): Promise<OpObra> {
    await this.opObraRepository.update(id, data);
    return this.findOne(id);
  }

  // Eliminar
  async remove(id: number): Promise<void> {
    await this.opObraRepository.delete(id);
  }

  async findAllListado() {
  const obras = await this.opObraRepository.find();

  return obras.map(o => ({
    id: o.idObra,
    consecutivo: o.consecutivo,
    captura: o.fechaCaptura,
    propietario: o.nombrePropietario,
    calle: o.domicilioPropietario,
    noOficial: `Mza ${o.manzanaObra ?? ''} Lt ${o.loteObra ?? ''}`,
    colonia: o.nombreColoniaObra,
    estadoObra: o.estadoObra,
    estadoPago: o.estadoPago
  }));
}

}
