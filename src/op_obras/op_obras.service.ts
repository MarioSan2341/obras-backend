import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OpObra } from './op_obras.entity';
import { OpNumerosOficiales } from '../op_numeros_oficiales/op-numeros-oficiales.entity';
import { Colonia } from '../colonias/colonias.entity';

@Injectable()
export class OpObrasService {

  constructor(
    @InjectRepository(OpObra)
    private opObraRepository: Repository<OpObra>,
    @InjectRepository(OpNumerosOficiales)
    private numerosOficialesRepository: Repository<OpNumerosOficiales>,
    @InjectRepository(Colonia)
    private coloniaRepository: Repository<Colonia>,
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
    const obras = await this.opObraRepository.find({
      order: { idObra: 'DESC' },
    });

    const obraIds = obras.map((o) => o.idObra);
    const coloniaIds = [...new Set(obras.map((o) => o.idColoniaObra).filter((id): id is number => id != null))];

    const [numerosOficiales, colonias] = await Promise.all([
      obraIds.length > 0
        ? this.numerosOficialesRepository.find({
            where: { idobra: In(obraIds) },
            order: { idnumerosoficialesobra: 'DESC' },
          })
        : [],
      coloniaIds.length > 0
        ? this.coloniaRepository.find({
            where: { id_colonia: In(coloniaIds) },
          })
        : [],
    ]);

    const noOficialPorObra = new Map<number, string>();
    for (const num of numerosOficiales) {
      const texto = num.numerooficial?.trim() ?? '';
      if (!texto) continue;
      const current = noOficialPorObra.get(num.idobra);
      noOficialPorObra.set(num.idobra, current ? `${current}, ${texto}` : texto);
    }

    const coloniaPorId = new Map<number, string>();
    for (const c of colonias) {
      coloniaPorId.set(c.id_colonia, c.nombre);
    }

    return obras.map((o) => {
      const noOficial = noOficialPorObra.get(o.idObra);
      const coloniaNombre = o.idColoniaObra != null ? coloniaPorId.get(o.idColoniaObra) ?? null : null;
      const coloniaDensidad = o.idColoniaObra != null
        ? (colonias.find((c) => c.id_colonia === o.idColoniaObra)?.densidad ?? null)
        : null;
      return {
        id: o.idObra,
        consecutivo: o.consecutivo,
        captura: o.fechaCaptura,
        propietario: o.nombrePropietario,
        calle: o.domicilioPropietario,
        noOficial: noOficial != null && noOficial !== '' ? noOficial : (o.manzanaObra != null || o.loteObra != null ? `Mza ${o.manzanaObra ?? ''} Lt ${o.loteObra ?? ''}`.trim() || null : null),
        colonia: coloniaNombre ?? null,
        coloniaDensidad: coloniaDensidad ?? undefined,
        estadoObra: o.estadoObra,
        estadoPago: o.estadoPago,
      };
    });
  }

   async eliminarObra(id: number) {
    const resultado = await this.opObraRepository.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`La obra con id ${id} no existe`);
    }
    return { mensaje: `Obra con id ${id} eliminada correctamente` };
  }
}
