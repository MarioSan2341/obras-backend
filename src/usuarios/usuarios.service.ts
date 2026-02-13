import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
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
  // HELPERS PARA HASHING
  // ==========================
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password.trim(), saltRounds);
  }

  private async comparePassword(plainPassword: string, hashedPassword: string | number | null | undefined): Promise<boolean> {
    try {
      // Validar y convertir parámetros
      if (!plainPassword) {
        console.error('comparePassword: plainPassword es null/undefined');
        return false;
      }
      
      if (!hashedPassword) {
        console.error('comparePassword: hashedPassword es null/undefined');
        return false;
      }

      // Convertir a string para asegurar que sea un string
      const hashedPasswordStr = String(hashedPassword).trim();
      const plainPasswordStr = String(plainPassword).trim();

      if (!hashedPasswordStr || !plainPasswordStr) {
        console.error('comparePassword: Contraseñas vacías después de trim');
        return false;
      }

      // Si la contraseña almacenada parece ser un hash de bcrypt (empieza con $2a$, $2b$, o $2y$)
      if (hashedPasswordStr.startsWith('$2a$') || hashedPasswordStr.startsWith('$2b$') || hashedPasswordStr.startsWith('$2y$')) {
        return await bcrypt.compare(plainPasswordStr, hashedPasswordStr);
      }
      // Compatibilidad con contraseñas antiguas en texto plano (migración gradual)
      return hashedPasswordStr === plainPasswordStr;
    } catch (error) {
      console.error('Error al comparar contraseñas:', error);
      console.error('Tipo de hashedPassword:', typeof hashedPassword);
      console.error('Valor de hashedPassword:', hashedPassword);
      return false;
    }
  }

  // ==========================
  // LOGIN
  // ==========================
  async login(usuario: string, clave: string) {
    try {
      const user = await this.usuariosRepository
        .createQueryBuilder('u')
        .where('LOWER(u.usuario) = LOWER(:usuario)', { usuario })
        .leftJoinAndSelect('u.cargo', 'cargo')
        .leftJoinAndSelect('u.area', 'area')
        .getOne();

      if (!user) {
        throw new UnauthorizedException('Usuario o contraseña incorrectos');
      }

      if (!user.clave) {
        throw new UnauthorizedException('Usuario o contraseña incorrectos');
      }

      // Asegurar que clave sea string
      const userClaveStr = String(user.clave).trim();
      if (!userClaveStr) {
        throw new UnauthorizedException('Usuario o contraseña incorrectos');
      }

      // Verificar estado ANTES de comparar contraseña para evitar procesamiento innecesario
      if (user.estado !== 'Activo') {
        throw new UnauthorizedException(
          'Tu usuario está inactivo. Contacta al administrador.',
        );
      }

      const passwordMatch = await this.comparePassword(clave, String(user.clave));
      if (!passwordMatch) {
        throw new UnauthorizedException('Usuario o contraseña incorrectos');
      }

      // Si la contraseña estaba en texto plano, hashearla ahora (migración automática)
      const claveStr = String(user.clave || '');
      if (claveStr && !claveStr.startsWith('$2a$') && !claveStr.startsWith('$2b$') && !claveStr.startsWith('$2y$')) {
        try {
          user.clave = await this.hashPassword(clave);
          await this.usuariosRepository.save(user);
        } catch (error) {
          // Si falla el hashing, continuar con el login (no es crítico)
          console.error('Error al hashear contraseña durante login:', error);
        }
      }

      return {
        mensaje: 'Login exitoso',
        usuario: {
          id: user.id_usuarios,
          usuario: user.usuario,
          nombre: `${user.nombre} ${user.ap_paterno} ${user.ap_materno}`.trim(),
          telefono: user.telefono,
          rol: user.rol,
          estado: user.estado,
          funcion: user.funcion,
          cargo: user.cargo?.nombre,
          area: user.area?.nombre,
          fechaCreacion: user.fechaCreacion ? new Date(user.fechaCreacion).toISOString() : null,
          ultimaModificacion: user.fechaModificacion ? new Date(user.fechaModificacion).toISOString() : null,
          ultimoAcceso: new Date().toISOString(),
        },
      };
    } catch (error) {
      // Si ya es una UnauthorizedException, relanzarla
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Para otros errores, loguear y lanzar un error genérico
      console.error('Error en login:', error);
      throw new UnauthorizedException('Error al procesar el login. Intenta nuevamente.');
    }
  }

  // ==========================
  // LISTAR TODOS LOS USUARIOS
  // ==========================
  async findAll() {
    return this.usuariosRepository
      .createQueryBuilder('usuario')
      .select([
        'usuario.id_usuarios',
        'usuario.nombre',
        'usuario.ap_paterno',
        'usuario.ap_materno',
        'usuario.usuario',
        'usuario.telefono',
        'usuario.rol',
        'usuario.estado',
        'usuario.funcion',
        'usuario.fechaCreacion',
      ])
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

    // Hashear la contraseña si se proporciona
    let claveHasheada = data.clave;
    if (data.clave && data.clave.trim()) {
      claveHasheada = await this.hashPassword(data.clave);
    }

    const nuevoUsuario = this.usuariosRepository.create({
      ...data,
      clave: claveHasheada,
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

    const existe = await this.usuariosRepository
      .createQueryBuilder('u')
      .select('u.id_usuarios')
      .where('u.id_usuarios = :id', { id })
      .getOne();
    if (!existe) throw new BadRequestException('Usuario no encontrado');

    // Cargo
    let cargoId: number | null = null;
    if (data.cargo) {
      let cargoEntity = await this.cargoRepository.findOne({
        where: { nombre: data.cargo },
      });
      if (!cargoEntity) {
        cargoEntity = this.cargoRepository.create({ nombre: data.cargo });
        await this.cargoRepository.save(cargoEntity);
      }
      cargoId = cargoEntity.idcargo;
    }

    // Área
    let areaId: number | null = null;
    if (data.area?.id_area) {
      const areaEntity = await this.usuariosRepository.manager.findOneBy('Area', {
        id_area: data.area.id_area,
      });
      areaId = areaEntity?.id_area ?? null;
    }

    // Función
    let funcionId: number | null = null;
    if (data.funcionEspecial?.id_funcion) {
      const funcionEntity = await this.funcionUsuarioRepository.findOne({
        where: { id_funcion: data.funcionEspecial.id_funcion },
      });
      funcionId = funcionEntity?.id_funcion ?? null;
    }

    const updatePayload: Record<string, unknown> = {
      nombre: data.nombre ?? undefined,
      ap_paterno: data.ap_paterno ?? undefined,
      ap_materno: data.ap_materno ?? undefined,
      telefono: data.telefono !== undefined ? data.telefono : undefined,
      estado: data.estado ?? undefined,
      rol: data.rol ?? undefined,
      funcion: data.funcion ?? undefined,
    };
    if (cargoId !== null) updatePayload.cargo_idcargo = cargoId;
    if (areaId !== null) updatePayload.area_id_area = areaId;
    if (funcionId !== null) updatePayload.id_funcion = funcionId;
    if (data.clave && String(data.clave).trim()) {
      updatePayload.clave = await this.hashPassword(data.clave);
    }

    const setKeys = Object.keys(updatePayload).filter((k) => updatePayload[k] !== undefined);
    if (setKeys.length === 0) {
      return this.findOneUsuarioSinClaveNiFechaMod(id);
    }

    const cols = setKeys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = setKeys.map((k) => updatePayload[k]);
    await this.usuariosRepository.manager.query(
      `UPDATE usuarios SET ${cols} WHERE id_usuarios = $1`,
      [id, ...values],
    );

    return this.findOneUsuarioSinClaveNiFechaMod(id);
  }

  private async findOneUsuarioSinClaveNiFechaMod(id: number) {
    return this.usuariosRepository
      .createQueryBuilder('usuario')
      .select([
        'usuario.id_usuarios',
        'usuario.nombre',
        'usuario.ap_paterno',
        'usuario.ap_materno',
        'usuario.usuario',
        'usuario.telefono',
        'usuario.rol',
        'usuario.estado',
        'usuario.funcion',
        'usuario.fechaCreacion',
      ])
      .leftJoinAndSelect('usuario.area', 'area')
      .leftJoinAndSelect('usuario.cargo', 'cargo')
      .leftJoinAndSelect('usuario.funcionEspecial', 'funcionEspecial')
      .where('usuario.id_usuarios = :id', { id })
      .getOne();
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

  /** Requiere clave de un admin para revelar la clave del usuario id. idAdmin = id del admin logueado. */
  async revelarClave(idUsuario: number, idAdmin: number, claveAdmin: string): Promise<{ clave: string; mensaje?: string; estaHasheada?: boolean }> {
    const admin = await this.usuariosRepository.findOne({ where: { id_usuarios: idAdmin } });
    if (!admin || !admin.clave) {
      throw new UnauthorizedException('Clave de administrador incorrecta');
    }
    
    const adminPasswordMatch = await this.comparePassword(claveAdmin, String(admin.clave || ''));
    if (!adminPasswordMatch) {
      throw new UnauthorizedException('Clave de administrador incorrecta');
    }
    
    if (admin.rol !== Rol.ADMIN) {
      throw new UnauthorizedException('Solo un administrador puede ver la clave');
    }
    const usuario = await this.usuariosRepository.findOne({ where: { id_usuarios: idUsuario } });
    if (!usuario) throw new BadRequestException('Usuario no encontrado');
    
    // Verificar si la contraseña está hasheada o en texto plano
    const claveStr = String(usuario.clave || '');
    const estaHasheada = claveStr.startsWith('$2a$') || claveStr.startsWith('$2b$') || claveStr.startsWith('$2y$');
    
    if (estaHasheada) {
      // Solo el admin puede ver: mostramos el valor almacenado (hash) aunque no sea la contraseña en texto
      return {
        clave: claveStr,
        mensaje: 'La contraseña está almacenada hasheada. Se muestra el valor almacenado; la contraseña original no se puede recuperar.',
        estaHasheada: true
      };
    } else if (claveStr.trim() === '') {
      // Si no tiene contraseña
      return {
        clave: '',
        mensaje: 'El usuario no tiene contraseña asignada.',
        estaHasheada: false
      };
    } else {
      // Si está en texto plano (migración pendiente), podemos mostrarla
      return {
        clave: claveStr,
        mensaje: 'Contraseña en texto plano (será hasheada automáticamente en el próximo login)',
        estaHasheada: false
      };
    }
  }

  /** Cambiar clave del usuario: claveActual, nuevaClave, confirmarNuevaClave */
  async cambiarClave(
    idUsuario: number,
    claveActual: string,
    nuevaClave: string,
    confirmarNuevaClave: string,
  ): Promise<{ mensaje: string }> {
    if (nuevaClave !== confirmarNuevaClave) {
      throw new BadRequestException('La nueva clave y su confirmación no coinciden');
    }
    if (!nuevaClave || nuevaClave.trim().length < 1) {
      throw new BadRequestException('La nueva clave no puede estar vacía');
    }
    const usuario = await this.usuariosRepository.findOne({ where: { id_usuarios: idUsuario } });
    if (!usuario || !usuario.clave) {
      throw new BadRequestException('Usuario no encontrado');
    }
    
    const passwordMatch = await this.comparePassword(claveActual, String(usuario.clave || ''));
    if (!passwordMatch) {
      throw new UnauthorizedException('Clave actual incorrecta');
    }
    
    usuario.clave = await this.hashPassword(nuevaClave);
    await this.usuariosRepository.save(usuario);
    return { mensaje: 'Clave actualizada correctamente' };
  }

  /** Cambiar clave de cualquier usuario como admin (sin necesidad de clave actual del usuario objetivo) */
  async cambiarClaveComoAdmin(
    idUsuarioObjetivo: number,
    idAdmin: number,
    claveAdmin: string,
    nuevaClave: string,
    confirmarNuevaClave: string,
  ): Promise<{ mensaje: string }> {
    const admin = await this.usuariosRepository.findOne({ where: { id_usuarios: idAdmin } });
    if (!admin || !admin.clave) {
      throw new UnauthorizedException('Clave de administrador incorrecta');
    }
    
    const adminPasswordMatch = await this.comparePassword(claveAdmin, String(admin.clave || ''));
    if (!adminPasswordMatch) {
      throw new UnauthorizedException('Clave de administrador incorrecta');
    }
    
    if (admin.rol !== Rol.ADMIN) {
      throw new UnauthorizedException('Solo un administrador puede cambiar la clave de otros usuarios');
    }
    if (nuevaClave !== confirmarNuevaClave) {
      throw new BadRequestException('La nueva clave y su confirmación no coinciden');
    }
    if (!nuevaClave || nuevaClave.trim().length < 1) {
      throw new BadRequestException('La nueva clave no puede estar vacía');
    }
    const usuarioObjetivo = await this.usuariosRepository.findOne({ where: { id_usuarios: idUsuarioObjetivo } });
    if (!usuarioObjetivo) throw new BadRequestException('Usuario no encontrado');
    
    usuarioObjetivo.clave = await this.hashPassword(nuevaClave);
    await this.usuariosRepository.save(usuarioObjetivo);
    return { mensaje: 'Clave actualizada correctamente' };
  }

  // ==========================
  // MIGRACIÓN: HASHEAR TODAS LAS CONTRASEÑAS EN LA BD
  // ==========================
  async hashearTodasLasContraseñas(idAdmin: number, claveAdmin: string): Promise<{ mensaje: string; usuariosActualizados: number }> {
    // Verificar que sea un admin
    const admin = await this.usuariosRepository.findOne({ where: { id_usuarios: idAdmin } });
    if (!admin || !admin.clave) {
      throw new UnauthorizedException('Administrador no encontrado');
    }
    
    const adminPasswordMatch = await this.comparePassword(claveAdmin, String(admin.clave || ''));
    if (!adminPasswordMatch) {
      throw new UnauthorizedException('Clave de administrador incorrecta');
    }
    
    if (admin.rol !== Rol.ADMIN) {
      throw new UnauthorizedException('Solo un administrador puede ejecutar esta operación');
    }

    // Obtener todos los usuarios
    const usuarios = await this.usuariosRepository.find();
    let usuariosActualizados = 0;

    for (const usuario of usuarios) {
      // Solo hashear si la contraseña existe y no está ya hasheada
      if (usuario.clave && usuario.clave.trim()) {
        const yaEstaHasheada = usuario.clave.startsWith('$2a$') || 
                               usuario.clave.startsWith('$2b$') || 
                               usuario.clave.startsWith('$2y$');
        
        if (!yaEstaHasheada) {
          // Hashear la contraseña en texto plano
          usuario.clave = await this.hashPassword(usuario.clave);
          await this.usuariosRepository.save(usuario);
          usuariosActualizados++;
        }
      }
    }

    return {
      mensaje: `Migración completada. ${usuariosActualizados} contraseñas hasheadas.`,
      usuariosActualizados
    };
  }
}
