import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectorObra } from './director-obra.entity';
import { DirectoresObraService } from './directores-obra.service';
import { DirectoresObraController } from './directores-obra.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DirectorObra])],
  controllers: [DirectoresObraController],
  providers: [DirectoresObraService],
})
export class DirectoresObraModule {}
