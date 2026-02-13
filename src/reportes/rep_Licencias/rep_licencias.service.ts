import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObraConcepto } from '../../obra-conceptos/obra-concepto.entity';
import { OpObra } from '../../op_obras/op_obras.entity';
import { Concepto } from '../../conceptos/concepto.entity';
import { ReporteLicenciasFilterDto } from './dto/reporte-licencias-filter.dto';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class RepLicenciasService {
  constructor(
    @InjectRepository(ObraConcepto)
    private readonly obraConceptoRepo: Repository<ObraConcepto>,
    @InjectRepository(OpObra)
    private readonly obraRepo: Repository<OpObra>,
    @InjectRepository(Concepto)
    private readonly conceptoRepo: Repository<Concepto>,
  ) {}

  // ✅ Reporte paginado de licencias
  async getReporteLicencias(filters: ReporteLicenciasFilterDto) {
    // Requerir fecha inicio y fecha fin
    if (!filters.fechaInicio || !filters.fechaFin) {
      return {
        meta: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          totalRegistros: 0,
          totalPaginas: 0,
        },
        data: [],
      };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const query = this.obraConceptoRepo
      .createQueryBuilder('oc')
      .leftJoin('op_obras', 'obra', 'obra.idobra = oc.idobra')
      .leftJoin('conceptos', 'concepto', 'concepto.id = oc.id_concepto')
      .leftJoin('conceptos', 'conceptoPadre', 'conceptoPadre.id = concepto.parent_id')
      .leftJoin('conceptos', 'conceptoAbuelo', 'conceptoAbuelo.id = conceptoPadre.parent_id')
      .select([
        'oc.id AS id',
        'obra."consecutivo" AS consecutivo',
        'obra."fechacaptura" AS fechaCaptura',
        'concepto.nombre AS nombreConcepto',
        'conceptoPadre.nombre AS tipoLicencia',
        'conceptoAbuelo.nombre AS clasificacion',
        'oc.cantidad AS cantidad',
        'oc.medicion AS medicionConcepto',
        'oc.costo AS costoConcepto',
        'oc.total AS total',
      ]);

    // Filtros - aplicar primero los que pueden reducir más el dataset
    if (filters.fechaInicio && filters.fechaFin) {
      // Incluir todo el día de fechaFin: usar DATE() para comparar solo la fecha sin hora
      query.andWhere(
        'DATE(obra."fechacaptura") >= DATE(:fechaInicioLic) AND DATE(obra."fechacaptura") <= DATE(:fechaFinLic)',
        {
          fechaInicioLic: filters.fechaInicio,
          fechaFinLic: filters.fechaFin,
        }
      );
    }

    if (filters.consecutivo) {
      query.andWhere('obra."consecutivo" ILIKE :consecutivo', {
        consecutivo: `%${filters.consecutivo}%`,
      });
    }

    if (filters.nombreConcepto) {
      query.andWhere('concepto.nombre ILIKE :nombreConcepto', {
        nombreConcepto: `%${filters.nombreConcepto}%`,
      });
    }

    if (filters.tipoLicencia) {
      query.andWhere('conceptoPadre.nombre ILIKE :tipoLicencia', {
        tipoLicencia: `%${filters.tipoLicencia}%`,
      });
    }

    if (filters.clasificacion) {
      query.andWhere('conceptoAbuelo.nombre ILIKE :clasificacion', {
        clasificacion: `%${filters.clasificacion}%`,
      });
    }

    // Optimizar COUNT: usar subquery para evitar recalcular JOINs complejos
    const countQuery = this.obraConceptoRepo
      .createQueryBuilder('oc')
      .leftJoin('op_obras', 'obra', 'obra.idobra = oc.idobra')
      .leftJoin('conceptos', 'concepto', 'concepto.id = oc.id_concepto')
      .leftJoin('conceptos', 'conceptoPadre', 'conceptoPadre.id = concepto.parent_id')
      .leftJoin('conceptos', 'conceptoAbuelo', 'conceptoAbuelo.id = conceptoPadre.parent_id');

    // Aplicar mismos filtros al count (usar nombres de parámetros diferentes para evitar conflictos)
    if (filters.fechaInicio && filters.fechaFin) {
      countQuery.andWhere(
        'DATE(obra."fechacaptura") >= DATE(:fechaInicioLicCount) AND DATE(obra."fechacaptura") <= DATE(:fechaFinLicCount)',
        {
          fechaInicioLicCount: filters.fechaInicio,
          fechaFinLicCount: filters.fechaFin,
        }
      );
    }
    if (filters.consecutivo) {
      countQuery.andWhere('obra."consecutivo" ILIKE :consecutivo', {
        consecutivo: `%${filters.consecutivo}%`,
      });
    }
    if (filters.nombreConcepto) {
      countQuery.andWhere('concepto.nombre ILIKE :nombreConcepto', {
        nombreConcepto: `%${filters.nombreConcepto}%`,
      });
    }
    if (filters.tipoLicencia) {
      countQuery.andWhere('conceptoPadre.nombre ILIKE :tipoLicencia', {
        tipoLicencia: `%${filters.tipoLicencia}%`,
      });
    }
    if (filters.clasificacion) {
      countQuery.andWhere('conceptoAbuelo.nombre ILIKE :clasificacion', {
        clasificacion: `%${filters.clasificacion}%`,
      });
    }

    const totalRegistros = await countQuery.getCount();
    const totalPaginas = Math.ceil(totalRegistros / limit);

    // Validar que la página solicitada no exceda el total de páginas
    const pageValid = Math.max(1, Math.min(page, totalPaginas || 1));
    const skipValid = (pageValid - 1) * limit;

    // Crear una subquery simple para obtener solo los IDs paginados usando SQL crudo
    // Esto garantiza que la paginación funcione correctamente
    // IMPORTANTE: Para SELECT DISTINCT, todas las columnas del ORDER BY deben estar en el SELECT
    let idsSubQuery = `
      SELECT DISTINCT oc_ids.id, obra_ids."fechacaptura", obra_ids.idobra, oc_ids.id_concepto
      FROM obra_conceptos oc_ids
      LEFT JOIN op_obras obra_ids ON obra_ids.idobra = oc_ids.idobra
    `;
    
    const idsParams: any[] = [];
    let paramIndex = 1;
    const idsConditions: string[] = [];

    // Aplicar filtros a la subquery
    if (filters.fechaInicio && filters.fechaFin) {
      idsConditions.push(`DATE(obra_ids."fechacaptura") >= DATE($${paramIndex}) AND DATE(obra_ids."fechacaptura") <= DATE($${paramIndex + 1})`);
      idsParams.push(filters.fechaInicio, filters.fechaFin);
      paramIndex += 2;
    }
    if (filters.consecutivo) {
      idsConditions.push(`obra_ids."consecutivo" ILIKE $${paramIndex}`);
      idsParams.push(`%${filters.consecutivo}%`);
      paramIndex++;
    }
    if (filters.nombreConcepto || filters.tipoLicencia || filters.clasificacion) {
      idsSubQuery += ` LEFT JOIN conceptos concepto_ids ON concepto_ids.id = oc_ids.id_concepto`;
      
      if (filters.nombreConcepto) {
        idsConditions.push(`concepto_ids.nombre ILIKE $${paramIndex}`);
        idsParams.push(`%${filters.nombreConcepto}%`);
        paramIndex++;
      }
      
      if (filters.tipoLicencia || filters.clasificacion) {
        idsSubQuery += ` LEFT JOIN conceptos conceptoPadre_ids ON conceptoPadre_ids.id = concepto_ids.parent_id`;
        
        if (filters.tipoLicencia) {
          idsConditions.push(`conceptoPadre_ids.nombre ILIKE $${paramIndex}`);
          idsParams.push(`%${filters.tipoLicencia}%`);
          paramIndex++;
        }
        
        if (filters.clasificacion) {
          idsSubQuery += ` LEFT JOIN conceptos conceptoAbuelo_ids ON conceptoAbuelo_ids.id = conceptoPadre_ids.parent_id`;
          idsConditions.push(`conceptoAbuelo_ids.nombre ILIKE $${paramIndex}`);
          idsParams.push(`%${filters.clasificacion}%`);
          paramIndex++;
        }
      }
    }

    if (idsConditions.length > 0) {
      idsSubQuery += ` WHERE ${idsConditions.join(' AND ')}`;
    }

    idsSubQuery += ` ORDER BY obra_ids."fechacaptura" DESC, obra_ids.idobra DESC, oc_ids.id_concepto DESC, oc_ids.id ASC`;
    idsSubQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    idsParams.push(limit, skipValid);

    // Ejecutar la query SQL cruda para obtener IDs paginados
    const idsResult = await this.obraConceptoRepo.query(idsSubQuery, idsParams);
    const ids = idsResult.map((row: any) => Number(row.id)).filter((id: number) => !isNaN(id) && id > 0);

    // Si no hay IDs, retornar vacío
    if (ids.length === 0) {
      return {
        meta: {
          page: pageValid,
          limit,
          totalRegistros,
          totalPaginas,
        },
        data: [],
      };
    }

    // Ahora hacer el JOIN completo solo para los IDs paginados
    // Crear una nueva query limpia solo para estos IDs
    const finalQuery = this.obraConceptoRepo
      .createQueryBuilder('oc')
      .leftJoin('op_obras', 'obra', 'obra.idobra = oc.idobra')
      .leftJoin('conceptos', 'concepto', 'concepto.id = oc.id_concepto')
      .leftJoin('conceptos', 'conceptoPadre', 'conceptoPadre.id = concepto.parent_id')
      .leftJoin('conceptos', 'conceptoAbuelo', 'conceptoAbuelo.id = conceptoPadre.parent_id')
      .select([
        'oc.id AS id',
        'obra."consecutivo" AS consecutivo',
        'obra."fechacaptura" AS fechaCaptura',
        'concepto.nombre AS nombreConcepto',
        'conceptoPadre.nombre AS tipoLicencia',
        'conceptoAbuelo.nombre AS clasificacion',
        'oc.cantidad AS cantidad',
        'oc.medicion AS medicionConcepto',
        'oc.costo AS costoConcepto',
        'oc.total AS total',
      ])
      .where('oc.id IN (:...ids)', { ids })
      .orderBy('obra."fechacaptura"', 'DESC')
      .addOrderBy('obra.idobra', 'DESC')
      .addOrderBy('oc.id_concepto', 'DESC')
      .addOrderBy('oc.id', 'ASC');

    const data = await finalQuery.getRawMany();

    // Mapear resultados raw a objetos planos
    // getRawMany() devuelve las columnas con los alias del SELECT (camelCase)
    const mappedData = data.map((row: any) => ({
      id: Number(row.id || 0),
      consecutivo: row.consecutivo || '',
      fechaCaptura: row.fechaCaptura || row.fechacaptura || '',
      nombreConcepto: row.nombreConcepto || row.nombreconcepto || '',
      tipoLicencia: row.tipoLicencia || row.tipolicencia || '',
      clasificacion: row.clasificacion || '',
      cantidad: Number(row.cantidad || 0),
      medicionConcepto: row.medicionConcepto || row.medicionconcepto || '',
      costoConcepto: Number(row.costoConcepto || row.costoconcepto || 0),
      total: Number(row.total || 0),
    }));

    return {
      meta: {
        page: pageValid,
        limit,
        totalRegistros,
        totalPaginas,
      },
      data: mappedData,
    };
  }

  // ✅ Exportar Excel
  async exportExcel(filters: ReporteLicenciasFilterDto, res: Response) {
    // Requerir fecha inicio y fecha fin
    if (!filters.fechaInicio || !filters.fechaFin) {
      res.status(400).json({ message: 'Fecha inicio y fecha fin son requeridas' });
      return;
    }

    const query = this.obraConceptoRepo
      .createQueryBuilder('oc')
      .leftJoin('op_obras', 'obra', 'obra.idobra = oc.idobra')
      .leftJoin('conceptos', 'concepto', 'concepto.id = oc.id_concepto')
      .leftJoin('conceptos', 'conceptoPadre', 'conceptoPadre.id = concepto.parent_id')
      .leftJoin('conceptos', 'conceptoAbuelo', 'conceptoAbuelo.id = conceptoPadre.parent_id')
      .select([
        'oc.id AS id',
        'obra."consecutivo" AS consecutivo',
        'obra."fechacaptura" AS fechaCaptura',
        'concepto.nombre AS nombreConcepto',
        'conceptoPadre.nombre AS tipoLicencia',
        'conceptoAbuelo.nombre AS clasificacion',
        'oc.cantidad AS cantidad',
        'oc.medicion AS medicionConcepto',
        'oc.costo AS costoConcepto',
        'oc.total AS total',
      ]);

    // Misma lógica de filtros (optimizado con ILIKE en lugar de LOWER)
    if (filters.fechaInicio && filters.fechaFin) {
      query.andWhere(
        'DATE(obra."fechacaptura") >= DATE(:fechaInicioLicExp) AND DATE(obra."fechacaptura") <= DATE(:fechaFinLicExp)',
        {
          fechaInicioLicExp: filters.fechaInicio,
          fechaFinLicExp: filters.fechaFin,
        }
      );
    }
    if (filters.consecutivo) {
      query.andWhere('obra."consecutivo" ILIKE :consecutivo', {
        consecutivo: `%${filters.consecutivo}%`,
      });
    }
    if (filters.nombreConcepto) {
      query.andWhere('concepto.nombre ILIKE :nombreConcepto', {
        nombreConcepto: `%${filters.nombreConcepto}%`,
      });
    }
    if (filters.tipoLicencia) {
      query.andWhere('conceptoPadre.nombre ILIKE :tipoLicencia', {
        tipoLicencia: `%${filters.tipoLicencia}%`,
      });
    }
    if (filters.clasificacion) {
      query.andWhere('conceptoAbuelo.nombre ILIKE :clasificacion', {
        clasificacion: `%${filters.clasificacion}%`,
      });
    }

    // Mismo ordenamiento determinístico para exportación
    const rawData = await query
      .orderBy('obra."fechacaptura"', 'DESC')
      .addOrderBy('obra.idobra', 'DESC')
      .addOrderBy('oc.id_concepto', 'DESC')
      .addOrderBy('oc.id', 'ASC')
      .getRawMany();

    const data = rawData.map((row: any) => ({
      consecutivo: row.consecutivo || '',
      fechaCaptura: row.fechaCaptura || row.fechacaptura || '',
      nombreConcepto: row.nombreConcepto || row.nombreconcepto || '',
      tipoLicencia: row.tipoLicencia || row.tipolicencia || '',
      clasificacion: row.clasificacion || '',
      cantidad: Number(row.cantidad || 0),
      medicionConcepto: row.medicionConcepto || row.medicionconcepto || '',
      costoConcepto: Number(row.costoConcepto || row.costoconcepto || 0),
      total: Number(row.total || 0),
    }));

    // Crear Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Licencias');

    worksheet.columns = [
      { header: 'Consecutivo', key: 'consecutivo', width: 20 },
      { header: 'Fecha Captura', key: 'fechaCaptura', width: 20 },
      { header: 'Nombre Concepto', key: 'nombreConcepto', width: 30 },
      { header: 'Tipo Licencia', key: 'tipoLicencia', width: 25 },
      { header: 'Clasificación', key: 'clasificacion', width: 25 },
      { header: 'Cantidad', key: 'cantidad', width: 12 },
      { header: 'Medición Concepto', key: 'medicionConcepto', width: 20 },
      { header: 'Costo Concepto', key: 'costoConcepto', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
    ];

    data.forEach((row) => {
      worksheet.addRow(row);
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Reporte_Licencias.xlsx',
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
