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
import { UpdateObraConceptoDto } from './dto/update-obra-concepto.dto';

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
    // Usar QueryBuilder con select explícito para asegurar que parent_id y medicion se carguen correctamente
    const conceptoRaw = await this.conceptoRepo
      .createQueryBuilder('c')
      .select('c.id', 'id')
      .addSelect('c.nombre', 'nombre')
      .addSelect('c.nivel', 'nivel')
      .addSelect('c.parent_id', 'parent_id')
      .addSelect('c.medicion', 'medicion')
      .where('c.id = :id', { id: dto.conceptoId })
      .getRawOne<{ id: number; nombre: string; nivel: number; parent_id: number | null; medicion: string | null }>();

    if (!conceptoRaw) {
      throw new NotFoundException('Concepto no encontrado');
    }

    /** 3️⃣ No permitir conceptos abuelos (sin parent_id) */
    // Solo bloquear si el concepto NO tiene parent_id (es un concepto raíz/abuelo)
    // Permitir cualquier concepto que tenga parent_id (padre, hijo, nieto)
    // Verificar parent_id explícitamente (puede ser null o undefined)
    if (conceptoRaw.parent_id === null || conceptoRaw.parent_id === undefined) {
      throw new BadRequestException(
        `No se puede agregar un concepto abuelo (nivel raíz) a la obra. Concepto ID: ${conceptoRaw.id}, Nombre: ${conceptoRaw.nombre}, Nivel: ${conceptoRaw.nivel}, Parent ID: ${conceptoRaw.parent_id}. Solo se pueden agregar conceptos padre, hijo o nieto.`,
      );
    }

    // Obtener el concepto completo para usarlo después
    const concepto = await this.conceptoRepo.findOne({
      where: { id: dto.conceptoId },
    });

    if (!concepto) {
      throw new NotFoundException('Concepto no encontrado');
    }

    /** 4️⃣ Evitar duplicados */
    const existe = await this.obraConceptoRepo.findOne({
      where: {
        idobra: dto.obraId,
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
    // Usar la medición del concepto si no se proporciona en el DTO
    // Priorizar: DTO > conceptoRaw (de la query) > concepto (entidad completa)
    const medicionRaw = dto.medicion?.trim() || conceptoRaw.medicion?.trim() || concepto.medicion?.trim() || null;
    // Convertir null a undefined para TypeScript (usar ?? para preservar strings vacíos)
    const medicion = medicionRaw ?? undefined;

    const registro = this.obraConceptoRepo.create({
      idobra: dto.obraId,
      concepto: concepto, // TypeScript ahora sabe que concepto no es null
      cantidad: dto.cantidad,
      costo_unitario: dto.costo_unitario,
      total,
      medicion: medicion,
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
      where: { idobra: obraId },
      relations: ['concepto'],
      order: { id: 'ASC' },
    });

    const withPath = await Promise.all(
      list.map(async (oc) => {
        const conceptoPath = await this.buildConceptoPathFromTable(oc.concepto.id);
        const pathKey = conceptoPath.map((p) => p.nombre).join('\0');
        return {
          id: oc.id,
          obra_id: oc.idobra,
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

  async update(id: number, dto: UpdateObraConceptoDto) {
    const registro = await this.obraConceptoRepo.findOne({
      where: { id },
      relations: ['concepto'],
    });

    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    // Si se proporciona un nuevo conceptoId, validar y actualizar
    if (dto.conceptoId !== undefined && dto.conceptoId !== registro.concepto.id) {
      const nuevoConcepto = await this.conceptoRepo.findOne({
        where: { id: dto.conceptoId },
      });

      if (!nuevoConcepto) {
        throw new NotFoundException('Concepto no encontrado');
      }

      // Validar que no sea un concepto abuelo (nivel 1)
      if (!nuevoConcepto.parent_id) {
        throw new BadRequestException(
          'No se puede cambiar a un concepto abuelo (nivel raíz). Solo se pueden usar conceptos padre, hijo o nieto.',
        );
      }

      // Verificar que no exista otro registro con el mismo concepto en la misma obra
      const existe = await this.obraConceptoRepo.findOne({
        where: {
          idobra: registro.idobra,
          concepto: { id: dto.conceptoId },
        },
      });

      if (existe && existe.id !== id) {
        throw new BadRequestException(
          'Este concepto ya fue agregado a la obra',
        );
      }

      registro.concepto = nuevoConcepto;
    }

    const total = Number(dto.cantidad) * Number(dto.costo_unitario);
    registro.cantidad = dto.cantidad;
    registro.costo_unitario = dto.costo_unitario;
    registro.total = total;
    if (dto.descripcion_costo !== undefined) registro.observaciones = dto.descripcion_costo;
    // La medición NO se puede cambiar, se mantiene la original

    await this.obraConceptoRepo.save(registro);
    return registro.idobra;
  }

  async getTotalByObra(obraId: number) {
    const conceptos = await this.obraConceptoRepo.find({
      where: { idobra: obraId },
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
