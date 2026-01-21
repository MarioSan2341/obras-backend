import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity()
export class Cargo {
  @PrimaryGeneratedColumn()
  idcargo: number;

  @Column({ unique: true })
  nombre: string;

  @OneToMany(() => Usuario, (usuario) => usuario.cargo)
  usuarios: Usuario[];
}
