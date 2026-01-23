import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FuncionUsuario } from './funcion-usuario.entity';

@Injectable()
export class FuncionUsuariosService {
  constructor(
    @InjectRepository(FuncionUsuario)
    private funcionUsuarioRepository: Repository<FuncionUsuario>,
  ) {}

  // Listar todas las funciones
  findAll(): Promise<FuncionUsuario[]> {
    return this.funcionUsuarioRepository.find({
      order: { nombre: 'ASC' },
    });
  }
}
