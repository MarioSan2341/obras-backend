import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialUsuario } from './historial-usuario.entity';

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(HistorialUsuario)
    private historialRepository: Repository<HistorialUsuario>,
  ) {}

  /**
   * Registra una acción en el historial de un usuario
   */
  async registrarAccion(
    idUsuario: number,
    accion: string,
    tipo: 'crear' | 'modificar' | 'eliminar' | 'otro',
    entidad: string,
    idEntidad?: number,
    detalles?: string,
  ): Promise<void> {
    try {
      const historial = this.historialRepository.create({
        idUsuario,
        accion,
        tipo,
        entidad,
        idEntidad,
        detalles,
      });
      await this.historialRepository.save(historial);
    } catch (error) {
      // No lanzar error para no interrumpir el flujo principal
      console.error('Error al registrar acción en historial:', error);
    }
  }

  /**
   * Obtiene el historial de un usuario específico
   */
  async obtenerHistorialUsuario(idUsuario: number) {
    const historiales = await this.historialRepository.find({
      where: { idUsuario },
      order: { fechaAccion: 'DESC' },
    });

    return historiales.map((h) => ({
      id: h.idHistorial,
      fecha: h.fechaAccion.toISOString().split('T')[0],
      hora: h.fechaAccion.toTimeString().split(' ')[0],
      accion: h.accion,
      tipo: h.tipo,
      entidad: h.entidad,
      detalles: h.detalles,
      idEntidad: h.idEntidad,
    }));
  }
}
