import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity'; // Asegúrate de tener tu entidad correcta
import { Rol } from './roles.enum';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  // Aquí va tu función login
  async login(nombre: string, clave: string) {
  const user = await this.usuariosRepository
    .createQueryBuilder('usuario')
    .where('LOWER(usuario.nombre) = LOWER(:nombre)', { nombre })
    .getOne();

  if (!user || String(user.clave || '').trim() !== String(clave).trim()) {
    throw new UnauthorizedException('Usuario o contraseña incorrectos');
  }

  return {
    mensaje: 'Login exitoso',
    usuario: {
      id: user.id_usuarios,
      nombre: `${user.nombre} ${user.ap_paterno} ${user.ap_materno}`,
      telefono: user.telefono,
      rol: user.rol,
      estado: user.estado,
      funcion: user.funcion
    },
  };
}

async findAll() {
  return this.usuariosRepository.find({
    order: { id_usuarios: 'ASC' },
  });
}

async updateUsuario(
  id: number,
  data: Partial<Usuario>,
  usuarioLogueado?: Usuario,
) {
  // 🔐 Validación de rol
  if (usuarioLogueado && usuarioLogueado.rol !== Rol.ADMIN) {
    throw new UnauthorizedException('No autorizado');
  }

  await this.usuariosRepository.update(id, data);

  return this.usuariosRepository.findOne({
    where: { id_usuarios: id },
  });
}


async deleteUsuario(id: number) {
  return this.usuariosRepository.delete(id);
}



  }

