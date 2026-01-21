import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('funciones_usuarios')
export class FuncionUsuario {
  @PrimaryGeneratedColumn()
  id_funcion: number;

  @Column({ unique: true })
  nombre: string;

  @OneToMany(() => Usuario, (usuario) => usuario.funcionEspecial)
  usuarios: Usuario[];
}
