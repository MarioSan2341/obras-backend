import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LugaresRecibidosObra } from './lugares-recibidos.entity';
import { LugaresRecibidosService } from './lugares-recibidos.service';
import { LugaresRecibidosController } from './lugares-recibidos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LugaresRecibidosObra])],
  controllers: [LugaresRecibidosController],
  providers: [LugaresRecibidosService],
  exports: [LugaresRecibidosService],
})
export class LugaresRecibidosModule {}
