import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Rol } from './roles.enum';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuarios' })
  id_usuarios: number;

  @Column({ name: 'nombre' }) // Este será tu login
  nombre: string;

  @Column({ name: 'ap_paterno' })
  ap_paterno: string;

  @Column({ name: 'ap_materno', nullable: true })
  ap_materno: string;

  @Column({ name: 'telefono', type: 'bigint', nullable: true })
  telefono: number;

  @Column({ name: 'clave', nullable: true })
  clave: string;

   @Column({
    type: 'varchar',
    length: 50,
    default: Rol.USUARIO,
  })
  rol: Rol;

  @Column({ name: 'estado', nullable: true })
  estado: string;

  @Column({ name: 'funcion', nullable: true })
  funcion: string;
}
