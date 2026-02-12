import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepLicenciasController } from './rep_licencias.controller';
import { RepLicenciasService } from './rep_licencias.service';
import { ObraConcepto } from '../../obra-conceptos/obra-concepto.entity';
import { OpObra } from '../../op_obras/op_obras.entity';
import { Concepto } from '../../conceptos/concepto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ObraConcepto, OpObra, Concepto])],
  controllers: [RepLicenciasController],
  providers: [RepLicenciasService],
})
export class RepLicenciasModule {}
