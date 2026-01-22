import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('directores_obra')
export class DirectorObra {
  @PrimaryGeneratedColumn({ name: 'id_director_obra' })
  id: number;

  @Column({ unique: true, nullable: true })
  clave_director: string;

  @Column()
  nombre_completo: string;

  @Column()
  domicilio: string;

  @Column()
  colonia: string;

  @Column()
  municipio: string;

  @Column({ nullable: true })
  codigo_postal: string;

  @Column({ nullable: true })
  telefono: string;

  @Column()
  rfc: string;

  @Column({ nullable: true })
  cedula_federal: string;

  @Column({ nullable: true })
  cedula_estatal: string;

  // 👇 ESTADO REAL DEL REGISTRO
  @Column({ default: true })
  activo: boolean;

  // 👇 FECHA DE BAJA (ESTO FALTABA)
  @Column({ type: 'timestamp', nullable: true })
  fecha_baja: Date;
}
