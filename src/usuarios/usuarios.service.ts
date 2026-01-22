import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Rol } from './roles.enum';
import { Cargo } from './cargo.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,

    @InjectRepository(Cargo)
    private cargoRepository: Repository<Cargo>,
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
      .orderBy('usuario.id_usuarios', 'ASC')
      .getMany();
  }

  // ==========================
  // CREAR NUEVO USUARIO
  // ==========================
  async createUsuario(data: any, usuarioLogueado?: Usuario) {
    // 🔐 Solo admin puede crear
    if (usuarioLogueado && usuarioLogueado.rol !== Rol.ADMIN) {
      throw new UnauthorizedException('No autorizado');
    }

    let cargoEntity: Cargo | undefined;

if (data.cargo) {
  const cargoEncontrado = await this.cargoRepository.findOne({
    where: { nombre: data.cargo },
  });

  // Si no existe, lo creamos
  if (!cargoEncontrado) {
    cargoEntity = this.cargoRepository.create({ nombre: data.cargo });
    await this.cargoRepository.save(cargoEntity);
  } else {
    cargoEntity = cargoEncontrado; // ⚡ null nunca
  }
}


    const nuevoUsuario = this.usuariosRepository.create({
      ...data,
      cargo: cargoEntity, // ⚡ undefined si no hay cargo
    });

    return this.usuariosRepository.save(nuevoUsuario);
  }

  // ==========================
  // ACTUALIZAR USUARIO
  // ==========================
  async updateUsuario(id: number, data: any, usuarioLogueado?: Usuario) {
    // 🔐 Solo admin puede actualizar
    if (usuarioLogueado && usuarioLogueado.rol !== Rol.ADMIN) {
      throw new UnauthorizedException('No autorizado');
    }

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
    usuarioExistente.funcion = data.funcion ?? usuarioExistente.funcion;
    usuarioExistente.cargo = cargoEntity ?? usuarioExistente.cargo;

    return this.usuariosRepository.save(usuarioExistente);
  }

  // ==========================
  // ELIMINAR USUARIO
  // ==========================
  async deleteUsuario(id: number) {
    return this.usuariosRepository.delete(id);
  }
}
