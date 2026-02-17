import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialUsuario } from './historial-usuario.entity';
import { HistorialService } from './historial.service';
import { HistorialController } from './historial.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialUsuario])],
  providers: [HistorialService],
  controllers: [HistorialController],
  exports: [HistorialService],
})
export class HistorialModule {}
