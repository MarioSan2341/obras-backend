import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OpObra } from './op_obras.entity';
import { Colonia } from '../colonias/colonias.entity';
import { OpNumeroOficial } from '../op_numerosoficiales/op_numerosoficiales.entity';


@Injectable()
export class OpObrasService {

  constructor(
    @InjectRepository(OpObra)
    private opObraRepository: Repository<OpObra>,
    @InjectRepository(Colonia)
    private coloniasRepository: Repository<Colonia>,
    @InjectRepository(OpNumeroOficial)
    private numerosOficialesRepository: Repository<OpNumeroOficial>,
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

  async findOneWithDetails(id: number) {
    const obra = await this.findOne(id);

    const [numerosOficiales, colonia] = await Promise.all([
      this.numerosOficialesRepository.find({
        where: { idobra: id },
        order: { idnumerosoficialesobra: 'ASC' }
      }),
      obra.idColoniaObra
        ? this.coloniasRepository.findOne({ where: { id_colonia: obra.idColoniaObra } })
        : Promise.resolve(null)
    ]);

    return {
      ...obra,
      nombreColoniaObra: colonia?.nombre ?? '',
      idDensidadColoniaObra: colonia?.densidad ?? '',
      destinoActualProyecto: obra.destinoActualProyeto,
      numerosOficiales: numerosOficiales.map(n => ({
        calle: n.calle ?? '',
        numeroOficial: n.numerooficial
      }))
    };
  }

  create(data: Partial<OpObra>): Promise<OpObra> {
    const obra = this.opObraRepository.create(data);
    return this.opObraRepository.save(obra);
  }

  async update(id: number, data: Partial<OpObra> & { destinoActualProyecto?: string }): Promise<OpObra> {
    const obra = await this.findOne(id);

    if (data.destinoActualProyecto !== undefined) {
      obra.destinoActualProyeto = data.destinoActualProyecto;
      delete (data as any).destinoActualProyecto;
    }
    Object.assign(obra, data);

    return this.opObraRepository.save(obra);
  }

  async remove(id: number): Promise<void> {

    const obra = await this.findOne(id);

    await this.opObraRepository.remove(obra);
  }

  async findAllListado() {
    const [obras, colonias, numerosOficiales] = await Promise.all([
      this.opObraRepository.find({ order: { idObra: 'DESC' } }),
      this.coloniasRepository.find(),
      this.numerosOficialesRepository.find()
    ]);

    const coloniasMap = new Map(colonias.map(c => [c.id_colonia, { nombre: c.nombre, densidad: c.densidad }]));
    const numerosPorObra = new Map<number, { calle: string; numerooficial: string }[]>();
    for (const n of numerosOficiales) {
      const list = numerosPorObra.get(n.idobra) ?? [];
      list.push({ calle: n.calle ?? '', numerooficial: n.numerooficial });
      numerosPorObra.set(n.idobra, list);
    }

    return obras.map(o => {
      const numeros = numerosPorObra.get(o.idObra) ?? [];
      const noOficialStr = numeros.length > 0
        ? numeros.map(n => n.calle ? `${n.calle}, No. ${n.numerooficial}` : `No. ${n.numerooficial}`).join('; ')
        : `Mza ${o.manzanaObra ?? ''} Lt ${o.loteObra ?? ''}`.trim() || '-';

      return {
        id: o.idObra,
        consecutivo: o.consecutivo,
        captura: o.fechaCaptura,
        propietario: o.nombrePropietario,
        calle: o.domicilioPropietario,
        noOficial: noOficialStr,
        colonia: coloniasMap.get(o.idColoniaObra)?.nombre ?? '',
        coloniaDensidad: coloniasMap.get(o.idColoniaObra)?.densidad ?? '',
        estadoObra: o.estadoObra,
        estadoPago: o.estadoPago
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

  async saveNumerosManual(
    id: number,
    numeros: { calle?: string; numeroOficial?: string }[],
  ) {
    await this.findOne(id);

    await this.numerosOficialesRepository.delete({ idobra: id });

    const now = new Date();
    const toInsert = numeros
      .filter((n) => n.numeroOficial?.trim())
      .map((n) => ({
        idobra: id,
        numerooficial: n.numeroOficial!.trim(),
        calle: n.calle?.trim() || undefined,
        fechacreacionno: now,
      }));

    if (toInsert.length > 0) {
      await this.numerosOficialesRepository.insert(toInsert);
    }

    return this.numerosOficialesRepository.find({
      where: { idobra: id },
      order: { idnumerosoficialesobra: 'ASC' },
    });
  }
}
