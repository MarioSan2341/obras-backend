// src/obra-conceptos/obra-conceptos.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObraConcepto } from './obra-concepto.entity';
import { Concepto } from '../conceptos/concepto.entity';
import { OpObra } from '../op_obras/op_obras.entity';
import { CreateObraConceptoDto } from './dto/create-obra-concepto.dto';

@Injectable()
export class ObraConceptosService {
  constructor(
    @InjectRepository(ObraConcepto)
    private readonly obraConceptoRepo: Repository<ObraConcepto>,

    @InjectRepository(Concepto)
    private readonly conceptoRepo: Repository<Concepto>,

    @InjectRepository(OpObra)
    private readonly obraRepo: Repository<OpObra>,
  ) {}

  async create(dto: CreateObraConceptoDto) {
    /** 1️⃣ Validar obra */
    const obra = await this.obraRepo.findOne({
      where: { idObra: dto.obraId },
    });

    if (!obra) {
      throw new NotFoundException('La obra no existe');
    }

    /** 2️⃣ Validar concepto */
    const concepto = await this.conceptoRepo.findOne({
      where: { id: dto.conceptoId },
      relations: ['padre'],
    });

    if (!concepto) {
      throw new NotFoundException('Concepto no encontrado');
    }

    /** 3️⃣ Solo conceptos hoja */
    const hijos = await this.conceptoRepo.find({
      where: { padre: { id: concepto.id } },
    });

    if (hijos.length > 0) {
      throw new BadRequestException(
        'No se puede agregar un concepto padre a la obra',
      );
    }

    /** 4️⃣ Evitar duplicados */
    const existe = await this.obraConceptoRepo.findOne({
      where: {
        obra_id: dto.obraId,
        concepto: { id: dto.conceptoId },
      },
    });

    if (existe) {
      throw new BadRequestException(
        'Este concepto ya fue agregado a la obra',
      );
    }

    /** 5️⃣ Calcular total */
    const total = Number(dto.cantidad) * Number(dto.costo_unitario);

    /** 6️⃣ Crear relación */
    const registro = this.obraConceptoRepo.create({
      obra_id: dto.obraId,
      concepto,
      cantidad: dto.cantidad,
      costo_unitario: dto.costo_unitario,
      total,
      medicion: dto.medicion,
      observaciones: dto.descripcion_costo,
      estado: true,
      fecha_creacion: new Date(),
    });

    return this.obraConceptoRepo.save(registro);
  }

  /**
   * Construye la ruta abuelo → padre → hijo → nieto desde la tabla conceptos (parent_id).
   * Usa query explícita para leer id, nombre, parent_id y no depender del mapeo de la entidad.
   */
  private async buildConceptoPathFromTable(conceptoId: number): Promise<{ id: number; nombre: string }[]> {
    const path: { id: number; nombre: string }[] = [];
    let currentId: number | null = conceptoId;
    while (currentId != null) {
      const row = await this.conceptoRepo
        .createQueryBuilder('c')
        .select('c.id', 'id')
        .addSelect('c.nombre', 'nombre')
        .addSelect('c.parent_id', 'parent_id')
        .where('c.id = :id', { id: currentId })
        .getRawOne<{ id: number; nombre: string; parent_id: number | null }>();
      if (!row) break;
      path.unshift({ id: row.id, nombre: row.nombre });
      currentId = row.parent_id != null ? row.parent_id : null;
    }
    return path;
  }

  async findByObra(obraId: number) {
    const list = await this.obraConceptoRepo.find({
      where: { obra_id: obraId },
      relations: ['concepto'],
      order: { id: 'ASC' },
    });

    const withPath = await Promise.all(
      list.map(async (oc) => {
        const conceptoPath = await this.buildConceptoPathFromTable(oc.concepto.id);
        const pathKey = conceptoPath.map((p) => p.nombre).join('\0');
        return {
          id: oc.id,
          obra_id: oc.obra_id,
          cantidad: oc.cantidad,
          costo_unitario: oc.costo_unitario,
          total: oc.total,
          medicion: oc.medicion,
          observaciones: oc.observaciones,
          concepto: { id: oc.concepto.id, nombre: oc.concepto.nombre },
          conceptoPath,
          _pathKey: pathKey,
        };
      }),
    );

    withPath.sort((a, b) => (a._pathKey < b._pathKey ? -1 : a._pathKey > b._pathKey ? 1 : 0));
    return withPath.map(({ _pathKey, ...rest }) => rest);
  }

  async remove(id: number) {
    const registro = await this.obraConceptoRepo.findOne({
      where: { id },
    });

    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    return this.obraConceptoRepo.remove(registro);
  }

  async getTotalByObra(obraId: number) {
    const conceptos = await this.obraConceptoRepo.find({
      where: { obra_id: obraId },
    });

    const total = conceptos.reduce((sum, c) => {
      return sum + Number(c.total);
    }, 0);

    return {
      obraId,
      total,
    };
  }
}
