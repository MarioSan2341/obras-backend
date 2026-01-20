import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColoniasController } from './colonias.controller';
import { ColoniasService } from './colonias.service';
import { Colonia } from './colonias.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Colonia])],
  controllers: [ColoniasController],
  providers: [ColoniasService],
})
export class ColoniasModule {}
