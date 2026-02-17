import { Injectable, UnauthorizedException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import { Rol } from './roles.enum';
import { Cargo } from './cargo.entity';
import { FuncionUsuario } from './funcion-usuario.entity';
import { HistorialService } from '../historial/historial.service';

@Injectable()
export class UsuariosService {
  
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,

    @InjectRepository(Cargo)
    private cargoRepository: Repository<Cargo>,

    @InjectRepository(FuncionUsuario)
    private funcionUsuarioRepository: Repository<FuncionUsuario>,

    @Inject(forwardRef(() => HistorialService))
    private historialService: HistorialService,
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
        .select([
          'u.id_usuarios',
          'u.nombre',
          'u.ap_paterno',
          'u.ap_materno',
          'u.usuario',
          'u.telefono',
          'u.clave',
          'u.rol',
          'u.estado',
          'u.funcion',
          'u.fechaCreacion',
          'u.area_id_area',
          'u.cargo_idcargo',
          'u.id_funcion',
        ])
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
    // Solo ADMIN puede crear usuarios
    if (usuarioLogueado && usuarioLogueado.rol !== Rol.ADMIN) {
      throw new UnauthorizedException('Solo los administradores pueden crear usuarios');
    }

    // Cargo
    let cargoId: number | null = null;
    if (data.cargo) {
      const cargoEncontrado = await this.cargoRepository.findOne({
        where: { nombre: data.cargo },
      });
      if (!cargoEncontrado) {
        const cargoNuevo = this.cargoRepository.create({ nombre: data.cargo });
        const cargoGuardado = await this.cargoRepository.save(cargoNuevo);
        cargoId = cargoGuardado.idcargo;
      } else {
        cargoId = cargoEncontrado.idcargo;
      }
    }

    // Área
    let areaId: number | null = null;
    if (data.area?.id_area) {
      areaId = data.area.id_area;
    }

    // Función
    let funcionId: number | null = null;
    if (data.funcionEspecial?.id_funcion) {
      funcionId = data.funcionEspecial.id_funcion;
    }

    // Hashear la contraseña si se proporciona
    let claveHasheada = data.clave;
    if (data.clave && data.clave.trim()) {
      claveHasheada = await this.hashPassword(data.clave);
    }

    // Usar inserción SQL directa para evitar problemas con fecha_modificacion
    const insertData: any = {
      nombre: data.nombre,
      ap_paterno: data.ap_paterno,
      ap_materno: data.ap_materno ?? null,
      usuario: data.usuario,
      telefono: data.telefono ?? null,
      clave: claveHasheada,
      rol: data.rol || Rol.USUARIO,
      estado: data.estado ?? null,
      funcion: data.funcion ?? null,
    };

    if (cargoId !== null && cargoId !== undefined) {
      insertData.cargo_idcargo = cargoId;
    }
    if (areaId !== null && areaId !== undefined) {
      insertData.area_id_area = areaId;
    }
    if (funcionId !== null && funcionId !== undefined) {
      insertData.id_funcion = funcionId;
    }

    const columns = Object.keys(insertData);
    const values = Object.values(insertData);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const columnNames = columns.join(', ');

    const result = await this.usuariosRepository.manager.query(
      `INSERT INTO usuarios (${columnNames}) VALUES (${placeholders}) RETURNING id_usuarios`,
      values,
    );

    const idUsuarioCreado = result[0]?.id_usuarios;
    if (!idUsuarioCreado) {
      throw new BadRequestException('Error al crear el usuario');
    }

    // Obtener el usuario creado sin clave ni fecha_modificacion
    const usuario = await this.findOneUsuarioSinClaveNiFechaMod(idUsuarioCreado);
    
    if (!usuario) {
      throw new BadRequestException('Error al obtener el usuario creado');
    }
    
    // Registrar en historial si hay usuario logueado válido que creó este usuario
    if (usuarioLogueado && usuarioLogueado.id_usuarios) {
      try {
        await this.historialService.registrarAccion(
          usuarioLogueado.id_usuarios,
          `Creó un nuevo usuario`,
          'crear',
          'Usuario',
          usuario.id_usuarios,
          `Usuario ID: ${usuario.id_usuarios}, Nombre: ${usuario.nombre} ${usuario.ap_paterno || ''}`,
        );
      } catch (error) {
        // No fallar la creación del usuario si falla el registro en historial
        console.error('Error al registrar en historial:', error);
      }
    }
    
    return usuario;
  }

  // ==========================
  // ACTUALIZAR USUARIO
  // ==========================
  async updateUsuario(id: number, data: any, usuarioLogueado?: Usuario) {
    // Solo ADMIN puede modificar usuarios (SUPERVISOR solo puede leer)
    if (usuarioLogueado && usuarioLogueado.rol !== Rol.ADMIN) {
      throw new UnauthorizedException('Solo los administradores pueden modificar usuarios');
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
      usuario: data.usuario ?? undefined,
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

    const usuarioActualizado = await this.findOneUsuarioSinClaveNiFechaMod(id);
    
    if (!usuarioActualizado) {
      throw new BadRequestException('Usuario no encontrado después de la actualización');
    }
    
    // Registrar en historial si hay usuario logueado válido que modificó este usuario
    if (usuarioLogueado && usuarioLogueado.id_usuarios) {
      try {
        await this.historialService.registrarAccion(
          usuarioLogueado.id_usuarios,
          `Modificó información de usuario`,
          'modificar',
          'Usuario',
          usuarioActualizado.id_usuarios,
          `Usuario ID: ${usuarioActualizado.id_usuarios}, Nombre: ${usuarioActualizado.nombre} ${usuarioActualizado.ap_paterno || ''}`,
        );
      } catch (error) {
        // No fallar la actualización del usuario si falla el registro en historial
        console.error('Error al registrar en historial:', error);
      }
    }
    
    return usuarioActualizado;
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
  async deleteUsuario(id: number, usuarioLogueado?: Usuario) {
    // Solo ADMIN puede eliminar usuarios (SUPERVISOR solo puede leer)
    if (usuarioLogueado && usuarioLogueado.rol !== Rol.ADMIN) {
      throw new UnauthorizedException('Solo los administradores pueden eliminar usuarios');
    }

    // Obtener información del usuario antes de eliminarlo para el historial
    const usuarioAEliminar = await this.usuariosRepository.findOne({
      where: { id_usuarios: id },
      select: ['id_usuarios', 'nombre', 'ap_paterno', 'ap_materno'],
    });

    const resultado = await this.usuariosRepository.delete(id);

    // Registrar en historial si hay usuario logueado válido que eliminó este usuario
    if (usuarioLogueado && usuarioLogueado.id_usuarios && usuarioAEliminar) {
      try {
        await this.historialService.registrarAccion(
          usuarioLogueado.id_usuarios,
          `Eliminó un usuario`,
          'eliminar',
          'Usuario',
          usuarioAEliminar.id_usuarios,
          `Usuario ID: ${usuarioAEliminar.id_usuarios}, Nombre: ${usuarioAEliminar.nombre} ${usuarioAEliminar.ap_paterno || ''}`,
        );
      } catch (error) {
        // No fallar la eliminación del usuario si falla el registro en historial
        console.error('Error al registrar en historial:', error);
      }
    }

    return resultado;
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
    
    // Registrar en historial
    try {
      await this.historialService.registrarAccion(
        idUsuario,
        `Cambió su contraseña`,
        'modificar',
        'Usuario',
        idUsuario,
        `Usuario ID: ${idUsuario}`,
      );
    } catch (error) {
      console.error('Error al registrar en historial:', error);
    }
    
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
    
    // Registrar en historial
    try {
      await this.historialService.registrarAccion(
        idAdmin,
        `Cambió la contraseña de un usuario`,
        'modificar',
        'Usuario',
        idUsuarioObjetivo,
        `Usuario objetivo ID: ${idUsuarioObjetivo}, Nombre: ${usuarioObjetivo.nombre} ${usuarioObjetivo.ap_paterno || ''}`,
      );
    } catch (error) {
      console.error('Error al registrar en historial:', error);
    }
    
    return { mensaje: 'Clave actualizada correctamente' };
  }

  /** Cambiar clave como admin sin verificar la clave del admin (solo verifica que sea admin) */
  async cambiarClaveComoAdminDirecto(
    idUsuarioObjetivo: number,
    idAdmin: number,
    nuevaClave: string,
    confirmarNuevaClave: string,
  ): Promise<{ mensaje: string }> {
    const admin = await this.usuariosRepository
      .createQueryBuilder('u')
      .select(['u.id_usuarios', 'u.rol'])
      .where('u.id_usuarios = :id', { id: idAdmin })
      .getOne();
    
    if (!admin) {
      throw new UnauthorizedException('Administrador no encontrado');
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
    
    // Verificar que el usuario objetivo existe sin cargar fecha_modificacion
    const existeUsuario = await this.usuariosRepository
      .createQueryBuilder('u')
      .select('u.id_usuarios')
      .where('u.id_usuarios = :id', { id: idUsuarioObjetivo })
      .getOne();
    
    if (!existeUsuario) {
      throw new BadRequestException('Usuario no encontrado');
    }
    
    // Obtener información del usuario objetivo antes de cambiar la clave
    const usuarioObjetivo = await this.usuariosRepository
      .createQueryBuilder('u')
      .select(['u.id_usuarios', 'u.nombre', 'u.ap_paterno'])
      .where('u.id_usuarios = :id', { id: idUsuarioObjetivo })
      .getOne();

    if (!usuarioObjetivo) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Actualizar la clave directamente usando SQL raw para evitar fecha_modificacion
    const claveHasheada = await this.hashPassword(nuevaClave);
    await this.usuariosRepository.manager.query(
      'UPDATE usuarios SET clave = $1 WHERE id_usuarios = $2',
      [claveHasheada, idUsuarioObjetivo],
    );
    
    // Registrar en historial
    try {
      await this.historialService.registrarAccion(
        idAdmin,
        `Cambió la contraseña de un usuario`,
        'modificar',
        'Usuario',
        idUsuarioObjetivo,
        `Usuario objetivo ID: ${idUsuarioObjetivo}, Nombre: ${usuarioObjetivo.nombre} ${usuarioObjetivo.ap_paterno || ''}`,
      );
    } catch (error) {
      console.error('Error al registrar en historial:', error);
    }
    
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
