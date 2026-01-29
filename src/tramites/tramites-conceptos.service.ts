import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TramitesConceptos } from './tramites-conceptos.entity';
import { Tramite } from '../tramites/tramite.entity';
import { Concepto } from '../conceptos/concepto.entity';
import { CreateTramiteConceptoDto } from './dto/create-tramite-concepto.dto';

@Injectable()
export class TramitesConceptosService {
  constructor(
    @InjectRepository(TramitesConceptos)
    private readonly repo: Repository<TramitesConceptos>,

    @InjectRepository(Tramite)
    private readonly tramitesRepo: Repository<Tramite>,

    @InjectRepository(Concepto)
    private readonly conceptosRepo: Repository<Concepto>,
  ) {}

  // 🔹 Obtener conceptos asociados a un trámite
  async findByTramite(tramiteId: number) {
    return this.repo.find({
      where: { tramite_id: tramiteId },
      relations: ['concepto'],
      order: { id: 'ASC' },
    });
  }

  // 🔹 Crear relación trámite–concepto
  async create(dto: CreateTramiteConceptoDto) {
    const tramite = await this.tramitesRepo.findOne({
      where: { id: dto.tramite_id },
    });

    if (!tramite) {
      throw new NotFoundException('Trámite no encontrado');
    }

    const concepto = await this.conceptosRepo.findOne({
      where: { id: dto.concepto_id },
    });

    if (!concepto) {
      throw new NotFoundException('Concepto no encontrado');
    }

    // Validar duplicado
    const existe = await this.repo.findOne({
      where: {
        tramite_id: dto.tramite_id,
        concepto_id: dto.concepto_id,
      },
    });

    if (existe) {
      throw new BadRequestException(
        'El concepto ya está asignado a este trámite',
      );
    }

    const relacion = this.repo.create({
      tramite_id: dto.tramite_id,
      concepto_id: dto.concepto_id,
      estado: dto.estado ?? true,
    });

    return this.repo.save(relacion);
  }

  // 🔹 Eliminar relación
  async remove(id: number) {
    const registro = await this.repo.findOne({
      where: { id },
    });

    if (!registro) {
      throw new NotFoundException(
        'Relación trámite–concepto no encontrada',
      );
    }

    return this.repo.remove(registro);
  }
}
