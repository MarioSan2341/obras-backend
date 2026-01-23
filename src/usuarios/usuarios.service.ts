import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Rol } from './roles.enum';
import { Cargo } from './cargo.entity';
import { FuncionUsuario } from './funcion-usuario.entity';

@Injectable()
export class UsuariosService {
  
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,

    @InjectRepository(Cargo)
    private cargoRepository: Repository<Cargo>,

    @InjectRepository(FuncionUsuario)
    private funcionUsuarioRepository: Repository<FuncionUsuario>,
  ) {}

  // ==========================
  // LOGIN
  // ==========================
  async login(usuario: string, clave: string) {
    const user = await this.usuariosRepository
      .createQueryBuilder('u')
      .where('LOWER(u.usuario) = LOWER(:usuario)', { usuario })
      .leftJoinAndSelect('u.cargo', 'cargo')
      .getOne();

    if (!user || String(user.clave).trim() !== String(clave).trim()) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    if (user.estado !== 'Activo') {
      throw new UnauthorizedException(
        'Tu usuario está inactivo. Contacta al administrador.',
      );
    }

    return {
      mensaje: 'Login exitoso',
      usuario: {
        id: user.id_usuarios,
        nombre: `${user.nombre} ${user.ap_paterno} ${user.ap_materno}`,
        telefono: user.telefono,
        rol: user.rol,
        estado: user.estado,
        funcion: user.funcion,
        cargo: user.cargo?.nombre,
      },
    };
  }

  // ==========================
  // LISTAR TODOS LOS USUARIOS
  // ==========================
  async findAll() {
    return this.usuariosRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.area', 'area')
      .leftJoinAndSelect('usuario.cargo', 'cargo')
      .leftJoinAndSelect('usuario.funcionEspecial', 'funcionEspecial')
      .orderBy('usuario.id_usuarios', 'ASC')
      .getMany();
  }

  // ==========================
  // CREAR NUEVO USUARIO
  // ==========================
  async createUsuario(data: any, usuarioLogueado?: Usuario) {
    if (usuarioLogueado && usuarioLogueado.rol !== Rol.ADMIN) {
      throw new UnauthorizedException('No autorizado');
    }

    // Cargo
    let cargoEntity: Cargo | undefined;
    if (data.cargo) {
      const cargoEncontrado = await this.cargoRepository.findOne({
        where: { nombre: data.cargo },
      });
      if (!cargoEncontrado) {
        cargoEntity = this.cargoRepository.create({ nombre: data.cargo });
        await this.cargoRepository.save(cargoEntity);
      } else {
        cargoEntity = cargoEncontrado;
      }
    }

    // Área
    let areaEntity;
    if (data.area?.id_area) {
      areaEntity = await this.usuariosRepository.manager.findOneBy('Area', {
        id_area: data.area.id_area,
      });
    }

    // Función
    let funcionEntity;
    if (data.funcionEspecial?.id_funcion) {
      funcionEntity = await this.funcionUsuarioRepository.findOne({
        where: { id_funcion: data.funcionEspecial.id_funcion },
      });
    }

    const nuevoUsuario = this.usuariosRepository.create({
      ...data,
      cargo: cargoEntity ?? null,
      area: areaEntity ?? null,
      funcionEspecial: funcionEntity ?? null,
    });

    return this.usuariosRepository.save(nuevoUsuario);
  }

  // ==========================
  // ACTUALIZAR USUARIO
  // ==========================
  async updateUsuario(id: number, data: any, usuarioLogueado?: Usuario) {
    if (usuarioLogueado && usuarioLogueado.rol !== Rol.ADMIN) {
      throw new UnauthorizedException('No autorizado');
    }

    // Cargo
    let cargoEntity: Cargo | undefined;
    if (data.cargo) {
      const cargoEncontrado = await this.cargoRepository.findOne({
        where: { nombre: data.cargo },
      });
      if (!cargoEncontrado) {
        cargoEntity = this.cargoRepository.create({ nombre: data.cargo });
        await this.cargoRepository.save(cargoEntity);
      } else {
        cargoEntity = cargoEncontrado;
      }
    }

    // Área
    let areaEntity;
    if (data.area?.id_area) {
      areaEntity = await this.usuariosRepository.manager.findOneBy('Area', {
        id_area: data.area.id_area,
      });
    }

    // Función
    let funcionEntity;
    if (data.funcionEspecial?.id_funcion) {
      funcionEntity = await this.funcionUsuarioRepository.findOne({
        where: { id_funcion: data.funcionEspecial.id_funcion },
      });
    }

    const usuarioExistente = await this.usuariosRepository.findOne({
      where: { id_usuarios: id },
    });
    if (!usuarioExistente) throw new Error('Usuario no encontrado');

    usuarioExistente.nombre = data.nombre ?? usuarioExistente.nombre;
    usuarioExistente.ap_paterno = data.ap_paterno ?? usuarioExistente.ap_paterno;
    usuarioExistente.ap_materno = data.ap_materno ?? usuarioExistente.ap_materno;
    usuarioExistente.telefono = data.telefono ?? usuarioExistente.telefono;
    usuarioExistente.estado = data.estado ?? usuarioExistente.estado;
    usuarioExistente.rol = data.rol ?? usuarioExistente.rol;
    usuarioExistente.cargo = cargoEntity ?? usuarioExistente.cargo;
    usuarioExistente.area = areaEntity ?? usuarioExistente.area;
    usuarioExistente.funcionEspecial = funcionEntity ?? usuarioExistente.funcionEspecial;

    return this.usuariosRepository.save(usuarioExistente);
  }

  // ==========================
  // ELIMINAR USUARIO
  // ==========================
  async deleteUsuario(id: number) {
    return this.usuariosRepository.delete(id);
  }

  // usuarios.service.ts
async findAllFunciones(): Promise<FuncionUsuario[]> {
  return this.funcionUsuarioRepository.find({
    order: { nombre: 'ASC' },
  });
}


}
