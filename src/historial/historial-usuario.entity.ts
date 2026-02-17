import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('historial_usuario')
export class HistorialUsuario {
  @PrimaryGeneratedColumn({ name: 'id_historial' })
  idHistorial: number;

  @Column({ name: 'id_usuario' })
  idUsuario: number;

  @Column({ name: 'accion', type: 'varchar', length: 255 })
  accion: string;

  @Column({ name: 'tipo', type: 'varchar', length: 50 })
  tipo: 'crear' | 'modificar' | 'eliminar' | 'otro';

  @Column({ name: 'entidad', type: 'varchar', length: 100 })
  entidad: string;

  @Column({ name: 'id_entidad', nullable: true })
  idEntidad: number;

  @Column({ name: 'detalles', type: 'text', nullable: true })
  detalles: string;

  @CreateDateColumn({ name: 'fecha_accion' })
  fechaAccion: Date;
}
