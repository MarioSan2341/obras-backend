import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuarios: number;

  @Column()
  cargo_idcargo: number;

  @Column()
  area_id_area: number;

  @Column()
  nombre: string;

  @Column()
  ap_paterno: string;

  @Column({ nullable: true })
  ap_materno: string;

  @Column({ type: 'bigint', nullable: true })
  telefono: number;

  @Column({ nullable: true })
  clave: number;

  @Column({ nullable: true })
  rol: string;

  @Column({ nullable: true })
  estado: string;

  @Column({ nullable: true })
  funcion: string;
}
