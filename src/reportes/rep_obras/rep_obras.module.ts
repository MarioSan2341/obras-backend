import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepObrasController } from './rep_obras.controller';
import { RepObrasService } from './rep_obras.service';
import { RepObra } from './entities/rep_obra.entity';
import { Colonia } from '../../colonias/colonias.entity';
import { OpNumeroOficial } from '../../op_numerosoficiales/op_numerosoficiales.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RepObra, Colonia, OpNumeroOficial])],
  controllers: [RepObrasController],
  providers: [RepObrasService],
})
export class RepObrasModule {}
