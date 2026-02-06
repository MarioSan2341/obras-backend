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

  findAll(): Promise<OpObra[]> {
    return this.opObraRepository.find({
      order: { idObra: 'DESC' }
    });
  }

  async findOne(id: number): Promise<OpObra> {

    const obra = await this.opObraRepository.findOne({
      where: { idObra: id }
    });

    if (!obra) {
      throw new NotFoundException('Obra no encontrada');
    }

    return obra;
  }

  create(data: Partial<OpObra>): Promise<OpObra> {
    const obra = this.opObraRepository.create(data);
    return this.opObraRepository.save(obra);
  }

  async update(id: number, data: Partial<OpObra>): Promise<OpObra> {

    const obra = await this.findOne(id);

    Object.assign(obra, data);

    return this.opObraRepository.save(obra);
  }

  async remove(id: number): Promise<void> {

    const obra = await this.findOne(id);

    await this.opObraRepository.remove(obra);
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

   async eliminarObra(id: number) {
    const resultado = await this.opObraRepository.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`La obra con id ${id} no existe`);
    }
    return { mensaje: `Obra con id ${id} eliminada correctamente` };
  }
}
