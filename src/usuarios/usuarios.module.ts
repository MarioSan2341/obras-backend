import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario, Area } from './usuario.entity';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Cargo } from './cargo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Area, Cargo]), // 🔑 Registrar Area aquí
  ],
  providers: [UsuariosService],
  controllers: [UsuariosController],
})
export class UsuariosModule {}