import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concepto } from './concepto.entity';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';
import { IsNull } from 'typeorm';

@Injectable()
export class ConceptosService {
  constructor(
    @InjectRepository(Concepto)
    private readonly repo: Repository<Concepto>,
  ) {}

  async findAll() {
    return this.repo.find({
      relations: ['padre'],
      order: { nivel: 'ASC', id: 'ASC' },
    });
  }

  async findByParent(parentId: number | null) {
  return this.repo.find({
    where: parentId
      ? { padre: { id: parentId } }
      : { padre: IsNull() },
    order: { id: 'ASC' },
  });
}


  async create(dto: CreateConceptoDto) {
  let nivel = 1;
  let padre: Concepto | null = null;

  if (dto.parent_id) {
    padre = await this.repo.findOne({
      where: { id: dto.parent_id },
    });

    if (!padre) {
      throw new NotFoundException('Concepto padre no existe');
    }

    nivel = padre.nivel + 1;

    if (nivel > 4) {
      throw new BadRequestException('Máximo 4 niveles permitidos');
    }
  }

  const concepto = this.repo.create({
    ...dto,
    nivel,
    padre,
  });

  return this.repo.save(concepto);
}


  async update(id: number, dto: UpdateConceptoDto) {
    const concepto = await this.repo.findOne({ where: { id } });
    if (!concepto) throw new NotFoundException('Concepto no encontrado');

    Object.assign(concepto, dto);
    return this.repo.save(concepto);
  }

  async getArbol() {
  const conceptos = await this.repo.find({
    order: { nivel: 'ASC', id: 'ASC' },
  });

  const map = new Map<number, any>();
  const arbol: any[] = [];

  // Inicializar nodos
  conceptos.forEach((c) => {
    map.set(c.id, {
      ...c,
      children: [],
    });
  });

  // Armar árbol
  conceptos.forEach((c) => {
    if (c.parent_id) {
      const padre = map.get(c.parent_id);
      if (padre) {
        padre.children.push(map.get(c.id));
      }
    } else {
      arbol.push(map.get(c.id));
    }
  });

  return arbol;
}

async remove(id: number) {
  const concepto = await this.repo.findOne({
    where: { id },
    relations: ['hijos'],
  });

  if (!concepto) {
    throw new NotFoundException('Concepto no encontrado');
  }

  if (concepto.hijos.length > 0) {
    throw new BadRequestException(
      'No se puede eliminar un concepto que tiene hijos',
    );
  }

  return this.repo.remove(concepto);
}

async getForSelect(parentId?: number) {
  return this.repo.find({
    where: parentId
      ? { padre: { id: parentId } }
      : { padre: IsNull() },
    select: ['id', 'nombre', 'nivel'],
    order: { nombre: 'ASC' },
  });
}

async findOne(id: number) {
  const concepto = await this.repo.findOne({
    where: { id },
    relations: ['padre'],
  });

  if (!concepto) {
    throw new NotFoundException('Concepto no encontrado');
  }

  return concepto;
}

}
