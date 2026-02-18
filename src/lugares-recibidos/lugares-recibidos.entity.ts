import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OpObra } from '../op_obras/op_obras.entity';

@Entity('lugares_recibidos_obra')
export class LugaresRecibidosObra {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'id_obra' })
  idObra: number;

  @ManyToOne(() => OpObra)
  @JoinColumn({ name: 'id_obra' })
  obra: OpObra;

  @Column({ name: 'secretaria_obras_publicas', nullable: true })
  secretariaObrasPublicas: string;

  @Column({ name: 'presidencia', nullable: true })
  presidencia: string;

  @Column({ name: 'padron_licencias', nullable: true })
  padronLicencias: string;

  @Column({ name: 'fecha_actualizacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaActualizacion: Date;
}
