import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepObra } from '../reportes/rep_obras/entities/rep_obra.entity';

export interface EstadisticasPagos {
  estadoPago: string;
  cantidad: number;
  total: number;
}

export interface EstadisticasPagosResponse {
  estadisticas: EstadisticasPagos[];
  totalGeneral: number;
  totalCantidad: number;
  fechaInicio?: string;
  fechaFin?: string;
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectRepository(RepObra)
    private repObraRepository: Repository<RepObra>,
  ) {}

  async obtenerEstadisticasPagos(
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<EstadisticasPagosResponse> {
    const query = this.repObraRepository
      .createQueryBuilder('obra')
      .select('obra.estadoPago', 'estadoPago')
      .addSelect('COUNT(*)', 'cantidad')
      .addSelect(
        'COALESCE(SUM(CAST(obra.totalCostoConceptos AS DECIMAL)), 0)',
        'total',
      )
      .groupBy('obra.estadoPago');

    if (fechaInicio) {
      query.andWhere('obra.fechaCaptura >= :fechaInicio', {
        fechaInicio: fechaInicio,
      });
    }

    if (fechaFin) {
      query.andWhere('obra.fechaCaptura <= :fechaFin', {
        fechaFin: fechaFin,
      });
    }

    const resultados = await query.getRawMany();

    const estadisticas: EstadisticasPagos[] = resultados.map((r) => ({
      estadoPago: r.estadoPago || 'Sin Pagar',
      cantidad: parseInt(r.cantidad, 10),
      total: parseFloat(r.total) || 0,
    }));

    const totalGeneral = estadisticas.reduce((sum, e) => sum + e.total, 0);
    const totalCantidad = estadisticas.reduce((sum, e) => sum + e.cantidad, 0);

    return {
      estadisticas,
      totalGeneral,
      totalCantidad,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
    };
  }

  async obtenerEstadisticasPorMes(
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<any[]> {
    const query = this.repObraRepository
      .createQueryBuilder('obra')
      .select(
        "TO_CHAR(obra.fechaCaptura, 'YYYY-MM')",
        'mes',
      )
      .addSelect('obra.estadoPago', 'estadoPago')
      .addSelect('COUNT(*)', 'cantidad')
      .addSelect(
        'COALESCE(SUM(CAST(obra.totalCostoConceptos AS DECIMAL)), 0)',
        'total',
      )
      .groupBy("TO_CHAR(obra.fechaCaptura, 'YYYY-MM')")
      .addGroupBy('obra.estadoPago')
      .orderBy("TO_CHAR(obra.fechaCaptura, 'YYYY-MM')", 'ASC');

    if (fechaInicio) {
      query.andWhere('obra.fechaCaptura >= :fechaInicio', {
        fechaInicio: fechaInicio,
      });
    }

    if (fechaFin) {
      query.andWhere('obra.fechaCaptura <= :fechaFin', {
        fechaFin: fechaFin,
      });
    }

    return query.getRawMany();
  }
}
