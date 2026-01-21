import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { FuncionUsuario } from '../usuarios/funcion-usuario.entity';

@Injectable()
export class AsignacionesService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,

    @InjectRepository(FuncionUsuario)
    private funcionesRepository: Repository<FuncionUsuario>,
  ) {}

  // ==========================
  // LISTAR USUARIOS CON FUNCIÓN
  // ==========================
  // ==========================
// LISTAR USUARIOS CON FUNCIÓN
// ==========================
async findAll() {
  return this.usuariosRepository
    .createQueryBuilder('usuario')
    .leftJoinAndSelect('usuario.funcionEspecial', 'funcion')
    .where('funcion.id_funcion IS NOT NULL')
    .select([
      'usuario.id_usuarios',
      'usuario.nombre',
      'usuario.ap_paterno',
      'usuario.ap_materno',
      'funcion.nombre',
    ])
    .getMany();
}



  // ==========================
  // LISTAR FUNCIONES DISPONIBLES
  // ==========================
  async findFunciones() {
    return this.funcionesRepository.find();
  }

  // ==========================
  // ASIGNAR FUNCIÓN A USUARIO
  // ==========================
  async asignarFuncion(id_usuario: number, id_funcion: number) {
    const usuario = await this.usuariosRepository.findOne({
      where: { id_usuarios: id_usuario },
      relations: ['funcionEspecial'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const funcion = await this.funcionesRepository.findOne({
      where: { id_funcion },
    });

    if (!funcion) {
      throw new NotFoundException('Función no encontrada');
    }

    usuario.funcionEspecial = funcion;

    return this.usuariosRepository.save(usuario);
  }
}
