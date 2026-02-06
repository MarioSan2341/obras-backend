import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpObra } from './op_obras.entity';
import { OpObrasService } from './op_obras.service';
import { OpObrasController } from './op_obras.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OpObra])],
  controllers: [OpObrasController],
  providers: [OpObrasService],
})
export class OpObrasModule {}
