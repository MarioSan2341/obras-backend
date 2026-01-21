// src/areas/areas.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from './area.entity';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>, // 🔹 readonly recomendado
  ) {}

  findAll(): Promise<Area[]> {
    return this.areaRepository.find();
  }
}
