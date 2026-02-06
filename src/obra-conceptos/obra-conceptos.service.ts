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
import { CreateObraConceptoDto } from './dto/create-obra-concepto.dto';

@Injectable()
export class ObraConceptosService {
  constructor(
    @InjectRepository(ObraConcepto)
    private readonly obraConceptoRepo: Repository<ObraConcepto>,

    @InjectRepository(Concepto)
    private readonly conceptoRepo: Repository<Concepto>,
  ) {}

  async create(dto: CreateObraConceptoDto) {
    const concepto = await this.conceptoRepo.findOne({
      where: { id: dto.concepto_id },
    });

    if (!concepto) {
      throw new NotFoundException('Concepto no encontrado');
    }

    // 🔐 Solo conceptos hoja
    const hijos = await this.conceptoRepo.find({
      where: { padre: { id: concepto.id } },
    });

    if (hijos.length > 0) {
      throw new BadRequestException(
        'No se puede agregar un concepto padre a la obra',
      );
    }

    // 🔁 Evitar duplicados
    const existe = await this.obraConceptoRepo.findOne({
      where: {
        obra_id: dto.obra_id,
        concepto: { id: dto.concepto_id },
      },
    });

    if (existe) {
      throw new BadRequestException(
        'Este concepto ya fue agregado a la obra',
      );
    }

    const registro = this.obraConceptoRepo.create({
      obra_id: dto.obra_id,
      concepto,
      descripcion_costo: dto.descripcion_costo,
      medicion: dto.medicion,
      costo_unitario: dto.costo_unitario,
      cantidad: dto.cantidad,
    });

    return this.obraConceptoRepo.save(registro);
  }

  async findByObra(obraId: number) {
    return this.obraConceptoRepo.find({
      where: { obra_id: obraId },
      relations: ['concepto'],
      order: { id: 'ASC' },
    });
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
}
