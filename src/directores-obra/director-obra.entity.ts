import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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
  codigo_postal?: string;

  @Column({ nullable: true })
  telefono?: string;

  
@Column({ unique: true })
rfc: string;

  @Column({ nullable: true })
  cedula_federal?: string;

  @Column({ nullable: true })
  cedula_estatal?: string;

  @Column({ nullable: true })
  oficio_autorizacion_ro?: string;

  @Column({ nullable: true })
  oficio_autorizacion_rp?: string;

  @Column({ nullable: true })
  oficio_autorizacion_pu?: string;

  @Column({ default: false }) ro_edificacion: boolean;
  @Column({ default: false }) ro_restauracion: boolean;
  @Column({ default: false }) ro_urbanizacion: boolean;
  @Column({ default: false }) ro_infraestructura: boolean;

  @Column({ default: false }) rp_edificacion: boolean;
  @Column({ default: false }) rp_restauracion: boolean;
  @Column({ default: false }) rp_urbanizacion: boolean;
  @Column({ default: false }) rp_infraestructura: boolean;

  @Column({ type: 'varchar', nullable: true })
imagen: string | null;


  @CreateDateColumn()
  fecha_registro: Date;

  @UpdateDateColumn()
  fecha_actualizacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_baja?: Date;

  @Column({ default: true })
  activo: boolean;
}
