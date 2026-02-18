import { Injectable, NotFoundException, Inject, forwardRef, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OpObra } from './op_obras.entity';
import { Colonia } from '../colonias/colonias.entity';
import { OpNumeroOficial } from '../op_numerosoficiales/op_numerosoficiales.entity';
import { HistorialService } from '../historial/historial.service';
import { Usuario } from '../usuarios/usuario.entity';
import { Rol } from '../usuarios/roles.enum';


@Injectable()
export class OpObrasService {

  constructor(
    @InjectRepository(OpObra)
    private opObraRepository: Repository<OpObra>,
    @InjectRepository(Colonia)
    private coloniasRepository: Repository<Colonia>,
    @InjectRepository(OpNumeroOficial)
    private numerosOficialesRepository: Repository<OpNumeroOficial>,
    @Inject(forwardRef(() => HistorialService))
    private historialService: HistorialService,
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  /**
   * Verifica si un usuario puede realizar acciones de escritura (crear/modificar/eliminar)
   * SUPERVISOR solo puede leer, ADMIN y USUARIO pueden escribir
   */
  private async puedeEscribir(idUsuario?: number): Promise<boolean> {
    if (!idUsuario) return true; // Si no hay usuario, permitir (para compatibilidad)
    
    const usuario = await this.usuariosRepository.findOne({
      where: { id_usuarios: idUsuario },
      select: ['id_usuarios', 'rol'],
    });
    
    if (!usuario) return false;
    
    // SUPERVISOR solo puede leer
    return usuario.rol !== Rol.SUPERVISOR;
  }

  findAll(): Promise<OpObra[]> {
    return this.opObraRepository.find({
      order: { idObra: 'DESC' }
    });
  }

  async findOne(id: number): Promise<OpObra> {
    const obra = await this.opObraRepository.findOne({
      where: { idObra: id },
      relations: ['directorObra']
    });

    if (!obra) {
      throw new NotFoundException('Obra no encontrada');
    }

    return obra;
  }

  async findOneWithDetails(id: number) {
    const obra = await this.findOne(id);

    const [numerosOficiales, colonia] = await Promise.all([
      this.numerosOficialesRepository.find({
        where: { idobra: id },
        order: { idnumerosoficialesobra: 'ASC' }
      }),
      obra.idColoniaObra
        ? this.coloniasRepository.findOne({ where: { id_colonia: obra.idColoniaObra } })
        : Promise.resolve(null)
    ]);

    const director = obra.directorObra;
    const directorLabel = director
      ? (director.clave_director ? `${director.clave_director}: ${director.nombre_completo}` : director.nombre_completo)
      : null;

    return {
      ...obra,
      idDirectorObra: obra.idDirectorObra ?? null,
      directorObraLabel: directorLabel,
      nombreColoniaObra: colonia?.nombre ?? '',
      idDensidadColoniaObra: colonia?.densidad ?? '',
      destinoActualProyecto: obra.destinoActualProyeto,
      numerosOficiales: numerosOficiales.map(n => ({
        calle: n.calle ?? '',
        numeroOficial: n.numerooficial
      }))
    };
  }

  async create(data: Partial<OpObra> & { destinoActualProyecto?: string }): Promise<OpObra> {
    // Verificar permisos: SUPERVISOR no puede crear obras
    const idUsuario = data.idUsuarioCapturador;
    if (idUsuario && !(await this.puedeEscribir(idUsuario))) {
      throw new UnauthorizedException('Los supervisores solo pueden visualizar información, no pueden crear obras');
    }

    // Si no viene idUsuarioAutorizador, usar el mismo que idUsuarioCapturador (o null si tampoco hay)
    // Esto evita el error de NOT NULL constraint en la base de datos
    if (data.idUsuarioAutorizador === undefined && data.idUsuarioCapturador !== undefined) {
      data.idUsuarioAutorizador = data.idUsuarioCapturador;
    }

    // Convertir destinoActualProyecto (del frontend) a destinoActualProyeto (de la entidad)
    if (data.destinoActualProyecto !== undefined) {
      (data as any).destinoActualProyeto = data.destinoActualProyecto;
      delete (data as any).destinoActualProyecto;
    }

    const obra = this.opObraRepository.create(data);
    const obraGuardada = await this.opObraRepository.save(obra);
    
    // Registrar en historial si hay usuario capturador
    if (obraGuardada.idUsuarioCapturador) {
      try {
        await this.historialService.registrarAccion(
          obraGuardada.idUsuarioCapturador,
          `Creó una nueva obra`,
          'crear',
          'Obra',
          obraGuardada.idObra,
          `Obra ID: ${obraGuardada.idObra}, Consecutivo: ${obraGuardada.consecutivo || 'N/A'}`,
        );
      } catch (error) {
        // No fallar la creación de la obra si falla el registro en historial
        console.error('Error al registrar en historial:', error);
      }
    }
    
    return obraGuardada;
  }

  async update(id: number, data: Partial<OpObra> & { destinoActualProyecto?: string }, idUsuarioModificador?: number): Promise<OpObra> {
    // Verificar permisos: SUPERVISOR no puede modificar obras
    if (idUsuarioModificador && !(await this.puedeEscribir(idUsuarioModificador))) {
      throw new UnauthorizedException('Los supervisores solo pueden visualizar información, no pueden modificar obras');
    }

    const obra = await this.findOne(id);

    if (data.destinoActualProyecto !== undefined) {
      obra.destinoActualProyeto = data.destinoActualProyecto;
      delete (data as any).destinoActualProyecto;
    }
    if ((data as any).directorObra !== undefined) delete (data as any).directorObra;
    if ((data as any).directorObraLabel !== undefined) delete (data as any).directorObraLabel;
    Object.assign(obra, data);

    const obraActualizada = await this.opObraRepository.save(obra);
    
    // Registrar en historial si hay usuario modificador
    const usuarioId = idUsuarioModificador || obraActualizada.idUsuarioCapturador;
    if (usuarioId) {
      try {
        await this.historialService.registrarAccion(
          usuarioId,
          `Modificó información de obra`,
          'modificar',
          'Obra',
          obraActualizada.idObra,
          `Obra ID: ${obraActualizada.idObra}, Consecutivo: ${obraActualizada.consecutivo || 'N/A'}`,
        );
      } catch (error) {
        // No fallar la actualización de la obra si falla el registro en historial
        console.error('Error al registrar en historial:', error);
      }
    }
    
    return obraActualizada;
  }

  async remove(id: number): Promise<void> {

    const obra = await this.findOne(id);

    await this.opObraRepository.remove(obra);
  }

  async findAllListado() {
    const [obras, colonias, numerosOficiales] = await Promise.all([
      this.opObraRepository.find({ order: { idObra: 'DESC' } }),
      this.coloniasRepository.find(),
      this.numerosOficialesRepository.find()
    ]);

    const coloniasMap = new Map(colonias.map(c => [c.id_colonia, { nombre: c.nombre, densidad: c.densidad }]));
    const numerosPorObra = new Map<number, { calle: string; numerooficial: string }[]>();
    for (const n of numerosOficiales) {
      const list = numerosPorObra.get(n.idobra) ?? [];
      list.push({ calle: n.calle ?? '', numerooficial: n.numerooficial });
      numerosPorObra.set(n.idobra, list);
    }

    return obras.map(o => {
      const numeros = numerosPorObra.get(o.idObra) ?? [];
      const noOficialStr = numeros.length > 0
        ? numeros.map(n => n.calle ? `${n.calle}, No. ${n.numerooficial}` : `No. ${n.numerooficial}`).join('; ')
        : `Mza ${o.manzanaObra ?? ''} Lt ${o.loteObra ?? ''}`.trim() || '-';

      return {
        id: o.idObra,
        consecutivo: o.consecutivo,
        captura: o.fechaCaptura,
        propietario: o.nombrePropietario,
        calle: numeros.length > 0 ? numeros[0].calle ?? '' : '',
        noOficial: noOficialStr,
        colonia: coloniasMap.get(o.idColoniaObra)?.nombre ?? '',
        coloniaDensidad: coloniasMap.get(o.idColoniaObra)?.densidad ?? '',
        numerosPrediosContiguos: o.numerosPrediosContiguosObra ?? '',
        estadoObra: o.estadoObra,
        estadoPago: o.estadoPago
      };
    });
  }

  // Obtener obras con filtros optimizados y paginación (filtra directamente en BD)
  async findListadoFiltrado(
    consecutivo?: string,
    fechaCaptura?: string,
    nombrePropietario?: string,
    numerosPrediosContiguos?: string,
    calle?: string,
    page?: number,
    limit?: number,
  ) {
    try {
      const pageNum = page ?? 1;
      const limitNum = limit ?? 10;
      const skip = (pageNum - 1) * limitNum;

      // Construir query con filtros en la BD
      const queryBuilder = this.opObraRepository.createQueryBuilder('obra');

      // Filtrar por calle (viene de op_numerosoficiales)
      if (calle && calle.trim()) {
        queryBuilder.innerJoin(
          'op_numerosoficiales',
          'num',
          'num.idobra = obra.idobra AND LOWER(COALESCE(num.calle, \'\')) LIKE LOWER(:calle)',
          { calle: `%${calle.trim()}%` },
        );
        queryBuilder.distinct(true);
      }

      // Filtrar por consecutivo
      if (consecutivo && consecutivo.trim()) {
        queryBuilder.andWhere('LOWER(obra.consecutivo) LIKE LOWER(:consecutivo)', {
          consecutivo: `%${consecutivo.trim()}%`,
        });
      }

      // Filtrar por fecha de captura (rango de un día si se proporciona fecha)
      if (fechaCaptura && fechaCaptura.trim()) {
        const fechaInicio = new Date(fechaCaptura);
        fechaInicio.setHours(0, 0, 0, 0);
        const fechaFin = new Date(fechaCaptura);
        fechaFin.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('obra.fechaCaptura >= :fechaInicio', { fechaInicio });
        queryBuilder.andWhere('obra.fechaCaptura <= :fechaFin', { fechaFin });
      }

      // Filtrar por nombre del propietario
      if (nombrePropietario && nombrePropietario.trim()) {
        queryBuilder.andWhere('LOWER(obra.nombrePropietario) LIKE LOWER(:nombrePropietario)', {
          nombrePropietario: `%${nombrePropietario.trim()}%`,
        });
      }

      // Filtrar por números predios contiguos
      if (numerosPrediosContiguos && numerosPrediosContiguos.trim()) {
        queryBuilder.andWhere('LOWER(obra.numerosPrediosContiguosObra) LIKE LOWER(:numerosPrediosContiguos)', {
          numerosPrediosContiguos: `%${numerosPrediosContiguos.trim()}%`,
        });
      }

      // Ordenar por ID descendente
      queryBuilder.orderBy('obra.idObra', 'DESC');

      const totalRegistros = await queryBuilder.getCount();
      const totalPaginas = Math.ceil(totalRegistros / limitNum) || 1;
      const pageValid = Math.max(1, Math.min(pageNum, totalPaginas));
      const skipValid = (pageValid - 1) * limitNum;

      // Obtener obras filtradas con paginación (sin el JOIN duplicado para calle en select)
      const obrasQuery = this.opObraRepository.createQueryBuilder('obra');

      if (calle && calle.trim()) {
        obrasQuery.innerJoin(
          'op_numerosoficiales',
          'num',
          'num.idobra = obra.idobra AND LOWER(COALESCE(num.calle, \'\')) LIKE LOWER(:calle)',
          { calle: `%${calle.trim()}%` },
        );
        obrasQuery.distinct(true);
      }
      if (consecutivo && consecutivo.trim()) {
        obrasQuery.andWhere('LOWER(obra.consecutivo) LIKE LOWER(:consecutivo)', {
          consecutivo: `%${consecutivo.trim()}%`,
        });
      }
      if (fechaCaptura && fechaCaptura.trim()) {
        const fechaInicio = new Date(fechaCaptura);
        fechaInicio.setHours(0, 0, 0, 0);
        const fechaFin = new Date(fechaCaptura);
        fechaFin.setHours(23, 59, 59, 999);
        obrasQuery.andWhere('obra.fechaCaptura >= :fechaInicio', { fechaInicio });
        obrasQuery.andWhere('obra.fechaCaptura <= :fechaFin', { fechaFin });
      }
      if (nombrePropietario && nombrePropietario.trim()) {
        obrasQuery.andWhere('LOWER(obra.nombrePropietario) LIKE LOWER(:nombrePropietario)', {
          nombrePropietario: `%${nombrePropietario.trim()}%`,
        });
      }
      if (numerosPrediosContiguos && numerosPrediosContiguos.trim()) {
        obrasQuery.andWhere('LOWER(obra.numerosPrediosContiguosObra) LIKE LOWER(:numerosPrediosContiguos)', {
          numerosPrediosContiguos: `%${numerosPrediosContiguos.trim()}%`,
        });
      }

      const obras = await obrasQuery
        .orderBy('obra.idObra', 'DESC')
        .skip(skipValid)
        .take(limitNum)
        .getMany();

      if (obras.length === 0) {
        return { data: [], meta: { page: pageValid, limit: limitNum, totalRegistros, totalPaginas } };
      }

      // Obtener solo las colonias y números oficiales necesarios
      const coloniaIds = [...new Set(obras.map((o) => o.idColoniaObra).filter((id) => id != null))];
      const obraIds = obras.map((o) => o.idObra);

      const [colonias, numerosOficiales] = await Promise.all([
        coloniaIds.length > 0
          ? this.coloniasRepository.find({ where: { id_colonia: In(coloniaIds) } })
          : Promise.resolve([]),
        this.numerosOficialesRepository.find({
          where: { idobra: In(obraIds) },
        }),
      ]);

      const coloniasMap = new Map(colonias.map((c) => [c.id_colonia, { nombre: c.nombre, densidad: c.densidad }]));
      const numerosPorObra = new Map<number, { calle: string; numerooficial: string }[]>();
      for (const n of numerosOficiales) {
        const list = numerosPorObra.get(n.idobra) ?? [];
        list.push({ calle: n.calle ?? '', numerooficial: n.numerooficial });
        numerosPorObra.set(n.idobra, list);
      }

      const data = obras.map((o) => {
        const numeros = numerosPorObra.get(o.idObra) ?? [];
        const noOficialStr =
          numeros.length > 0
            ? numeros.map((n) => (n.calle ? `${n.calle}, No. ${n.numerooficial}` : `No. ${n.numerooficial}`)).join('; ')
            : `Mza ${o.manzanaObra ?? ''} Lt ${o.loteObra ?? ''}`.trim() || '-';

        return {
          id: o.idObra,
          consecutivo: o.consecutivo,
          captura: o.fechaCaptura,
          propietario: o.nombrePropietario,
          calle: numeros.length > 0 ? numeros[0].calle ?? '' : '',
          noOficial: noOficialStr,
          colonia: coloniasMap.get(o.idColoniaObra)?.nombre ?? '',
          coloniaDensidad: coloniasMap.get(o.idColoniaObra)?.densidad ?? '',
          numerosPrediosContiguos: o.numerosPrediosContiguosObra ?? '',
          estadoObra: o.estadoObra,
          estadoPago: o.estadoPago,
        };
      });

      return { data, meta: { page: pageValid, limit: limitNum, totalRegistros, totalPaginas } };
    } catch (error) {
      console.error('Error en findListadoFiltrado:', error);
      throw error;
    }
  }

  /**
   * Listado filtrado con paginación (para Alertas y otros listados pesados)
   */
  async findListadoFiltradoPaginado(
    page: number,
    limit: number,
    consecutivo?: string,
    fechaCaptura?: string,
    nombrePropietario?: string,
    numerosPrediosContiguos?: string,
    estadoObra?: string,
  ): Promise<{ data: any[]; total: number }> {
    try {
      const queryBuilder = this.opObraRepository.createQueryBuilder('obra');

      if (consecutivo && consecutivo.trim()) {
        queryBuilder.andWhere('LOWER(obra.consecutivo) LIKE LOWER(:consecutivo)', {
          consecutivo: `%${consecutivo.trim()}%`,
        });
      }
      if (fechaCaptura && fechaCaptura.trim()) {
        const fechaInicio = new Date(fechaCaptura);
        fechaInicio.setHours(0, 0, 0, 0);
        const fechaFin = new Date(fechaCaptura);
        fechaFin.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('obra.fechaCaptura >= :fechaInicio', { fechaInicio });
        queryBuilder.andWhere('obra.fechaCaptura <= :fechaFin', { fechaFin });
      }
      if (nombrePropietario && nombrePropietario.trim()) {
        queryBuilder.andWhere('LOWER(obra.nombrePropietario) LIKE LOWER(:nombrePropietario)', {
          nombrePropietario: `%${nombrePropietario.trim()}%`,
        });
      }
      if (numerosPrediosContiguos && numerosPrediosContiguos.trim()) {
        queryBuilder.andWhere('LOWER(obra.numerosPrediosContiguosObra) LIKE LOWER(:numerosPrediosContiguos)', {
          numerosPrediosContiguos: `%${numerosPrediosContiguos.trim()}%`,
        });
      }
      if (estadoObra && estadoObra.trim()) {
        queryBuilder.andWhere('TRIM(obra.estadoObra) = TRIM(:estadoObra)', {
          estadoObra: estadoObra.trim(),
        });
      }

      queryBuilder.orderBy('obra.idObra', 'DESC');

      const [obras, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      if (obras.length === 0) {
        return { data: [], total: 0 };
      }

      const coloniaIds = [...new Set(obras.map((o) => o.idColoniaObra).filter((id) => id != null))];
      const obraIds = obras.map((o) => o.idObra);

      const [colonias, numerosOficiales] = await Promise.all([
        coloniaIds.length > 0
          ? this.coloniasRepository.find({ where: { id_colonia: In(coloniaIds) } })
          : Promise.resolve([]),
        this.numerosOficialesRepository.find({ where: { idobra: In(obraIds) } }),
      ]);

      const coloniasMap = new Map(colonias.map((c) => [c.id_colonia, { nombre: c.nombre, densidad: c.densidad }]));
      const numerosPorObra = new Map<number, { calle: string; numerooficial: string }[]>();
      for (const n of numerosOficiales) {
        const list = numerosPorObra.get(n.idobra) ?? [];
        list.push({ calle: n.calle ?? '', numerooficial: n.numerooficial });
        numerosPorObra.set(n.idobra, list);
      }

      const data = obras.map((o) => {
        const numeros = numerosPorObra.get(o.idObra) ?? [];
        const noOficialStr =
          numeros.length > 0
            ? numeros.map((n) => (n.calle ? `${n.calle}, No. ${n.numerooficial}` : `No. ${n.numerooficial}`)).join('; ')
            : `Mza ${o.manzanaObra ?? ''} Lt ${o.loteObra ?? ''}`.trim() || '-';
        return {
          id: o.idObra,
          consecutivo: o.consecutivo,
          captura: o.fechaCaptura,
          propietario: o.nombrePropietario,
          calle: numeros.length > 0 ? numeros[0].calle ?? '' : '',
          noOficial: noOficialStr,
          colonia: coloniasMap.get(o.idColoniaObra)?.nombre ?? '',
          coloniaDensidad: coloniasMap.get(o.idColoniaObra)?.densidad ?? '',
          numerosPrediosContiguos: o.numerosPrediosContiguosObra ?? '',
          estadoObra: o.estadoObra,
          estadoPago: o.estadoPago,
        };
      });

      return { data, total };
    } catch (error) {
      console.error('Error en findListadoFiltradoPaginado:', error);
      throw error;
    }
  }

   async eliminarObra(id: number, idUsuarioEliminador?: number) {
    // Verificar permisos: SUPERVISOR no puede eliminar obras
    if (idUsuarioEliminador && !(await this.puedeEscribir(idUsuarioEliminador))) {
      throw new UnauthorizedException('Los supervisores solo pueden visualizar información, no pueden eliminar obras');
    }

    // Obtener información de la obra antes de eliminarla para el historial
    const obraAEliminar = await this.opObraRepository.findOne({
      where: { idObra: id },
      select: ['idObra', 'consecutivo', 'nombrePropietario'],
    });

    const resultado = await this.opObraRepository.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`La obra con id ${id} no existe`);
    }

    // Registrar en historial si hay usuario que eliminó la obra
    const usuarioId = idUsuarioEliminador || obraAEliminar?.idUsuarioCapturador;
    if (usuarioId && obraAEliminar) {
      try {
        await this.historialService.registrarAccion(
          usuarioId,
          `Eliminó una obra`,
          'eliminar',
          'Obra',
          obraAEliminar.idObra,
          `Obra ID: ${obraAEliminar.idObra}, Consecutivo: ${obraAEliminar.consecutivo || 'N/A'}`,
        );
      } catch (error) {
        // No fallar la eliminación de la obra si falla el registro en historial
        console.error('Error al registrar en historial:', error);
      }
    }

    return { mensaje: `Obra con id ${id} eliminada correctamente` };
  }

  async saveNumerosManual(
    id: number,
    numeros: { calle?: string; numeroOficial?: string }[],
    idUsuarioModificador?: number,
  ) {
    // Verificar permisos: SUPERVISOR no puede modificar números oficiales
    if (idUsuarioModificador && !(await this.puedeEscribir(idUsuarioModificador))) {
      throw new UnauthorizedException('Los supervisores solo pueden visualizar información, no pueden modificar números oficiales');
    }

    const obra = await this.findOne(id);

    await this.numerosOficialesRepository.delete({ idobra: id });

    const now = new Date();
    const toInsert = numeros
      .filter((n) => n.numeroOficial?.trim())
      .map((n) => ({
        idobra: id,
        numerooficial: n.numeroOficial!.trim(),
        calle: n.calle?.trim() || undefined,
        fechacreacionno: now,
      }));

    if (toInsert.length > 0) {
      await this.numerosOficialesRepository.insert(toInsert);
    }

    // Registrar en historial si hay usuario que modificó los números oficiales
    const usuarioId = idUsuarioModificador || obra.idUsuarioCapturador;
    if (usuarioId) {
      try {
        await this.historialService.registrarAccion(
          usuarioId,
          `Modificó números oficiales de obra`,
          'modificar',
          'Obra',
          obra.idObra,
          `Obra ID: ${obra.idObra}, Consecutivo: ${obra.consecutivo || 'N/A'}, Números: ${toInsert.length}`,
        );
      } catch (error) {
        console.error('Error al registrar en historial:', error);
      }
    }

    return this.numerosOficialesRepository.find({
      where: { idobra: id },
      order: { idnumerosoficialesobra: 'ASC' },
    });
  }
}