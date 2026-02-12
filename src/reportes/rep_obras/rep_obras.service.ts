import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RepObra } from './entities/rep_obra.entity';
import { Colonia } from '../../colonias/colonias.entity';
import { ReporteObrasFilterDto } from './dto/reporte-obras-filter.dto';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class RepObrasService {
  constructor(
    @InjectRepository(RepObra)
    private readonly obraRepo: Repository<RepObra>,
    @InjectRepository(Colonia)
    private readonly coloniaRepo: Repository<Colonia>,
  ) {}

  // ✅ Detalle completo de una obra por id (con JOIN a colonias)
  async getDetalleObra(idObra: number) {
    const obra = await this.obraRepo.findOne({
      where: { idObra },
    });
    
    if (!obra) return null;
    
    // Obtener colonia si existe
    if (obra.idColoniaObra) {
      const colonia = await this.coloniaRepo.findOne({
        where: { id_colonia: obra.idColoniaObra },
      });
      
      if (colonia) {
        (obra as any).nombreColoniaObra = colonia.nombre;
        (obra as any).idDensidadColoniaObra = colonia.densidad || '';
      }
    }
    
    return obra;
  }

  // ✅ Endpoint normal: filtros y paginación
  async getReporteObras(filters: ReporteObrasFilterDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.obraRepo.createQueryBuilder('obra');

    // Filtros
    if (filters.fechaInicio && filters.fechaFin) {
      query.andWhere('obra."fechacaptura" BETWEEN :inicio AND :fin', {
        inicio: filters.fechaInicio,
        fin: filters.fechaFin,
      });
    }

    if (filters.nombrePropietario) {
      query.andWhere('LOWER(obra."nombrepropietario") LIKE LOWER(:nombre)', {
        nombre: `%${filters.nombrePropietario}%`,
      });
    }

    if (filters.consecutivo) {
      query.andWhere('LOWER(obra."consecutivo") LIKE LOWER(:consecutivo)', {
        consecutivo: `%${filters.consecutivo}%`,
      });
    }

    if (filters.estadoObra) {
      query.andWhere('LOWER(obra."estadoobra") = LOWER(:estadoObra)', {
        estadoObra: filters.estadoObra,
      });
    }

    if (filters.estadoPago) {
      query.andWhere('LOWER(obra."estadopago") = LOWER(:estadoPago)', {
        estadoPago: filters.estadoPago,
      });
    }

    const totalRegistros = await query.getCount();
    const totalPaginas = Math.ceil(totalRegistros / limit);

    // Validar que la página solicitada no exceda el total de páginas
    const pageValid = Math.max(1, Math.min(page, totalPaginas || 1));
    const skipValid = (pageValid - 1) * limit;

    const obras = await query
      .orderBy('obra."fechacaptura"', 'DESC')
      .skip(skipValid)
      .take(limit)
      .getMany();

    // Obtener colonias para todas las obras de una vez
    const coloniaIds = [...new Set(obras.map(o => o.idColoniaObra).filter(Boolean))];
    const colonias = coloniaIds.length > 0
      ? await this.coloniaRepo.find({ where: { id_colonia: In(coloniaIds) } })
      : [];
    
    const coloniasMap = new Map(colonias.map(c => [c.id_colonia, c]));

    // Agregar nombre y densidad desde colonias
    const data = obras.map(obra => {
      const colonia = coloniasMap.get(obra.idColoniaObra);
      return {
        ...obra,
        nombreColoniaObra: colonia?.nombre || '',
        idDensidadColoniaObra: colonia?.densidad || '',
      };
    });

    return {
      meta: {
        page: pageValid,
        limit,
        totalRegistros,
        totalPaginas,
      },
      data,
    };
  }

  // ✅ Exportar Excel completo
  async exportExcel(filters: ReporteObrasFilterDto, res: Response) {
    const query = this.obraRepo.createQueryBuilder('obra');

    // Misma lógica de filtros
    if (filters.fechaInicio && filters.fechaFin) {
      query.andWhere('obra."fechacaptura" BETWEEN :inicio AND :fin', {
        inicio: filters.fechaInicio,
        fin: filters.fechaFin,
      });
    }
    if (filters.nombrePropietario) {
      query.andWhere('LOWER(obra."nombrepropietario") LIKE LOWER(:nombre)', {
        nombre: `%${filters.nombrePropietario}%`,
      });
    }
    if (filters.consecutivo) {
      query.andWhere('LOWER(obra."consecutivo") LIKE LOWER(:consecutivo)', {
        consecutivo: `%${filters.consecutivo}%`,
      });
    }
    if (filters.estadoObra) {
      query.andWhere('LOWER(obra."estadoobra") = LOWER(:estadoObra)', {
        estadoObra: filters.estadoObra,
      });
    }
    if (filters.estadoPago) {
      query.andWhere('LOWER(obra."estadopago") = LOWER(:estadoPago)', {
        estadoPago: filters.estadoPago,
      });
    }

    const obras = await query.orderBy('obra."fechacaptura"', 'DESC').getMany();

    // Obtener colonias para todas las obras
    const coloniaIds = [...new Set(obras.map(o => o.idColoniaObra).filter(Boolean))];
    const colonias = coloniaIds.length > 0
      ? await this.coloniaRepo.find({ where: { id_colonia: In(coloniaIds) } })
      : [];
    
    const coloniasMap = new Map(colonias.map(c => [c.id_colonia, c]));

    // Agregar nombre y densidad desde colonias
    const data = obras.map(obra => {
      const colonia = coloniasMap.get(obra.idColoniaObra);
      return {
        ...obra,
        nombreColoniaObra: colonia?.nombre || '',
        idDensidadColoniaObra: colonia?.densidad || '',
      };
    });

    // Crear Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Obras');

    // Definir columnas según los campos que me pasaste
    worksheet.columns = [
      { header: 'Consecutivo', key: 'consecutivo', width: 20 },
      { header: 'Fecha Captura', key: 'fechaCaptura', width: 20 },
      { header: 'Tipo Propietario', key: 'tipoPropietario', width: 15 },
      { header: 'Nombre Propietario', key: 'nombrePropietario', width: 25 },
      { header: 'Representante Legal', key: 'representanteLegal', width: 25 },
      { header: 'Domicilio Propietario', key: 'domicilioPropietario', width: 25 },
      { header: 'Colonia Propietario', key: 'coloniaPropietario', width: 20 },
      { header: 'Municipio Propietario', key: 'municipioPropietario', width: 20 },
      { header: 'Entidad Propietario', key: 'entidadPropietario', width: 20 },
      { header: 'Telefono Propietario', key: 'telefonoPropietario', width: 15 },
      { header: 'RFC', key: 'rfcPropietario', width: 15 },
      { header: 'Codigo Postal Propietario', key: 'codigoPostalPropietario', width: 10 },
      { header: 'Correo Electronico Propietario', key: 'correoPropietario', width: 25 },
      { header: 'Sitio Web', key: 'sitioWebPropietario', width: 25 },
      { header: 'Ocupacion', key: 'ocupacionPropietario', width: 20 },
      { header: 'Identificacion', key: 'identificacion', width: 20 },
      { header: 'Tipo Identificacion', key: 'tipoIdentificacion', width: 20 },
      { header: 'Documento Acredita Propiedad', key: 'documentoAcreditaPropiedad', width: 25 },
      { header: 'Tipo Documento Acredita Propiedad', key: 'tipoDocumentoAcreditaPropiedad', width: 25 },
      { header: 'Documentos Requeridos', key: 'documentosRequeridos', width: 25 },
      { header: 'Nombre Colonia Obra', key: 'nombreColoniaObra', width: 20 },
      { header: 'Densidad Colonia Obra', key: 'idDensidadColoniaObra', width: 15 },
      { header: 'Manzana Obra', key: 'manzanaObra', width: 10 },
      { header: 'Lote Obra', key: 'loteObra', width: 10 },
      { header: 'Etapa Obra', key: 'etapaObra', width: 15 },
      { header: 'Condominio Obra', key: 'condominioObra', width: 15 },
      { header: 'Numeros Predios Contiguos Obra', key: 'numerosPrediosContiguosObra', width: 20 },
      { header: 'Entre Calle1 Obra', key: 'entreCalle1Obra', width: 20 },
      { header: 'Entre Calle2 Obra', key: 'entreCalle2Obra', width: 20 },
      { header: 'Destino Actual Proyeto', key: 'destinoActual', width: 20 },
      { header: 'Destino Propuesto Proyecto', key: 'destinoPropuesto', width: 20 },
      { header: 'Agua Potable', key: 'aguaPotable', width: 10 },
      { header: 'Drenaje', key: 'drenaje', width: 10 },
      { header: 'Electricidad', key: 'electricidad', width: 10 },
      { header: 'Alumbrado Publico', key: 'alumbradoPublico', width: 10 },
      { header: 'Machuelos', key: 'machuelos', width: 10 },
      { header: 'Banquetas', key: 'banquetas', width: 10 },
      { header: 'Pavimento', key: 'pavimento', width: 10 },
      { header: 'Servidumbre Frontal', key: 'servidumbreFrontal', width: 15 },
      { header: 'Servidumbre Lateral', key: 'servidumbreLateral', width: 15 },
      { header: 'Servidumbre Posterior', key: 'servidumbrePosterior', width: 15 },
      { header: 'Coeficiente Ocupacion', key: 'coeficienteOcupacion', width: 10 },
      { header: 'Coeficiente Utilizacion', key: 'coeficienteUtilizacion', width: 10 },
      { header: 'Descripcion Proyecto', key: 'descripcionProyecto', width: 30 },
      { header: 'Nombre Perito', key: 'idPerito', width: 15 }, // se puede mapear luego al nombre
      { header: 'Folio Bitacora', key: 'bitacora', width: 15 },
      { header: 'Vigencia', key: 'vigencia', width: 10 },
      { header: 'Fecha Verificacion', key: 'fechaVerificacion', width: 15 },
      { header: 'Verificacion', key: 'verificacion', width: 30 },
      { header: 'Total Costo Conceptos', key: 'totalCostoConceptos', width: 15 },
      { header: 'Fecha Pago', key: 'fechaPago', width: 15 },
      { header: 'Recibo', key: 'reciboDePago', width: 15 },
      { header: 'Otros recibos', key: 'otrosRecibos', width: 15 },
      { header: 'Folio Forma', key: 'folioDeLaForma', width: 15 },
      { header: 'Estatus Pago', key: 'estadoPago', width: 15 },
    ];

    data.forEach((obra) => {
      worksheet.addRow(obra as any);
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Reporte_Obras.xlsx',
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
