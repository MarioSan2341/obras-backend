import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OpObra } from '../op_obras/op_obras.entity';

@Entity('alertas')
export class Alerta {
  @PrimaryGeneratedColumn({ name: 'idalerta' })
  idAlerta: number;

  @Column({ name: 'idobra' })
  idObra: number;

  @Column({ name: 'tipopdf', type: 'varchar', length: 100 })
  tipoPdf: string; // 'ALINEAMIENTO Y NUMERO OFICIAL', 'LICENCIA DE CONSTRUCCIÓN', 'CERTIFICADO DE HABITABILIDAD'

  @Column({ name: 'mensaje', type: 'text' })
  mensaje: string;

  @Column({ name: 'fechacreacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @Column({ name: 'fechamodificacion', type: 'timestamp', nullable: true })
  fechaModificacion: Date;

  @Column({ name: 'idusuario', nullable: true })
  idUsuario: number;

  @ManyToOne(() => OpObra)
  @JoinColumn({ name: 'idobra' })
  obra: OpObra;
}
