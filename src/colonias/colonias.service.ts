import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Colonia } from './colonias.entity';

@Injectable()
export class ColoniasService {
  constructor(
    @InjectRepository(Colonia)
    private repo: Repository<Colonia>,
  ) {}

  findAll() {
    return this.repo.find({
      order: { id_colonia: 'ASC' },
    });
  }

  create(data: Partial<Colonia>) {
    return this.repo.save(data);
  }

  update(id: number, data: Partial<Colonia>) {
    return this.repo.update(id, data);
  }

  delete(id: number) {
    return this.repo.delete(id);
  }
}
